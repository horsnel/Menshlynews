'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { usePosts } from '@/lib/posts-provider';
import { useBlogStore } from '@/lib/store';
import { useLikes } from '@/hooks/use-likes';
import { useSubscriberCount } from '@/hooks/use-subscriber-count';
import { useStats } from '@/hooks/use-stats';
import { CategoryIcon } from './category-icon';

export function Sidebar() {
  const { setCurrentArticle, setActiveCategory, activeCategory, setNewsletterOpen } = useBlogStore();
  const { posts, categories } = usePosts();
  const { getLikeCount } = useLikes();
  const { displayCount } = useSubscriberCount();
  const { stats } = useStats();

  const popularPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <aside className="space-y-6">
      {/* About Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      >
        <h3 className="text-lg font-bold text-[#121212] mb-3 serif">
          About Menshly Wire
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Your go-to source for AI-powered money-making strategies, smart
          investing tips, and actionable wealth-building insights. We turn
          complex financial concepts into simple, executable playbooks.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <Users className="w-4 h-4 text-[#166f4f] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#121212]">{stats ? `${(stats.subscribers / 1000).toFixed(0)}K+` : '50K+'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Readers
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <FileText className="w-4 h-4 text-[#166f4f] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#121212]">{stats?.posts || '200+'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Articles
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <TrendingUp className="w-4 h-4 text-[#166f4f] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#121212]">{stats?.categories || 6}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Categories
            </p>
          </div>
        </div>
      </motion.div>

      {/* Popular Posts Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      >
        <h3 className="text-lg font-bold text-[#121212] mb-4 serif">
          Popular Posts
        </h3>
        <div className="space-y-3">
          {popularPosts.map((post, idx) => (
            <button
              key={post.id}
              onClick={() => setCurrentArticle(post)}
              className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#f0f0f0] text-[#166f4f] flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#121212] line-clamp-2 group-hover:text-[#1c7352] transition-colors">
                  {post.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {getLikeCount(post.id, post.likes).toLocaleString()} likes
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Newsletter Widget */}
      <motion.div
        id="newsletter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-gradient-to-br from-[#166f4f] to-[#1c7352] rounded-xl p-6 text-white shadow-[0_4px_30px_rgba(22,111,79,0.15)]"
      >
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5" />
          <h3 className="text-lg font-bold serif">Newsletter</h3>
        </div>
        <p className="text-[#76bf9f]/80 text-sm mb-1">
          Join <span className="font-bold text-white">{displayCount || '50,000+'}</span> readers
        </p>
        <p className="text-[#76bf9f]/60 text-xs mb-4">
          Get the latest AI money-making strategies delivered to your inbox every week.
        </p>
        <button
          onClick={() => setNewsletterOpen(true)}
          className="w-full px-4 py-2.5 rounded-lg bg-white text-[#166f4f] text-sm font-semibold hover:bg-[#f0f0f0] transition-colors flex items-center justify-center gap-1.5"
        >
          Subscribe
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Categories Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      >
        <h3 className="text-lg font-bold text-[#121212] mb-4 serif">
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setActiveCategory(activeCategory === cat.name ? null : cat.name)
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeCategory === cat.name
                  ? 'bg-[#f0f0f0] text-[#1c7352]'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CategoryIcon category={cat.name} size={16} />
                <span className="font-medium">{cat.name}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === cat.name
                    ? 'bg-[#166f4f]/10 text-[#1c7352]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}
