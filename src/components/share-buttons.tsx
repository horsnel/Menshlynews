'use client';

import { Linkedin, Facebook, Link2, Check, Share2, MessageCircle, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Custom X (Twitter) icon — replaces the bird icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/article/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: 'X',
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-slate-50 hover:text-slate-900',
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
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-50 hover:text-green-600',
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'hover:bg-amber-50 hover:text-amber-600',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Silent fail
      }
      document.body.removeChild(textArea);
    }
  };

  // Native Web Share API — works on mobile (iOS Safari, Android Chrome, etc.)
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
        if ((err as DOMException).name === 'AbortError') return;
      }
    }
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Close dropdown on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    if (showDropdown) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDropdown]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="px-3 py-1.5 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share this article</p>
      </div>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={() => setShowDropdown(false)}
        >
          <link.icon className="w-4 h-4 text-slate-400" />
          <span>{link.name}</span>
        </a>
      ))}
      <div className="border-t border-slate-100 mt-1 pt-1">
        <button
          onClick={() => {
            handleCopyLink();
            setShowDropdown(false);
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#166f4f]" />
              <span className="text-[#166f4f] font-medium">Link copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-slate-400" />
              <span>Copy link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (variant === 'floating') {
    return (
      <div className="relative flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2.5 shadow-lg border border-slate-200">
        {shareLinks.slice(0, 3).map((link) => (
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
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleNativeShare}
            className={`p-2 rounded-full transition-colors ${
              copied
                ? 'text-[#166f4f] bg-[#f0f0f0]'
                : 'text-slate-400 hover:bg-[#f0f0f0] hover:text-[#166f4f]'
            }`}
            aria-label="Share"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
          {showDropdown && dropdownContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {shareLinks.slice(0, 3).map((link) => (
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
      <div className="relative">
        <button
          ref={buttonRef}
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
        {showDropdown && dropdownContent}
      </div>
      {copied && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#166f4f] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
