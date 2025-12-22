import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import {
  FaYoutube, FaLinkedinIn, FaInstagram, FaTwitter, FaPinterestP, FaFacebookF,
  FaThreads, FaMastodon, FaGithub, FaSlack, FaDribbble
} from "react-icons/fa6";
import { SiTiktok, SiMedium, SiTwitch } from "react-icons/si";

// --- ICON DATA ---
const mobileIcons = [
  { Icon: FaYoutube, pos: "top-20 left-4", color: "#FF0000" },
  { Icon: FaInstagram, pos: "top-32 right-5", color: "#E1306C" },
  { Icon: FaPinterestP, pos: "top-[45%] left-5", color: "#E60023" },
  { Icon: FaTwitter, pos: "bottom-24 left-6", color: "#1DA1F2" },
  { Icon: SiTiktok, pos: "bottom-32 right-4", color: "#000000" },
];

const desktopIcons = [
  { Icon: FaYoutube, pos: "top-[10%] left-[5%]", color: "#FF0000" },
  { Icon: FaSlack, pos: "top-[15%] left-[30%]", color: "#4A154B" },
  { Icon: FaTwitter, pos: "top-[8%] right-[25%]", color: "#1DA1F2" },
  { Icon: FaLinkedinIn, pos: "top-[12%] right-[8%]", color: "#0A66C2" },
  { Icon: FaInstagram, pos: "top-[40%] left-[15%]", color: "#E1306C" },
  { Icon: FaThreads, pos: "top-[50%] left-[48%] -translate-x-1/2", color: "#000000" },
  { Icon: FaFacebookF, pos: "top-[42%] right-[15%]", color: "#1877F2" },
  { Icon: FaGithub, pos: "top-[60%] right-[30%]", color: "#181717" },
  { Icon: FaPinterestP, pos: "bottom-[10%] right-[5%]", color: "#E60023" },
  { Icon: SiTiktok, pos: "bottom-[12%] left-[8%]", color: "#000000" },
  { Icon: SiTwitch, pos: "bottom-[8%] left-[35%]", color: "#9146FF" },
  { Icon: SiMedium, pos: "bottom-[15%] right-[20%]", color: "#000000" },
  { Icon: FaMastodon, pos: "bottom-[25%] left-[20%]", color: "#6364FF" },
  { Icon: FaDribbble, pos: "bottom-[28%] right-[40%]", color: "#EA4C89" },
];

const randomDelay = (idx: number) => idx * 0.2 + Math.random() * 0.3;

interface FloatingIconProps {
  icon: React.ElementType;
  pos: string;
  color: string;
  delay: number;
  size: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon: Icon, pos, color, delay, size }) => {
  return (
    <motion.div
      className={`absolute ${pos} bg-white dark:bg-gray-800 p-2 md:p-3 rounded-xl shadow-lg cursor-pointer`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: [-10, 0, -10], rotate: [0, 2, -2, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay },
      }}
      whileHover={{ scale: 1.2, rotate: 5, transition: { duration: 0.2 } }}
    >
      <Icon className={size} style={{ color: color }} />
    </motion.div>
  );
};


const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden min-h-screen py-20 px-4 sm:px-6 flex items-center justify-center">
      {/* --- REFINED: BACKGROUND GRIDS --- */}
      {/* Light mode grid: now more subtle on mobile */}
      <div
        className="absolute inset-0 opacity-10 md:opacity-30 dark:hidden pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />
      {/* Dark mode grid: now more subtle on mobile */}
      <div
        className="absolute inset-0 hidden dark:block dark:opacity-10 md:dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* --- ICONS FOR MOBILE --- */}
      <div className="block md:hidden" aria-hidden="true">
        {mobileIcons.map(({ Icon, pos, color }, idx) => (
          <FloatingIcon key={`mobile-${idx}`} icon={Icon} pos={pos} color={color} delay={randomDelay(idx)} size="w-6 h-6" />
        ))}
      </div>

      {/* --- ICONS FOR DESKTOP --- */}
      <div className="hidden md:block" aria-hidden="true">
        {desktopIcons.map(({ Icon, pos, color }, idx) => (
          <FloatingIcon key={`desktop-${idx}`} icon={Icon} pos={pos} color={color} delay={randomDelay(idx)} size="w-8 h-8" />
        ))}
      </div>

      {/* --- MAIN CONTENT (UNCHANGED) --- */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
          {t("Your social media", "Votre espace médias sociaux")}
          <br className="hidden md:block" />{" "}
          <span className="text-[#3C48F6]">
            {t("workspace", "de travail")}
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t( "Share consistently, grow your audience, and build your brand—all from one intuitive dashboard.", "Partagez régulièrement, développez votre audience et construisez votre marque, le tout depuis un tableau de bord intuitif." )}
        </p>
        <form className="mt-10 w-full mx-auto flex flex-col sm:flex-row gap-3 max-w-md">
          <label htmlFor="hero-email-input" className="sr-only">
            {t("Email address", "Adresse e-mail")}
          </label>
          <input
            id="hero-email-input"
            type="email"
            placeholder={t("Enter your email...", "Entrez votre email...")}
            required
            className="flex-1 px-5 py-4 text-base md:text-lg rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3C48F6] focus:border-transparent transition"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-[#3C48F6] text-white font-medium text-base md:text-lg rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {t("Get started now", "Commencer maintenant")}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {t( "Free forever. No credit card required.", "Gratuit pour toujours. Aucune carte de crédit requise." )}
        </p>
      </div>
    </section>
  );
};

export default Hero;
