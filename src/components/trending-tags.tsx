'use client';

import { motion } from 'framer-motion';
import { useBlogStore } from '@/lib/store';

const trendingTags = [
  'Investing',
  'Saving',
  'Retirement',
  'Crypto',
  'Real Estate',
  'Side Hustles',
  'AI',
  'Passive Income',
  'Freelancing',
  'Wealth',
];

export function TrendingTags() {
  const { activeTag, setActiveTag } = useBlogStore();

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Trending:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag, index) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`tag-pill px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === tag
                  ? 'bg-[#166f4f] text-white border-[#166f4f]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#166f4f]'
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
