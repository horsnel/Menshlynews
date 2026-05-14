'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

// Supported target languages mapped to locale detection
const LOCALE_LANG_MAP: Record<string, string> = {
  // Chinese variants
  'zh': 'zh-HK',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-HK',
  'zh-MO': 'zh-HK',
  'zh-SG': 'zh-HK',
  'yue': 'zh-HK',
  // Other Asian languages
  'ja': 'ja',
  'ko': 'ko',
  'th': 'th',
  'vi': 'vi',
  'id': 'id',
  'ms': 'ms',
  'tl': 'tl',
  // European
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'pt': 'pt',
  'it': 'it',
  'ru': 'ru',
  'ar': 'ar',
  'hi': 'hi',
};

// Timezone-based detection for Chinese regions
function detectLangFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Hong_Kong') return 'zh-HK';
    if (tz === 'Asia/Taipei') return 'zh-TW';
    if (tz === 'Asia/Shanghai' || tz === 'Asia/Chongqing' || tz === 'Asia/Harbin') return 'zh-CN';
    if (tz === 'Asia/Macau') return 'zh-HK';
    if (tz === 'Asia/Singapore') return 'zh-HK';
    if (tz === 'Asia/Tokyo') return 'ja';
    if (tz === 'Asia/Seoul') return 'ko';
    if (tz === 'Asia/Bangkok') return 'th';
    if (tz === 'Asia/Ho_Chi_Minh') return 'vi';
    if (tz === 'Asia/Jakarta') return 'id';
    if (tz === 'Asia/Kuala_Lumpur') return 'ms';
    if (tz === 'Asia/Manila') return 'tl';
  } catch {
    // Timezone detection not available
  }
  return null;
}

// Detect target language from browser
function detectTargetLang(): string | null {
  if (typeof window === 'undefined') return null;

  // Check if user has manually overridden
  const override = localStorage.getItem('mw-lang');
  if (override === 'en') return null; // User chose English
  if (override) return override;

  // Check timezone first (more reliable for HK/Singapore users who may use English browser)
  const tzLang = detectLangFromTimezone();
  if (tzLang) return tzLang;

  // Then check browser language
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const baseLang = lang.split('-')[0];
    // Check exact match first
    if (LOCALE_LANG_MAP[lang]) return LOCALE_LANG_MAP[lang];
    // Then base language
    if (LOCALE_LANG_MAP[baseLang]) return LOCALE_LANG_MAP[baseLang];
  }

  return null;
}

interface TranslationCache {
  [key: string]: string;
}

interface TranslatorContextType {
  targetLang: string | null;
  isTranslating: boolean;
  translate: (texts: string[]) => Promise<string[]>;
  translatedUI: Record<string, string>;
}

const TranslatorContext = createContext<TranslatorContextType>({
  targetLang: null,
  isTranslating: false,
  translate: async (texts) => texts,
  translatedUI: {},
});

export function TranslatorProvider({ children }: { children: ReactNode }) {
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedUI, setTranslatedUI] = useState<Record<string, string>>({});
  const cacheRef = useRef<TranslationCache>({});
  const pendingRef = useRef<Map<string, Promise<string[]>>>(new Map());

  // Detect language on mount
  useEffect(() => {
    const detected = detectTargetLang();
    setTargetLang(detected);
  }, []);

  const translate = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (!targetLang || targetLang === 'en') return texts;

      const results: string[] = [];
      const uncached: { index: number; text: string }[] = [];

      // Check local cache first
      for (let i = 0; i < texts.length; i++) {
        const cacheKey = `${targetLang}:${texts[i]}`;
        if (cacheRef.current[cacheKey]) {
          results[i] = cacheRef.current[cacheKey];
        } else {
          uncached.push({ index: i, text: texts[i] });
        }
      }

      // All cached
      if (uncached.length === 0) return results;

      // Check if there's a pending request for the same texts
      const batchKey = `${targetLang}:${uncached.map(u => u.text.slice(0, 50)).join('|')}`;
      const pending = pendingRef.current.get(batchKey);
      if (pending) {
        const pendingResults = await pending;
        pendingResults.forEach((t, i) => {
          results[uncached[i].index] = t;
          const cacheKey = `${targetLang}:${uncached[i].text}`;
          cacheRef.current[cacheKey] = t;
        });
        return results;
      }

      // Make API call
      const translatePromise = (async () => {
        setIsTranslating(true);
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              texts: uncached.map(u => u.text),
              targetLang,
              sourceLang: 'en',
            }),
          });
          const data = await res.json();
          return data.translations || uncached.map(u => u.text);
        } catch {
          return uncached.map(u => u.text);
        } finally {
          setIsTranslating(false);
          pendingRef.current.delete(batchKey);
        }
      })();

      pendingRef.current.set(batchKey, translatePromise);

      const translations = await translatePromise;
      translations.forEach((t, i) => {
        results[uncached[i].index] = t;
        const cacheKey = `${targetLang}:${uncached[i].text}`;
        cacheRef.current[cacheKey] = t;
      });

      // Also update localStorage cache
      try {
        const storedCache = JSON.parse(localStorage.getItem('mw-translations') || '{}');
        uncached.forEach((u, i) => {
          const cacheKey = `${targetLang}:${u.text}`;
          storedCache[cacheKey] = translations[i];
        });
        // Limit stored cache size
        const keys = Object.keys(storedCache);
        if (keys.length > 500) {
          keys.slice(0, keys.length - 500).forEach(k => delete storedCache[k]);
        }
        localStorage.setItem('mw-translations', JSON.stringify(storedCache));
      } catch {
        // localStorage full or unavailable
      }

      return results;
    },
    [targetLang]
  );

  // Load cached translations from localStorage on mount
  useEffect(() => {
    if (!targetLang) return;
    try {
      const storedCache = JSON.parse(localStorage.getItem('mw-translations') || '{}');
      const loaded: Record<string, string> = {};
      for (const [key, value] of Object.entries(storedCache)) {
        if (key.startsWith(`${targetLang}:`)) {
          cacheRef.current[key] = value as string;
          // Also populate translatedUI for quick access
          const text = key.replace(`${targetLang}:`, '');
          loaded[text] = value as string;
        }
      }
      if (Object.keys(loaded).length > 0) {
        setTranslatedUI(loaded);
      }
    } catch {
      // Ignore
    }
  }, [targetLang]);

  // Translate common UI strings on language detection
  useEffect(() => {
    if (!targetLang) return;

    const uiStrings = [
      'Where AI Meets Revenue',
      'Latest Articles',
      'Filtered Articles',
      'Read more',
      'Subscribe',
      'Search articles...',
      'No articles found',
      'Popular Posts',
      'Newsletter',
      'Categories',
      'About Menshly Wire',
      'Join',
      'readers',
      'Subscribe to Newsletter',
      'Back to articles',
      'Continue Reading',
      'Previous',
      'Next Read',
      'Share this article',
      'Copy link',
      'Link copied!',
      'Recent',
      'Popular',
      'Home',
      'Investing',
      'Saving',
      'Retirement',
      'Crypto',
      'Real Estate',
      'Side Hustles',
      'Our Services',
      'Company',
      'Stay Updated',
      'Get weekly AI money-making tips.',
      'Check your inbox for a confirmation email.',
      'Welcome aboard!',
      'Already subscribed!',
      'Article Generator API',
      'Trending',
    ];

    // Check which ones need translation
    const uncached = uiStrings.filter(s => {
      const cacheKey = `${targetLang}:${s}`;
      return !cacheRef.current[cacheKey];
    });

    if (uncached.length > 0) {
      translate(uncached).then(translations => {
        const newUI: Record<string, string> = {};
        uncached.forEach((text, i) => {
          newUI[text] = translations[i];
        });
        setTranslatedUI(prev => ({ ...prev, ...newUI }));
      });
    }
  }, [targetLang, translate]);

  return (
    <TranslatorContext.Provider value={{ targetLang, isTranslating, translate, translatedUI }}>
      {children}
    </TranslatorContext.Provider>
  );
}

export function useTranslator() {
  return useContext(TranslatorContext);
}

// Convenience hook for translating a single string
export function useT(text: string): string {
  const { targetLang, translatedUI } = useTranslator();
  if (!targetLang || targetLang === 'en') return text;
  return translatedUI[text] || text;
}

// Hook for translating article content
export function useArticleTranslator() {
  const { targetLang, translate, isTranslating } = useTranslator();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  const translateContent = useCallback(
    async (articleId: string, content: string) => {
      if (!targetLang || targetLang === 'en') return content;
      if (translatedContent[articleId]) return translatedContent[articleId];

      // Split content into paragraphs for translation
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      const translated = await translate(paragraphs);
      const result = translated.join('\n\n');
      setTranslatedContent(prev => ({ ...prev, [articleId]: result }));
      return result;
    },
    [targetLang, translate, translatedContent]
  );

  return { translateContent, isTranslating, targetLang };
}
