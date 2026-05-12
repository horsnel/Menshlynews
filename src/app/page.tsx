'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Heart } from 'lucide-react';
import { posts } from '@/lib/data';
import { useBlogStore } from '@/lib/store';
import { Header } from '@/components/header';
import { HeroCarousel } from '@/components/hero-carousel';
import { NewsTicker } from '@/components/news-ticker';
import { CompactPostCard } from '@/components/compact-post-card';
import { TrendingTags } from '@/components/trending-tags';
import { ArticleCard } from '@/components/article-card';
import { ArticleReader } from '@/components/article-reader';
import { Sidebar } from '@/components/sidebar';

export default function HomePage() {
  const { currentArticle, sortBy, activeCategory, activeTag, searchQuery } =
    useBlogStore();

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by tag
    if (activeTag) {
      result = result.filter(
        (p) =>
          p.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
          p.category.toLowerCase() === activeTag.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [sortBy, activeCategory, activeTag, searchQuery]);

  // Posts for the CNN-style hero section
  // Carousel shows featured + top posts (handled inside HeroCarousel)
  // Side cards show the remaining popular posts
  const carouselPostIds = [
    ...posts.filter((p) => p.featured).map((p) => p.id),
    ...posts
      .filter((p) => !p.featured)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
      .map((p) => p.id),
  ].slice(0, 5);

  const sideCardPosts = posts
    .filter((p) => !carouselPostIds.includes(p.id))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);

  const leftSidePosts = sideCardPosts.slice(0, 2);
  const rightSidePosts = sideCardPosts.slice(2, 4);

  // Posts for the grid below
  const gridPosts = filteredPosts.filter(
    (p) => !(p.featured && !activeCategory && !activeTag && !searchQuery.trim())
  );

  const { setSortBy } = useBlogStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <Header />
      <NewsTicker />

      {/* CNN-Style Hero Section — Only when no filters active */}
      {!activeCategory && !activeTag && !searchQuery.trim() && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5">
              {/* Left Side Cards */}
              <div className="hidden lg:flex flex-col gap-4">
                {leftSidePosts.map((post, index) => (
                  <CompactPostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {/* Center Carousel */}
              <div className="lg:col-span-2">
                <HeroCarousel />
              </div>

              {/* Right Side Cards */}
              <div className="hidden lg:flex flex-col gap-4">
                {rightSidePosts.map((post, index) => (
                  <CompactPostCard key={post.id} post={post} index={index + 2} />
                ))}
              </div>
            </div>

            {/* Mobile: Show side cards as horizontal row */}
            <div className="lg:hidden mt-4 grid grid-cols-2 gap-3">
              {sideCardPosts.map((post, index) => (
                <CompactPostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Tags */}
      {!activeCategory && !activeTag && !searchQuery.trim() && <TrendingTags />}

      {/* Active filter indicator */}
      {(activeCategory || activeTag || searchQuery.trim()) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-3 flex-wrap">
            {activeCategory && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f0f0] border border-[#76bf9f] text-sm">
                <span className="font-medium text-[#1c7352]">
                  Category: {activeCategory}
                </span>
                <button
                  onClick={() => useBlogStore.getState().setActiveCategory(null)}
                  className="text-[#166f4f] hover:text-[#1c7352] font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {activeTag && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#166f4f]/10 border border-[#76bf9f] text-sm">
                <span className="font-medium text-[#1c7352]">
                  Tag: {activeTag}
                </span>
                <button
                  onClick={() => useBlogStore.getState().setActiveTag(null)}
                  className="text-[#166f4f] hover:text-[#1c7352] font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {searchQuery.trim() && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm">
                <span className="font-medium text-slate-700">
                  Search: &ldquo;{searchQuery}&rdquo;
                </span>
                <button
                  onClick={() => useBlogStore.getState().setSearchQuery('')}
                  className="text-slate-500 hover:text-slate-700 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Sort */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#121212] serif">
                {activeCategory || activeTag || searchQuery.trim()
                  ? 'Filtered Articles'
                  : 'Latest Articles'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-[#f0f0f0] text-[#1c7352]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-[#f0f0f0] text-[#1c7352]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Popular
              </button>
            </div>
          </div>

          {/* Grid: Articles + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Column */}
            <div className="lg:col-span-2 space-y-4">
              {gridPosts.length > 0 ? (
                gridPosts.map((post, index) => (
                  <ArticleCard key={post.id} post={post} index={index} />
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2 serif">
                    No articles found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Try adjusting your filters or search query to find what
                    you&apos;re looking for.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white serif">
                  Menshlynews
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Where AI meets revenue. Smart money moves, investing strategies,
                and wealth building insights for the modern entrepreneur.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-sm">
                {['Investing', 'Saving', 'Retirement', 'Crypto', 'Real Estate', 'Side Hustles'].map(
                  (item) => (
                    <li key={item}>
                      <button
                        onClick={() =>
                          useBlogStore.getState().setActiveCategory(item)
                        }
                        className="hover:text-[#76bf9f] transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="hover:text-[#76bf9f] transition-colors cursor-pointer">
                        {item.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Stay Updated
              </h4>
              <p className="text-sm mb-3">
                Get weekly AI money-making tips.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#166f4f]/30"
              />
              <button className="w-full px-3 py-2 rounded-lg bg-[#166f4f] text-white text-sm font-medium hover:bg-[#166f4f] transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} Menshlynews. All rights reserved.
              Built with ❤️ by Horsnel John.
            </p>
          </div>
        </div>
      </footer>

      {/* Article Reader Overlay */}
      <AnimatePresence>
        {currentArticle && <ArticleReader post={currentArticle} />}
      </AnimatePresence>
    </div>
  );
}
