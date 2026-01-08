"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; 
import Image from "next/image";
import {
  FaMoon, FaSun, FaChevronDown, FaBars, FaRocket, FaPaperPlane,
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPinterestP, 
  FaTiktok, FaMagic, FaUsers, FaHandshake, FaPlayCircle, FaTimes, FaGlobe,
  FaSignOutAlt, FaUser, FaCog, FaChartBar
} from "react-icons/fa"; 
import { useLanguage } from "../context/LanguageContext";
import { api } from "@/src/lib/api"; // Use our helper

// ============================================================================
// CONFIGURATION
// ============================================================================

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
    }
  ],
  featured: { 
    label: { en: "New! Channels", fr: "Nouveau ! Canaux" }, 
    description: { en: "Connect all your social accounts.", fr: "Connectez tous vos comptes." }, 
    href: "#", 
    image: "/assets/Sarah.jpg" 
  },
};

const channelsMenuData = {
  type: 'channels' as const,
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
  const { language, toggleLanguage, t } = useLanguage();
  
  // UI State
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Data State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 1. Auth Check & Profile Fetch
  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsAuthenticated(false);
            setIsAuthLoading(false);
            return;
        }

        setIsAuthenticated(true);
        try {
            // Fetch User Profile for Avatar
            const profile = await api.get<any>('/auth/profile');
            setUser(profile);
        } catch (e) {
            console.error("Profile fetch failed", e);
            // Don't log out immediately on error to avoid flickering, just show generic avatar
        } finally {
            setIsAuthLoading(false);
        }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileOpen(false);
    router.push('/login');
  };

  // Scroll Listener
  useEffect(() => { 
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll); 
    return () => window.removeEventListener('scroll', handleScroll); 
  }, []);

  // Theme Init
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const getTranslatedText = (text: { en: string; fr: string } | string) => {
    if (typeof text === 'string') return text;
    return language === 'fr' ? text.fr : text.en;
  };

  const showNavbar = pathname === "/" || pathname === "/pricing" || pathname === "/community";
  if (!showNavbar) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 z-50 mr-8">
            <Image src="/assets/WiggleLogo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">EasyPost</span>
          </Link>
          
          {/* DESKTOP MENU */}
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
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hoveredDropdown === getTranslatedText(item.label) ? "text-[#3C48F6]" : "text-gray-600 dark:text-gray-300 hover:text-[#3C48F6]"}`}
                  onClick={(e) => item.hasDropdown && e.preventDefault()}
                >
                  {getTranslatedText(item.label)}
                  {item.hasDropdown && <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${hoveredDropdown === getTranslatedText(item.label) ? "rotate-180" : ""}`} />}
                </Link>
                
                {/* MEGA MENU DROPDOWNS */}
                <AnimatePresence>
                  {item.hasDropdown && hoveredDropdown === getTranslatedText(item.label) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 pt-2 w-[600px] z-50"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 grid grid-cols-2 gap-6">
                            {item.dropdownContent?.type === 'mega' && item.dropdownContent.columns.map((col, idx) => (
                                <div key={idx}>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{getTranslatedText(col.heading)}</h4>
                                    <div className="space-y-3">
                                        {col.links.map(link => (
                                            <Link key={getTranslatedText(link.label)} href={link.href} className="flex gap-3 items-start group">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><link.Icon size={16}/></div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600">{getTranslatedText(link.label)}</div>
                                                    <div className="text-xs text-gray-500">{getTranslatedText(link.description)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {item.dropdownContent?.type === 'channels' && (
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    {item.dropdownContent.channels.map(c => (
                                        <Link key={getTranslatedText(c.label)} href={c.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <c.Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{getTranslatedText(c.label)}</span>
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

          {/* RIGHT ACTIONS */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthLoading ? (
                <div className="w-24 h-9 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
                /* 🧑‍💼 LOGGED IN: PROFILE DROPDOWN */
                <div className="relative" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-300 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user?.firstName?.charAt(0) || 'U')}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                            {user?.firstName || 'User'}
                        </span>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 pt-2 w-56 z-50"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-2">
                                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                                        <p className="text-xs font-bold text-gray-500">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
                                    </div>
                                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                        <FaChartBar /> Dashboard
                                    </Link>
                                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                        <FaCog /> Settings
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1">
                                        <FaSignOutAlt /> Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                /* 🚪 LOGGED OUT */
                <>
                    <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">{t("Log in", "Connexion")}</Link>
                    <Link href="/signup" className="px-5 py-2.5 bg-[#3C48F6] text-white font-bold text-sm rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-500/30">
                        {t("Get started", "Commencer")}
                    </Link>
                </>
            )}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button onClick={toggleLanguage} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><FaGlobe /></button>
            <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">{isDark ? <FaSun /> : <FaMoon />}</button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-3">
             {isAuthenticated ? (
                 <Link href="/dashboard" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.firstName?.charAt(0) || <FaUser />}
                 </Link>
             ) : (
                 <Link href="/signup" className="px-4 py-2 bg-[#3C48F6] text-white font-bold text-xs rounded-full">Start</Link>
             )}
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 dark:text-white"><FaBars size={24} /></button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (FULL SCREEN) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-0 bg-white dark:bg-gray-950 z-[999] flex flex-col">
             
             {/* Header */}
             <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-xl tracking-tight">EasyPost</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><FaTimes size={20} /></button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {navLinks.map((item) => (
                   <div key={getTranslatedText(item.label)} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                     <div 
                        className="flex justify-between items-center py-2 text-lg font-bold text-gray-900 dark:text-white cursor-pointer"
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
                     </div>
                     
                     {/* Accordion Content */}
                     <AnimatePresence>
                        {item.hasDropdown && mobileExpanded === item.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="pl-4 pt-2 space-y-3">
                                    {item.dropdownContent?.type === 'mega' && item.dropdownContent.columns.map((col, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <p className="text-xs font-bold text-blue-600 uppercase mt-2">{getTranslatedText(col.heading)}</p>
                                            {col.links.map(l => (
                                                <Link key={getTranslatedText(l.label)} href={l.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-gray-600 dark:text-gray-400 py-1">
                                                    {getTranslatedText(l.label)}
                                                </Link>
                                            ))}
                                        </div>
                                    ))}
                                    {item.dropdownContent?.type === 'channels' && item.dropdownContent.channels.map(c => (
                                        <Link key={getTranslatedText(c.label)} href={c.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            <c.Icon className="text-gray-400" /> {getTranslatedText(c.label)}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                ))}
             </div>

             {/* Footer Actions */}
             <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-xl border border-gray-200 bg-white font-bold text-gray-900">Log In</Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center rounded-xl bg-[#3C48F6] font-bold text-white shadow-lg shadow-blue-500/30">Sign Up</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#3C48F6] text-white font-bold rounded-xl">
                            <FaChartBar /> Dashboard
                        </Link>
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-bold border border-red-100 rounded-xl">
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};