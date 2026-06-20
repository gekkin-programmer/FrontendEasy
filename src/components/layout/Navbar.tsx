"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const clickActiveRef = useRef<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full h-[87px] lg:h-[72px] flex items-center justify-center text-white z-50 box-border transition-all duration-300 bg-[#040028] ${isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.15)]' : ''}`}>
      <div className="w-full h-full max-w-[1440px] 2xl:max-w-[2200px] 3xl:max-w-[2200px] mx-auto flex items-center justify-between px-[16px] lg:px-[12px] xl:px-[40px] 2xl:px-[60px] 3xl:px-[120px]">
      
      {/* Logo (Left Aligned) — lien vers l'accueil */}
      <Link href="/" className="flex items-center justify-start gap-[8px] lg:gap-[12px] 2xl:gap-[16px] 3xl:gap-[20px] cursor-pointer">
        <img src="/assets/WiggleLogo.png" alt="Wiggle Logo" className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] object-contain" />
        <span className="font-['Rubik_One'] font-normal text-[22px] md:text-[28px] lg:text-[20px] xl:text-[28px] 2xl:text-[32px] 3xl:text-[36px] tracking-tight">azypost</span>
      </Link>

      {/* Nav Links (Perfectly Centered) */}
      <div className="hidden lg:flex h-full items-center justify-center gap-[6px] xl:gap-[24px] 2xl:gap-[32px] 3xl:gap-[60px] font-['Rubik_One'] font-normal text-[11px] xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px]">
        
        {/* Frame 14: Fonctionnalités */}
        <div 
          className="h-full flex items-center gap-[4px] cursor-pointer group"
          onClick={() => {
            const next = activeDropdown === 'Fonctionnalités' ? null : 'Fonctionnalités';
            clickActiveRef.current = next;
            setActiveDropdown(next);
          }}
          onMouseEnter={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown('Fonctionnalités');
          }}
          onMouseLeave={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown(null);
          }}
        >
          <span>{t("Features", "Fonctionnalités")}</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform duration-300 group-hover:rotate-180">
            <path d="M10.835 5.83502L5.83496 0.835022L0.834961 5.83502" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Mega Dropdown */}
          {activeDropdown === 'Fonctionnalités' && (
            <div className="absolute left-0 top-[87px] lg:top-[72px] w-full bg-[#040028] cursor-default p-[24px] lg:p-[24px] 2xl:p-[50px] 3xl:p-[60px] shadow-2xl font-sans">
              <div className="max-w-[1440px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto grid grid-cols-3 gap-x-[40px] 2xl:gap-x-[50px] 3xl:gap-x-[60px] gap-y-[32px] 2xl:gap-y-[36px] 3xl:gap-y-[40px]">
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Global Dashboard", "Tableau de bord global")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Multi-network Scheduling", "Planification multi réseaux")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Inbox & Engagement", "Boîte de réception & engagement")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Editorial Calendar", "Calendrier éditorial")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Simplified Analytics & Reports", "Analytics & rapports simplifiés")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Collaboration & Team Management", "Collaboration & gestion d'équipe")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Content Library & Integrations", "Bibliothèque de contenus & intégrations")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Automation & Smart Assistance", "Automatisation & assistance intelligente")}</h3>
                </div>
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("Settings, Billing & Accessibility", "Paramètres, facturation & accessibilité")}</h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frame 16: Canaux */}
        <div 
          className="h-full flex items-center gap-[4px] cursor-pointer group"
          onClick={() => {
            const next = activeDropdown === 'Canaux' ? null : 'Canaux';
            clickActiveRef.current = next;
            setActiveDropdown(next);
          }}
          onMouseEnter={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown('Canaux');
          }}
          onMouseLeave={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown(null);
          }}
        >
          <span>{t("Channels", "Canaux")}</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform duration-300 group-hover:rotate-180">
            <path d="M10.835 5.83502L5.83496 0.835022L0.834961 5.83502" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {activeDropdown === 'Canaux' && (
            <div className="absolute left-0 top-[87px] lg:top-[72px] w-full bg-[#040028] cursor-default p-[24px] lg:p-[24px] 2xl:p-[50px] 3xl:p-[60px] shadow-2xl font-sans">
              <div className="max-w-[1440px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-[24px] lg:gap-x-[40px] 2xl:gap-x-[50px] 3xl:gap-x-[60px] gap-y-[24px] lg:gap-y-[32px] 2xl:gap-y-[36px] 3xl:gap-y-[40px]">
                
                {/* Facebook */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_1334_718)"/>
                    <path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_1334_718" x1="16" y1="2" x2="16" y2="29.917" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#18ACFE"/>
                        <stop offset="1" stopColor="#0163E0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Facebook</h3>
                    <p className="text-[14px]">{t("Pages & Groups", "Pages & Groupes")}</p>
                  </div>
                </div>

                {/* Instagram */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint0_radial_1334_663_insta)"/>
                    <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint1_radial_1334_663_insta)"/>
                    <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint2_radial_1334_663_insta)"/>
                    <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white"/>
                    <defs>
                      <radialGradient id="paint0_radial_1334_663_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)">
                        <stop stopColor="#B13589"/>
                        <stop offset="0.79309" stopColor="#C62F94"/>
                        <stop offset="1" stopColor="#8A3AC8"/>
                      </radialGradient>
                      <radialGradient id="paint1_radial_1334_663_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)">
                        <stop stopColor="#E0E8B7"/>
                        <stop offset="0.444662" stopColor="#FB8A2E"/>
                        <stop offset="0.71474" stopColor="#E2425C"/>
                        <stop offset="1" stopColor="#E2425C" stopOpacity="0"/>
                      </radialGradient>
                      <radialGradient id="paint2_radial_1334_663_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)">
                        <stop offset="0.156701" stopColor="#406ADC"/>
                        <stop offset="0.467799" stopColor="#6A45BE"/>
                        <stop offset="1" stopColor="#6A45BE" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Instagram</h3>
                    <p className="text-[14px]">{t("Posts, Reels & Stories", "Posts, Reels & Stories")}</p>
                  </div>
                </div>

                {/* Twitter (X) */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <rect width="80" height="80" rx="40" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M49.8637 67.5L35.9901 47.7253L18.6222 67.5H11.2744L32.7302 43.0777L11.2744 12.5H30.1393L43.215 31.1375L59.5982 12.5H66.9459L46.4858 35.7912L68.7285 67.5H49.8637ZM58.0462 61.925H53.0994L21.7953 18.075H26.7428L39.2803 35.6329L41.4484 38.6797L58.0462 61.925Z" fill="#242E36"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Twitter (X)</h3>
                    <p className="text-[14px]">{t("Tweets & Threads", "Tweets & Threads")}</p>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <rect x="2" y="2" width="28" height="28" rx="14" fill="#1275B1"/>
                    <path d="M12.6186 9.69215C12.6186 10.6267 11.8085 11.3843 10.8093 11.3843C9.81004 11.3843 9 10.6267 9 9.69215C9 8.7576 9.81004 8 10.8093 8C11.8085 8 12.6186 8.7576 12.6186 9.69215Z" fill="white"/>
                    <path d="M9.24742 12.6281H12.3402V22H9.24742V12.6281Z" fill="white"/>
                    <path d="M17.3196 12.6281H14.2268V22H17.3196C17.3196 22 17.3196 19.0496 17.3196 17.2049C17.3196 16.0976 17.6977 14.9855 19.2062 14.9855C20.911 14.9855 20.9008 16.4345 20.8928 17.5571C20.8824 19.0244 20.9072 20.5219 20.9072 22H24V17.0537C23.9738 13.8954 23.1508 12.4401 20.4433 12.4401C18.8354 12.4401 17.8387 13.1701 17.3196 13.8305V12.6281Z" fill="white"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">LinkedIn</h3>
                    <p className="text-[14px]">{t("Profiles & Pages", "Profils & Pages")}</p>
                  </div>
                </div>

                {/* Telegram */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <g clipPath="url(#clip0_56_363_tele)">
                      <path d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z" fill="url(#paint0_linear_56_363_tele)"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M18.1064 39.5777C29.7672 34.4973 37.5429 31.148 41.4335 29.5298C52.5419 24.9094 54.8502 24.1068 56.3546 24.0803C56.6855 24.0744 57.4254 24.1564 57.9046 24.5453C58.3093 24.8737 58.4206 25.3172 58.4739 25.6286C58.5272 25.9399 58.5936 26.6491 58.5408 27.2032C57.9388 33.5282 55.3341 48.8771 54.009 55.9612C53.4483 58.9587 52.3442 59.9637 51.2754 60.0621C48.9525 60.2759 47.1886 58.527 44.9388 57.0522C41.4183 54.7445 39.4294 53.3079 36.0121 51.056C32.0629 48.4535 34.623 47.0231 36.8737 44.6854C37.4627 44.0737 47.6973 34.7645 47.8954 33.92C47.9202 33.8144 47.9432 33.4207 47.7093 33.2128C47.4754 33.0049 47.1302 33.076 46.8811 33.1325C46.528 33.2127 40.9039 36.93 30.0089 44.2845C28.4125 45.3806 26.9666 45.9147 25.671 45.8868C24.2428 45.8559 21.4955 45.0792 19.4532 44.4153C16.9482 43.6011 14.9573 43.1706 15.1306 41.7877C15.2209 41.0674 16.2129 40.3307 18.1064 39.5777Z" fill="white"/>
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_56_363_tele" x1="40" y1="0" x2="40" y2="79.4067" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2AABEE"/>
                        <stop offset="1" stopColor="#229ED9"/>
                      </linearGradient>
                      <clipPath id="clip0_56_363_tele">
                        <rect width="80" height="80" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Telegram</h3>
                    <p className="text-[14px]">{t("Channels & Groups", "Canaux & Groupes")}</p>
                  </div>
                </div>

                {/* Discord */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z" fill="url(#paint0_linear_1334_785)"/>
                    <path d="M24.2752 10.0267C22.7615 8.74667 20.945 8.10667 19.0275 8L18.7248 8.32C20.4404 8.74667 21.9541 9.6 23.367 10.7733C21.6514 9.81333 19.7339 9.17333 17.7156 8.96C17.1101 8.85333 16.6055 8.85333 16 8.85333C15.3945 8.85333 14.8899 8.85333 14.2844 8.96C12.2661 9.17333 10.3486 9.81333 8.63303 10.7733C10.0459 9.6 11.5596 8.74667 13.2752 8.32L12.9725 8C11.055 8.10667 9.23853 8.74667 7.72477 10.0267C6.00917 13.44 5.10092 17.28 5 21.2267C6.51376 22.9333 8.63303 24 10.8532 24C10.8532 24 11.5596 23.1467 12.0642 22.4C10.7523 22.08 9.54128 21.3333 8.73395 20.16C9.44037 20.5867 10.1468 21.0133 10.8532 21.3333C11.7615 21.76 12.6697 21.9733 13.578 22.1867C14.3853 22.2933 15.1927 22.4 16 22.4C16.8073 22.4 17.6147 22.2933 18.422 22.1867C19.3303 21.9733 20.2385 21.76 21.1468 21.3333C21.8532 21.0133 22.5596 20.5867 23.2661 20.16C22.4587 21.3333 21.2477 22.08 19.9358 22.4C20.4404 23.1467 21.1468 24 21.1468 24C23.367 24 25.4862 22.9333 27 21.2267C26.8991 17.28 25.9908 13.44 24.2752 10.0267ZM12.6697 19.3067C11.6606 19.3067 10.7523 18.3467 10.7523 17.1733C10.7523 16 11.6606 15.04 12.6697 15.04C13.6789 15.04 14.5872 16 14.5872 17.1733C14.5872 18.3467 13.6789 19.3067 12.6697 19.3067ZM19.3303 19.3067C18.3211 19.3067 17.4128 18.3467 17.4128 17.1733C17.4128 16 18.3211 15.04 19.3303 15.04C20.3394 15.04 21.2477 16 21.2477 17.1733C21.2477 18.3467 20.3394 19.3067 19.3303 19.3067Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_1334_785" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#687EC9"/>
                        <stop offset="1" stopColor="#5971C3"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Discord</h3>
                    <p className="text-[14px]">{t("Servers & Channels", "Serveurs & Salons")}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z" fill="#BFC8D0"/>
                    <path d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" fill="url(#paint0_linear_1334_774)"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z" fill="white"/>
                    <path d="M12.5 9.50001C12.1672 8.83143 11.6565 8.89062 11.1407 8.89062C10.2188 8.89062 8.78125 9.9949 8.78125 12.0501C8.78125 13.7344 9.52345 15.5782 12.0244 18.3362C14.438 20.998 17.6094 22.3749 20.2422 22.3281C22.875 22.2812 23.4167 20.0156 23.4167 19.2504C23.4167 18.9113 23.2062 18.7421 23.0613 18.6961C22.1641 18.2656 20.5093 17.4633 20.1328 17.3125C19.7563 17.1618 19.5597 17.3657 19.4375 17.4766C19.0961 17.802 18.4193 18.7609 18.1875 18.9766C17.9558 19.1923 17.6103 19.0831 17.4665 19.0016C16.9374 18.7893 15.5029 18.1512 14.3595 17.0427C12.9453 15.6719 12.8623 15.2003 12.5959 14.7804C12.3828 14.4446 12.5392 14.2385 12.6172 14.1484C12.9219 13.7969 13.3426 13.2541 13.5313 12.9844C13.7199 12.7147 13.5702 12.3051 13.4803 12.0501C13.0938 10.9531 12.7663 10.0349 12.5 9.50001Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_1334_774" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#5BD066"/>
                        <stop offset="1" stopColor="#27B43E"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">WhatsApp</h3>
                    <p className="text-[14px]">{t("Business & Broadcasts", "Business & Broadcasts")}</p>
                  </div>
                </div>

                {/* YouTube */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M2.24451 9.94111C2.37304 7.96233 3.96395 6.41157 5.94447 6.31345C8.81239 6.17136 12.9115 6 16 6C19.0885 6 23.1876 6.17136 26.0555 6.31345C28.0361 6.41157 29.627 7.96233 29.7555 9.94111C29.8786 11.8369 30 14.1697 30 16C30 17.8303 29.8786 20.1631 29.7555 22.0589C29.627 24.0377 28.0361 25.5884 26.0555 25.6866C23.1876 25.8286 19.0885 26 16 26C12.9115 26 8.81239 25.8286 5.94447 25.6866C3.96395 25.5884 2.37304 24.0377 2.24451 22.0589C2.12136 20.1631 2 17.8303 2 16C2 14.1697 2.12136 11.8369 2.24451 9.94111Z" fill="#FC0D1B"/>
                    <path d="M13 12V20L21 16L13 12Z" fill="white"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">YouTube</h3>
                    <p className="text-[14px]">{t("Channels & Shorts", "Chaînes & Shorts")}</p>
                  </div>
                </div>

                {/* Twitch */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M22 10H20V16H22V10Z" fill="#6445A2"/>
                    <path d="M15 10H17V16H15V10Z" fill="#6445A2"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5 8L6.56799 4H28V19L22 25H17L13.886 28H10V25H5V8ZM22 21L26 17V6H9V21H13V24L16 21H22Z" fill="#6445A2"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Twitch</h3>
                    <p className="text-[14px]">{t("Streams & VOD", "Streams & VOD")}</p>
                  </div>
                </div>

                {/* Pinterest */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <g clipPath="url(#clip0_56_368_pint)">
                      <path d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z" fill="white"/>
                      <path d="M40 0C17.9095 0 0 17.9095 0 40C0 56.9547 10.535 71.4403 25.4156 77.2675C25.0535 74.107 24.7572 69.2346 25.5473 65.7778C26.2716 62.6502 30.2222 45.893 30.2222 45.893C30.2222 45.893 29.037 43.4897 29.037 39.9671C29.037 34.4033 32.2634 30.2551 36.2798 30.2551C39.7037 30.2551 41.3498 32.823 41.3498 35.8848C41.3498 39.3086 39.177 44.4444 38.0247 49.2181C37.07 53.2016 40.0329 56.4609 43.9506 56.4609C51.0617 56.4609 56.5267 48.9547 56.5267 38.1564C56.5267 28.5761 49.6461 21.893 39.8025 21.893C28.4115 21.893 21.7284 30.4198 21.7284 39.2428C21.7284 42.6667 23.0453 46.3539 24.6914 48.3621C25.0206 48.7572 25.0535 49.1193 24.9547 49.5144C24.6584 50.7654 23.9671 53.4979 23.8354 54.0576C23.6708 54.7819 23.2428 54.9465 22.4856 54.5844C17.4815 52.2469 14.3539 44.9712 14.3539 39.0782C14.3539 26.4691 23.5062 14.8807 40.7901 14.8807C54.6502 14.8807 65.4486 24.7572 65.4486 37.9918C65.4486 51.786 56.7572 62.8807 44.7078 62.8807C40.6584 62.8807 36.8395 60.7737 35.5556 58.2716C35.5556 58.2716 33.5473 65.9095 33.0535 67.786C32.1646 71.2757 29.7284 75.6214 28.0823 78.2881C31.8354 79.4403 35.786 80.0658 39.9342 80.0658C62.0247 80.0658 79.9342 62.1564 79.9342 40.0658C80 17.9095 62.0905 0 40 0Z" fill="#E60019"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_56_368_pint">
                        <rect width="80" height="80" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Pinterest</h3>
                    <p className="text-[14px]">{t("Pins & Boards", "Épingles & Tableaux")}</p>
                  </div>
                </div>

                {/* Canva */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <circle fill="#24BECA" cx="32" cy="32" r="32"/>
                    <path fill="#FFFFFF" d="M45.6,43.1c-1.7,2.3-3.9,4.7-6.8,6.5c-2.8,1.8-6,3.2-9.8,3.2c-3.5,0-6.4-1.8-8-3.3c-2.4-2.3-3.7-5.6-4.1-8.7 c-1.2-9.6,4.7-22.3,13.8-27.8c2.1-1.3,4.4-1.9,6.6-1.9c4.4,0,7.7,3.1,8.1,6.9c0.4,3.4-0.9,6.3-4.7,8.2c-1.9,1-2.9,0.9-3.2,0.5 c-0.2-0.3-0.1-0.8,0.3-1.1c3.5-2.9,3.6-5.3,3.2-8.7c-0.3-2.2-1.7-3.6-3.3-3.6c-6.9,0-16.9,15.5-15.5,26.7c0.5,4.4,3.2,9.5,8.8,9.5 c1.8,0,3.8-0.5,5.5-1.4c3.9-2,5.6-3.4,7.9-6.6c0.3-0.4,0.6-0.9,0.9-1.3c0.2-0.4,0.6-0.5,0.9-0.5c0.3,0,0.7,0.3,0.7,0.8 c0,0.3-0.1,0.9-0.5,1.4C46.3,42.1,46,42.7,45.6,43.1L45.6,43.1z"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Canva</h3>
                    <p className="text-[14px]">{t("Designs & Templates", "Designs & Templates")}</p>
                  </div>
                </div>

                {/* Dropbox */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <circle cx="16" cy="16" r="14" fill="#0F287F"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M11 8L6 11L11 14L6 17L11 20L16 17L21 20L26 17L21 14L26 11L21 8L16 11L11 8ZM16 11L21 14L16 17L11 14L16 11Z" fill="#DAF8FE"/>
                    <path d="M11 22L16 19L21 22L16 25L11 22Z" fill="#DAF8FE"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Dropbox</h3>
                    <p className="text-[14px]">{t("Files & Folders", "Fichiers & Dossiers")}</p>
                  </div>
                </div>

                {/* TikTok */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M57.2541 28.8782C62.3986 32.5688 68.7008 34.7403 75.5076 34.7403V21.5954C74.2194 21.5956 72.9345 21.4608 71.6742 21.1929V31.5398C64.868 31.5398 58.5666 29.3683 53.4207 25.678V52.5029C53.4207 65.9221 42.581 76.7997 29.2103 76.7997C24.2214 76.7997 19.5844 75.2861 15.7324 72.6901C20.1288 77.2014 26.2599 79.9999 33.0428 79.9999C46.4143 79.9999 57.2546 69.1223 57.2546 55.7026V28.8782H57.2541ZM61.9829 15.6166C59.3538 12.7341 57.6276 9.00891 57.2541 4.89057V3.19986H53.6214C54.5358 8.43426 57.6546 12.9062 61.9829 15.6166ZM24.1894 62.3927C22.7205 60.4598 21.9267 58.0953 21.9302 55.6641C21.9302 49.5267 26.8882 44.5504 33.0051 44.5504C34.1451 44.5501 35.2782 44.7253 36.3646 45.0712V31.6326C35.095 31.4579 33.8137 31.3838 32.5329 31.411V41.871C31.4457 41.5251 30.312 41.3494 29.1717 41.3505C23.0549 41.3505 18.0971 46.3262 18.0971 52.4645C18.0971 56.8046 20.5753 60.5622 24.1894 62.3927Z" fill="#FF004F"/>
                    <path d="M53.4232 25.6777C58.5691 29.368 64.8705 31.5395 71.6768 31.5395V21.1926C67.8776 20.3804 64.5143 18.388 61.9855 15.6166C57.6569 12.9059 54.5383 8.43399 53.624 3.19986H44.082V55.702C44.0604 61.8227 39.1108 66.7787 33.0071 66.7787C29.4103 66.7787 26.2149 65.0581 24.1911 62.3927C20.5773 60.5622 18.0991 56.8044 18.0991 52.4647C18.0991 46.327 23.0569 41.3507 29.1737 41.3507C30.3457 41.3507 31.4753 41.5339 32.5349 41.8713V31.4113C19.3991 31.6836 8.83472 42.455 8.83472 55.7023C8.83472 62.3152 11.4655 68.3102 15.7353 72.6904C19.5872 75.2861 24.2242 76.8 29.2131 76.8C42.5841 76.8 53.4235 65.9218 53.4235 52.5029V25.6777H53.4232Z" fill="black"/>
                    <path d="M71.6751 21.1927V18.3949C68.2492 18.4002 64.8905 17.4373 61.9839 15.6164C64.5569 18.4435 67.9451 20.3929 71.6751 21.1927ZM53.6223 3.19994C53.5351 2.6997 53.4681 2.19617 53.4216 1.69071V0H40.2467V52.5027C40.2257 58.6226 35.2764 63.5786 29.1721 63.5786C27.38 63.5786 25.6879 63.1516 24.1895 62.393C26.2132 65.0581 29.4086 66.7785 33.0055 66.7785C39.1087 66.7785 44.059 61.8231 44.0804 55.7024V3.19994H53.6223ZM32.5338 31.4114V28.433C31.4329 28.282 30.323 28.2062 29.2118 28.2067C15.8397 28.2065 5 39.0846 5 52.5027C5 60.9151 9.2602 68.3289 15.7339 72.69C11.4641 68.31 8.83336 62.3148 8.83336 55.7021C8.83336 42.4551 19.3975 31.6837 32.5338 31.4114Z" fill="#00F2EA"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">TikTok</h3>
                    <p className="text-[14px]">{t("Videos & Trends", "Vidéos & Tendances")}</p>
                  </div>
                </div>

                {/* Reddit */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M16 2C8.27812 2 2 8.27812 2 16C2 23.7219 8.27812 30 16 30C23.7219 30 30 23.7219 30 16C30 8.27812 23.7219 2 16 2Z" fill="#FC471E"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z" fill="white"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Reddit</h3>
                    <p className="text-[14px]">{t("Subreddits & Communities", "Subreddits & Communautés")}</p>
                  </div>
                </div>

                {/* Messenger */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 28.1791C23.1797 28.1791 29 22.5426 29 15.5896C29 8.63654 23.1797 3 16 3C8.8203 3 3 8.63654 3 15.5896C3 19.3712 4.72168 22.7634 7.44737 25.0711V27.6188C7.44737 28.6145 8.4616 29.2824 9.36588 28.8821L12.193 27.6307C13.397 27.9873 14.6754 28.1791 16 28.1791Z" fill="url(#paint0_linear_1334_749)"/>
                    <path d="M12.887 12.9133L9.11723 18.0689C8.71304 18.6217 9.43994 19.2858 9.99334 18.8693L13.2123 16.4469C13.5399 16.2003 13.9992 16.197 14.3307 16.4388L17.1935 18.5272C17.7425 18.9277 18.5272 18.8125 18.9269 18.2727L22.8805 12.9341C23.2905 12.3804 22.558 11.7109 22.0038 12.1328L18.6006 14.7236C18.2729 14.9731 17.8112 14.9777 17.4782 14.7347L14.6247 12.6531C14.0733 12.2509 13.285 12.369 12.887 12.9133Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_1334_749" x1="16" y1="3" x2="11.8286" y2="28.8583" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00B1FF"/>
                        <stop offset="1" stopColor="#006BFF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Messenger</h3>
                    <p className="text-[14px]">{t("Chats & Bots", "Discussions & Bots")}</p>
                  </div>
                </div>

                {/* Google Drive */}
                <div className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z" fill="#4285F4"/>
                    <path d="M16.2853 30C20.1424 30 23.3804 28.7555 25.7456 26.6089L21.2377 23.1865C20.0313 24.011 18.4123 24.5866 16.2853 24.5866C12.5076 24.5866 9.30128 22.1444 8.15832 18.7688L7.99078 18.7827L3.58111 22.1272L3.52344 22.2843C5.87261 26.8577 10.698 30 16.2853 30Z" fill="#34A853"/>
                    <path d="M8.16061 18.7688C7.85903 17.8977 7.6845 16.9643 7.6845 15.9999C7.6845 15.0354 7.85903 14.1021 8.14475 13.231L8.13676 13.0455L3.67181 9.64734L3.52572 9.71544C2.55751 11.6132 2.00195 13.7444 2.00195 15.9999C2.00195 18.2555 2.55751 20.3865 3.52572 22.2843L8.16061 18.7688Z" fill="#FBBC05"/>
                    <path d="M16.2854 7.4133C18.9679 7.4133 20.7774 8.54885 21.8092 9.4978L25.8409 5.64C23.3648 3.38445 20.1425 2 16.2854 2C10.698 2 5.87262 5.1422 3.52344 9.71549L8.14247 13.2311C9.30131 9.85555 12.5076 7.4133 16.2854 7.4133Z" fill="#EB4335"/>
                  </svg>
                  <div>
                    <h3 className="text-[18px] text-white font-bold mb-1 transition-colors">Google Drive</h3>
                    <p className="text-[14px]">{t("Storage & Docs", "Stockage & Docs")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frame: Pour */}
        <div 
          className="h-full flex items-center gap-[4px] cursor-pointer group"
          onClick={() => {
            const next = activeDropdown === 'Pour' ? null : 'Pour';
            clickActiveRef.current = next;
            setActiveDropdown(next);
          }}
          onMouseEnter={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown('Pour');
          }}
          onMouseLeave={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown(null);
          }}
        >
          <span>{t("For", "Pour")}</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform duration-300 group-hover:rotate-180">
            <path d="M10.835 5.83502L5.83496 0.835022L0.834961 5.83502" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {activeDropdown === 'Pour' && (
            <div className="absolute left-0 top-[87px] lg:top-[72px] w-full bg-[#040028] cursor-default p-[24px] lg:p-[24px] 2xl:p-[50px] 3xl:p-[60px] shadow-2xl font-sans">
              <div className="max-w-[1440px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-[24px] lg:gap-[40px] 2xl:gap-[50px] 3xl:gap-[60px]">
                <Link href="/pour/createurs" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Creators & Influencers", "Créateurs & Influenceurs")}</h3>
                </Link>
                <Link href="/pour/pme" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Small & Medium Businesses", "Petites & Moyennes Entreprises")}</h3>
                </Link>
                <Link href="/pour/agences" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Agencies", "Agences")}</h3>
                </Link>
                <Link href="/pour/organisations" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Organizations & Institutions", "Organisations & Institutions")}</h3>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Frame 15: Ressources */}
        <div 
          className="h-full flex items-center gap-[4px] cursor-pointer group"
          onClick={() => {
            const next = activeDropdown === 'Ressources' ? null : 'Ressources';
            clickActiveRef.current = next;
            setActiveDropdown(next);
          }}
          onMouseEnter={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown('Ressources');
          }}
          onMouseLeave={() => {
            if (clickActiveRef.current) return;
            setActiveDropdown(null);
          }}
        >
          <span>{t("Resources", "Ressources")}</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform duration-300 group-hover:rotate-180">
            <path d="M10.835 5.83502L5.83496 0.835022L0.834961 5.83502" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {activeDropdown === 'Ressources' && (
            <div className="absolute left-0 top-[87px] lg:top-[72px] w-full bg-[#040028] cursor-default p-[24px] lg:p-[24px] 2xl:p-[50px] 3xl:p-[60px] shadow-2xl font-sans">
              <div className="max-w-[1440px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto grid grid-cols-2 gap-[24px] lg:gap-[40px] 2xl:gap-[50px] 3xl:gap-[60px]">
                <div className="text-white/80">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Blog", "Blog")}</h3>
                  <p className="text-[14px]">{t("Discover our latest articles and marketing tips.", "Découvrez nos derniers articles et astuces marketing.")}</p>
                </div>
                <div className="text-white/80">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("Help Center", "Centre d'Aide")}</h3>
                  <p className="text-[14px]">{t("Find quick answers to your questions.", "Trouvez des réponses rapides à vos questions.")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frame 17: Tarifs */}
        <div className="h-full flex items-center gap-[4px] cursor-pointer">
          <span>{t("Pricing", "Tarifs")}</span>
        </div>

      </div>

      {/* Right Actions (Right Aligned) */}
      <div className="flex items-center justify-end gap-[8px] xl:gap-[24px] 2xl:gap-[28px] 3xl:gap-[40px] font-['Rubik_One'] font-normal">
        {/* Language */}
        <div className="relative">
          <div 
            className="flex items-center gap-[4px] md:gap-[6px] cursor-pointer transition-colors"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <span className="text-[14px] md:text-[18px] uppercase">{language}</span>
            <Globe size={20} className="w-[16px] md:w-[20px] h-[16px] md:h-[20px]" />
          </div>

          {isLangOpen && (
            <div className="absolute right-0 top-[40px] w-[240px] bg-[#040028] border border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.3)] py-[8px] flex flex-col z-50">
              <div 
                className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer"
                onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
              >
                <span className="font-['Rubik'] font-medium text-[14px] text-white">English</span>
              </div>
              <div 
                className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer"
                onClick={() => { setLanguage('fr'); setIsLangOpen(false); }}
              >
                <span className="font-['Rubik'] font-medium text-[14px] text-white">Français</span>
              </div>
              <div 
                className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer"
                onClick={() => { setLanguage('ar'); setIsLangOpen(false); }}
              >
                <span className="font-['Rubik'] font-medium text-[14px] text-white">العربية (Arab)</span>
              </div>
            </div>
          )}
        </div>

        {/* Login */}
        <Link href="/login" className="hidden sm:block text-[14px] md:text-[16px] lg:text-[12px] xl:text-[16px] 2xl:text-[17px] 3xl:text-[18px] cursor-pointer transition-colors whitespace-nowrap">
          {t("Log in", "Connexion")}
        </Link>

        {/* CTA */}
        <Link href="/signup" className="hidden sm:flex items-center justify-center px-[16px] lg:px-[10px] xl:px-[32px] 2xl:px-[36px] 3xl:px-[40px] h-[40px] md:h-[54px] lg:h-[32px] xl:h-[54px] 2xl:h-[56px] 3xl:h-[60px] border-[2px] border-white rounded-[12px] md:rounded-[18px] 2xl:rounded-[19px] 3xl:rounded-[20px] text-[12px] md:text-[16px] lg:text-[12px] xl:text-[16px] 2xl:text-[17px] 3xl:text-[18px] font-medium hover:bg-white hover:text-[#040028] transition-all whitespace-nowrap">
          {t("Start free trial", "Commencer l'essai")}
        </Link>

        {/* Hamburger Menu Toggle */}
        <button className="lg:hidden flex items-center ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[87px] left-0 w-full h-[calc(100vh-87px)] bg-[#040028] flex flex-col p-[24px] overflow-y-auto lg:hidden font-sans border-t border-white/10 shadow-2xl">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-6 font-['Rubik_One'] pb-[40px]">
             
             {/* Features */}
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveDropdown(activeDropdown === 'Fonctionnalités' ? null : 'Fonctionnalités')}>
                   <span className="text-[18px]">{t("Features", "Fonctionnalités")}</span>
                   <ChevronDown className={`transition-transform ${activeDropdown === 'Fonctionnalités' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'Fonctionnalités' && (
                   <div className="flex flex-col gap-3 pl-4 font-sans text-[16px] text-white/80 border-l border-white/20">
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Global Dashboard", "Tableau de bord global")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Multi-network Scheduling", "Planification multi réseaux")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Inbox & Engagement", "Boîte de réception & engagement")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Editorial Calendar", "Calendrier éditorial")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Simplified Analytics & Reports", "Analytics & rapports simplifiés")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Collaboration & Team Management", "Collaboration & gestion d'équipe")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Content Library & Integrations", "Bibliothèque de contenus & intégrations")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Automation & Smart Assistance", "Automatisation & assistance intelligente")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Settings, Billing & Accessibility", "Paramètres, facturation & accessibilité")}</Link>
                   </div>
                )}
             </div>

             {/* Canaux */}
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveDropdown(activeDropdown === 'Canaux' ? null : 'Canaux')}>
                   <span className="text-[18px]">{t("Channels", "Canaux")}</span>
                   <ChevronDown className={`transition-transform ${activeDropdown === 'Canaux' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'Canaux' && (
                   <div className="flex flex-col gap-3 pl-4 font-sans text-[16px] text-white/80 border-l border-white/20">
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Facebook</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Instagram</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Twitter (X)</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>LinkedIn</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Telegram</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Discord</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>WhatsApp</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>YouTube</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Twitch</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Pinterest</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Canva</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Dropbox</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>TikTok</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Reddit</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Messenger</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>Google Drive</Link>
                   </div>
                )}
             </div>

             {/* Pour */}
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveDropdown(activeDropdown === 'Pour' ? null : 'Pour')}>
                   <span className="text-[18px]">{t("For", "Pour")}</span>
                   <ChevronDown className={`transition-transform ${activeDropdown === 'Pour' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'Pour' && (
                   <div className="flex flex-col gap-3 pl-4 font-sans text-[16px] text-white/80 border-l border-white/20">
                      <Link href="/pour/createurs" onClick={() => setIsMobileMenuOpen(false)}>{t("Creators & Influencers", "Créateurs & Influenceurs")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Small & Medium Businesses", "Petites & Moyennes Entreprises")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Agencies", "Agences")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Organizations & Institutions", "Organisations & Institutions")}</Link>
                   </div>
                )}
             </div>

             {/* Ressources */}
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveDropdown(activeDropdown === 'Ressources' ? null : 'Ressources')}>
                   <span className="text-[18px]">{t("Resources", "Ressources")}</span>
                   <ChevronDown className={`transition-transform ${activeDropdown === 'Ressources' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'Ressources' && (
                   <div className="flex flex-col gap-3 pl-4 font-sans text-[16px] text-white/80 border-l border-white/20">
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Blog", "Blog")}</Link>
                      <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>{t("Help Center", "Centre d'Aide")}</Link>
                   </div>
                )}
             </div>

             {/* Tarifs */}
             <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[18px] block pt-2">{t("Pricing", "Tarifs")}</Link>

             {/* Mobile CTA */}
             <div className="sm:hidden flex flex-col gap-4 mt-8 pt-6 border-t border-white/10">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 text-[16px]">
                  {t("Log in", "Connexion")}
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-[48px] flex items-center justify-center border-[2px] border-white rounded-[12px] text-[16px] font-medium hover:bg-white hover:text-[#040028] transition-all">
                  {t("Start free trial", "Commencer l'essai")}
                </Link>
             </div>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}

