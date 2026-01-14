"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { FaArrowRight, FaStar, FaYoutube, FaLinkedinIn, FaInstagram, FaTwitter, FaFacebookF, FaPinterestP, FaSlack, FaDribbble, FaGithub, FaMastodon } from "react-icons/fa6";
import { SiTiktok, SiThreads, SiMedium, SiTwitch } from "react-icons/si";
import Link from 'next/link';

// --- ICON CONFIGURATION (MORE ICONS) ---
const icons = [
  // Left Side
  { Icon: FaYoutube, pos: "top-[12%] left-[5%]", color: "#FF0000", delay: 0 },
  { Icon: FaInstagram, pos: "bottom-[20%] left-[3%]", color: "#E1306C", delay: 0.6 },
  { Icon: SiTiktok, pos: "top-[50%] left-[8%]", color: "#000000", delay: 1 },
  { Icon: FaPinterestP, pos: "bottom-[40%] left-[12%]", color: "#E60023", delay: 1.2 },
  { Icon: FaSlack, pos: "top-[25%] left-[15%]", color: "#4A154B", delay: 1.4 },
  { Icon: SiTwitch, pos: "bottom-[10%] left-[20%]", color: "#9146FF", delay: 1.6 },

  // Right Side
  { Icon: FaTwitter, pos: "top-[8%] right-[8%]", color: "#1DA1F2", delay: 0.2 },
  { Icon: FaLinkedinIn, pos: "top-[45%] right-[2%]", color: "#0A66C2", delay: 0.4 },
  { Icon: FaFacebookF, pos: "bottom-[30%] right-[10%]", color: "#1877F2", delay: 0.8 },
  { Icon: SiThreads, pos: "top-[20%] right-[15%]", color: "#000000", delay: 1.1 },
  { Icon: FaDribbble, pos: "bottom-[15%] right-[5%]", color: "#EA4C89", delay: 1.3 },
  { Icon: FaGithub, pos: "top-[60%] right-[12%]", color: "#181717", delay: 1.5 },
  { Icon: SiMedium, pos: "bottom-[50%] right-[18%]", color: "#000000", delay: 1.7 },
  { Icon: FaMastodon, pos: "top-[35%] right-[25%]", color: "#6364FF", delay: 1.8 },
];

// --- SUB-COMPONENT: FLOATING BOX ---
const BrutalIcon = ({ Icon, pos, color, delay }: any) => (
  <motion.div
    className={`absolute ${pos} bg-white dark:bg-white/5 p-3 border-2 border-black dark:border-white/5 shadow-[4px_4px_0px_0px_#000] hidden md:flex items-center justify-center z-0`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0]
    }}
    transition={{ 
        opacity: { duration: 0.5, delay },
        scale: { type: "spring", stiffness: 200, delay },
        y: { duration: 4 + Math.random(), repeat: Infinity, ease: "easeInOut", delay: delay * 2 }, // Randomize float speed
        rotate: { duration: 5 + Math.random(), repeat: Infinity, ease: "easeInOut", delay: delay * 2 }
    }}
    whileHover={{ scale: 1.2, rotate: 10, zIndex: 50, cursor: "grab" }}
  >
    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color }} />
  </motion.div>
);

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-black/90 pt-24 pb-20 border-b-4 border-black dark:border-white/5">
      
      {/* 1. ANIMATED BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)"
        }}
      />

      {/* 2. FLOATING ICONS (Expanded List) */}
      {icons.map((item, idx) => (
          <BrutalIcon key={idx} {...item} />
      ))}

      {/* 3. MAIN CONTENT */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        

        {/* Headline */}
        <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-black dark:text-gray-200 leading-[0.9] tracking-tighter mb-6 relative z-20"
        >
            {t("YOUR SOCIAL MEDIA", "VOTRE ESPACE")}
            <br />
            <span className="relative inline-block text-[#3C48F6]">
                {/* SVG Underline/Marker */}
                <svg className="absolute w-[105%] h-[30%] -bottom-2 -left-2 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="#3D49F9" strokeWidth="8" fill="none" />
                </svg>
                {t("WORKSPACE.", "SOCIAL COMMENCE ICI.")}
            </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed relative z-20"
        >
            {t(
                "Stop juggling apps. Plan, schedule, and automate your content across Facebook, TikTok, and LinkedIn in one place.",
                "Arrêtez de jongler. Planifiez, programmez et automatisez votre contenu sur Facebook, TikTok et LinkedIn au même endroit."
            )}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 relative z-20"
        >
            <Link href="/signup" className="group relative px-8 py-4 bg-black dark:bg-white/5 text-white font-bold text-lg rounded-none border-2 border-black shadow-[8px_8px_0px_0px_#3C48F6] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#3C48F6] transition-all flex items-center gap-2">
                {t("Start Free Trial", "Essai Gratuit")} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-gray-200 text-black font-bold text-lg border-2 border-black hover:bg-gray-50 transition-colors hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_#000] duration-300">
                {t("View Pricing", "Voir les Tarifs")}
            </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;

      
