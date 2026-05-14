'use client';

import { useEffect, useState, useRef } from 'react';

interface ReadingProgressProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ReadingProgress({ scrollContainerRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const selfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef?.current || window;

    const updateProgress = () => {
      let scrollTop: number;
      let docHeight: number;

      if (scrollContainerRef?.current) {
        // Scrolling inside a specific container (like the article overlay)
        const el = scrollContainerRef.current;
        scrollTop = el.scrollTop;
        docHeight = el.scrollHeight - el.clientHeight;
      } else {
        // Scrolling on the window
        scrollTop = window.scrollY;
        docHeight = document.documentElement.scrollHeight - window.innerHeight;
      }

      if (docHeight > 0) {
        setProgress((scrollTop / docHeight) * 100);
      }
    };

    container.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial check
    return () => container.removeEventListener('scroll', updateProgress);
  }, [scrollContainerRef]);

  return (
    <div ref={selfRef} className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-slate-100/50">
      <div
        className="h-full bg-gradient-to-r from-[#166f4f] to-[#1c7352] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
