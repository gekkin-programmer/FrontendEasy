"use client";

import React from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { FaArrowRight, FaWhatsapp, FaHeadset } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';

const revealItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// --- COMPONENTS ---
const BrutalButton = ({ children, icon, color, href, target, rel }: any) => (
  <a
    href={href}
    target={target}
    rel={rel}
    className={`
      flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 font-black text-sm md:text-lg uppercase tracking-wider
      border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-xl
      hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff]
      transition-all w-full sm:w-auto
    `}
    aria-label={typeof children === 'string' ? children : 'Support Button'}
  >
    {icon} {children}
  </a>
);

export default function SupportSection() {
  const { t } = useLanguage();

  return (
    <section 
      className="bg-white dark:bg-black border-b-4 dark:border-black border-black py-16 md:py-24 px-4 font-sans relative overflow-hidden"
      aria-label="Customer Support"
    >
      
      <SectionBackground />
      {/* Decorative Elements (CSS Only for perf) */}
      <div className="absolute top-10 left-10 w-12 h-12 md:w-16 md:h-16 bg-blue-100 border-4 border-black dark:border-white rounded-full animate-bounce-slow hidden md:block pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 md:w-24 md:h-24 bg-[#3C48F6] border-4 border-black rotate-12 hidden md:block pointer-events-none"></div>

      <motion.div
        className="container mx-auto flex max-w-4xl flex-col items-center gap-6 md:gap-8 text-center relative z-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        
        {/* Top Label */}
        <motion.div variants={revealItem} className="bg-black dark:bg-white text-white dark:text-black px-4 py-1 font-bold text-xs md:text-sm uppercase tracking-widest border-2 border-white dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          {t("24/7 SUPPORT", "SUPPORT 24/7")}
        </motion.div>

        {/* Main Heading */}
        <motion.h2 variants={revealItem} className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-gray-200 leading-[0.9] tracking-tighter uppercase">
          {t("HUMAN SUPPORT,", "SUPPORT HUMAIN,")}<br/>
          <span className="text-white dark:text-black text-stroke-black bg-black dark:bg-white px-2 mt-2 inline-block">WORLDWIDE.</span>
        </motion.h2>

        {/* Illustration (Icon Cluster) */}
        <motion.div variants={revealItem} className="flex justify-center -space-x-4 my-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] relative">
                    <Image
                      src={`https://i.pravatar.cc/150?img=${i + 20}`}
                      alt="Support Agent"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                </div>
            ))}
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-black bg-[#3C48F6] flex items-center justify-center shadow-[4px_4px_0px_0px_#000] z-10 text-white">
                <FaHeadset className="w-6 h-6 md:w-8 md:h-8" />
            </div>
        </motion.div>

        {/* First Paragraph */}
        <motion.p variants={revealItem} className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug max-w-2xl bg-white dark:bg-black border-4 border-black dark:border-white p-4 md:p-6 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]">
          {t(
            "Our global Customer Advocacy team is spread across time zones to make sure help is always nearby. No bots, just real people who care.",
            "Notre équipe mondiale est répartie sur plusieurs fuseaux horaires pour s'assurer que l'aide est toujours à portée de main. Pas de bots, juste de vraies personnes."
          )}
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={revealItem} className="mt-4 flex flex-col gap-4 sm:flex-row w-full justify-center">
          <BrutalButton href="/help" color="primary" icon={<FaHeadset />}>
            {t("HELP CENTER", "CENTRE D'AIDE")}
          </BrutalButton>
          <BrutalButton href="https://whatsapp.com/channel/0029VbC0LNr9WtCDNpRnPn27" color="whatsapp" icon={<FaWhatsapp />} target="_blank" rel="noopener noreferrer">
            {t("WHATSAPP COMMUNITY", "COMMUNAUTÉ WHATSAPP")}
          </BrutalButton>
        </motion.div>

        {/* Final Link */}
        <motion.a variants={revealItem}
          href="/about"
          className="group mt-4 md:mt-8 inline-flex items-center gap-2 font-black text-black dark:text-white text-base md:text-lg border-b-4 border-transparent hover:border-black dark:hover:border-white transition-all"
        >
          {t("MEET THE TEAM", "RENCONTREZ L'ÉQUIPE")}
          <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </motion.a>
      </motion.div>
    </section>
  );
};
