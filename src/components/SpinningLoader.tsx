'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
}

export default function SpinningLoader({ fullScreen = true, size = 50 }: LoaderProps) {
  
  const content = (
    <div 
      className="relative flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      {/* 1. The Spinning E */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1, // Slightly faster for snappier feel
          ease: "linear" 
        }}
        className="relative z-10"
        style={{ width: size, height: size }}
      >
        <Image 
          src="/assets/WiggleLogo.png" 
          alt="" // Alt empty as it's decorative in this context (status role handles it)
          fill
          className="object-contain"
          priority
          sizes={`${size}px`}
        />
      </motion.div>

      {/* 2. Simplified Pulse (No Blur for Performance) */}
      <motion.div 
        className="absolute rounded-full border-2 border-[#3C48F6]/20"
        style={{ width: size + 10, height: size + 10 }}
        animate={{ scale: [0.8, 1.2], opacity: [0.5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-[2px]">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-2">{content}</div>;
}