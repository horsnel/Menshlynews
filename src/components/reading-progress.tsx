'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

interface ReadingProgressProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ReadingProgress({ scrollContainerRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const selfRef = useRef<HTMLDivElement>(null);

  // Smooth spring animation for the progress bar
  const scaleX = useSpring(0, {
    stiffness: 150,
    damping: 25,
    mass: 0.5,
  });

  useEffect(() => {
    const container = scrollContainerRef?.current || window;

    const updateProgress = () => {
      let scrollTop: number;
      let docHeight: number;

      if (scrollContainerRef?.current) {
        const el = scrollContainerRef.current;
        scrollTop = el.scrollTop;
        docHeight = el.scrollHeight - el.clientHeight;
      } else {
        scrollTop = window.scrollY;
        docHeight = document.documentElement.scrollHeight - window.innerHeight;
      }

      if (docHeight > 0) {
        const newProgress = (scrollTop / docHeight) * 100;
        setProgress(newProgress);
        scaleX.set(newProgress / 100);
      }
    };

    container.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial check
    return () => container.removeEventListener('scroll', updateProgress);
  }, [scrollContainerRef, scaleX]);

  return (
    <div ref={selfRef} className="fixed top-0 left-0 right-0 z-[100]">
      {/* Track background */}
      <div className="h-[3px] bg-slate-200/60">
        {/* Animated progress fill using Framer Motion spring */}
        <motion.div
          className="h-full origin-left"
          style={{
            scaleX,
            background: `linear-gradient(90deg, #166f4f 0%, #1c7352 40%, #76bf9f 100%)`,
          }}
        />
      </div>
      {/* Glow effect that intensifies as progress increases */}
      <motion.div
        className="h-[2px] -mt-[2px] opacity-60"
        style={{
          scaleX,
          originX: 0,
          background: `linear-gradient(90deg, rgba(22,111,79,0) 0%, rgba(118,191,159,0.8) 100%)`,
          filter: `blur(2px)`,
        }}
      />
      {/* Percentage indicator tooltip — appears on hover or near completion */}
      <motion.div
        className="absolute top-1 -translate-x-1/2"
        style={{
          left: `${progress}%`,
        }}
        initial={{ opacity: 0, y: -5 }}
        animate={{
          opacity: progress > 5 ? 0.9 : 0,
          y: progress > 5 ? 0 : -5,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <div className="px-1.5 py-0.5 rounded bg-[#166f4f] text-white text-[9px] font-bold tabular-nums shadow-md">
            {Math.round(progress)}%
          </div>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-l-transparent border-r-transparent border-t-[#166f4f]" />
        </div>
      </motion.div>
    </div>
  );
}
