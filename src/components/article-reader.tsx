'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Heart, Clock } from 'lucide-react';
import { Post } from '@/lib/data';
import { useBlogStore } from '@/lib/store';
import { ReadingProgress } from './reading-progress';
import { ShareButtons } from './share-buttons';

interface ArticleReaderProps {
  post: Post;
}

export function ArticleReader({ post }: ArticleReaderProps) {
  const { toggleLike, isLiked, setCurrentArticle } = useBlogStore();
  const liked = isLiked(post.id);
  const displayLikes = liked ? post.likes + 1 : post.likes;
  const [showFloatingShare, setShowFloatingShare] = useState(false);

  // Push a history entry so the browser back button closes the overlay
  // instead of navigating away from the page entirely
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.history.pushState({ articleReader: true }, '');
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingShare(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentArticle(null);
  }, [setCurrentArticle]);

  // Listen for the popstate event (browser back button) to close the overlay
  useEffect(() => {
    const handlePopState = () => {
      handleClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Go back in history to trigger popstate, which will close the overlay
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/article/${post.slug}`
      );
    } catch {
      // Fallback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
        <ReadingProgress />

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to articles</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-slate-50"
              >
                <Heart
                  className={`w-4 h-4 ${
                    liked
                      ? 'fill-red-500 text-red-500'
                      : 'text-slate-400'
                  }`}
                />
                <span className={`font-medium ${liked ? 'text-red-500' : 'text-slate-500'}`}>
                  {displayLikes.toLocaleString()}
                </span>
              </button>

              <ShareButtons title={post.title} slug={post.slug} />
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Category badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f0f0] border border-[#76bf9f] mb-6">
            <span className="text-[#166f4f] text-sm">{post.categoryIcon}</span>
            <span className="text-[#1c7352] text-xs font-semibold uppercase tracking-wider">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121212] leading-tight mb-6 serif">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-8 text-sm text-slate-500">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#76bf9f] to-[#166f4f] flex items-center justify-center text-white text-sm font-bold">
              HJ
            </div>
            <div>
              <p className="font-semibold text-[#121212]">{post.author}</p>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{post.date}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-56 sm:h-72 lg:h-96 object-cover"
            />
          </div>

          {/* Article body */}
          <div className="prose-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Floating Share Bar */}
        <AnimatePresence>
          {showFloatingShare && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
            >
              <ShareButtons
                title={post.title}
                slug={post.slug}
                variant="floating"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}
