'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoaderProps {
  fullScreen?: boolean; // If true, covers whole screen. If false, fits inside container.
  size?: number;        // Size of the logo
}

export default function SpinningLoader({ fullScreen = true, size = 60 }: LoaderProps) {
  
  const content = (
    <div className="relative flex items-center justify-center">
      {/* 1. The Spinning E */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.2, // Speed of rotation
          ease: "linear" 
        }}
        className="relative z-10"
      >
        <Image 
          src="/assets/WiggleLogo.png" 
          alt="Loading..." 
          width={size} 
          height={size} 
          className="object-contain"
          priority
        />
      </motion.div>

      {/* 2. Optional: Subtle Glow/Pulse behind it */}
      <motion.div 
        className="absolute bg-[#3C48F6] rounded-full opacity-20 blur-xl"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{content}</div>;
}