'use client';

import { useState, useEffect } from 'react';

export function useSubscriberCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/newsletter')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(() => setCount(null));
  }, []);

  // Format the count for display, fallback to "50,000+" if not loaded
  const displayCount = count !== null
    ? count >= 1000
      ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K+`
      : `${count}+`
    : null;

  return { count, displayCount };
}
