"use client";

import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext'; 

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <div className="w-full h-full p-4">
      
      {/* Main Container Card */}
      <div className="relative bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] pt-16 pb-0 px-6 md:px-12 shadow-sm overflow-hidden border border-amber-100 dark:border-amber-800/50 flex flex-col items-center text-center h-full">
        
        {/* === 1. Top Text Content === */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 mb-12">
          <p className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-sm">
            {t("Collaborate", "Collaborer")}
          </p>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
            {t("Great Content, Created Together", "Du contenu génial, créé ensemble")}
          </h2>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {t(
              "Collaborate seamlessly with your team. Invite unlimited collaborators, assign roles and permissions, and keep everyone aligned with saved drafts and notes.",
              "Collaborez facilement avec votre équipe. Invitez des collaborateurs illimités, attribuez des rôles et des autorisations, et gardez tout le monde aligné."
            )}
          </p>

          <div className="pt-4 flex justify-center">
            <a
              href="#"
              className="bg-primary text-white font-semibold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-blue-700 transition-all hover:scale-105"
            >
              {t("Learn more", "En savoir plus")} <FiArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* === 2. Huge Video Section === */}
        <div className="relative w-full max-w-6xl mx-auto perspective-1000 mt-auto">
          
          <div className="relative transform rotate-x-12 hover:rotate-0 transition-all duration-700 ease-out group">
            
            {/* The Color Glow (Behind) */}
            <div className="absolute -inset-1 top-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-500"></div>

            {/* The Video Container */}
            <div className="relative rounded-t-2xl md:rounded-t-[2rem] overflow-hidden border-t border-l border-r border-gray-200 dark:border-gray-700 bg-gray-900 shadow-2xl">
              
              {/* Browser Window Header */}
              <div className="bg-white dark:bg-gray-800 h-8 flex items-center px-4 gap-2 border-b border-gray-100 dark:border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              {/* Video Wrapper */}
              <div className="aspect-video w-full bg-gray-50 dark:bg-gray-900">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/assets/comment.PNG" 
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/CommentVideo.mp4" type="video/mp4" />
                  {/* Fallback if video fails */}
                  <img src="/assets/comment.PNG" alt="Fallback" className="w-full h-full object-cover" />
                </video>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
