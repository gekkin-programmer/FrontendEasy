"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers, FiLock, FiMessageSquare } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import SectionBackground from './SectionBackground';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };

// --- COMPONENTS ---
const BrutalBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-4 py-1 font-black text-xs md:text-sm uppercase tracking-widest rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white">
    {children}
  </span>
);

const FeatureTag = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 text-black bg-white border border-gray-100 dark:border-zinc-700 rounded-full font-bold text-xs uppercase shadow-sm">
    {icon} <span>{text}</span>
  </div>
);

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <section
      className="w-full py-16 md:py-20 flex justify-center font-sans relative overflow-hidden"
      aria-label="Collaboration Features"
    >
      <SectionBackground />
      {/* Main Container Card */}
      <div className="relative w-full bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 shadow-xl p-6 md:p-16 overflow-hidden rounded-3xl">
        
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
            className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-white leading-[0.95] uppercase tracking-tighter"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("Create Better.", "Créer Mieux.")}<br/>
            <span className="text-[#3C48F5]">{t("Together.", "Ensemble.")}</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl font-bold text-black dark:text-white max-w-2xl mx-auto leading-snug px-2"
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
              className="inline-flex items-center gap-3 bg-white text-black font-black text-lg md:text-xl py-3 md:py-4 px-8 md:px-10 border border-gray-200 hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5] transition-all shadow-sm hover:shadow-lg rounded-xl"
            >
              {t("START COLLABORATING", "COMMENCER")} <FiArrowRight strokeWidth={3} />
            </a>
          </motion.div>
        </motion.div>

        {/* === 2. Preview GIF === */}
        <motion.div
          className="w-full max-w-6xl mx-auto mt-auto px-4 md:px-0"
          variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <img
            src="/assets/Team.gif"
            alt="Team collaboration preview"
            className="w-full rounded-xl border border-gray-100 dark:border-zinc-800 shadow-lg"
          />
        </motion.div>

      </div>
    </section>
  );
}