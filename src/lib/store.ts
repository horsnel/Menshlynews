import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post } from './types';

interface BlogStore {
  // Current article
  currentArticle: Post | null;
  setCurrentArticle: (post: Post | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;

  // Sort & Filter
  sortBy: 'recent' | 'popular';
  setSortBy: (sort: 'recent' | 'popular') => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;

  // Newsletter popup
  isNewsletterOpen: boolean;
  setNewsletterOpen: (open: boolean) => void;
  toggleNewsletter: () => void;
}

export const useBlogStore = create<BlogStore>()(
  persist(
    (set) => ({
      // Current article
      currentArticle: null,
      setCurrentArticle: (post: Post | null) => set({ currentArticle: post }),

      // Search
      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      isSearchOpen: false,
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),

      // Sort & Filter
      sortBy: 'recent',
      setSortBy: (sort: 'recent' | 'popular') => set({ sortBy: sort }),
      activeCategory: null,
      setActiveCategory: (category: string | null) => set({ activeCategory: category }),
      activeTag: null,
      setActiveTag: (tag: string | null) => set({ activeTag: tag }),

      // Newsletter popup
      isNewsletterOpen: false,
      setNewsletterOpen: (open: boolean) => set({ isNewsletterOpen: open }),
      toggleNewsletter: () => set((state) => ({ isNewsletterOpen: !state.isNewsletterOpen })),
    }),
    {
      name: 'menshlynews-blog-store',
      partialize: () => ({}),
    }
  )
);
