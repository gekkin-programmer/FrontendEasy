import React from 'react';

export default function AProposSection() {
  return (
    <section className="w-full bg-white relative flex flex-col items-center pt-[40px] pb-[100px]">
      {/* 
        Container matching the exact Figma dimensions for the section.
        Width: 1312 + 64*2 = 1440px approx. 
        Height: 999px.
      */}
      <div className="relative w-full max-w-none px-[2%] h-[999px]">
        
        {/* Title: "A Propos De Nous" */}
        {/* Centered at the top of the section */}
        <div className="absolute top-[0px] w-full flex flex-col items-center justify-center text-center z-10">
          <h2 
            className="text-[#000000] text-[36px] leading-[45px] -mb-2"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            A Propos De
          </h2>
          <h1 
            className="text-[#174CD2] text-[70px] leading-[87px]"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            Nous
          </h1>
        </div>

        {/* Main Outlined Card (Rectangle 135) */}
        {/* Increased width to be wider and centered instead of absolute left */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[175px] w-[95%] max-w-[1800px] h-[824px] bg-white border-[3px] border-[#174CD2] rounded-[10px] overflow-hidden">
          
          {/* Decorative Shape Bottom Left (Rectangle 155) */}
          {/* relative left: 0, top: 765px (6416 - 5651) */}
          <div className="absolute w-[95px] h-[59px] left-[-3px] top-[762px] bg-[#174CD2] border-[3px] border-[#174CD2] rounded-[10px_40px_10px_10px] z-10" />

          {/* Decorative Shape Top Right (Rectangle 156) */}
          <div className="absolute w-[95px] h-[59px] right-[-3px] top-[-3px] bg-[#174CD2] border-[3px] border-[#174CD2] rounded-[10px_40px_10px_10px] transform rotate-[179.4deg] z-10" />

          {/* Right Column / Image (Rectangle 136) */}
          {/* Covers the right side fully */}
          <div className="absolute right-0 top-0 w-[50%] h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/apropos-image.jpg" 
              alt="À propos de nous" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Left Column Content */}
          <div className="absolute left-0 top-0 w-[50%] h-full flex flex-col items-center justify-center px-[4%] gap-[80px]">
            
            <div className="flex flex-col items-center gap-[60px]">
              {/* Paragraph 1 */}
              <p className="w-full max-w-[580px] text-center text-[#000000] font-[600] text-[20px] leading-[30px]" style={{ fontFamily: "'Rubik', sans-serif" }}>
                BEST-CORP propulse l’écosystème numérique africain. Startup technologique basée au Cameroun, nous déployons une offre intégrée : SaaS, IA, IT, Marketing et Esport; pour outiller les entreprises dans leur progression tout en créant des opportunités durables pour la jeunesse.
              </p>

              {/* Paragraph 2 */}
              <p className="w-full max-w-[580px] text-center text-[#000000] font-[600] text-[20px] leading-[30px]" style={{ fontFamily: "'Rubik', sans-serif" }}>
                Au cœur de son département SaaS, BEST‑CORP développe plusieurs solutions dont Eazypost, une plateforme de gestion des réseaux sociaux pensée d’abord pour les réalités africaines : multi‑plateforme, simple à prendre en main, accessible en prix et taillée pour les créateurs, PME, agences et organisations du continent. Eazypost s’impose comme l’une des solutions phares de BEST‑CORP, en incarnant sa vision, offrir des outils professionnels, robustes et modernes, tout en restant d’une simplicité fluide et accessible.
              </p>
            </div>

            {/* Button */}
            <button className="w-[347px] h-[70px] bg-[#174CD2] rounded-[40px] flex justify-center items-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <span className="font-[700] text-[24px] leading-[30px] text-white" style={{ fontFamily: "'Rubik', sans-serif" }}>
                En savoir plus sur nous
              </span>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
