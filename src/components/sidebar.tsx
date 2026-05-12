'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { categories, posts } from '@/lib/data';
import { useBlogStore } from '@/lib/store';

export function Sidebar() {
  const { setCurrentArticle, setActiveCategory, activeCategory } = useBlogStore();

  const popularPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <aside className="space-y-6">
      {/* About Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-3 serif">
          About Menshlynews
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Your go-to source for AI-powered money-making strategies, smart
          investing tips, and actionable wealth-building insights. We turn
          complex financial concepts into simple, executable playbooks.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <Users className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">50K+</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Readers
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <FileText className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">200+</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Articles
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">12</p>
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
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4 serif">
          Popular Posts
        </h3>
        <div className="space-y-3">
          {popularPosts.map((post, idx) => (
            <button
              key={post.id}
              onClick={() => setCurrentArticle(post)}
              className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {post.likes.toLocaleString()} likes
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
        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5" />
          <h3 className="text-lg font-bold serif">Newsletter</h3>
        </div>
        <p className="text-emerald-100 text-sm mb-1">
          Join <span className="font-bold text-white">50,000+</span> readers
        </p>
        <p className="text-emerald-100/80 text-xs mb-4">
          Get the latest AI money-making strategies delivered to your inbox every week.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="newsletter-input w-full px-4 py-2.5 rounded-lg bg-white/15 border border-white/20 text-white placeholder-emerald-200 text-sm mb-3 backdrop-blur-sm"
        />
        <button className="w-full px-4 py-2.5 rounded-lg bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5">
          Subscribe
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Categories Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4 serif">
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
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === cat.name
                    ? 'bg-emerald-100 text-emerald-700'
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
