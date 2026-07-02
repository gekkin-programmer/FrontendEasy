'use client';

import React from 'react';

export default function CreateursHero() {
  return (
    <section className="relative w-full h-auto min-h-[100dvh] lg:h-screen bg-white flex flex-col lg:flex-row items-center overflow-hidden py-[80px] lg:py-0">
      
      {/* Content Container */}
      <div className="w-full max-w-[1282px] h-full mx-auto px-4 md:px-12 lg:px-0 z-10 flex flex-col lg:flex-row lg:items-center relative">
        
        {/* Left Text Content */}
        <div className="w-full lg:w-[422px] flex flex-col justify-center gap-[20px] lg:pl-[12px] z-20">
          <div className="flex flex-col">
            <h2 className="text-[#000000] text-[24px] md:text-[36px] leading-[45px] font-['Rubik_One'] font-normal -mb-2">
              EazyPost Pour les
            </h2>
            <h1 className="text-[#174CD2] text-[40px] md:text-[70px] leading-[87px] font-['Rubik_One'] font-normal">
              Créateurs
            </h1>
          </div>
          
          <p className="text-[#000000] text-[16px] font-medium leading-[19px] font-['Rubik'] max-w-[412px]">
            Publie régulièrement, analyse tes performances et professionnalise ton image, sans passer ta vie sur les réseaux.
          </p>
          
          <div className="mt-4">
            <button className="bg-[#174CD2] text-white font-sans font-bold text-[24px] leading-[30px] rounded-[40px] flex items-center justify-center w-full max-w-[307px] h-[70px] hover:scale-105 transition-transform shadow-[0px_4px_4px_5px_rgba(23,76,210,0.53)]">
              En savoir plus sur nous
            </button>
          </div>
        </div>

      </div>

      {/* Right Image Container - Mobile/Tablet inline (Moved outside to ignore padding) */}
      <div 
        className="lg:hidden w-full h-[400px] bg-cover bg-center rounded-tl-[200px] mt-12 shadow-[4px_4px_10px_rgba(0,0,0,0.15)] relative"
        style={{ backgroundImage: "url('/assets/creatrice.png')" }}
      />

      {/* Right Image Container - Desktop Absolute */}
      <div 
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55vw] xl:w-[60vw] h-full bg-cover bg-right rounded-tl-[1000px] m-0 p-0 shadow-[4px_4px_10px_rgba(0,0,0,0.15)] z-0"
        style={{ backgroundImage: "url('/assets/creatrice.png')" }}
      />
      
    </section>
  );
}
