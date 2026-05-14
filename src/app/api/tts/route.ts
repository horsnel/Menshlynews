import { NextRequest, NextResponse } from 'next/server';

const SPEECHIFY_API_KEY = 'I1YSNWxfj8CTUPuhq6xpMRhK0aD_ttpqbcyI37Vz1lA=';
const SPEECHIFY_API_URL = 'https://api.speechify.com/v1/audio/stream';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'david', rate = 1.0 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Truncate text to avoid API limits (Speechify supports up to ~100K chars)
    const truncatedText = text.slice(0, 50000);

    // Call Speechify API
    const response = await fetch(SPEECHIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPEECHIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: truncatedText,
        voice: {
          id: voice,
          type: 'speechify_voice',
        },
        audio_format: 'mp3',
        speed: rate,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Speechify API error:', response.status, errText);

      // Return a fallback response that tells the client to use browser TTS
      return NextResponse.json(
        { error: `Speechify API error: ${response.status}`, fallback: true },
        { status: response.status }
      );
    }

    // Stream audio back as MP3
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', fallback: true },
      { status: 500 }
    );
  }
}
