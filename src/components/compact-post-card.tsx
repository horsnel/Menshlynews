'use client';

import { Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '@/lib/data';
import { useBlogStore } from '@/lib/store';
import { useLikes } from '@/hooks/use-likes';
import { CategoryIcon } from './category-icon';

interface CompactPostCardProps {
  post: Post;
  index: number;
}

export function CompactPostCard({ post, index }: CompactPostCardProps) {
  const { setCurrentArticle } = useBlogStore();
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const liked = isLiked(post.id);
  const displayLikes = getLikeCount(post.id, post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white/70 backdrop-blur-xl rounded-xl border border-white/40 overflow-hidden cursor-pointer group shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(22,111,79,0.08)] hover:border-[#76bf9f]/30 transition-all duration-300"
      onClick={() => setCurrentArticle(post)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#166f4f] text-white text-[10px] font-semibold uppercase tracking-wider">
            <CategoryIcon category={post.category} size={10} />
            <span>{post.category}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title */}
        <h3 className="text-sm font-bold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors serif leading-snug mb-2">
          {post.title}
        </h3>

        {/* Meta Row */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#76bf9f] to-[#166f4f] flex items-center justify-center text-white text-[8px] font-bold">
              HJ
            </div>
            <span className="font-medium text-slate-700">{post.author}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs transition-colors"
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${
                liked
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            />
            <span className={`font-medium ${liked ? 'text-red-500' : 'text-slate-500'}`}>
              {displayLikes.toLocaleString()}
            </span>
          </button>
          <span className="text-[10px] text-slate-400">{post.date}</span>
        </div>
      </div>
    </motion.article>
  );
}
