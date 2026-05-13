import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#f0f0f0] text-[#121212]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
