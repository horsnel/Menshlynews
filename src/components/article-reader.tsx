'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heart, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Post, posts } from '@/lib/data';
import { useBlogStore } from '@/lib/store';
import { useLikes } from '@/hooks/use-likes';
import { ReadingProgress } from './reading-progress';
import { ShareButtons } from './share-buttons';
import { CategoryIcon } from './category-icon';

interface ArticleReaderProps {
  post: Post;
}

// Split content at a good mid-point (after the 4th ## heading)
function splitContent(content: string): { firstHalf: string; secondHalf: string } {
  const lines = content.split('\n');
  let headingCount = 0;
  let splitIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      headingCount++;
      if (headingCount === 4) {
        splitIndex = i;
        break;
      }
    }
  }

  // Fallback: split at 50% if fewer than 4 headings
  if (headingCount < 4) {
    splitIndex = Math.floor(lines.length * 0.5);
    // Find the nearest heading
    for (let i = splitIndex; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        splitIndex = i;
        break;
      }
    }
  }

  return {
    firstHalf: lines.slice(0, splitIndex).join('\n'),
    secondHalf: lines.slice(splitIndex).join('\n'),
  };
}

// Mid-article suggestions component
function MidArticleSuggestions({ currentPost }: { currentPost: Post }) {
  const { setCurrentArticle } = useBlogStore();

  const suggestions = useMemo(() => {
    // Get 3 articles from different categories, excluding current
    const otherPosts = posts.filter(p => p.id !== currentPost.id);
    const sameCategory = otherPosts.filter(p => p.category === currentPost.category);
    const differentCategory = otherPosts.filter(p => p.category !== currentPost.category);

    const result: Post[] = [];
    // Prefer 1 from same category
    if (sameCategory.length > 0) {
      result.push(sameCategory[Math.floor(Math.random() * sameCategory.length)]);
    }
    // 2 from different categories
    const shuffled = differentCategory.sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, 3 - result.length));

    return result.slice(0, 3);
  }, [currentPost.id, currentPost.category]);

  const handleClick = (post: Post) => {
    setCurrentArticle(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="my-10 py-8 border-t border-b border-slate-200 bg-gradient-to-r from-[#f0f0f0]/50 to-white/50 -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-[#166f4f] rounded-full" />
        <h3 className="text-lg font-bold text-[#121212]">Continue Reading</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleClick(suggestion)}
            className="group text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#76bf9f]/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={suggestion.image}
                alt={suggestion.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#166f4f] text-white text-[10px] font-semibold uppercase tracking-wider">
                  <CategoryIcon category={suggestion.category} size={10} />
                  <span>{suggestion.category}</span>
                </span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-bold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors leading-snug">
                {suggestion.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{suggestion.readTime}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Previous / Next navigation cards
function PrevNextNavigation({ currentPost }: { currentPost: Post }) {
  const { setCurrentArticle } = useBlogStore();

  const { prevPost, nextPost } = useMemo(() => {
    const currentIndex = posts.findIndex(p => p.id === currentPost.id);
    return {
      prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
      nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    };
  }, [currentPost.id]);

  const handleClick = (post: Post) => {
    setCurrentArticle(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!prevPost && !nextPost) return null;

  return (
    <div className="mt-10 pt-8 border-t border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Article */}
        {prevPost ? (
          <button
            onClick={() => handleClick(prevPost)}
            className="group text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-[#76bf9f]/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Previous</span>
            </div>
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={prevPost.image}
                  alt={prevPost.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1c7352] uppercase tracking-wider mb-1">
                  <CategoryIcon category={prevPost.category} size={10} />
                  {prevPost.category}
                </span>
                <h4 className="text-sm font-bold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors leading-snug">
                  {prevPost.title}
                </h4>
              </div>
            </div>
          </button>
        ) : (
          <div />
        )}

        {/* Next Article */}
        {nextPost ? (
          <button
            onClick={() => handleClick(nextPost)}
            className="group text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-[#76bf9f]/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-end gap-1.5 text-xs text-[#166f4f] mb-2">
              <span className="uppercase tracking-wider font-semibold">Next Read</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 min-w-0 text-right">
                <span className="inline-flex items-center gap-1 justify-end text-[10px] font-semibold text-[#1c7352] uppercase tracking-wider mb-1">
                  <CategoryIcon category={nextPost.category} size={10} />
                  {nextPost.category}
                </span>
                <h4 className="text-sm font-bold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors leading-snug">
                  {nextPost.title}
                </h4>
              </div>
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={nextPost.image}
                  alt={nextPost.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

export function ArticleReader({ post }: ArticleReaderProps) {
  const { setCurrentArticle } = useBlogStore();
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const liked = isLiked(post.id);
  const displayLikes = getLikeCount(post.id, post.likes);
  const [showFloatingShare, setShowFloatingShare] = useState(false);

  // Split content for mid-article suggestions
  const { firstHalf, secondHalf } = useMemo(() => splitContent(post.content), [post.content]);

  // Push a history entry so the browser back button closes the overlay
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
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Content protection: disable right-click, copy, and keyboard shortcuts on article content
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.prose-content')) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.prose-content')) {
        e.preventDefault();
      }
    };

    const handleKeyDownProtect = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.prose-content')) return;
      // Block Ctrl+C, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, F12
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'u')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
        e.preventDefault();
      }
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.prose-content')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDownProtect);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDownProtect);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const handleLike = () => {
    toggleLike(post.id);
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
              className="text-sm font-medium text-slate-600 hover:text-[#1c7352] transition-colors"
            >
              Back to articles
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
            <CategoryIcon category={post.category} size={14} className="text-[#166f4f]" />
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

          {/* Article body — first half */}
          <div className="prose-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{firstHalf}</ReactMarkdown>
          </div>

          {/* Mid-article suggestions */}
          <MidArticleSuggestions currentPost={post} />

          {/* Article body — second half */}
          <div className="prose-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{secondHalf}</ReactMarkdown>
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

          {/* Previous / Next navigation */}
          <PrevNextNavigation currentPost={post} />
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
