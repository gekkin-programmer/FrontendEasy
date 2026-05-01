'use client';

import React from 'react';
import Image from 'next/image';

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
}

export default function SpinningLoader({ fullScreen = true, size = 50 }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src="/assets/WiggleLogo.png"
          alt=""
          fill
          className="object-contain"
          priority
          sizes={`${size}px`}
        />
      </div>
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
        By Best-Corp
      </p>
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
