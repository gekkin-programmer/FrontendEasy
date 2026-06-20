'use client';

import React from 'react';

export default function CreateursFeatures() {
  return (
    <section className="w-full relative bg-white overflow-hidden flex justify-center min-h-[100dvh] items-center m-0 p-0">
      
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row relative z-10">
        
        {/* Left Content */}
        <div className="w-full lg:w-[574px] flex flex-col justify-center px-4 lg:pl-[64px] z-20 py-[80px] lg:py-0">
          
          {/* Subtitle */}
          <span className="font-sans font-bold text-[14px] leading-[17px] text-[#174CD2] mb-[15px] uppercase tracking-wide">
            OUTILS POUR CRÉATEURS
          </span>
          
          {/* Main Title */}
          <h2 className="font-['Rubik_One'] font-normal text-[36px] md:text-[46px] leading-[1.2] text-[#1A202C] mb-[20px]">
            EazyPost pour les createurs de contenu et influenceurs
          </h2>
          
          {/* Paragraph */}
          <p className="font-['Rubik'] font-medium text-[16px] md:text-[18px] leading-[1.6] text-[#1A202C] opacity-70 mb-[40px] max-w-[534px]">
            Publie regulierement, analyse tes perfomances et professionalise ton image sans passer ta vie sur les reseaux.
          </p>
          
          {/* Buttons Layout */}
          <div className="flex flex-row items-center gap-[24px]">
            <button className="flex items-center justify-center w-[250px] md:w-[307px] h-[50px] md:h-[70px] bg-[#174CD2] text-white rounded-[40px] font-sans font-bold text-[18px] md:text-[24px] shadow-[0px_4px_4px_5px_rgba(23,76,210,0.53)] hover:scale-105 hover:bg-blue-700 transition-all">
              Commencez maintenant
            </button>
          </div>
          
        </div>

        {/* Mobile/Tablet Image */}
        <div 
          className="lg:hidden w-full h-[400px] bg-cover bg-center mt-12 relative" 
          style={{ backgroundImage: "url('/assets/creatrice.png')" }}
        />
      </div>

      {/* Right Image Block - Desktop Absolute (Touches Top, Bottom, and Right edge of Viewport) */}
      <div 
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55vw] xl:w-[729px] h-full bg-[#AAB5C4] rounded-tl-[63px] bg-cover bg-right shadow-[4px_4px_10px_rgba(0,0,0,0.15)] z-0 m-0 p-0" 
        style={{ backgroundImage: "url('/assets/creatrice.png')" }}
      />

    </section>
  );
}
