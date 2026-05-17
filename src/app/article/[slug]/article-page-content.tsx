'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heart, Clock, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { useLikes } from '@/hooks/use-likes';
import { CategoryIcon } from '@/components/category-icon';
import { ShareButtons } from '@/components/share-buttons';
import { ReadingProgress } from '@/components/reading-progress';
import { useRef, useEffect, useState } from 'react';

interface ArticlePageContentProps {
  post: Post;
  relatedPosts: Post[];
  prevPost: Post | null;
  nextPost: Post | null;
}

export function ArticlePageContent({
  post,
  relatedPosts,
  prevPost,
  nextPost,
}: ArticlePageContentProps) {
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const liked = isLiked(post.id);
  const displayLikes = getLikeCount(post.id, post.likes);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFloatingShare, setShowFloatingShare] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingShare(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-white">
      <ReadingProgress scrollContainerRef={scrollRef} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-2xl border-b border-white/30 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-[#1c7352] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to articles
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-slate-50"
            >
              <Heart
                className={`w-4 h-4 ${
                  liked ? 'fill-red-500 text-red-500' : 'text-slate-400'
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-[#1c7352] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/?category=${encodeURIComponent(post.category)}`} className="hover:text-[#1c7352] transition-colors">
            {post.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

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
            {post.author.split(' ').map(n => n[0]).join('')}
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-[#166f4f]/10 hover:text-[#1c7352] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-[#166f4f] rounded-full" />
              <h3 className="text-lg font-bold text-[#121212]">Related Articles</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/article/${related.slug}`}
                  className="group text-left bg-white/60 rounded-xl border border-slate-200 overflow-hidden hover:border-[#76bf9f]/30 hover:shadow-[0_8px_40px_rgba(22,111,79,0.08)] transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1c7352] uppercase tracking-wider mb-1">
                      <CategoryIcon category={related.category} size={10} />
                      {related.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors leading-snug">
                      {related.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Previous / Next navigation */}
        {(prevPost || nextPost) && (
          <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/article/${prevPost.slug}`}
                  className="group text-left bg-white/60 rounded-xl border border-slate-200 p-4 hover:border-[#76bf9f]/30 hover:shadow-[0_8px_40px_rgba(22,111,79,0.08)] transition-all duration-300"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                    <ArrowLeft className="w-3.5 h-3.5" />
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
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={`/article/${nextPost.slug}`}
                  className="group text-left bg-white/60 rounded-xl border border-slate-200 p-4 hover:border-[#76bf9f]/30 hover:shadow-[0_8px_40px_rgba(22,111,79,0.08)] transition-all duration-300"
                >
                  <div className="flex items-center justify-end gap-1.5 text-xs text-[#166f4f] mb-2">
                    <span className="uppercase tracking-wider font-semibold">Next Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      </article>

      {/* Floating Share Bar */}
      {showFloatingShare && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <ShareButtons title={post.title} slug={post.slug} variant="floating" />
        </div>
      )}
    </div>
  );
}
