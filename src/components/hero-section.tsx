'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, User } from 'lucide-react';
import { posts } from '@/lib/data';
import { useBlogStore } from '@/lib/store';

export function HeroSection() {
  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const { setCurrentArticle } = useBlogStore();

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
              <span className="text-emerald-600 text-sm font-semibold">
                {featuredPost.categoryIcon}
              </span>
              <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                Featured
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4 serif">
              {featuredPost.title}
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 line-clamp-3">
              {featuredPost.excerpt}
            </p>

            <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  HJ
                </div>
                <span className="font-medium text-slate-700">
                  {featuredPost.author}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <span>{featuredPost.date}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{featuredPost.readTime}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentArticle(featuredPost)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 group"
            >
              Read Article
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={() => setCurrentArticle(featuredPost)}
            >
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700">
                  <span>{featuredPost.categoryIcon}</span>
                  <span>{featuredPost.category}</span>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-100 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-teal-100 rounded-xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
