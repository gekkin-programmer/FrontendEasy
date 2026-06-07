"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wand2, Bell, CheckCircle } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';

// --- NEUBRUTALIST COMPONENTS ---

interface HardCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

const HardCard = ({ children, className = "", color = "bg-white" }: HardCardProps) => (
  <div className={`border border-gray-100 dark:border-zinc-800 shadow-lg ${color} ${className}`}>
    {children}
  </div>
);

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-start gap-4 p-4 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-black">
    <div className="flex-shrink-0 w-12 h-12 bg-[#3C48F5] rounded-xl flex items-center justify-center text-white">
      {icon}
    </div>
    <p className="text-sm sm:text-base font-bold text-black dark:text-white leading-tight pt-1">{text}</p>
  </div>
);

export default function PublishSection() {
  const { t } = useLanguage();

  return (
    <section 
      className="bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 py-16 md:py-20 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative"
      aria-label="Publishing Features"
    >
      
      <SectionBackground />
      {/* Background Decor (CSS Only Animation for Performance) */}
      <div className="absolute top-10 left-10 w-16 h-16 md:w-20 md:h-20 bg-pink-100 rounded-full opacity-50 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-2xl rotate-12 opacity-50 pointer-events-none"></div>

      <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl relative z-10">
        
        {/* LEFT – VISUAL (The Browser Window) */}
        <motion.div
          className="relative order-2 lg:order-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
            {/* Illustration Card */}
            <HardCard className="rounded-xl overflow-hidden p-0 bg-white">
                <img
                  src="/assets/undraw_writing-online.svg"
                  alt="Writing online illustration"
                  className="w-full h-auto object-contain p-8 md:p-10"
                />
            </HardCard>

        </motion.div>

        {/* RIGHT – COPY */}
        <motion.div
          className="space-y-6 md:space-y-8 order-1 lg:order-2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          <div>
            <span className="inline-block px-3 py-1 font-black text-xs md:text-sm uppercase tracking-widest rounded-full bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 mb-4">
              {t("PUBLISH", "PUBLIER")}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-gray-200 leading-[0.95] tracking-tighter uppercase">
              {t("The complete", "L'ensemble")} <br/>
              <span className="text-[#3C48F6]">{t("publishing", "publication")}</span> <br/>
              {t("suite.", "complet.")}
            </h2>
          </div>

          <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-300 leading-snug border-l-2 border-[#3C48F6] pl-6">
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
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com/api'}/auth/google`}
              className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black text-lg rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-3"
            >
              {t("Start Publishing", "Commencer")}
              <CheckCircle strokeWidth={3} />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
