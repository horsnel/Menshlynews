'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Post } from '@/lib/types';
import { usePosts } from '@/lib/posts-provider';
import { useBlogStore } from '@/lib/store';
import { CategoryIcon } from './category-icon';

export function HeroCarousel() {
  const { posts } = usePosts();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setCurrentArticle } = useBlogStore();

  // Pick top posts for carousel (featured first, then by likes)
  const carouselPosts = [
    ...posts.filter((p) => p.featured),
    ...posts
      .filter((p) => !p.featured)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3),
  ].slice(0, 5);

  const total = carouselPosts.length;

  const goTo = useCallback(
    (index: number) => setCurrent((index + total) % total),
    [total]
  );
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused || total === 0) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isPaused, total]);

  const slide = carouselPosts[current];

  // Don't render if no posts available
  if (total === 0 || !slide) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#166f4f] to-[#1c7352] aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center">
        <div className="text-center text-white/70">
          <p className="text-lg font-medium serif">Loading featured stories...</p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel Area */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[16/9] sm:aspect-[21/9] cursor-pointer group">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            onClick={() => setCurrentArticle(slide)}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-content'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Category Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#166f4f] text-white text-xs font-semibold uppercase tracking-wider mb-3">
                <CategoryIcon category={slide.category} size={12} />
                <span>{slide.category}</span>
              </span>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight mb-3 serif line-clamp-2 max-w-3xl">
                {slide.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm sm:text-base text-white/70 line-clamp-2 max-w-2xl mb-4 leading-relaxed">
                {slide.excerpt}
              </p>

              {/* Meta Row */}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#76bf9f] to-[#166f4f] flex items-center justify-center text-white text-[10px] font-bold">
                    HJ
                  </div>
                  <span className="font-medium text-white/80">
                    {slide.author}
                  </span>
                </div>
                <span className="text-white/40">|</span>
                <span>{slide.date}</span>
                <span className="text-white/40">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slide.readTime}</span>
                </div>
              </div>

              {/* Read CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentArticle(slide);
                }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#166f4f]/80 backdrop-blur-lg text-white text-sm font-semibold hover:bg-[#166f4f] shadow-lg shadow-[#166f4f]/30 transition-all group/cta"
              >
                Read Article
                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-8 z-20 flex items-center gap-2">
          {carouselPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                goTo(idx);
              }}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? 'w-8 h-2 bg-[#76bf9f]'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
