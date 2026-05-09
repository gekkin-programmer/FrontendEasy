"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import {
  FaArrowRight, FaYoutube, FaLinkedinIn, FaInstagram, FaTwitter,
  FaFacebookF, FaPinterestP, FaSlack, FaGithub, FaMastodon,
  FaWhatsapp, FaDiscord, FaSnapchat, FaTelegram
} from "react-icons/fa6";
import { SiTiktok, SiThreads, SiMedium, SiTwitch } from "react-icons/si";
import Link from 'next/link';

// --- TYPES ---
interface IconConfig {
  Icon: React.ElementType;
  pos: string;
  color: string;
  delay: number;
  rot: number;
}

// --- ANIMATION VARIANTS ---
const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

// --- ICON CONFIGURATION ---
const icons: IconConfig[] = [
  // Left Side
  { Icon: FaYoutube, pos: "top-[12%] left-[5%]", color: "#FF0000", delay: 0, rot: -5 },
  { Icon: FaInstagram, pos: "bottom-[20%] left-[3%]", color: "#E1306C", delay: 0.6, rot: 12 },
  { Icon: SiTiktok, pos: "top-[50%] left-[8%]", color: "#000000", delay: 1, rot: -8 },
  { Icon: FaPinterestP, pos: "bottom-[40%] left-[12%]", color: "#E60023", delay: 1.2, rot: 4 },
  { Icon: FaSlack, pos: "top-[25%] left-[15%]", color: "#4A154B", delay: 1.4, rot: -15 },
  { Icon: SiTwitch, pos: "bottom-[10%] left-[20%]", color: "#9146FF", delay: 1.6, rot: 6 },
  { Icon: FaMastodon, pos: "top-[35%] right-[25%]", color: "#6364FF", delay: 1.8, rot: -9 },

  // Right Side
  { Icon: FaTwitter, pos: "top-[8%] right-[8%]", color: "#1DA1F2", delay: 0.2, rot: 10 },
  { Icon: FaLinkedinIn, pos: "top-[45%] right-[2%]", color: "#0A66C2", delay: 0.4, rot: -6 },
  { Icon: FaFacebookF, pos: "bottom-[10%] right-[10%]", color: "#1877F2", delay: 0.8, rot: 8 },
  { Icon: SiThreads, pos: "top-[20%] right-[15%]", color: "#000000", delay: 1.1, rot: -12 },
  { Icon: FaGithub, pos: "top-[60%] right-[12%]", color: "#181717", delay: 1.5, rot: -3 },
  { Icon: SiMedium, pos: "bottom-[50%] right-[18%]", color: "#000000", delay: 1.7, rot: 9 },

  // Extra platforms
  { Icon: FaWhatsapp, pos: "top-[70%] left-[2%]", color: "#25D366", delay: 2.0, rot: 7 },
  { Icon: FaDiscord, pos: "bottom-[30%] right-[5%]", color: "#5865F2", delay: 2.1, rot: -10 },
  { Icon: FaSnapchat, pos: "bottom-[15%] left-[30%]", color: "#FFFC00", delay: 2.2, rot: 5 },
  { Icon: FaTelegram, pos: "top-[15%] left-[28%]", color: "#26A5E4", delay: 2.3, rot: -7 },
];

// --- SUB-COMPONENT: WABI-SABI STICKER ---
const WabiSabiIcon = ({ Icon, pos, color, delay, rot }: IconConfig) => (
  <motion.div
    className={`absolute ${pos} hidden md:flex flex-col items-center justify-center z-10 pointer-events-auto`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -10, 0],
    }}
    transition={{ 
        opacity: { duration: 0.5, delay },
        scale: { type: "spring", stiffness: 200, delay },
        y: { duration: 5 + (delay % 1), repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
    }}
    style={{ rotate: rot }}
    whileHover={{ scale: 1.1, rotate: 0, zIndex: 50 }}
    aria-hidden="true" // Accessibility: Hide decorative icons
  >
    {/* The Tape Effect */}
    <div className="w-8 h-3 bg-blue-100/80 absolute -top-1.5 z-20 rotate-[-5deg] backdrop-blur-sm border border-white/20 shadow-sm" />
    
    {/* The Sticker Card */}
    <div 
        className="bg-white dark:bg-white p-3 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
        style={{
            borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" 
        }}
    >
        <Icon className="w-5 h-5 md:w-6 md:h-6 opacity-90" style={{ color }} />
    </div>
  </motion.div>
);

// --- DECORATIVE SVGS ---
const ScribbleArrow = () => (
    <svg 
      width="60" height="40" viewBox="0 0 60 40" fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute -right-16 top-2 text-black dark:text-white hidden sm:block rotate-12 pointer-events-none"
      aria-hidden="true"
    >
        <path d="M5 35C15 35 25 15 55 5M55 5L40 10M55 5L45 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ScribbleUnderline = () => (
    <svg 
      className="absolute w-[110%] h-[40%] -bottom-2 -left-2 -z-10 pointer-events-none" 
      viewBox="0 0 200 20" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
        <path d="M5 15 Q 100 25 195 10" stroke="#3D49F9" strokeWidth="6" fill="none" strokeLinecap="round" style={{ opacity: 0.8 }} />
    </svg>
);

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-black pt-16 md:pt-24 pb-20 font-sans"
      aria-label="Introduction"
    >
      
      {/* 1. TEXTURE: Noise */}
      <div
        className="absolute inset-0 z-0 opacity-30 dark:opacity-[0.08] pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 2a. BACKGROUND GRID — light mode */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:hidden"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 70%, black 30%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* 2b. BACKGROUND GRID — dark mode (white lines + brand glow) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] hidden dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 70%, black 30%, transparent 75%)",
        }}
        aria-hidden="true"
      />
      {/* Brand radial glow — dark mode only */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(60,72,245,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* 3. ICONS (Desktop Only) */}
      {icons.map((item, idx) => (
          <WabiSabiIcon key={idx} {...item} />
      ))}

      {/* 4. MAIN CONTENT */}
      <motion.div variants={heroContainer} initial="hidden" animate="visible" className="relative z-10 container mx-auto px-4 text-center max-w-7xl">
        
        {/* Headline - Typography Scaled for Mobile */}
        <motion.h1
            variants={heroItem}
            className="text-4xl sm:text-6xl md:text-8xl font-black text-black dark:text-gray-100 leading-[0.95] tracking-tighter mb-6 md:mb-8 relative z-20"
        >
            {t("YOUR SOCIAL MEDIA", "VOTRE ESPACE")}
            <br />
            <span className="relative inline-block text-[#3C48F6]">
                <ScribbleUnderline />
                {t("WORKSPACE.", "SOCIAL.")}
            </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.div variants={heroItem} className="relative inline-block max-w-2xl mx-auto mb-8 md:mb-12">
            <p
                className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed px-2"
            >
                {t(
                    "Stop juggling apps. Plan, schedule, and automate your content across Facebook, TikTok, LinkedIn and more in one place.",
                    "Arrêtez de jongler. Planifiez, programmez et automatisez votre contenu sur Facebook, TikTok , LinkedIn et autres au même endroit."
                )}
            </p>

            {/* Analytics illustration (Hidden on Mobile) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -right-28 -bottom-2 hidden xl:block pointer-events-none z-20"
                aria-hidden="true"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/undraw_analytics.png" alt="" width={140} height={105} className="opacity-70 dark:opacity-40" />
            </motion.div>
        </motion.div>

        {/* CTA Buttons - Vertical stack on mobile, horizontal on desktop */}
        <motion.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 relative z-20 w-full sm:w-auto px-4"
        >
            <div className="relative group w-full sm:w-auto">
                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com/api'}/auth/google`} className="relative z-10 w-full sm:w-auto justify-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold text-lg rounded-sm border-2 border-transparent hover:border-black dark:hover:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2">
                    {t("Start Free Trial", "Essai Gratuit")} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
                {/* Button decoration */}
                <div className="absolute inset-0 bg-[#3C48F6] -z-10 translate-x-1.5 translate-y-1.5 rotate-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                
                <ScribbleArrow />
            </div>

            <Link href="/pricing" className="w-full sm:w-auto justify-center px-8 py-4 bg-transparent text-black dark:text-white font-bold text-lg border-2 border-black dark:border-white/20 hover:bg-black/5 transition-colors rounded-sm flex items-center gap-2">
                {t("View Pricing", "Voir les Tarifs")}
            </Link>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default Hero;

      
