'use client';

import { useState, useEffect } from 'react';
import { posts } from '@/lib/data';
import { useBlogStore } from '@/lib/store';

export function NewsTicker() {
  const { setCurrentArticle } = useBlogStore();
  // Pick top 5 most popular posts
  const tickerPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tickerPosts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tickerPosts.length]);

  return (
    <div className="bg-[#121212]/90 backdrop-blur-xl text-white overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-9 gap-3">
          {/* Breaking label */}
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#166f4f] px-3 py-1 rounded-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Trending
            </span>
          </div>

          {/* Scrolling headline */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            {tickerPosts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => setCurrentArticle(post)}
                className={`absolute inset-0 flex items-center text-left transition-all duration-500 text-sm ${
                  idx === activeIndex
                    ? 'translate-x-0 opacity-100'
                    : idx < activeIndex
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
              >
                <span className="text-[#76bf9f] font-semibold mr-2">
                  {post.category}:
                </span>
                <span className="text-white/90 truncate hover:text-white transition-colors">
                  {post.title}
                </span>
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {tickerPosts.map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-4 h-1.5 bg-[#76bf9f]'
                    : 'w-1.5 h-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
