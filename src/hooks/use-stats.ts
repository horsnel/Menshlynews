'use client';

import { useState, useEffect } from 'react';

interface Stats {
  subscribers: number;
  posts: number;
  categories: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return { stats };
}
