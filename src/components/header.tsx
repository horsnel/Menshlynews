'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, X, Menu } from 'lucide-react';
import { useBlogStore } from '@/lib/store';
import { posts } from '@/lib/data';

const navLinks = [
  { label: 'Home', category: null },
  { label: 'Investing', category: 'Investing' },
  { label: 'Saving', category: 'Saving' },
  { label: 'Retirement', category: 'Retirement' },
  { label: 'Crypto', category: 'Crypto' },
];

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    toggleSearch,
    setSearchOpen,
    setActiveCategory,
    activeCategory,
    setNewsletterOpen,
  } = useBlogStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5);
    }
    return [];
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchOpen, setSearchQuery]);

  const handleNavClick = (category: string | null) => {
    setActiveCategory(category);
    setMobileMenuOpen(false);
  };

  const handleSearchResultClick = (post: (typeof posts)[0]) => {
    setSearchOpen(false);
    setSearchQuery('');
    useBlogStore.getState().setCurrentArticle(post);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick(null)}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[#121212] leading-tight serif">
                Menshlynews
              </h1>
              <p className="text-[10px] text-[#166f4f] font-medium -mt-0.5 tracking-wide">
                Where AI Meets Revenue
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === link.category
                    ? 'bg-[#f0f0f0] text-[#1c7352]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Search"
              >
                {isSearchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>

              {/* Mobile: Full-screen overlay search */}
              <AnimatePresence>
                {isSearchOpen && (
                  <>
                    {/* Mobile backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    />
                    {/* Mobile search panel */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="fixed top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl z-[70] p-4 md:hidden"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#166f4f]/20 focus-within:border-[#166f4f]">
                          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full bg-transparent text-base focus:outline-none placeholder-slate-400"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="p-1.5 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="px-3 py-2 text-sm font-medium text-[#166f4f]"
                        >
                          Cancel
                        </button>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="max-h-[50vh] overflow-y-auto">
                          {searchResults.map((post) => (
                            <button
                              key={post.id}
                              onClick={() => handleSearchResultClick(post)}
                              className="w-full px-3 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 rounded-lg"
                            >
                              <p className="text-sm font-medium text-[#121212] line-clamp-2">
                                {post.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {post.excerpt}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-400">
                          No articles found
                        </div>
                      )}
                    </motion.div>
                    {/* Desktop dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="hidden md:block absolute right-0 top-12 w-96 bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 overflow-hidden z-50"
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#166f4f]/20 focus-within:border-[#166f4f]">
                          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="p-1 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="border-t border-slate-100 max-h-64 overflow-y-auto">
                          {searchResults.map((post) => (
                            <button
                              key={post.id}
                              onClick={() => handleSearchResultClick(post)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <p className="text-sm font-medium text-[#121212] line-clamp-1">
                                {post.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {post.excerpt}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                          No articles found
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => setNewsletterOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white text-sm font-medium hover:from-[#1c7352] hover:to-[#166f4f] transition-all shadow-sm"
            >
              Subscribe
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.category)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeCategory === link.category
                      ? 'bg-[#f0f0f0] text-[#1c7352]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); setNewsletterOpen(true); }}
                className="mt-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white text-sm font-medium text-center"
              >
                Subscribe
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
