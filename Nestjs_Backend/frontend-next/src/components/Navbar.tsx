"use client";

import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; 
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  FaMoon, FaSun, FaChevronDown, FaBars, FaRocket, FaPaperPlane,
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPinterestP, 
  FaTiktok, FaMagic, FaUsers, FaHandshake, FaPlayCircle, FaTimes, FaGlobe
} from "react-icons/fa"; 
import { useLanguage } from "../context/LanguageContext";

// ... (Keep your existing data objects: megaMenuData, channelsMenuData, navLinks) ...
// For brevity, I'm assuming the data objects are here as before.

const megaMenuData = {
  type: 'mega' as const,
  columns: [
    { 
      heading: { en: "Core Tools", fr: "Outils Principaux" }, 
      links: [ 
        { label: { en: "Publishing", fr: "Publication" }, description: { en: "Plan & schedule", fr: "Planifiez" }, href: "#", Icon: FaRocket }, 
        { label: { en: "Analytics", fr: "Analytique" }, description: { en: "Measure stats", fr: "Mesurez" }, href: "#", Icon: FaPaperPlane } 
      ] 
    },
    { 
      heading: { en: "Advanced", fr: "Avancé" }, 
      links: [ 
        { label: { en: "Engagement", fr: "Engagement" }, description: { en: "Social inbox", fr: "Boîte de réception" }, href: "#", Icon: FaUsers }, 
        { label: { en: "AI Assistant", fr: "Assistant IA" }, description: { en: "Generate ideas", fr: "Générez des idées" }, href: "#", Icon: FaMagic } 
      ] 
    },
    {
      heading: { en: "Platform", fr: "Plateforme" },
      links: [
        { label: { en: "Collaborate", fr: "Collaborer" }, description: { en: "For teams", fr: "Pour les équipes" }, href: "#", Icon: FaHandshake },
        { label: { en: "Start Page", fr: "Page Bio" }, description: { en: "Link-in-bio", fr: "Lien en bio" }, href: "#", Icon: FaPlayCircle }
      ]
    }
  ],
  featured: { 
    label: { en: "New! Channels", fr: "Nouveau ! Canaux" }, 
    description: { en: "Connect all your social accounts.", fr: "Connectez tous vos comptes." }, 
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
  { label: { en: "Community", fr: "Communauté" }, href: "/community" },
];

const Navbar: React.FC = () => {
  // 1. ALL HOOKS MUST RUN FIRST
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

  useEffect(() => { 
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll); 
    return () => window.removeEventListener('scroll', handleScroll); 
  }, []);

  useEffect(() => { 
    if(isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMobileMenuOpen]);

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

  const getTranslatedText = (text: { en: string; fr: string } | string) => {
    if (typeof text === 'string') return text;
    return language === 'fr' ? text.fr : text.en;
  };

  // --- SUB-COMPONENTS (Defined inside or outside, better outside but here is fine) ---
  const MegaMenu = ({ content }: { content: typeof megaMenuData }) => (
    <motion.div 
      initial={{ opacity: 0, y: -5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -5 }} 
      className="absolute top-full left-0 lg:-left-20 pt-6 w-[800px] z-50 cursor-default"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex">
        <div className="flex-1 p-6 grid grid-cols-3 gap-6 bg-white dark:bg-gray-900">
          {content.columns.map((col) => (
            <div key={getTranslatedText(col.heading)}>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                {getTranslatedText(col.heading)}
              </h3>
              <div className="space-y-3">
                {col.links.map((link) => (
                  <a key={getTranslatedText(link.label)} href={link.href} className="group flex items-start gap-3 p-2 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="mt-1 p-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#3C48F6] rounded-md group-hover:scale-110 transition-transform">
                      <link.Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#3C48F6] transition-colors">{getTranslatedText(link.label)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{getTranslatedText(link.description)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {content.featured && (
          <div className="w-64 bg-gray-50 dark:bg-gray-800/50 p-5 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute inset-0">
               <Image 
                 src={content.featured.image} 
                 alt="Featured" 
                 fill 
                 className="object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-[#3C48F6] text-white text-[10px] font-bold rounded-full mb-2">New</span>
              <p className="font-bold text-white text-base mb-1">{getTranslatedText(content.featured.label)}</p>
              <p className="text-xs text-gray-200 mb-3">{getTranslatedText(content.featured.description)}</p>
              <a href={content.featured.href} className="text-xs font-bold text-white underline decoration-white/50 hover:decoration-white transition-all">
                Learn more &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ChannelsMenu = ({ content }: { content: typeof channelsMenuData }) => (
    <motion.div 
      initial={{ opacity: 0, y: -5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -5 }} 
      className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[360px] z-50 cursor-default"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Supported Platforms</h3>
        <div className="grid grid-cols-2 gap-2">
          {content.channels.map((channel) => (
            <a key={getTranslatedText(channel.label)} href={channel.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <channel.Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#3C48F6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{getTranslatedText(channel.label)}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // 2. CHECK VISIBILITY (AFTER HOOKS)
  const showNavbar = pathname === "/" || pathname === "/pricing" || pathname === "/community";

  if (!showNavbar) {
    return null;
  }

  // 3. RENDER
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${scrolled 
        ? "bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm" 
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
              <div 
                key={getTranslatedText(item.label)} 
                className="relative h-20 flex items-center"
                onMouseEnter={() => item.hasDropdown && setHoveredDropdown(getTranslatedText(item.label))} 
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link 
                  href={item.href || "#"} 
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    hoveredDropdown === getTranslatedText(item.label) 
                      ? "text-[#3C48F6]" 
                      : "text-gray-600 dark:text-gray-300 hover:text-[#3C48F6]"
                  }`}
                  onClick={(e) => { if (item.hasDropdown) e.preventDefault(); }}
                >
                  {getTranslatedText(item.label)}
                  {item.hasDropdown && <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${hoveredDropdown === getTranslatedText(item.label) ? "rotate-180" : ""}`} />}
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
            
            <SignedOut>
              <Link href="/login" className="text-sm font-semibold text-[#3C48F6] hover:text-blue-700 transition-colors">
                {t("Log in", "Connexion")}
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-[#3C48F6] text-white font-medium text-sm rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                {t("Get started", "Commencer")}
              </Link>
            </SignedOut>

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
              
              <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {navLinks.map((item) => (
                   <div key={getTranslatedText(item.label)} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                     <Link href={item.href || "#"} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-800 dark:text-white block mb-2">
                       {getTranslatedText(item.label)}
                     </Link>
                     {item.hasDropdown && item.dropdownContent && (
                       <div className="pl-4 space-y-2 mt-2">
                          {item.dropdownContent.type === 'mega' && item.dropdownContent.columns.map(col => (
                             col.links.map(l => (
                               <div key={getTranslatedText(l.label)} className="text-sm text-gray-500">{getTranslatedText(l.label)}</div>
                             ))
                          ))}
                          {item.dropdownContent.type === 'channels' && item.dropdownContent.channels.map(c => (
                             <div key={getTranslatedText(c.label)} className="text-sm text-gray-500">{getTranslatedText(c.label)}</div>
                          ))}
                       </div>
                     )}
                   </div>
                ))}
                
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