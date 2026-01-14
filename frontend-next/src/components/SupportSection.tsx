"use client";

import React from 'react';
import { FaArrowRight, FaWhatsapp, FaHeadset } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext'; 

// --- COMPONENTS ---
const BrutalButton = ({ children, icon, color, href }: any) => (
  <a
    href={href}
    className={`
      flex items-center justify-center gap-2 px-8 py-4 font-black text-lg uppercase tracking-wider
      border-4 border-black bg-white text-black shadow-[6px_6px_0px_0px_#000]
      hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] 
      transition-all w-full sm:w-auto
      ${color === 'primary' ? 'hover:bg-[#3C48F6] hover:text-white' : 'hover:bg-green-400'}
    `}
  >
    {icon} {children}
  </a>
);

export default function SupportSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-pink-100 border-b-4 border-black py-24 px-4 font-sans relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300 border-4 border-black rounded-full animate-bounce-slow hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#3C48F6] border-4 border-black rotate-12 hidden md:block"></div>

      <div className="container mx-auto flex max-w-4xl flex-col items-center gap-8 text-center relative z-10">
        
        {/* Top Label */}
        <div className="bg-black text-white px-4 py-1 font-bold text-sm uppercase tracking-widest border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          {t("24/7 SUPPORT", "SUPPORT 24/7")}
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase">
          {t("HUMAN SUPPORT,", "SUPPORT HUMAIN,")}<br/>
          <span className="text-white text-stroke-black bg-black px-2">WORLDWIDE.</span>
        </h2>

        {/* Illustration (Icon Cluster) */}
        <div className="flex justify-center -space-x-4 my-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 rounded-full border-4 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_#000] hover:-translate-y-2 transition-transform">
                    <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Agent" className="w-full h-full object-cover grayscale hover:grayscale-0" />
                </div>
            ))}
            <div className="w-16 h-16 rounded-full border-4 border-black bg-yellow-300 flex items-center justify-center shadow-[4px_4px_0px_0px_#000] z-10">
                <FaHeadset className="w-8 h-8 text-black" />
            </div>
        </div>

        {/* First Paragraph */}
        <p className="text-xl font-bold text-gray-900 leading-snug max-w-2xl bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
          {t(
            "Our global Customer Advocacy team is spread across time zones to make sure help is always nearby. No bots, just real people who care.",
            "Notre équipe mondiale est répartie sur plusieurs fuseaux horaires pour s'assurer que l'aide est toujours à portée de main. Pas de bots, juste de vraies personnes."
          )}
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row w-full justify-center">
          <BrutalButton href="#" color="primary" icon={<FaHeadset />}>
            {t("HELP CENTER", "CENTRE D'AIDE")}
          </BrutalButton>
          <BrutalButton href="#" color="whatsapp" icon={<FaWhatsapp />}>
            {t("WHATSAPP COMMUNITY", "COMMUNAUTÉ WHATSAPP")}
          </BrutalButton>
        </div>

        {/* Final Link */}
        <a
          href="#"
          className="group mt-8 inline-flex items-center gap-2 font-black text-black text-lg border-b-4 border-transparent hover:border-black transition-all"
        >
          {t("MEET THE TEAM", "RENCONTREZ L'ÉQUIPE")}
          <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};
