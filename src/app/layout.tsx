import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TranslatorProvider } from "@/hooks/use-translator";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Menshly Wire - Where AI Meets Revenue",
    template: "%s | Menshly Wire",
  },
  description: "AI-powered finance blog with smart money moves, investing strategies, and wealth building insights for the modern entrepreneur.",
  keywords: ["finance", "investing", "AI", "wealth", "money", "blog", "side hustle", "crypto", "real estate", "retirement", "saving"],
  authors: [{ name: "Horsnel John" }],
  creator: "Horsnel John",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_HK", "zh_CN", "zh_TW", "ja_JP", "ko_KR"],
    siteName: "Menshly Wire",
    title: "Menshly Wire - Where AI Meets Revenue",
    description: "AI-powered finance blog with smart money moves, investing strategies, and wealth building insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menshly Wire - Where AI Meets Revenue",
    description: "AI-powered finance blog with smart money moves, investing strategies, and wealth building insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon',
    other: [
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh-HK': '/?lang=zh-HK',
      'zh-CN': '/?lang=zh-CN',
      'zh-TW': '/?lang=zh-TW',
      'ja': '/?lang=ja',
      'ko': '/?lang=ko',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hreflang tags for regional SEO */}
        <link rel="alternate" hrefLang="en" href="https://menshlywire.com/" />
        <link rel="alternate" hrefLang="zh-HK" href="https://menshlywire.com/?lang=zh-HK" />
        <link rel="alternate" hrefLang="zh-CN" href="https://menshlywire.com/?lang=zh-CN" />
        <link rel="alternate" hrefLang="zh-TW" href="https://menshlywire.com/?lang=zh-TW" />
        <link rel="alternate" hrefLang="ja" href="https://menshlywire.com/?lang=ja" />
        <link rel="alternate" hrefLang="ko" href="https://menshlywire.com/?lang=ko" />
        <link rel="alternate" hrefLang="x-default" href="https://menshlywire.com/" />
        {/* Geo targeting for Hong Kong */}
        <meta name="geo.region" content="HK" />
        <meta name="geo.placename" content="Hong Kong" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#f0f0f0] text-[#121212]`}
      >
        <TranslatorProvider>
          {children}
        </TranslatorProvider>
        <Toaster />
      </body>
    </html>
  );
}
