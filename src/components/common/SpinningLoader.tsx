'use client';

import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
}

export default function SpinningLoader({ fullScreen = true, size = 120 }: LoaderProps) {
  const content = (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="487.86 428.08 285.51 636.65 792.93 636.65 349.28 863.87 344.68 862.36 462.96 708.25 114.3 708.25 114.3 650.66 339.99 428.08 487.86 428.08"
          fill="#174CD2"
        />
        <polygon
          points="210.8 356.48 645.13 135.51 649.71 140.09 537.67 284.89 886.32 284.89 886.32 342.48 663.74 565.06 512.76 565.06 718.22 356.48 210.8 356.48"
          fill="#174CD2"
        />
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-2 bg-white">{content}</div>;
}
