import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

// Simple in-memory cache for translations (expires every 24h)
const translationCache = new Map<string, { translation: string; expires: number }>();

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}:${text.slice(0, 200)}`;
}

function getCached(key: string): string | null {
  const entry = translationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    translationCache.delete(key);
    return null;
  }
  return entry.translation;
}

function setCache(key: string, translation: string): void {
  // Limit cache size
  if (translationCache.size > 500) {
    const oldest = translationCache.keys().next().value;
    if (oldest) translationCache.delete(oldest);
  }
  translationCache.set(key, { translation, expires: Date.now() + 86_400_000 }); // 24h
}

async function translateWithAI(
  texts: string[],
  targetLang: string,
  sourceLang: string
): Promise<string[]> {
  const systemPrompt = `You are a professional translator for a financial news blog called "Menshly Wire". Translate the following text(s) to ${targetLang}. Rules:
- Keep all HTML tags, markdown formatting, and URLs intact
- Keep brand names like "Menshly Wire" untranslated
- Keep numbers, percentages, and currency symbols as-is
- Translate financial terms accurately for the ${targetLang} speaking market
- Keep the tone conversational and engaging
- Do NOT add any explanations, notes, or commentary
- Return ONLY the translated text(s), one per line if multiple
- If the text is already in ${targetLang}, return it unchanged`;

  const userMessage = texts.length === 1
    ? texts[0]
    : texts.map((t, i) => `[${i + 1}] ${t}`).join('\n---\n');

  // Try z-ai-web-dev-sdk first
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });
    const content = completion.choices[0]?.message?.content || '';
    if (content.length > 0) {
      if (texts.length === 1) return [content.trim()];
      // Parse multiple translations
      const parts = content.split('\n---\n').map((s: string) => s.trim());
      if (parts.length === texts.length) return parts;
      // Fallback: split by numbered lines
      const lines = content.split('\n').filter((l: string) => l.trim());
      return lines.length >= texts.length ? lines.slice(0, texts.length) : [content.trim()];
    }
    throw new Error('Empty response from z-ai-web-dev-sdk');
  } catch (err) {
    console.error('z-ai-web-dev-sdk translate failed:', (err as Error).message);
  }

  // Fallback to OpenRouter
  if (!OPENROUTER_API_KEY) {
    throw new Error('Translation service unavailable');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://menshlywire.com',
      'X-Title': 'Menshly Wire Translator',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (!content) throw new Error('Empty translation response');

  if (texts.length === 1) return [content.trim()];
  const parts = content.split('\n---\n').map((s: string) => s.trim());
  if (parts.length === texts.length) return parts;
  const lines = content.split('\n').filter((l: string) => l.trim());
  return lines.length >= texts.length ? lines.slice(0, texts.length) : [content.trim()];
}

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLang, sourceLang = 'en' } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 });
    }

    if (!targetLang || targetLang === sourceLang) {
      return NextResponse.json({ translations: texts });
    }

    // Check cache first
    const cached = texts.map((t: string) => getCached(getCacheKey(t, targetLang)));
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    cached.forEach((c, i) => {
      if (c === null) {
        uncachedIndices.push(i);
        uncachedTexts.push(texts[i]);
      }
    });

    // All cached
    if (uncachedTexts.length === 0) {
      return NextResponse.json({ translations: cached });
    }

    // Translate uncached texts (batch max 10 at a time)
    const translations = [...cached];
    const batchSize = 10;
    for (let i = 0; i < uncachedTexts.length; i += batchSize) {
      const batch = uncachedTexts.slice(i, i + batchSize);
      const results = await translateWithAI(batch, targetLang, sourceLang);
      results.forEach((translation, j) => {
        const originalIndex = uncachedIndices[i + j];
        translations[originalIndex] = translation;
        setCache(getCacheKey(texts[originalIndex], targetLang), translation);
      });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', translations: [] },
      { status: 500 }
    );
  }
}
