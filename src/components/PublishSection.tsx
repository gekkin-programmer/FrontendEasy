"use client";

import React from 'react';
import { Calendar, Clock, Wand2, Bell, CheckCircle } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';

// --- NEUBRUTALIST COMPONENTS ---

interface HardCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

const HardCard = ({ children, className = "", color = "bg-white" }: HardCardProps) => (
  <div className={`border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] ${color} ${className}`}>
    {children}
  </div>
);

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-start gap-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all cursor-default">
    <div className="flex-shrink-0 w-12 h-12 bg-[#3C48F5] border-2 border-black dark:border-white flex items-center justify-center text-white">
      {icon}
    </div>
    <p className="text-sm sm:text-base font-bold text-black dark:text-white leading-tight pt-1">{text}</p>
  </div>
);

export default function PublishSection() {
  const { t } = useLanguage();

  return (
    <section 
      className="bg-[#E0E7FF] dark:bg-[#0a0a0a] border-b-4 border-black dark:border-white/5 py-16 md:py-20 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative"
      aria-label="Publishing Features"
    >
      
      <SectionBackground />
      {/* Background Decor (CSS Only Animation for Performance) */}
      <div className="absolute top-10 left-10 w-16 h-16 md:w-20 md:h-20 bg-pink-400 border-4 border-black rounded-full opacity-50 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 md:w-32 md:h-32 bg-green-400 border-4 border-black rotate-12 opacity-50 pointer-events-none"></div>

      <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl relative z-10">
        
        {/* LEFT – VISUAL (The Browser Window) */}
        <div className="relative order-2 lg:order-1">
            {/* The Window Frame */}
            <HardCard className="rounded-xl overflow-hidden p-0 bg-gray-900">
                {/* Browser Bar */}
                <div className="bg-white dark:bg-zinc-900 border-b-4 border-black p-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 border-2 border-black"></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-400 border-2 border-black"></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 border-2 border-black"></div>
                    </div>
                    <div className="flex-1 bg-gray-100 border-2 border-black h-4 md:h-6 mx-4 rounded-full"></div>
                </div>
                
                {/* Image Content */}
                <div className="p-4 bg-gray-100 dark:bg-black">
                    <div className="border-2 border-black rounded-lg overflow-hidden relative aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Coming Soon</span>
                    </div>
                    
                    {/* Simulated UI Actions */}
                    <div className="flex justify-between items-center mt-4">
                        <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[10px] md:text-xs uppercase">
                            {t("Save Draft", "Brouillon")}
                        </button>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-1 text-[10px] md:text-xs font-mono font-bold bg-white border-2 border-black px-2 py-1 text-black">
                                <Clock className="w-3 h-3" /> 11:45 AM
                            </div>
                            <button type="button" className="cursor-pointer px-4 py-1.5 md:px-6 md:py-2 bg-white text-black font-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-[10px] md:text-xs uppercase hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                                {t("Schedule", "Programmer")}
                            </button>
                        </div>
                    </div>
                </div>
            </HardCard>

            {/* Floating Sticker */}
            <div className="absolute -top-4 -right-2 md:-top-6 md:-right-10 bg-[#3C48F5] text-white font-black px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_0px_#000] rotate-6 transform z-20">
                AUTO-POST
            </div>
        </div>

        {/* RIGHT – COPY */}
        <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
          <div>
            <span className="inline-block px-3 py-1 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-black bg-pink-400 text-black mb-4">
              {t("PUBLISH", "PUBLIER")}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-gray-200 leading-[0.95] tracking-tighter uppercase">
              {t("The complete", "L'ensemble")} <br/>
              <span className="text-[#3C48F6]">publishing</span> <br/>
              {t("suite.", "complet.")}
            </h2>
          </div>

          <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-300 leading-snug border-l-8 border-black dark:border-white pl-6">
            {t(
              "Schedule to Facebook, Instagram, TikTok, LinkedIn, and X from one dashboard. No more tab switching.",
              "Planifiez sur Facebook, Instagram, TikTok, LinkedIn et X depuis un seul tableau de bord."
            )}
          </p>

          <div className="space-y-4">
            <FeatureItem
              icon={<Bell className="w-5 h-5 md:w-6 md:h-6" />}
              text={t("Auto-publish or get notified when it's time.", "Publication auto ou notifications.")}
            />
            <FeatureItem
              icon={<Wand2 className="w-5 h-5 md:w-6 md:h-6" />}
              text={t("Magically repurpose posts for every platform.", "Réutilisez le contenu pour chaque plateforme.")}
            />
            <FeatureItem
              icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
              text={t("Visual calendar view for your entire month.", "Vue calendrier visuelle pour tout le mois.")}
            />
          </div>

          <div className="pt-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black text-lg border-4 border-transparent hover:bg-white dark:hover:bg-gray-200 hover:text-black hover:border-black dark:hover:border-white transition-all shadow-[8px_8px_0px_0px_#3C48F6] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-3 uppercase tracking-wider">
              {t("Start Publishing", "Commencer")}
              <CheckCircle strokeWidth={3} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
