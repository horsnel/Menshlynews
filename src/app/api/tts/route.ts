import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY || 'I1YSNWxfj8CTUPuhq6xpMRhK0aD_ttpqbcyI37Vz1lA=';
const SPEECHIFY_API_URL = 'https://api.speechify.ai/v1/audio/stream';

// Map of voice IDs to Microsoft Edge TTS voice names
const MICROSOFT_VOICES: Record<string, string> = {
  david: 'en-US-GuyNeural',
  gwyneth: 'en-US-AriaNeural',
  mrbeast: 'en-US-ChristopherNeural',
  snoop: 'en-US-GuyNeural',
  emma: 'en-US-JennyNeural',
  kimberly: 'en-GB-SoniaNeural',
  aria: 'en-US-AriaNeural',
  guy: 'en-US-GuyNeural',
  jenny: 'en-US-JennyNeural',
  christopher: 'en-US-ChristopherNeural',
  sonia: 'en-GB-SoniaNeural',
  ryan: 'en-GB-RyanNeural',
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'david', rate = 1.0, engine = 'auto' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Truncate text to reasonable limit
    const truncatedText = text.slice(0, 50000);
    const msVoice = MICROSOFT_VOICES[voice] || MICROSOFT_VOICES.david;
    const speedPercent = Math.round((rate - 1) * 100);
    const rateStr = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

    console.log(`[TTS] Request: ${truncatedText.length} chars, voice: ${voice}, rate: ${rate}, engine: ${engine}`);

    // Strategy: Try Speechify first, then Microsoft Edge TTS, then return error for browser fallback
    let audioBuffer: Buffer | null = null;

    // ATTEMPT 1: Speechify (only if engine is 'auto' or 'speechify')
    if (engine === 'auto' || engine === 'speechify') {
      try {
        audioBuffer = await trySpeechify(truncatedText, voice, rate);
        if (audioBuffer) {
          console.log(`[TTS] Speechify success: ${audioBuffer.length} bytes`);
          return sendAudio(audioBuffer);
        }
      } catch (err) {
        console.warn('[TTS] Speechify failed:', err instanceof Error ? err.message : err);
      }
    }

    // ATTEMPT 2: Microsoft Edge TTS (free, reliable)
    if (engine === 'auto' || engine === 'microsoft' || engine === 'edge') {
      try {
        audioBuffer = await tryMicrosoftEdge(truncatedText, msVoice, rateStr);
        if (audioBuffer) {
          console.log(`[TTS] Microsoft Edge TTS success: ${audioBuffer.length} bytes`);
          return sendAudio(audioBuffer);
        }
      } catch (err) {
        console.warn('[TTS] Microsoft Edge TTS failed:', err instanceof Error ? err.message : err);
      }
    }

    // All server-side TTS failed — tell client to use browser TTS
    return NextResponse.json(
      { error: 'Server TTS unavailable', fallback: true },
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
    signal: AbortSignal.timeout(30000), // 30s timeout
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.warn(`[TTS] Speechify API error: ${response.status}`, errText);
    return null;
  }

  const arrayBuf = await response.arrayBuffer();
  if (arrayBuf.byteLength < 100) return null;

  return Buffer.from(arrayBuf);
}

async function tryMicrosoftEdge(text: string, voice: string, rateStr: string): Promise<Buffer | null> {
  // For very long texts, chunk them to avoid timeout issues
  const MAX_CHUNK_CHARS = 3000;
  const chunks: string[] = [];

  if (text.length <= MAX_CHUNK_CHARS) {
    chunks.push(text);
  } else {
    // Split at sentence boundaries
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
        timeout: 30000,
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
    // Clean up temp files
    for (const f of tmpFiles) {
      try { await unlink(f); } catch {}
    }
  }
}

function sendAudio(buffer: Buffer) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
