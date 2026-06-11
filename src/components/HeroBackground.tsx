import React from 'react';

export default function HeroBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="final-hero-bg">
      {/* Base Light Effect */}
      <div className="herobg-base">
        <div className="light-half-left"></div>
        <div className="light-half-right"></div>
      </div>
      
      {/* Accent Light Effect (Blend mode: plus-lighter) */}
      <div className="herobg-blend">
        <div className="light-half-left"></div>
        <div className="light-half-right"></div>
      </div>
      
      {/* Content wrapper z-indexed on top of background */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
