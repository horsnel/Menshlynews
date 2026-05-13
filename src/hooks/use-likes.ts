'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Generate a simple browser fingerprint (stored in localStorage)
function getFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const stored = localStorage.getItem('mw-fp');
  if (stored) return stored;

  // Generate a simple fingerprint based on browser properties
  const nav = navigator;
  const screen = window.screen;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const fp = 'fp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
  localStorage.setItem('mw-fp', fp);
  return fp;
}

interface LikeData {
  [postId: string]: {
    count: number;
    liked: boolean;
  };
}

export function useLikes() {
  const [likeData, setLikeData] = useState<LikeData>({});
  const fingerprintRef = useRef('');
  const [loading, setLoading] = useState(true);

  // Initialize fingerprint and fetch likes
  useEffect(() => {
    const fp = getFingerprint();
    fingerprintRef.current = fp;

    fetch(`/api/likes?fp=${fp}`)
      .then((res) => res.json())
      .then((data: LikeData) => {
        setLikeData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!fingerprintRef.current) return;

      // Optimistic update
      const current = likeData[postId] || { count: 0, liked: false };
      const optimisticLiked = !current.liked;
      const optimisticCount = optimisticLiked
        ? current.count + 1
        : Math.max(0, current.count - 1);

      setLikeData((prev) => ({
        ...prev,
        [postId]: { count: optimisticCount, liked: optimisticLiked },
      }));

      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, fingerprint: fingerprintRef.current }),
        });
        const data = await res.json();
        // Update with server response
        setLikeData((prev) => ({
          ...prev,
          [postId]: { count: data.count, liked: data.liked },
        }));
      } catch {
        // Revert on error
        setLikeData((prev) => ({
          ...prev,
          [postId]: current,
        }));
      }
    },
    [likeData]
  );

  const getLikeCount = useCallback(
    (postId: string, fallback: number): number => {
      if (loading) return fallback;
      return likeData[postId]?.count ?? fallback;
    },
    [likeData, loading]
  );

  const isLiked = useCallback(
    (postId: string): boolean => {
      return likeData[postId]?.liked ?? false;
    },
    [likeData]
  );

  return { getLikeCount, isLiked, toggleLike, loading };
}
