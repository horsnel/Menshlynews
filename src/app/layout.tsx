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
  title: "Menshly Wire - Where AI Meets Revenue",
  description: "AI-powered finance blog with smart money moves, investing strategies, and wealth building insights.",
  keywords: ["finance", "investing", "AI", "wealth", "money", "blog"],
  authors: [{ name: "Horsnel John" }],
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
