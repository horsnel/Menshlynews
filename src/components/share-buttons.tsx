'use client';

import { Twitter, Linkedin, Facebook, Link2, Check, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
  variant?: 'horizontal' | 'floating';
}

export function ShareButtons({
  title,
  slug,
  variant = 'horizontal',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/article/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-sky-50 hover:text-sky-500',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-700',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Use native Web Share API on supported devices (mobile-first)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or API failed — fall through to copy
        if ((err as DOMException).name === 'AbortError') return;
      }
    }
    // Fallback: copy to clipboard
    await handleCopyLink();
  };

  if (variant === 'floating') {
    return (
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2.5 shadow-lg border border-slate-200">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full transition-colors text-slate-400 ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
          </a>
        ))}
        <button
          onClick={handleNativeShare}
          className={`p-2 rounded-full transition-colors ${
            copied
              ? 'text-[#166f4f] bg-[#f0f0f0]'
              : 'text-slate-400 hover:bg-[#f0f0f0] hover:text-[#166f4f]'
          }`}
          aria-label="Share"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-lg transition-colors text-slate-400 border border-slate-200 ${link.color}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={handleNativeShare}
        className={`p-2.5 rounded-lg transition-colors border ${
          copied
            ? 'text-[#166f4f] bg-[#f0f0f0] border-[#76bf9f]'
            : 'text-slate-400 border-slate-200 hover:bg-[#f0f0f0] hover:text-[#166f4f]'
        }`}
        aria-label="Share"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
