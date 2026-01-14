"use client";

import React from 'react';
import { FiArrowRight, FiUsers, FiLock, FiMessageSquare } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext'; 

// --- COMPONENTS ---
const BrutalBadge = ({ children }: any) => (
  <span className="inline-block px-4 py-1 font-black text-sm uppercase tracking-widest border-2 border-black bg-white text-black transform -rotate-2">
    {children}
  </span>
);

const FeatureTag = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-200 border-2 border-black font-bold text-xs uppercase">
    {icon} <span>{text}</span>
  </div>
);

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <div className="w-full py-20 px-4">
      
      {/* Main Container Card */}
      <div className="relative bg-[#FF9900] border-4 border-black shadow-[12px_12px_0px_0px_#000] p-8 md:p-16 overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* === 1. Top Text Content === */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 mb-16">
          <BrutalBadge>{t("Collaborate", "Collaborer")}</BrutalBadge>

          <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.9] uppercase tracking-tighter">
            {t("Create Better.", "Créer Mieux.")}<br/>
            <span className="text-white text-stroke-black">Together.</span>
          </h2>

          <p className="text-xl font-bold text-black max-w-2xl mx-auto leading-snug">
            {t(
              "Stop emailing screenshots. Invite your team, assign roles, and approve posts in one shared workspace.",
              "Arrêtez d'envoyer des captures d'écran. Invitez votre équipe, attribuez des rôles et approuvez les publications dans un espace partagé."
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <FeatureTag icon={<FiUsers />} text="Unlimited Users" />
             <FeatureTag icon={<FiLock />} text="Role Based Access" />
             <FeatureTag icon={<FiMessageSquare />} text="Contextual Comments" />
          </div>

          <div className="pt-4">
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-black text-white font-black text-xl py-4 px-10 border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[8px_8px_0px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              {t("START COLLABORATING", "COMMENCER")} <FiArrowRight strokeWidth={3} />
            </a>
          </div>
        </div>

        {/* === 2. Huge Video Section (Browser Window Style) === */}
        <div className="relative w-full max-w-5xl mx-auto mt-auto">
            {/* The Window Frame */}
            <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_#000] relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
              
              {/* Browser Header */}
              <div className="bg-black p-3 flex items-center justify-between border-b-4 border-black">
                <div className="flex gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                    <div className="w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                </div>
                <div className="bg-white border-2 border-black px-4 py-1 text-xs font-mono font-bold uppercase truncate max-w-[200px]">
                    app.easypost.cm/team
                </div>
                <div className="w-8"></div> {/* Spacer */}
              </div>

              {/* Video Wrapper */}
              <div className="aspect-video w-full bg-gray-100 overflow-hidden relative group">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/assets/comment.PNG" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                >
                  <source src="/assets/CommentVideo.mp4" type="video/mp4" />
                  <img src="/assets/comment.PNG" alt="Fallback" className="w-full h-full object-cover" />
                </video>
                
                {/* Floating Label */}
                <div className="absolute bottom-4 right-4 bg-white border-2 border-black px-3 py-1 font-bold text-xs shadow-[4px_4px_0px_0px_#000]">
                    LIVE PREVIEW
                </div>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
}
