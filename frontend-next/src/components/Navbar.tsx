"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaMoon, FaSun, FaChevronDown, FaBars, FaRocket, FaPaperPlane,
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn,
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
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('accessToken');
      if (!token) { setIsAuthenticated(false); setIsAuthLoading(false); return; }
      setIsAuthenticated(true);
      try {
        const profile = await api.get<any>('/auth/profile');
        setUser(profile.data || profile);
      } catch (e) {
        // silent — user stays authenticated, just no profile data
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout', {}); } catch (e) { /* silent */ }
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

  const handleScroll = useCallback(() => { setScrolled(window.scrollY > 10); }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const getTranslatedText = (text: { en: string; fr: string } | string) => {
    if (typeof text === 'string') return text;
    return language === 'fr' ? text.fr : text.en;
  };

  const showNavbar = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/auth');
  if (!showNavbar) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200
      ${scrolled
        ? "bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-[0_4px_0px_0px_rgba(0,0,0,0.08)] py-0"
        : "bg-transparent border-b-2 border-transparent py-2"
      }`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-2.5 z-50 flex-shrink-0" aria-label="EazyPost Home">
            <div className="relative w-8 h-8 border-2 border-black dark:border-white bg-white dark:bg-black p-0.5 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              <Image src="/assets/WiggleLogo.png" alt="EazyPost Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-black text-black dark:text-white tracking-tighter uppercase">EazyPost.</span>
          </Link>

          {/* ── DESKTOP NAV LINKS ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <div
                key={item.id || item.href}
                className="relative h-16 flex items-center"
                onMouseEnter={() => item.hasDropdown && setHoveredDropdown(item.id || item.href || '')}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href={item.href || "#"}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-2 border-transparent
                    ${hoveredDropdown === (item.id || item.href)
                      ? "text-white bg-black dark:text-black dark:bg-white border-black dark:border-white"
                      : "text-black dark:text-white hover:border-black dark:hover:border-white hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
                    }`}
                  onClick={(e) => item.hasDropdown && e.preventDefault()}
                >
                  {getTranslatedText(item.label)}
                  {item.hasDropdown && (
                    <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-150 ${hoveredDropdown === (item.id || item.href) ? "rotate-180" : ""}`} />
                  )}
                </Link>

                {/* ── DROPDOWN ── */}
                <AnimatePresence>
                  {item.hasDropdown && hoveredDropdown === (item.id || item.href) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      style={{ width: item.dropdownContent?.type === 'channels' ? '340px' : '520px' }}
                    >
                      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] p-5">
                        {/* Arrow notch */}
                        <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-t-2 border-l-2 border-black dark:border-white rotate-45" />

                        {item.dropdownContent?.type === 'mega' && (
                          <div className="grid grid-cols-2 gap-6">
                            {item.dropdownContent.columns.map((col, idx) => (
                              <div key={idx}>
                                <h4 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 pb-2 border-b-2 border-black/10 dark:border-white/10">
                                  {getTranslatedText(col.heading)}
                                </h4>
                                <div className="space-y-3">
                                  {col.links.map(link => (
                                    <Link
                                      key={getTranslatedText(link.label)}
                                      href={link.href}
                                      className="flex gap-3 items-start group/item"
                                    >
                                      <div className="p-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] group-hover/item:translate-x-[1px] group-hover/item:translate-y-[1px] group-hover/item:shadow-none transition-all flex-shrink-0">
                                        <link.Icon size={12} />
                                      </div>
                                      <div>
                                        <div className="text-xs font-black text-black dark:text-white uppercase group-hover/item:text-[#3C48F5] transition-colors">
                                          {getTranslatedText(link.label)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                                          {getTranslatedText(link.description!)}
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.dropdownContent?.type === 'channels' && (
                          <div className="grid grid-cols-2 gap-2">
                            {item.dropdownContent.channels.map(c => (
                              <Link
                                key={getTranslatedText(c.label)}
                                href={c.href}
                                className="flex items-center gap-3 p-3 border-2 border-transparent hover:border-black dark:hover:border-white hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow-50 dark:hover:bg-white/5 transition-all group/ch"
                              >
                                <c.Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/ch:text-black dark:group-hover/ch:text-white transition-colors" />
                                <span className="text-xs font-black text-black dark:text-white uppercase tracking-wide">
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

          {/* ── RIGHT ACTIONS (Desktop) ── */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Language + Theme toggles */}
            <div className="flex gap-1">
              <button
                onClick={toggleLanguage}
                className="p-2 border-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all"
                title="Toggle language"
              >
                <FaGlobe size={14} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 border-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all"
                title="Toggle theme"
              >
                {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
              </button>
            </div>

            <div className="w-px h-5 bg-black/20 dark:bg-white/20" />

            {/* Auth section */}
            {isAuthLoading ? (
              <div className="w-24 h-9 bg-gray-200 dark:bg-zinc-800 border-2 border-black/20 animate-pulse" />
            ) : isAuthenticated ? (
              <div
                className="relative z-50"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] transition-all">
                  <div className="w-6 h-6 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-[10px] text-black overflow-hidden flex-shrink-0">
                    {user?.avatar
                      ? <Image src={user.avatar} alt="User" width={24} height={24} className="object-cover" />
                      : (user?.firstName?.charAt(0)?.toUpperCase() || 'U')
                    }
                  </div>
                  <span className="text-xs font-black uppercase tracking-wide text-black dark:text-white max-w-[80px] truncate">
                    {user?.firstName || "Account"}
                  </span>
                  <FaChevronDown size={10} className={`text-black dark:text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.1 }}
                      className="absolute top-full right-0 pt-2 w-52"
                    >
                      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
                        <div className="px-3 py-2.5 border-b-2 border-black dark:border-white bg-black dark:bg-white">
                          <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Signed in as</p>
                          <p className="text-xs font-black text-white dark:text-black truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-black uppercase text-black dark:text-white hover:bg-yellow-400 hover:text-black border-2 border-transparent hover:border-black transition-all">
                            <FaChartBar size={12} /> Dashboard
                          </Link>
                          <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-black uppercase text-black dark:text-white hover:bg-yellow-400 hover:text-black border-2 border-transparent hover:border-black transition-all">
                            <FaCog size={12} /> Settings
                          </Link>
                          <div className="border-t-2 border-black/10 dark:border-white/10 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-black uppercase text-red-600 hover:bg-red-600 hover:text-white border-2 border-transparent hover:border-red-600 transition-all"
                            >
                              <FaSignOutAlt size={12} /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] transition-all"
                >
                  {t("Log in", "Connexion")}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#3C48F5] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] active:shadow-none transition-all"
                >
                  {t("Start Free", "Gratuit")}
                </Link>
              </div>
            )}
          </div>

          {/* ── MOBILE TOGGLE ── */}
          <div className="lg:hidden flex items-center gap-3">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="w-8 h-8 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black text-xs text-black"
              >
                {user?.firstName?.charAt(0)?.toUpperCase() || <FaUser size={12} />}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]"
              aria-label="Open menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed top-0 left-0 w-full h-[100dvh] bg-white dark:bg-black z-[9999] flex flex-col overflow-hidden border-r-4 border-black dark:border-white"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-4 border-black dark:border-white bg-black dark:bg-white flex-shrink-0">
              <span className="font-black text-lg tracking-tighter text-white dark:text-black uppercase">EazyPost.</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white dark:bg-black border-2 border-white dark:border-black text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                aria-label="Close menu"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 overflow-y-auto">
              {navLinks.map((item) => (
                <div key={getTranslatedText(item.label)} className="border-b-2 border-black/10 dark:border-white/10">
                  <button
                    className="w-full flex justify-between items-center px-5 py-4 text-sm font-black uppercase tracking-widest text-black dark:text-white hover:bg-yellow-400 hover:text-black transition-all"
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
                    {item.hasDropdown && (
                      <FaChevronDown className={`w-3 h-3 transition-transform ${mobileExpanded === item.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  <AnimatePresence>
                    {item.hasDropdown && mobileExpanded === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden border-t-2 border-black/10 dark:border-white/10"
                      >
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900 space-y-4">
                          {item.dropdownContent?.type === 'mega' && item.dropdownContent.columns.map((col, idx) => (
                            <div key={idx}>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pb-1 border-b border-black/10">
                                {getTranslatedText(col.heading)}
                              </p>
                              {col.links.map(l => (
                                <Link
                                  key={getTranslatedText(l.label)}
                                  href={l.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center gap-3 py-2.5 border-2 border-transparent hover:border-black hover:bg-yellow-400 hover:text-black px-2 transition-all text-black dark:text-white"
                                >
                                  <div className="p-1.5 bg-yellow-400 border border-black">
                                    <l.Icon size={11} className="text-black" />
                                  </div>
                                  <span className="text-xs font-black uppercase">{getTranslatedText(l.label)}</span>
                                </Link>
                              ))}
                            </div>
                          ))}
                          {item.dropdownContent?.type === 'channels' && (
                            <div className="grid grid-cols-2 gap-2">
                              {item.dropdownContent.channels.map(c => (
                                <Link
                                  key={getTranslatedText(c.label)}
                                  href={c.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center gap-2 py-2 px-3 border-2 border-black/20 hover:border-black hover:bg-yellow-400 transition-all text-black dark:text-white"
                                >
                                  <c.Icon size={13} />
                                  <span className="text-xs font-black uppercase">{getTranslatedText(c.label)}</span>
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

            {/* Mobile Footer */}
            <div className="p-5 border-t-4 border-black dark:border-white bg-gray-50 dark:bg-zinc-900 flex-shrink-0">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center border-2 border-black dark:border-white font-black text-black dark:text-white uppercase text-xs tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center bg-[#3C48F5] border-2 border-black text-white font-black uppercase text-xs tracking-widest shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#3C48F5] text-white font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                  >
                    <FaChartBar size={12} /> Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-black uppercase text-xs tracking-widest border-2 border-red-300 hover:border-red-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <FaSignOutAlt size={12} /> Sign Out
                  </button>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4 border-t-2 border-black/10 dark:border-white/10">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <FaGlobe size={11} /> {language === 'fr' ? 'English' : 'Français'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  {isDark ? <><FaSun size={11} /> Light</> : <><FaMoon size={11} /> Dark</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
