'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function AnimatedCounter({ end, separator }: { end: number, separator?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const duration = 2500;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart for smooth deceleration
        const ease = 1 - Math.pow(1 - progress, 4); 
        setCount(Math.floor(ease * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end]);

  return (
    <span ref={ref}>
      {separator ? count.toLocaleString('en-US') : count}
    </span>
  );
}
