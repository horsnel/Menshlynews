import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post } from './data';

interface BlogStore {
  // Likes - stored as array for serialization, used as Set in logic
  likedPosts: string[];
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;

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
}

export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      // Likes
      likedPosts: [],
      toggleLike: (id: string) => {
        const current = get().likedPosts;
        if (current.includes(id)) {
          set({ likedPosts: current.filter((postId) => postId !== id) });
        } else {
          set({ likedPosts: [...current, id] });
        }
      },
      isLiked: (id: string) => {
        return get().likedPosts.includes(id);
      },

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
    }),
    {
      name: 'menshlynews-blog-store',
      partialize: (state) => ({
        likedPosts: state.likedPosts,
      }),
    }
  )
);
