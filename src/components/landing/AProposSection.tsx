'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AProposSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-white flex flex-col items-center pt-12 px-4 relative">
      {/* Title */}
      <div className="w-full flex flex-col items-center text-center mb-12">
        <h2 className="font-['Rubik_One'] font-normal text-[24px] md:text-[30px] lg:text-[36px] leading-tight lg:leading-[45px] text-black relative z-2">
          {t("About Us Heading", "A propos de")}
        </h2>
        <h1 className="font-['Rubik_One'] font-normal text-[48px] md:text-[58px] lg:text-[70px] leading-tight lg:leading-[87px] text-[#174CD2] mt-[-5px] md:mt-[-10px] lg:mt-[-20px] relative z-1">
          {t("Us", "Nous")}
        </h1>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-[1200px] 3xl:max-w-[1600px] bg-white border-2 border-[#174CD2] rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
        
        {/* Decorative Shape Bottom Left */}
        <div className="absolute w-[70px] h-[40px] md:w-[95px] md:h-[59px] left-[-2px] bottom-[-2px] bg-[#174CD2] border-2 border-[#174CD2] rounded-[10px_40px_10px_10px] z-10" />

        
       
{/* Left Column */}
<div className="relative w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-10 gap-10">
  


  <div className="flex flex-col items-center gap-8">
    {/* Paragraph 1 */}
    <p className="text-center text-black font-normal text-base md:text-lg leading-relaxed max-w-[580px]" style={{ fontFamily: "'Rubik', sans-serif" }}>
      {t("BEST-CORP powers the African digital ecosystem. A technology startup based in Cameroon, we deploy an integrated offering: SaaS, AI, IT, Marketing and Esport; to equip businesses in their progress while creating sustainable opportunities for youth.", "BEST-CORP propulse l’écosystème numérique africain. Startup technologique basée au Cameroun, nous déployons une offre intégrée : SaaS, IA, IT, Marketing et Esport; pour outiller les entreprises dans leur progression tout en créant des opportunités durables pour la jeunesse.")}
    </p>

    {/* Paragraph 2 */}
    <p className="text-center text-black font-normal text-base md:text-lg leading-relaxed max-w-[580px]" style={{ fontFamily: "'Rubik', sans-serif" }}>
      {t("At the heart of its SaaS department, BEST-CORP develops several solutions including Eazypost, a social media management platform designed primarily for African realities: multi-platform, easy to learn, affordable and tailored for creators, SMEs, agencies and organizations on the continent.", "Au cœur de son département SaaS, BEST‑CORP développe plusieurs solutions dont Eazypost, une plateforme de gestion des réseaux sociaux pensée d’abord pour les réalités africaines : multi‑plateforme, simple à prendre en main, accessible en prix et taillée pour les créateurs, PME, agences et organisations du continent.")}
    </p>
  </div>

  {/* Button */}
  <button className="w-[80%] max-w-[280px] md:max-w-[347px] h-[55px] md:h-[70px] bg-[#174CD2] rounded-full flex justify-center items-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
    <span className="font-bold text-lg md:text-xl text-white" style={{ fontFamily: "'Rubik', sans-serif" }}>
      {t("Learn more about us", "En savoir plus sur nous")}
    </span>
  </button>
</div>


        {/* Right Column / Image */}
        <div className="w-full md:w-1/2 h-[250px] md:h-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/apropos-image.jpg"
            alt={t("About us", "À propos de nous")}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
