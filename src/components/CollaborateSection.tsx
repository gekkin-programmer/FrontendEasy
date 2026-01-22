"use client";

import React from 'react';
import Image from 'next/image';
import { FiArrowRight, FiUsers, FiLock, FiMessageSquare } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext'; 

// --- COMPONENTS ---
const BrutalBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-4 py-1 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-black bg-white text-black transform -rotate-2">
    {children}
  </span>
);

const FeatureTag = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 text-black bg-orange-200 border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
    {icon} <span>{text}</span>
  </div>
);

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <section 
      className="w-full py-16 md:py-20 px-4 flex justify-center font-sans"
      aria-label="Collaboration Features"
    >
      
      {/* Main Container Card */}
      <div className="relative w-full max-w-7xl bg-[#FF9900] border-4 border-black dark:border-white/5 shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] p-6 md:p-16 overflow-hidden rounded-sm">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '20px 20px' }} aria-hidden="true" />

        {/* === 1. Top Text Content === */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <BrutalBadge>{t("Collaborate", "Collaborer")}</BrutalBadge>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-black leading-[0.95] uppercase tracking-tighter">
            {t("Create Better.", "Créer Mieux.")}<br/>
            <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Together.</span>
          </h2>

          <p className="text-lg md:text-xl font-bold text-black max-w-2xl mx-auto leading-snug px-2">
            {t(
              "Stop emailing screenshots. Invite your team, assign roles, and approve posts in one shared workspace.",
              "Arrêtez d'envoyer des captures d'écran. Invitez votre équipe, attribuez des rôles et approuvez les publications dans un espace partagé."
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
             <FeatureTag icon={<FiUsers />} text={t("Unlimited Users", "Utilisateurs Illimités")} />
             <FeatureTag icon={<FiLock />} text={t("Role Based Access", "Accès par Rôle")} />
             <FeatureTag icon={<FiMessageSquare />} text={t("Contextual Comments", "Commentaires Contextuels")} />
          </div>

          <div className="pt-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-3 bg-black text-white font-black text-lg md:text-xl py-3 md:py-4 px-8 md:px-10 border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-sm"
            >
              {t("START COLLABORATING", "COMMENCER")} <FiArrowRight strokeWidth={3} />
            </a>
          </div>
        </div>

        {/* === 2. Huge Video Section (Browser Window Style) === */}
        <div className="relative w-full max-w-5xl mx-auto mt-auto px-2 md:px-0">
            {/* The Window Frame */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] md:shadow-[16px_16px_0px_0px_#000] relative transform rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm overflow-hidden">
              
              {/* Browser Header */}
              <div className="bg-black p-2 md:p-3 flex items-center justify-between border-b-4 border-black">
                <div className="flex gap-1.5 md:gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-black rounded-full"></div>
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-black rounded-full"></div>
                </div>
                <div className="bg-white border-2 text-black border-black px-3 md:px-4 py-0.5 md:py-1 text-[10px] md:text-xs font-mono font-bold uppercase truncate max-w-[150px] md:max-w-[200px]">
                    app.easypost.cm/team
                </div>
                <div className="w-6 md:w-8"></div> {/* Spacer */}
              </div>

              {/* Video Wrapper */}
              <div className="aspect-video w-full bg-gray-100 relative group">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/assets/comment.PNG" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                >
                  <source src="/assets/CommentVideo.mp4" type="video/mp4" />
                  {/* Fallback for browsers that don't support video */}
                  <Image 
                    src="/assets/comment.PNG" 
                    alt="Team collaboration interface preview" 
                    fill
                    className="object-cover"
                  />
                </video>
                
                {/* Floating Label */}
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white border-2 text-black border-black px-2 md:px-3 py-0.5 md:py-1 font-bold text-[10px] md:text-xs shadow-[3px_3px_0px_0px_#000]">
                    LIVE PREVIEW
                </div>
              </div>
            </div>
        </div>

      </div>
    </section>
  );
}