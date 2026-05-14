import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

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
    const { text, voice = 'aria', rate = 1.0, offset = 0 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const msVoice = VOICES[voice] || VOICES.aria;
    const speedPercent = Math.round((rate - 1) * 100);
    const rateStr = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

    // Take only ~3000 chars starting from offset — one chunk = fast response
    const MAX_CHARS = 3000;
    let portion = text.slice(offset, offset + MAX_CHARS + 500); // extra buffer to finish a sentence

    // Snap to sentence boundary so we don't cut mid-sentence
    if (text.length > offset + MAX_CHARS) {
      const lastSentenceEnd = portion.lastIndexOf('. ');
      const lastQ = portion.lastIndexOf('? ');
      const lastE = portion.lastIndexOf('! ');
      const snapPoint = Math.max(lastSentenceEnd, lastQ, lastE);
      if (snapPoint > MAX_CHARS * 0.5) {
        portion = portion.slice(0, snapPoint + 1);
      } else {
        portion = portion.slice(0, MAX_CHARS);
      }
    }

    const actualEnd = offset + portion.length;
    const hasMore = actualEnd < text.length;

    console.log(`[TTS] ${portion.length} chars (offset ${offset}), voice: ${msVoice}, hasMore: ${hasMore}`);

    const tmpFile = join(tmpdir(), `tts_${Date.now()}.mp3`);

    try {
      const tts = new EdgeTTS({
        voice: msVoice,
        lang: 'en-US',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        rate: rateStr,
        timeout: 20000,
      });

      await tts.ttsPromise(portion, tmpFile);
      const data = await readFile(tmpFile);

      if (data.length < 100) {
        return NextResponse.json({ error: 'Empty audio', fallback: true }, { status: 502 });
      }

      console.log(`[TTS] Success: ${data.length} bytes, nextOffset: ${actualEnd}`);

      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(data.length),
          'Cache-Control': 'public, max-age=86400',
          'X-TTS-Next-Offset': String(actualEnd),
          'X-TTS-Has-More': String(hasMore),
          'X-TTS-Total-Length': String(text.length),
        },
      });
    } finally {
      try { await unlink(tmpFile); } catch {}
    }
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json({ error: 'TTS failed', fallback: true }, { status: 500 });
  }
}
