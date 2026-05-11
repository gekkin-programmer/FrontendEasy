"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; 
import Image from "next/image";
import {
  FaMoon, FaSun, FaChevronDown, FaBars, FaRocket, FaPaperPlane,
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPinterestP, 
  FaTiktok, FaMagic, FaUsers, FaTimes, FaGlobe,
  FaSignOutAlt, FaUser, FaCog, FaChartBar
} from "react-icons/fa"; 
import { useLanguage } from "../context/LanguageContext";
import { api } from "@/src/lib/api";
import { getCookie, deleteCookie } from 'cookies-next';

// --- TYPES ---
type MenuLink = { label: { en: string; fr: string }, href: string, Icon: React.ElementType, description?: { en: string; fr: string } };
type MegaMenu = { type: 'mega', columns: { heading: { en: string; fr: string }, links: MenuLink[] }[], featured: any };
type ChannelMenu = { type: 'channels', channels: MenuLink[] };

const megaMenuData: MegaMenu = {
  type: 'mega',
  columns: [
    { 
      heading: { en: "Core Tools", fr: "Outils Principaux" }, 
      links: [ 
        { label: { en: "Publishing", fr: "Publication" }, description: { en: "Plan & schedule", fr: "Planifiez" }, href: "/features/publishing", Icon: FaRocket }, 
        { label: { en: "Analytics", fr: "Analytique" }, description: { en: "Measure stats", fr: "Mesurez" }, href: "/features/analytics", Icon: FaPaperPlane } 
      ] 
    },
    { 
      heading: { en: "Advanced", fr: "Avancé" }, 
      links: [ 
        { label: { en: "Engagement", fr: "Engagement" }, description: { en: "Social inbox", fr: "Boîte de réception" }, href: "/features/engagement", Icon: FaUsers }, 
        { label: { en: "AI Assistant", fr: "Assistant IA" }, description: { en: "Generate ideas", fr: "Générez des idées" }, href: "/features/ai", Icon: FaMagic } 
      ] 
    }
  ],
  featured: { label: { en: "New! Channels", fr: "Nouveau ! Canaux" }, description: { en: "Connect all your social accounts.", fr: "Connectez tous vos comptes." }, href: "#", image: "/assets/Sarah.jpg" },
};

const channelsMenuData: ChannelMenu = {
  type: 'channels',
  channels: [
    { label: { en: "Facebook", fr: "Facebook" }, href: "#", Icon: FaFacebookF },
    { label: { en: "Instagram", fr: "Instagram" }, href: "#", Icon: FaInstagram },
    { label: { en: "Twitter", fr: "Twitter" }, href: "#", Icon: FaTwitter },
    { label: { en: "LinkedIn", fr: "LinkedIn" }, href: "#", Icon: FaLinkedinIn },
    { label: { en: "TikTok", fr: "TikTok" }, href: "#", Icon: FaTiktok },
  ]
};

const navLinks = [
  { label: { en: "Features", fr: "Fonctionnalités" }, hasDropdown: true, dropdownContent: megaMenuData, id: 'features' },
  { label: { en: "Channels", fr: "Canaux" }, hasDropdown: true, dropdownContent: channelsMenuData, id: 'channels' },
  { label: { en: "Pricing", fr: "Tarifs" }, href: "/pricing" },
  { label: { en: "Community", fr: "Communauté" }, href: "/community" },
];

export default function Navbar() {
  const pathname = usePathname(); 
  const router = useRouter();
  const { language, toggleLanguage, t, theme, toggleTheme } = useLanguage();
  
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ➤ 1. LOCK SCROLL WHEN MOBILE MENU IS OPEN
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
        const token = getCookie('accessToken');
        if (!token) {
            setIsAuthenticated(false);
            setIsAuthLoading(false);
            return;
        }
        setIsAuthenticated(true);
        try {
            const profile = await api.get<any>('/auth/profile');
            setUser(profile.data || profile);
        } catch (e) {
            console.error("Profile fetch failed", e);
        } finally {
            setIsAuthLoading(false);
        }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) { console.error(e); } 
    finally {
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsProfileOpen(false);
      router.push('/login');
    }
  };

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMounted(true); }, []);

  const toggleDarkMode = () => {
    toggleTheme();
  };

  const getTranslatedText = (text: { en: string; fr: string } | string) => {
    if (typeof text === 'string') return text;
    return language === 'fr' ? text.fr : text.en;
  };

  const showNavbar = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/auth');
  if (!showNavbar) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 border-b
      ${scrolled
        ? "bg-white dark:bg-black border-black/10 dark:border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)] py-2"
        : "bg-white/80 dark:bg-black/80 backdrop-blur-md border-black/5 dark:border-white/5 py-4"
      }`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 z-50 mr-8 flex-shrink-0" aria-label="EazyPost Home">
            <div className="relative w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                <Image src="/assets/WiggleLogo.png" alt="EazyPost Logo" fill className="object-contain" priority />
            </div>
            <span className="text-lg md:text-xl font-black text-black dark:text-white tracking-tighter select-none">EazyPost</span>
          </Link>
          
          {/* DESKTOP MENU (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {/* ... Desktop menu links ... */}
            {navLinks.map((item) => (
              <div 
                key={item.id || item.href} 
                className="relative h-16 flex items-center group"
                onMouseEnter={() => item.hasDropdown && setHoveredDropdown(getTranslatedText(item.label))} 
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href={item.href || "#"}
                  className={`flex items-center gap-1 text-sm font-semibold tracking-wide transition-colors px-1 py-0.5 ${
                    hoveredDropdown === getTranslatedText(item.label)
                      ? "text-[#3C48F6] dark:text-[#7B87FF]"
                      : "text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white"
                  }`}
                  onClick={(e) => item.hasDropdown && e.preventDefault()}
                >
                  {getTranslatedText(item.label)}
                  {item.hasDropdown && <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${hoveredDropdown === getTranslatedText(item.label) ? "rotate-180" : ""}`} />}
                </Link>
                
                <AnimatePresence>
                  {item.hasDropdown && hoveredDropdown === getTranslatedText(item.label) && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-14 left-1/2 -translate-x-1/2 z-50"
                        style={{ width: item.dropdownContent?.type === 'mega' ? 600 : 320 }}
                    >
                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-gray-200/70 dark:border-white/8 overflow-hidden">
                            {item.dropdownContent?.type === 'mega' && (
                                <div className="flex">
                                    {/* Left — feature links */}
                                    <div className="flex-1 p-5 grid grid-cols-2 gap-x-6 gap-y-1">
                                        {item.dropdownContent.columns.map((col, idx) => (
                                            <div key={idx}>
                                                <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
                                                    {getTranslatedText(col.heading)}
                                                </p>
                                                {col.links.map(link => (
                                                    <Link key={getTranslatedText(link.label)} href={link.href}
                                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                                                        <div className="w-9 h-9 rounded-xl bg-[#3C48F5]/8 dark:bg-[#3C48F5]/15 flex items-center justify-center text-[#3C48F5] flex-shrink-0 group-hover:bg-[#3C48F5] group-hover:text-white transition-all">
                                                            <link.Icon size={15}/>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#3C48F5] dark:group-hover:text-[#7B87FF] transition-colors leading-tight">
                                                                {getTranslatedText(link.label)}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 dark:text-zinc-400 leading-tight mt-0.5">
                                                                {getTranslatedText(link.description!)}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Right — featured card */}
                                    <div className="w-[180px] bg-gradient-to-br from-[#3C48F5] to-[#6366f1] p-5 flex flex-col justify-between flex-shrink-0">
                                        <div>
                                            <span className="inline-block text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full mb-3">
                                                {getTranslatedText(item.dropdownContent.featured.label)}
                                            </span>
                                            <p className="text-white font-bold text-sm leading-snug">
                                                {getTranslatedText(item.dropdownContent.featured.description)}
                                            </p>
                                        </div>
                                        <Link href={item.dropdownContent.featured.href}
                                            className="mt-4 inline-flex items-center gap-1 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wide transition-colors">
                                            {t("Explore", "Explorer")} →
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {item.dropdownContent?.type === 'channels' && (
                                <div className="p-3 grid grid-cols-2 gap-1">
                                    {item.dropdownContent.channels.map(c => (
                                        <Link key={getTranslatedText(c.label)} href={c.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <c.Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#3C48F5] dark:group-hover:text-[#7B87FF] transition-colors">
                                                {getTranslatedText(c.label)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* RIGHT ACTIONS (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthLoading ? (
                <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
                <div className="relative z-50" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white dark:bg-black border-2 border-black dark:border-white/20 rounded-full hover:bg-gray-50 transition-all">
                        <div className="w-7 h-7 rounded-full bg-[#3C48F5] text-white flex items-center justify-center font-bold text-xs border border-black overflow-hidden">
                            {user?.avatar ? <Image src={user.avatar} alt="User" width={28} height={28} className="object-cover" /> : (user?.firstName?.charAt(0) || 'U')}
                        </div>
                        <span className="text-xs font-bold text-black dark:text-white max-w-[80px] truncate">
                            {user?.firstName || "Account"}
                        </span>
                    </button>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full right-0 pt-2 w-56">
                                <div className="bg-white dark:bg-black rounded-lg shadow-xl border-2 border-black dark:border-white/20 p-2 overflow-hidden">
                                    <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Signed in as</p>
                                        <p className="text-xs font-bold text-black dark:text-white truncate">{user?.email}</p>
                                    </div>
                                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"><FaChartBar /> Dashboard</Link>
                                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"><FaCog /> Settings</Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md mt-1 transition-colors"><FaSignOutAlt /> Sign Out</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-semibold text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors">{t("Log in", "Connexion")}</Link>
                    <Link href="/signup" className="px-5 py-2 bg-[#3C48F5] hover:bg-[#2f3cd4] text-white font-bold text-sm rounded-full transition-all shadow-sm">{t("Start Free", "Gratuit")}</Link>
                </div>
            )}
            <div className="h-6 w-px bg-gray-300 dark:bg-white/20 mx-1"></div>
            <div className="flex gap-1">
                <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-md transition-colors text-xs font-black uppercase" aria-label="Toggle language"><FaGlobe size={14}/>{language === 'en' ? 'FR' : 'EN'}</button>
                <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-md transition-colors">{mounted ? (isDark ? <FaSun size={16}/> : <FaMoon size={16}/>) : <FaMoon size={16}/>}</button>
            </div>
          </div>

          {/* MOBILE TOGGLE (Visible on Mobile) */}
          <div className="lg:hidden flex items-center gap-4">
             {isAuthenticated && (
                 <Link href="/dashboard" className="w-8 h-8 rounded-full bg-yellow-400 border border-black flex items-center justify-center font-bold text-xs text-black">
                    {user?.firstName?.charAt(0) || <FaUser />}
                 </Link>
             )}
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-black dark:text-white"><FaBars size={24} /></button>
          </div>
        </div>
      </div>

      {/* ➤ MOBILE MENU OVERLAY (FIXED) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }} 
            // ➤ FIX: FORCE TOP-0 LEFT-0 AND 100dvh TO COVER EVERYTHING INCLUDING SCROLL
            className="fixed top-0 left-0 w-full h-[100dvh] bg-white dark:bg-zinc-950 z-[9999] flex flex-col overflow-hidden"
          >
             {/* Mobile Header */}
             <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                <span className="font-black text-xl tracking-tighter text-black dark:text-white">azyPost.</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-black dark:text-white"><FaTimes size={20} /></button>
             </div>

             {/* Mobile Links */}
             <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {navLinks.map((item) => (
                   <div key={getTranslatedText(item.label)} className="border-b border-gray-100 dark:border-white/5 pb-2">
                     <button 
                        className="w-full flex justify-between items-center py-3 text-lg font-bold text-black dark:text-white uppercase tracking-tight"
                        onClick={() => {
                            if (item.hasDropdown) {
                                setMobileExpanded(mobileExpanded === item.id ? null : item.id as string);
                            } else {
                                router.push(item.href || "#");
                                setIsMobileMenuOpen(false);
                            }
                        }}
                     >
                       {getTranslatedText(item.label)}
                       {item.hasDropdown && <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${mobileExpanded === item.id ? 'rotate-180' : ''}`} />}
                     </button>
                     
                     <AnimatePresence>
                        {item.hasDropdown && mobileExpanded === item.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50 dark:bg-white/5 rounded-lg mb-2">
                                <div className="p-4 space-y-4">
                                    {item.dropdownContent?.type === 'mega' && item.dropdownContent.columns.map((col, idx) => (
                                        <div key={idx}>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{getTranslatedText(col.heading)}</p>
                                            {col.links.map(l => (
                                                <Link key={getTranslatedText(l.label)} href={l.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <l.Icon className="text-black dark:text-white opacity-50" size={14} /> {getTranslatedText(l.label)}
                                                </Link>
                                            ))}
                                        </div>
                                    ))}
                                    {item.dropdownContent?.type === 'channels' && item.dropdownContent.channels.map(c => (
                                        <Link key={getTranslatedText(c.label)} href={c.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <c.Icon className="text-black dark:text-white opacity-50" size={14} /> {getTranslatedText(c.label)}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                ))}
             </div>

             {/* Mobile Footer */}
             <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50 flex-shrink-0 safe-pb">
                {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-sm border-2 border-black dark:border-white font-bold text-black dark:text-white uppercase text-sm">{t("Log In", "Connexion")}</Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-sm bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">{t("Sign Up", "Inscription")}</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#3C48F6] text-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] border-2 border-black">
                            <FaChartBar /> {t("Dashboard", "Tableau de bord")}
                        </Link>
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-bold uppercase text-sm border-2 border-red-200 hover:bg-red-50 transition-colors">
                            <FaSignOutAlt /> {t("Sign Out", "Déconnexion")}
                        </button>
                    </div>
                )}
                
                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                    <button onClick={toggleLanguage} className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500"><FaGlobe /> {language === 'fr' ? 'English' : 'Français'}</button>
                    <button onClick={toggleDarkMode} className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500">{mounted ? (isDark ? <><FaSun /> {t("Light Mode", "Mode Clair")}</> : <><FaMoon /> {t("Dark Mode", "Mode Sombre")}</>) : <><FaMoon /> {t("Dark Mode", "Mode Sombre")}</>}</button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};