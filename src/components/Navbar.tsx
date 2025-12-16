"use client";

import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; 
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; // <--- CLERK IMPORTS
import {
  FaMoon, 
  FaSun, 
  FaChevronDown, 
  FaBars, 
  FaRocket, 
  FaPaperPlane,
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedinIn, 
  FaPinterestP, 
  FaTiktok, 
  FaMagic, 
  FaUsers, 
  FaHandshake, 
  FaPlayCircle, 
  FaTimes,
  FaGlobe
} from "react-icons/fa"; 
import { useLanguage } from "../context/LanguageContext";

// --- DATA OBJECTS ---
const megaMenuData = {
  type: 'mega' as const,
  columns: [
    { 
      heading: { en: "Core Tools", fr: "Outils Principaux" }, 
      links: [ 
        { label: { en: "Publishing", fr: "Publication" }, description: { en: "Plan and schedule content", fr: "Planifiez et programmez du contenu" }, href: "#", Icon: FaRocket }, 
        { label: { en: "Analytics", fr: "Analytique" }, description: { en: "Measure your performance", fr: "Mesurez vos performances" }, href: "#", Icon: FaPaperPlane } 
      ] 
    },
    { 
      heading: { en: "Advanced", fr: "Avancé" }, 
      links: [ 
        { label: { en: "Engagement", fr: "Engagement" }, description: { en: "Respond to comments", fr: "Répondez aux commentaires" }, href: "#", Icon: FaRocket }, 
        { label: { en: "AI Assistant", fr: "Assistant IA" }, description: { en: "Generate post ideas", fr: "Générez des idées de publications" }, href: "#", Icon: FaPaperPlane } 
      ] 
    },
    {
      heading: { en: "Platform", fr: "Plateforme" },
      links: [
        { label: { en: "Create", fr: "Créer" }, description: { en: "Craft content with our editor", fr: "Créez du contenu avec notre éditeur" }, href: "#", Icon: FaMagic },
        { label: { en: "Collaborate", fr: "Collaborer" }, description: { en: "Work together with your team", fr: "Travaillez avec votre équipe" }, href: "#", Icon: FaHandshake },
        { label: { en: "Community", fr: "Communauté" }, description: { en: "Join other creators & brands", fr: "Rejoignez d'autres créateurs" }, href: "#", Icon: FaUsers },
        { label: { en: "Start Page", fr: "Page de Démarrage" }, description: { en: "Build a beautiful link-in-bio", fr: "Créez une belle page de lien en bio" }, href: "#", Icon: FaPlayCircle }
      ]
    }
  ],
  featured: { 
    label: { en: "New! Introducing Channels", fr: "Nouveau ! Présentation des Canaux" }, 
    description: { en: "Connect all your social accounts.", fr: "Connectez tous vos comptes sociaux." }, 
    href: "#", 
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400" 
  },
};

const channelsMenuData = {
  type: 'channels' as const,
  channels: [
    { label: { en: "Facebook", fr: "Facebook" }, href: "#", Icon: FaFacebookF },
    { label: { en: "Instagram", fr: "Instagram" }, href: "#", Icon: FaInstagram },
    { label: { en: "Twitter", fr: "Twitter" }, href: "#", Icon: FaTwitter },
    { label: { en: "LinkedIn", fr: "LinkedIn" }, href: "#", Icon: FaLinkedinIn },
    { label: { en: "Pinterest", fr: "Pinterest" }, href: "#", Icon: FaPinterestP },
    { label: { en: "TikTok", fr: "TikTok" }, href: "#", Icon: FaTiktok },
  ]
};

type NavLink = {
  label: { en: string; fr: string };
  href?: string;
  hasDropdown?: boolean;
  dropdownContent?: typeof megaMenuData | typeof channelsMenuData;
};

const navLinks: NavLink[] = [
  { label: { en: "Features", fr: "Fonctionnalités" }, hasDropdown: true, dropdownContent: megaMenuData },
  { label: { en: "Channels", fr: "Canaux" }, hasDropdown: true, dropdownContent: channelsMenuData },
  { label: { en: "Pricing", fr: "Tarifs" }, href: "/pricing" },
  { label: { en: "Community", fr: "Communauté" }, href: "/#support-section" },
];

const Navbar: React.FC = () => {
  const pathname = usePathname(); 
  
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  useEffect(() => { 
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll); 
    return () => window.removeEventListener('scroll', handleScroll); 
  }, []);

  useEffect(() => { 
    if(isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMobileMenuOpen]);

  const getTranslatedText = (text: { en: string; fr: string } | string) => {
    if (typeof text === 'string') return text;
    return language === 'fr' ? text.fr : text.en;
  };

  const MegaMenu = ({ content }: { content: typeof megaMenuData }) => (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50">
      <div className="flex p-5">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 pr-5 border-r border-gray-200 dark:border-gray-700">
          {content.columns.map((col) => (
            <div key={getTranslatedText(col.heading)}>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3 whitespace-nowrap">{getTranslatedText(col.heading)}</h3>
              <div className="space-y-2">
                {col.links.map((link) => (
                  <a key={getTranslatedText(link.label)} href={link.href} className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <link.Icon className="w-5 h-5 mt-1 text-[#3C48F6]" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{getTranslatedText(link.label)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getTranslatedText(link.description)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {content.featured && (
          <div className="pl-5 w-48 flex-shrink-0">
            <a href={content.featured.href} className="group block rounded-lg overflow-hidden relative h-full">
              <img src={content.featured.image} alt={getTranslatedText(content.featured.label)} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-semibold text-white text-sm">{getTranslatedText(content.featured.label)}</p>
                <p className="text-xs text-gray-200">{getTranslatedText(content.featured.description)}</p>
              </div>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ChannelsMenu = ({ content }: { content: typeof channelsMenuData }) => (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50">
      <div className="grid grid-cols-3 gap-4 p-6">
        {content.channels.map((channel) => (
          <a key={getTranslatedText(channel.label)} href={channel.href} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <channel.Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{getTranslatedText(channel.label)}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );

  // NOTE: This hides the marketing navbar on non-home pages.
  // If you want the navbar on /pricing, change to: if (pathname !== "/" && pathname !== "/pricing")
  if (pathname !== "/") {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${scrolled 
        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm" 
        : "bg-transparent border-b border-transparent shadow-none"
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 mr-8">
            <Image 
              src="/assets/WiggleLogo.png" 
              alt="Wiggle Logo" 
              width={40} 
              height={40} 
              className="w-10 h-10 object-contain" 
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">asyPost</span>
          </Link>
          
          {/* CENTER: Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <div key={getTranslatedText(item.label)} className="relative" onMouseEnter={() => item.hasDropdown && setHoveredDropdown(getTranslatedText(item.label))} onMouseLeave={() => setHoveredDropdown(null)}>
                <Link href={item.href || "#"} className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#3C48F6] dark:hover:text-[#3C48F6] transition" onClick={(e) => { if (item.hasDropdown) e.preventDefault(); }}>
                  {getTranslatedText(item.label)}
                  {item.hasDropdown && <FaChevronDown className="w-3 h-3" />}
                </Link>
                <AnimatePresence>
                  {item.hasDropdown && hoveredDropdown === getTranslatedText(item.label) && item.dropdownContent && (
                    <>
                      {item.dropdownContent.type === 'mega' && (<MegaMenu content={item.dropdownContent} />)}
                      {item.dropdownContent.type === 'channels' && (<ChannelsMenu content={item.dropdownContent} />)}
                    </>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* GUEST VIEW */}
            <SignedOut>
              <Link href="/login" className="text-sm font-semibold text-[#3C48F6] hover:text-blue-700 transition-colors">
                {t("Log in", "Connexion")}
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-[#3C48F6] text-white font-medium text-sm rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                {t("Get started now", "Commencer")}
              </Link>
            </SignedOut>

            {/* LOGGED IN VIEW */}
            <SignedIn>
              <Link href="/dashboard" className="px-5 py-2.5 bg-[#3C48F6] text-white font-medium text-sm rounded-full hover:bg-blue-700 transition-all shadow-sm">
                {t("Dashboard", "Tableau de bord")}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <button onClick={toggleLanguage} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FaGlobe className="w-5 h-5" /></button>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-800 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <SignedOut>
              <Link href="/signup" className="px-4 py-2 bg-[#3C48F6] text-white font-medium text-sm rounded-full hover:bg-blue-700 transition">{t("Get started", "Démarrer")}</Link>
            </SignedOut>
            <SignedIn>
               <Link href="/dashboard" className="px-4 py-2 bg-[#3C48F6] text-white font-medium text-sm rounded-full hover:bg-blue-700 transition">{t("Dashboard", "Tableau")}</Link>
            </SignedIn>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-lg text-gray-700 dark:text-gray-300"><FaBars className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[999]" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-[1000] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-lg">{t('Menu', 'Menu')}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FaTimes className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-grow p-4 space-y-4">
                {navLinks.map((item) => (
                   <div key={getTranslatedText(item.label)} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                     <Link href={item.href || "#"} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-800 dark:text-white block">
                       {getTranslatedText(item.label)}
                     </Link>
                   </div>
                ))}
                
                {/* MOBILE BOTTOM ACTIONS */}
                <div className="mt-8 space-y-3">
                   <SignedOut>
                      <Link href="/login" className="block w-full text-center py-3 text-[#3C48F6] font-bold border border-[#3C48F6] rounded-full hover:bg-blue-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          {t("Log in", "Connexion")}
                      </Link>
                      <Link href="/signup" className="block w-full text-center py-3 bg-[#3C48F6] text-white font-bold rounded-full hover:bg-blue-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          {t("Get started now", "Commencer")}
                      </Link>
                   </SignedOut>
                   
                   <SignedIn>
                      <Link href="/dashboard" className="block w-full text-center py-3 bg-[#3C48F6] text-white font-bold rounded-full hover:bg-blue-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          {t("Go to Dashboard", "Tableau de bord")}
                      </Link>
                      <div className="flex justify-center pt-4">
                         <UserButton afterSignOutUrl="/" showName />
                      </div>
                   </SignedIn>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;