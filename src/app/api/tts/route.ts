import { NextRequest, NextResponse } from 'next/server';

const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY || 'I1YSNWxfj8CTUPuhq6xpMRhK0aD_ttpqbcyI37Vz1lA=';
const SPEECHIFY_API_URL = 'https://api.speechify.ai/v1/audio/stream';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'david', rate = 1.0 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Truncate text to stay within Speechify limits (free tier: 50K chars)
    const truncatedText = text.slice(0, 50000);

    console.log(`[TTS] Requesting audio for ${truncatedText.length} chars, voice: ${voice}, speed: ${rate}`);

    // Call Speechify API with correct format
    const response = await fetch(SPEECHIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPEECHIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        input: truncatedText,
        voice_id: voice,
        audio_format: 'mp3',
        speed: rate,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[TTS] Speechify API error:', response.status, errText);

      return NextResponse.json(
        { error: `Speechify API error: ${response.status}`, fallback: true },
        { status: response.status }
      );
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS] Received audio: ${audioBuffer.byteLength} bytes`);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', fallback: true },
      { status: 500 }
    );
  }
}
