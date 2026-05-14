import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY || 'I1YSNWxfj8CTUPuhq6xpMRhK0aD_ttpqbcyI37Vz1lA=';
const SPEECHIFY_API_URL = 'https://api.speechify.ai/v1/audio/stream';

// Map of voice IDs to Microsoft Edge TTS voice names
const MICROSOFT_VOICES: Record<string, string> = {
  david: 'en-US-GuyNeural',
  aria: 'en-US-AriaNeural',
  jenny: 'en-US-JennyNeural',
  christopher: 'en-US-ChristopherNeural',
  sonia: 'en-GB-SoniaNeural',
  ryan: 'en-GB-RyanNeural',
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'aria', rate = 1.0 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const truncatedText = text.slice(0, 50000);
    const msVoice = MICROSOFT_VOICES[voice] || MICROSOFT_VOICES.aria;
    const speedPercent = Math.round((rate - 1) * 100);
    const rateStr = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

    console.log(`[TTS] Request: ${truncatedText.length} chars, voice: ${voice}, rate: ${rate}`);

    // STEP 1: Try Speechify (premium voices, fast)
    try {
      const speechifyAudio = await trySpeechify(truncatedText, voice, rate);
      if (speechifyAudio) {
        console.log(`[TTS] Speechify success: ${speechifyAudio.length} bytes`);
        return sendAudio(speechifyAudio, 'speechify');
      }
    } catch (err) {
      console.warn('[TTS] Speechify failed:', err instanceof Error ? err.message : String(err));
    }

    // STEP 2: Try Microsoft Edge TTS (free, reliable, no API key)
    try {
      const msAudio = await tryMicrosoftEdge(truncatedText, msVoice, rateStr);
      if (msAudio) {
        console.log(`[TTS] Microsoft Edge TTS success: ${msAudio.length} bytes`);
        return sendAudio(msAudio, 'microsoft');
      }
    } catch (err) {
      console.warn('[TTS] Microsoft Edge TTS failed:', err instanceof Error ? err.message : String(err));
    }

    // All server-side TTS failed — tell client to use browser TTS
    return NextResponse.json(
      { error: 'Server TTS unavailable, using browser fallback', fallback: true },
      { status: 503 }
    );
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', fallback: true },
      { status: 500 }
    );
  }
}

async function trySpeechify(text: string, voice: string, rate: number): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(SPEECHIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPEECHIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        input: text,
        voice_id: voice,
        audio_format: 'mp3',
        speed: rate,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuf = await response.arrayBuffer();
    if (arrayBuf.byteLength < 100) return null;

    return Buffer.from(arrayBuf);
  } finally {
    clearTimeout(timeout);
  }
}

async function tryMicrosoftEdge(text: string, voice: string, rateStr: string): Promise<Buffer | null> {
  // Chunk long texts at sentence boundaries to avoid Vercel serverless timeout
  const MAX_CHUNK_CHARS = 3000;
  const chunks: string[] = [];

  if (text.length <= MAX_CHUNK_CHARS) {
    chunks.push(text);
  } else {
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';
    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > MAX_CHUNK_CHARS && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
  }

  console.log(`[TTS] Microsoft Edge: ${chunks.length} chunk(s) for ${text.length} chars`);

  const audioBuffers: Buffer[] = [];
  const tmpFiles: string[] = [];

  try {
    for (let i = 0; i < chunks.length; i++) {
      const tmpFile = join(tmpdir(), `tts_${Date.now()}_${i}.mp3`);
      tmpFiles.push(tmpFile);

      const tts = new EdgeTTS({
        voice,
        lang: 'en-US',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        rate: rateStr,
        timeout: 20000,
      });

      await tts.ttsPromise(chunks[i], tmpFile);
      const audioData = await readFile(tmpFile);

      if (audioData.length < 100) {
        console.warn(`[TTS] Edge chunk ${i} too small: ${audioData.length} bytes`);
        return null;
      }

      audioBuffers.push(audioData);
    }

    return Buffer.concat(audioBuffers);
  } finally {
    for (const f of tmpFiles) {
      try { await unlink(f); } catch {}
    }
  }
}

function sendAudio(buffer: Buffer, engine: string) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400',
      'X-TTS-Engine': engine,
    },
  });
}
