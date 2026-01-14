"use client";

import React from 'react';
import { Calendar, Clock, Wand2, Bell, CheckCircle } from "lucide-react";
import { useLanguage } from '../context/LanguageContext'; 

// --- NEUBRUTALIST COMPONENTS ---

const HardCard = ({ children, className = "", color = "bg-white" }: any) => (
  <div className={`border-4 border-black shadow-[8px_8px_0px_0px_#000] ${color} ${className}`}>
    {children}
  </div>
);

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-start gap-4 p-4 border-2 border-black bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all cursor-default">
    <div className="flex-shrink-0 w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center text-black">
      {icon}
    </div>
    <p className="text-base font-bold text-black leading-tight pt-1">{text}</p>
  </div>
);

export default function PublishSection() {
  const { t } = useLanguage();
  const publishImage = "/assets/postKanban.PNG"; // Ensure this path is correct

  return (
    <section className="bg-[#E0E7FF] dark:bg-black/90 border-b-4 border-black dark:border-white/5 py-20 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400 border-4 border-black rounded-full opacity-50 animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-400 border-4 border-black rotate-12 opacity-50"></div>

      <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center max-w-7xl relative z-10">
        
        {/* LEFT – VISUAL (The Browser Window) */}
        <div className="relative">
            {/* The Window Frame */}
            <HardCard className="rounded-xl overflow-hidden p-0 bg-gray-900">
                {/* Browser Bar */}
                <div className="bg-white border-b-4 border-black p-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black"></div>
                        <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-black"></div>
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
                    </div>
                    <div className="flex-1 bg-gray-100 border-2 border-black h-6 mx-4 rounded-full"></div>
                </div>
                
                {/* Image Content */}
                <div className="p-4 bg-gray-100">
                    <div className="border-2 border-black rounded-lg overflow-hidden">
                        <img 
                           src={publishImage}
                           alt="Kanban View"
                           className="w-full h-auto object-cover" 
                        />
                    </div>
                    
                    {/* Simulated UI Actions */}
                    <div className="flex justify-between items-center mt-4">
                        <button className="px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs uppercase">
                            {t("Save Draft", "Brouillon")}
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs font-mono font-bold bg-white border-2 border-black px-2 py-1">
                                <Clock className="w-3 h-3" /> 11:45 AM
                            </div>
                            <button className="px-6 py-2 bg-[#3C48F6] text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs uppercase hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                                {t("Schedule", "Programmer")}
                            </button>
                        </div>
                    </div>
                </div>
            </HardCard>

            {/* Floating Sticker */}
            <div className="absolute -top-6 -right-6 md:-right-10 bg-yellow-300 text-black font-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] rotate-6 transform">
                AUTO-POST
            </div>
        </div>

        {/* RIGHT – COPY */}
        <div className="space-y-8">
          <div>
            <span className="inline-block px-3 py-1 font-black text-sm uppercase tracking-widest border-2 border-black bg-pink-400 text-black mb-4">
              {t("PUBLISH", "PUBLIER")}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-gray-200 leading-[0.95] tracking-tighter uppercase">
              {t("The complete", "L'ensemble")} <br/>
              <span className="text-[#3C48F6]">publishing</span> <br/>
              {t("suite.", "complet.")}
            </h2>
          </div>

          <p className="text-xl font-bold text-gray-800 dark:text-gray-300 leading-snug border-l-8 border-black pl-6">
            {t(
              "Schedule to Facebook, Instagram, TikTok, LinkedIn, and X from one dashboard. No more tab switching.",
              "Planifiez sur Facebook, Instagram, TikTok, LinkedIn et X depuis un seul tableau de bord."
            )}
          </p>

          <div className="space-y-4">
            <FeatureItem
              icon={<Bell className="w-6 h-6" />}
              text={t("Auto-publish or get notified when it's time.", "Publication auto ou notifications.")}
            />
            <FeatureItem
              icon={<Wand2 className="w-6 h-6" />}
              text={t("Magically repurpose posts for every platform.", "Réutilisez le contenu pour chaque plateforme.")}
            />
            <FeatureItem
              icon={<Calendar className="w-6 h-6" />}
              text={t("Visual calendar view for your entire month.", "Vue calendrier visuelle pour tout le mois.")}
            />
          </div>

          <div className="pt-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white/5 text-white font-black text-lg border-4 border-transparent hover:bg-white dark:hover:bg-gray-200 hover:text-black hover:border-black transition-all shadow-[8px_8px_0px_0px_#3C48F6] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-3 uppercase tracking-wider">
              {t("Start Publishing", "Commencer")}
              <CheckCircle strokeWidth={3} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
