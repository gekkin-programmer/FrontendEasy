"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers, FiLock, FiMessageSquare } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };

// --- COMPONENTS ---
const BrutalBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-4 py-1 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-white bg-transparent text-white transform -rotate-2">
    {children}
  </span>
);

const FeatureTag = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 text-black bg-white border-2 border-white font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
    {icon} <span>{text}</span>
  </div>
);

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <section
      className="w-full py-16 md:py-20 px-4 flex justify-center font-sans relative overflow-hidden"
      aria-label="Collaboration Features"
    >
      <SectionBackground />
      {/* Main Container Card */}
      <div className="relative w-full max-w-7xl bg-black border-4 border-black dark:border-white/5 shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] p-6 md:p-16 overflow-hidden rounded-sm">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '20px 20px' }} aria-hidden="true" />

        {/* === 1. Top Text Content === */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <BrutalBadge>{t("Collaborate", "Collaborer")}</BrutalBadge>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[0.95] uppercase tracking-tighter"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("Create Better.", "Créer Mieux.")}<br/>
            <span className="text-[#3C48F5] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">Together.</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl font-bold text-white max-w-2xl mx-auto leading-snug px-2"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t(
              "Stop emailing screenshots. Invite your team, assign roles, and approve posts in one shared workspace.",
              "Arrêtez d'envoyer des captures d'écran. Invitez votre équipe, attribuez des rôles et approuvez les publications dans un espace partagé."
            )}
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-3 md:gap-4"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
          >
             <FeatureTag icon={<FiUsers />} text={t("Unlimited Users", "Utilisateurs Illimités")} />
             <FeatureTag icon={<FiLock />} text={t("Role Based Access", "Accès par Rôle")} />
             <FeatureTag icon={<FiMessageSquare />} text={t("Contextual Comments", "Commentaires Contextuels")} />
          </motion.div>

          <motion.div className="pt-4" variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }}>
            <a
              href="/signup"
              className="inline-flex items-center gap-3 bg-white text-black font-black text-lg md:text-xl py-3 md:py-4 px-8 md:px-10 border-4 border-white hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5] transition-all shadow-[6px_6px_0px_0px_#3C48F5] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-sm"
            >
              {t("START COLLABORATING", "COMMENCER")} <FiArrowRight strokeWidth={3} />
            </a>
          </motion.div>
        </motion.div>

        {/* === 2. MacBook Mockup === */}
        <motion.div
          className="relative w-full max-w-4xl mx-auto mt-auto px-4 md:px-0"
          variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* MacBook Lid */}
          <div className="relative mx-auto" style={{ width: '100%' }}>
            {/* Screen housing */}
            <div className="relative bg-gradient-to-b from-[#d1d1d1] to-[#b8b8b8] rounded-t-2xl border-[3px] border-[#a0a0a0] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] p-[10px] pb-0">
              {/* Camera notch */}
              <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#555] border border-[#444]" />
              {/* Screen bezel */}
              <div className="bg-black rounded-t-xl overflow-hidden border border-[#222]">
                {/* Screen content area */}
                <div className="aspect-[16/10] w-full bg-gray-900 flex items-center justify-center relative">
                  <div className="text-center space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Your mockup here</div>
                    <div className="w-16 h-0.5 bg-gray-700 mx-auto" />
                    <div className="text-[9px] font-mono text-gray-700">app.eazypost.cm/team</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Hinge */}
            <div className="bg-gradient-to-b from-[#b0b0b0] to-[#c8c8c8] h-[6px] border-x-[3px] border-[#a0a0a0] shadow-inner" />
            {/* Base / keyboard */}
            <div className="bg-gradient-to-b from-[#c8c8c8] to-[#d8d8d8] rounded-b-2xl border-[3px] border-t-0 border-[#a0a0a0] px-6 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              {/* Keyboard rows (decorative) */}
              <div className="space-y-1.5 mb-3">
                {[11, 9, 9, 9].map((cols, row) => (
                  <div key={row} className="flex gap-1 justify-center">
                    {[...Array(cols)].map((_, i) => (
                      <div key={i} className="h-3 flex-1 max-w-[28px] bg-[#b8b8b8] rounded-sm border border-[#a0a0a0] shadow-[0_1px_0_#888]" />
                    ))}
                  </div>
                ))}
              </div>
              {/* Trackpad */}
              <div className="mx-auto w-24 h-14 bg-[#b8b8b8] rounded-lg border border-[#a0a0a0] shadow-inner" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}