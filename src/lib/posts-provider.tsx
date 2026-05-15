'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Post, Category } from './types';

interface PostsContextValue {
  posts: Post[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const PostsContext = createContext<PostsContextValue>({
  posts: [],
  categories: [],
  loading: true,
  error: null,
});

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();

        if (!cancelled) {
          setPosts(data.posts || []);
          setCategories(data.categories || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PostsProvider fetch error:', err);
          setError('Failed to load articles');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, []);

  return (
    <PostsContext.Provider value={{ posts, categories, loading, error }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
