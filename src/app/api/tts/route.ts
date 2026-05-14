import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Microsoft Edge TTS voices (free, no API key needed)
const VOICES: Record<string, string> = {
  aria: 'en-US-AriaNeural',
  david: 'en-US-GuyNeural',
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
    const msVoice = VOICES[voice] || VOICES.aria;
    const speedPercent = Math.round((rate - 1) * 100);
    const rateStr = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

    console.log(`[TTS] ${truncatedText.length} chars, voice: ${msVoice}, rate: ${rateStr}`);

    // Chunk long texts at sentence boundaries to avoid serverless timeout
    const MAX_CHUNK = 3000;
    const chunks: string[] = [];

    if (truncatedText.length <= MAX_CHUNK) {
      chunks.push(truncatedText);
    } else {
      const sentences = truncatedText.split(/(?<=[.!?])\s+/);
      let cur = '';
      for (const s of sentences) {
        if ((cur + ' ' + s).length > MAX_CHUNK && cur.length > 0) {
          chunks.push(cur.trim());
          cur = s;
        } else {
          cur += ' ' + s;
        }
      }
      if (cur.trim()) chunks.push(cur.trim());
    }

    console.log(`[TTS] ${chunks.length} chunk(s)`);

    const audioBuffers: Buffer[] = [];
    const tmpFiles: string[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const tmpFile = join(tmpdir(), `tts_${Date.now()}_${i}.mp3`);
        tmpFiles.push(tmpFile);

        const tts = new EdgeTTS({
          voice: msVoice,
          lang: 'en-US',
          outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
          rate: rateStr,
          timeout: 20000,
        });

        await tts.ttsPromise(chunks[i], tmpFile);
        const data = await readFile(tmpFile);

        if (data.length < 100) {
          console.warn(`[TTS] Chunk ${i} too small: ${data.length} bytes`);
          return NextResponse.json({ error: 'TTS produced empty audio', fallback: true }, { status: 502 });
        }

        audioBuffers.push(data);
      }

      const buffer = Buffer.concat(audioBuffers);
      console.log(`[TTS] Success: ${buffer.length} bytes`);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(buffer.length),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } finally {
      for (const f of tmpFiles) {
        try { await unlink(f); } catch {}
      }
    }
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', fallback: true },
      { status: 500 }
    );
  }
}
