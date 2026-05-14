'use client';

import { Heart, Share2, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '@/lib/data';
import { useBlogStore } from '@/lib/store';
import { useLikes } from '@/hooks/use-likes';
import { CategoryIcon } from './category-icon';

interface ArticleCardProps {
  post: Post;
  index: number;
}

export function ArticleCard({ post, index }: ArticleCardProps) {
  const { setCurrentArticle } = useBlogStore();
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const liked = isLiked(post.id);
  const displayLikes = getLikeCount(post.id, post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/article/${post.slug}`
      );
    } catch {
      // Fallback - do nothing
    }
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentArticle(post);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="article-card bg-white/70 backdrop-blur-xl rounded-xl border border-white/40 overflow-hidden cursor-pointer group shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(22,111,79,0.08)] hover:border-[#76bf9f]/30 transition-all duration-300"
      onClick={() => setCurrentArticle(post)}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-56 md:w-64 flex-shrink-0 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 sm:h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#1c7352]">
              <CategoryIcon category={post.category} size={12} />
              <span>{post.category}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2.5 text-xs text-slate-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#76bf9f] to-[#166f4f] flex items-center justify-center text-white text-[10px] font-bold">
                HJ
              </div>
              <span className="font-medium text-slate-700">{post.author}</span>
              <span className="text-slate-300">·</span>
              <span>{post.date}</span>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-[#121212] mb-2 line-clamp-2 group-hover:text-[#1c7352] transition-colors serif">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-sm transition-colors group/like"
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    liked
                      ? 'fill-red-500 text-red-500 scale-110'
                      : 'text-slate-400 group-hover/like:text-red-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    liked ? 'text-red-500' : 'text-slate-500'
                  }`}
                >
                  {displayLikes.toLocaleString()}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#166f4f] transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-medium text-slate-500">
                  {post.shares}
                </span>
              </button>
            </div>

            {/* Read more */}
            <button
              onClick={handleReadMore}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#166f4f] hover:text-[#1c7352] transition-colors group/read"
            >
              Read more
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/read:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
