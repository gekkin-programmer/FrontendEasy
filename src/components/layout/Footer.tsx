"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10">
      <button
        className="w-full flex items-center justify-between py-3 px-1 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-[14px] max-[375px]:text-[13px] text-white">{title}</span>
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M1 1.5L6 5.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-3' : 'max-h-0'}`}>
        <div className="flex flex-col gap-2 px-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="w-[44px] max-[375px]:w-[36px] max-[375px]:h-[36px] h-[44px] flex items-center justify-center rounded-full hover:scale-110 transition-transform bg-white/10"
      target="_blank" rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#040028] relative font-sans overflow-hidden flex flex-col min-h-[calc(100vh-87px)] lg:min-h-[calc(100vh-72px)]">
      <div className="w-full max-w-[1440px] 3xl:max-w-[2200px] mx-auto px-4 max-[375px]:px-3 md:px-[117px] 3xl:px-[160px] pt-[40px] max-[375px]:pt-[24px] lg:pt-[60px] 3xl:pt-[80px] pb-[30px] lg:pb-[40px] 3xl:pb-[60px] h-full flex flex-col justify-between relative">
        
        {/* Top Section: Text & Button */}
        <div className="flex flex-col gap-[20px] md:gap-[32px] 3xl:gap-[40px] relative z-10 w-full md:w-[587px] 3xl:w-[800px] mb-[40px] md:mb-[60px] lg:mb-[80px] 3xl:mb-[100px]">
          <h2 className="font-bold text-[28px] max-[375px]:text-[22px] max-[320px]:text-[18px] md:text-[52px] 3xl:text-[64px] leading-tight md:leading-[61px] 3xl:leading-[76px] text-white">
            {t('Boost your online presence today', 'Propulsez votre présence en ligne aujourd\'hui')}
          </h2>
        </div>

        {/* Decorative Spline Image */}
        <div 
          className="hidden lg:block absolute right-[50px] xl:right-[177px] 3xl:right-[250px] top-[-30px] xl:top-[-61px] 3xl:top-[-80px] w-[450px] h-[450px] xl:w-[556px] xl:h-[583px] 3xl:w-[700px] 3xl:h-[700px] transform -rotate-[21.02deg] pointer-events-none bg-no-repeat bg-contain bg-center opacity-90"
          style={{ backgroundImage: "url('/Splines_00023.png')" }}
        >
        </div>

        {/* ===== DESKTOP GRID COLUMNS (hidden on mobile) ===== */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-[30px] xl:gap-[32px] 3xl:gap-[48px] z-10 w-full mb-[20px] 3xl:mb-[30px]">
          
          {/* Fonctionnalités */}
          <div className="flex flex-col gap-[12px] md:gap-[16px] 3xl:gap-[24px]">
            <h3 className="font-bold text-[16px] md:text-[18px] 3xl:text-[22px] leading-[21px] 3xl:leading-[26px] text-[#FFFFFF] mb-[4px] 3xl:mb-[8px]">
              {t('Features', 'Fonctionnalités')}
            </h3>
            {[t('Publish', 'Publier'), t('Create', 'Créer'), t('Collaborate', 'Collaborer'), t('Schedule', 'Planifier')].map(item => (
              <Link key={item} href="#" className="font-normal text-[13px] md:text-[14px] 3xl:text-[16px] leading-[16px] 3xl:leading-[20px] text-[#FFFFFF] hover:text-gray-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Canaux */}
          <div className="flex flex-col gap-[12px] md:gap-[16px] 3xl:gap-[24px]">
            <h3 className="font-bold text-[16px] md:text-[18px] 3xl:text-[22px] leading-[21px] 3xl:leading-[26px] text-[#FFFFFF] mb-[4px] 3xl:mb-[8px]">
              {t('Channels', 'Canaux')}
            </h3>
            {['Facebook', 'Tiktok', 'Instagram', 'Snapchat', 'Youtube', 'Télégram', 'Whatsapp', 'Pinterest', 'Twitter'].map(item => (
              <Link key={item} href="#" className="font-normal text-[13px] md:text-[14px] 3xl:text-[16px] leading-[16px] 3xl:leading-[20px] text-[#FFFFFF] hover:text-gray-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Pour qui */}
          <div className="flex flex-col gap-[12px] md:gap-[16px] 3xl:gap-[24px]">
            <h3 className="font-bold text-[16px] md:text-[18px] 3xl:text-[22px] leading-[21px] 3xl:leading-[26px] text-[#FFFFFF] mb-[4px] 3xl:mb-[8px]">
              {t('For who', 'Pour qui')}
            </h3>
            {[t('Influencer', 'Influenceur'), t('Content Creator', 'Créateur de contenu'), t('SME', 'PME'), t('Agencies', 'Agences'), t('Organization', 'Organisation'), t('Institutions', 'Institutions')].map(item => (
              <Link key={item} href="#" className="font-normal text-[13px] md:text-[14px] 3xl:text-[16px] leading-[16px] 3xl:leading-[20px] text-[#FFFFFF] hover:text-gray-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Ressources */}
          <div className="flex flex-col gap-[12px] md:gap-[16px] 3xl:gap-[24px]">
            <h3 className="font-bold text-[16px] md:text-[18px] 3xl:text-[22px] leading-[21px] 3xl:leading-[26px] text-[#FFFFFF] mb-[4px] 3xl:mb-[8px]">
              {t('Resources', 'Ressources')}
            </h3>
            {[t('Blog', 'Blog'), t('Community', 'Communauté'), t('Help Center', 'Centre d\'aide'), t('Contact', 'Contact')].map(item => (
              <Link key={item} href="#" className="font-normal text-[13px] md:text-[14px] 3xl:text-[16px] leading-[16px] 3xl:leading-[20px] text-[#FFFFFF] hover:text-gray-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* A propos */}
          <div className="flex flex-col gap-[12px] md:gap-[16px] 3xl:gap-[24px]">
            <h3 className="font-bold text-[16px] md:text-[18px] 3xl:text-[22px] leading-[21px] 3xl:leading-[26px] text-[#FFFFFF] mb-[4px] 3xl:mb-[8px]">
              {t('About', 'À propos')}
            </h3>
            {[t('Team', 'Equipe'), t('Company', 'Entreprise')].map(item => (
              <Link key={item} href="#" className="font-normal text-[13px] md:text-[14px] 3xl:text-[16px] leading-[16px] 3xl:leading-[20px] text-[#FFFFFF] hover:text-gray-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>

        </div>

        {/* ===== MOBILE ACCORDION + CTAs + TRUST + LEGAL (hidden on desktop) ===== */}
        <div className="md:hidden z-10 w-full flex flex-col flex-1">

          {/* --- Accordion Categories (flex-1 to fill available space) --- */}
          <div className="flex-1 overflow-y-auto">
            <AccordionSection title={t('About', 'À propos')}>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Team', 'Equipe')}
              </Link>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Company', 'Entreprise')}
              </Link>
            </AccordionSection>

            <AccordionSection title={t('Features', 'Fonctionnalités')}>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Publish', 'Publier')}
              </Link>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Create', 'Créer')}
              </Link>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Collaborate', 'Collaborer')}
              </Link>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Schedule', 'Planifier')}
              </Link>
            </AccordionSection>

            <AccordionSection title={t('Channels', 'Canaux')}>
              {['Facebook', 'Tiktok', 'Instagram', 'Snapchat', 'Youtube', 'Télégram', 'Whatsapp', 'Pinterest', 'Twitter'].map(item => (
                <Link key={item} href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                  {item}
                </Link>
              ))}
            </AccordionSection>

            <AccordionSection title={t('For who', 'Pour qui')}>
              {[t('Influencer', 'Influenceur'), t('Content Creator', 'Créateur de contenu'), t('SME', 'PME'), t('Agencies', 'Agences'), t('Organization', 'Organisation'), t('Institutions', 'Institutions')].map(item => (
                <Link key={item} href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                  {item}
                </Link>
              ))}
            </AccordionSection>

            <AccordionSection title={t('Resources', 'Ressources')}>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Blog', 'Blog')}
              </Link>
              <Link href="#" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Community', 'Communauté')}
              </Link>
              <Link href="/help" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Help Center', 'Centre d\'aide')}
              </Link>
              <Link href="/contact" className="text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] text-white/80 hover:text-white py-1">
                {t('Contact', 'Contact')}
              </Link>
            </AccordionSection>
          </div>

          {/* --- Legal Mentions (small grey text) --- */}
          <div className="pt-4 pb-3 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1.5">
            <Link href="/legal/terms" className="text-[11px] max-[375px]:text-[10px] max-[320px]:text-[9px] text-gray-500 hover:text-gray-300 transition-colors">
              {t('Terms of Service', "Conditions d'utilisation")}
            </Link>
            <Link href="/legal/privacy" className="text-[11px] max-[375px]:text-[10px] max-[320px]:text-[9px] text-gray-500 hover:text-gray-300 transition-colors">
              {t('Privacy Policy', 'Politique de confidentialité')}
            </Link>
            <Link href="/legal/cookies" className="text-[11px] max-[375px]:text-[10px] max-[320px]:text-[9px] text-gray-500 hover:text-gray-300 transition-colors">
              {t('Cookie Policy', 'Politique des cookies')}
            </Link>
            <Link href="/legal/data-deletion" className="text-[11px] max-[375px]:text-[10px] max-[320px]:text-[9px] text-gray-500 hover:text-gray-300 transition-colors">
              {t('GDPR', 'Données personnelles')}
            </Link>
          </div>

          {/* --- Bottom group: Social + Contact (pushed to very bottom via mt-auto) --- */}
          <div className="mt-auto">

          {/* --- Social Icons --- */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-[13px] max-[375px]:text-[11px] text-white/60 block mb-3">
              {t('Follow us', 'Suivez-nous')}
            </span>
            <div className="flex gap-3 max-[375px]:gap-2">
              <SocialIcon href="#">
                <svg className="max-[375px]:w-5 max-[375px]:h-5" width="24" height="24" viewBox="0 0 40 40" fill="none">
                  <path d="M40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 29.986 7.32047 38.2573 16.875 39.7554V25.7812H11.7969V20H16.875V15.5859C16.875 10.5844 19.8516 7.8125 24.4172 7.8125C26.6047 7.8125 28.8828 8.20312 28.8828 8.20312V13.125H26.3656C23.8875 13.125 23.125 14.6641 23.125 16.2422V20H28.6719L27.7852 25.7812H23.125V39.7554C32.6795 38.2573 40 29.986 40 20Z" fill="white"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="max-[375px]:w-5 max-[375px]:h-5" width="24" height="24" viewBox="0 0 40 40" fill="none">
                  <path d="M40 7.6433C38.5284 8.29524 36.9388 8.73356 35.2676 8.92878C36.9741 7.90708 38.2831 6.28628 38.8988 4.36442C37.3117 5.30514 35.5539 5.98064 33.6845 6.34757C32.1868 4.75017 30.0465 3.75342 27.6835 3.75342C23.1492 3.75342 19.4729 7.42971 19.4729 11.964C19.4729 12.6074 19.5456 13.2323 19.6865 13.8344C12.8624 13.4917 6.81604 10.2184 2.77583 5.30514C2.06821 6.51864 1.66289 7.93043 1.66289 9.42845C1.66289 12.278 3.11218 14.8021 5.31688 16.2753C3.9723 16.2325 2.70932 15.8631 1.59765 15.2464C1.59682 15.2804 1.59682 15.3149 1.59682 15.3499C1.59682 19.3248 4.42676 22.6468 8.18182 23.4002C7.49266 23.5872 6.76742 23.6873 6.0195 23.6873C5.4905 23.6873 4.97866 23.6358 4.4842 23.5411C5.52844 26.8005 8.55836 29.1724 12.1554 29.2384C9.34588 31.4385 5.80164 32.7508 1.95671 32.7508C1.29367 32.7508 0.640165 32.7119 0 32.6356C3.63391 34.9657 7.95101 36.321 12.6053 36.321C27.7314 36.321 36.0028 23.7915 36.0028 12.9238C36.0028 12.5676 35.9947 12.2139 35.979 11.8623C37.5855 10.7028 38.9839 9.27137 40 7.6433Z" fill="white"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="max-[375px]:w-[18px] max-[375px]:h-[18px]" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17.1762 8.66347C18.7196 9.77064 20.6102 10.4221 22.6523 10.4221V6.47861C22.2658 6.47869 21.8803 6.43825 21.5023 6.35786V9.46193C19.4604 9.46193 17.57 8.81049 16.0262 7.7034V15.7509C16.0262 19.7766 12.7743 23.0399 8.76309 23.0399C7.26641 23.0399 5.87531 22.5858 4.71973 21.807C6.03864 23.1604 7.87796 24 9.91285 24C13.9243 24 17.1764 20.7367 17.1764 16.7108V8.66347H17.1762ZM18.5949 4.68499C17.8061 3.82023 17.2883 2.70267 17.1762 1.46717V0.959961H16.0864C16.3607 2.53028 17.2964 3.87187 18.5949 4.68499ZM7.25681 18.7178C6.81614 18.1379 6.578 17.4286 6.57907 16.6992C6.57907 14.858 8.06647 13.3651 9.90153 13.3651C10.2435 13.365 10.5835 13.4176 10.9094 13.5214V9.48977C10.5285 9.43739 10.1441 9.41515 9.75986 9.4233V12.5613C9.4337 12.4575 9.0936 12.4048 8.75152 12.4051C6.91646 12.4051 5.42914 13.8979 5.42914 15.7393C5.42914 17.0414 6.1726 18.1687 7.25681 18.7178Z" fill="#FF004F"/>
                  <path d="M16.0269 7.70332C17.5707 8.81041 19.4611 9.46185 21.503 9.46185V6.35778C20.3632 6.11414 19.3543 5.5164 18.5956 4.68499C17.2971 3.87179 16.3615 2.5302 16.0872 0.959961H13.2246V16.7106C13.2181 18.5468 11.7332 20.0336 9.90211 20.0336C8.82306 20.0336 7.86443 19.5174 7.25731 18.7178C6.17318 18.1687 5.42972 17.0413 5.42972 15.7394C5.42972 13.8981 6.91704 12.4052 8.7521 12.4052C9.10369 12.4052 9.44256 12.4602 9.76044 12.5614V9.42338C5.8197 9.50509 2.65039 12.7365 2.65039 16.7107C2.65039 18.6946 3.43962 20.4931 4.72055 21.8071C5.87614 22.5858 7.26724 23.04 8.76391 23.04C12.7752 23.04 16.027 19.7765 16.027 15.7509V7.70332H16.0269Z" fill="black"/>
                  <path d="M21.5025 6.3578V5.51848C20.4748 5.52005 19.4672 5.23119 18.5952 4.68493C19.3671 5.53306 20.3835 6.11787 21.5025 6.3578ZM16.0867 0.959983C16.0605 0.809911 16.0404 0.658851 16.0265 0.507214V0H12.074V15.7508C12.0677 17.5868 10.5829 19.0736 8.75164 19.0736C8.214 19.0736 7.70638 18.9455 7.25685 18.7179C7.86397 19.5174 8.82259 20.0336 9.90164 20.0336C11.7326 20.0336 13.2177 18.5469 13.2241 16.7107V0.959983H16.0867ZM9.76014 9.42341V8.52989C9.42988 8.48459 9.09691 8.46186 8.76353 8.46202C4.75192 8.46194 1.5 11.7254 1.5 15.7508C1.5 18.2745 2.77806 20.4987 4.72017 21.807C3.43924 20.493 2.65001 18.6944 2.65001 16.7106C2.65001 12.7365 5.81924 9.50511 9.76014 9.42341Z" fill="#00F2EA"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* --- Contact CTA --- */}
          <div className="pt-4 border-t border-white/10">
            <Link 
              href="/contact" 
              className="w-full flex items-center justify-center min-h-[44px] max-[375px]:min-h-[38px] bg-white text-[#040028] rounded-full text-[14px] max-[375px]:text-[13px] font-medium hover:bg-gray-200 transition-colors"
            >
              {t('Contact Us', 'Nous contacter')}
            </Link>
          </div>

          </div>
        </div>

        {/* ===== DESKTOP DIVIDER + BOTTOM AREA (hidden on mobile) ===== */}
        <div className="hidden md:block w-full h-[1px] border-t border-[#FFFFFF] opacity-30 z-10 mb-[20px] md:mb-[30px] 3xl:mb-[40px]"></div>

        <div className="hidden md:flex flex-col lg:flex-row justify-between items-center z-10 w-full gap-6 lg:gap-0 3xl:gap-8 mt-auto">
          
          {/* Left: Follow Us & Socials */}
          <div className="flex flex-row items-center gap-[16px] md:gap-[24px] 3xl:gap-[32px]">
            <span className="font-bold text-[14px] md:text-[16px] 3xl:text-[20px] leading-[19px] 3xl:leading-[24px] text-[#FFFFFF]">
              {t('Follow us', 'Suivez-nous')}
            </span>
            <div className="flex flex-row gap-[16px] 3xl:gap-[20px]">
              <a href="#" className="w-[24px] h-[24px] 3xl:w-[32px] 3xl:h-[32px] flex items-center justify-center hover:scale-110 transition-transform">
                <svg className="3xl:w-[32px] 3xl:h-[32px]" width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 29.986 7.32047 38.2573 16.875 39.7554V25.7812H11.7969V20H16.875V15.5859C16.875 10.5844 19.8516 7.8125 24.4172 7.8125C26.6047 7.8125 28.8828 8.20312 28.8828 8.20312V13.125H26.3656C23.8875 13.125 23.125 14.6641 23.125 16.2422V20H28.6719L27.7852 25.7812H23.125V39.7554C32.6795 38.2573 40 29.986 40 20Z" fill="white"/>
                </svg>
              </a>
              <a href="#" className="w-[24px] h-[24px] 3xl:w-[32px] 3xl:h-[32px] flex items-center justify-center hover:scale-110 transition-transform">
                <svg className="3xl:w-[32px] 3xl:h-[32px]" width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 7.6433C38.5284 8.29524 36.9388 8.73356 35.2676 8.92878C36.9741 7.90708 38.2831 6.28628 38.8988 4.36442C37.3117 5.30514 35.5539 5.98064 33.6845 6.34757C32.1868 4.75017 30.0465 3.75342 27.6835 3.75342C23.1492 3.75342 19.4729 7.42971 19.4729 11.964C19.4729 12.6074 19.5456 13.2323 19.6865 13.8344C12.8624 13.4917 6.81604 10.2184 2.77583 5.30514C2.06821 6.51864 1.66289 7.93043 1.66289 9.42845C1.66289 12.278 3.11218 14.8021 5.31688 16.2753C3.9723 16.2325 2.70932 15.8631 1.59765 15.2464C1.59682 15.2804 1.59682 15.3149 1.59682 15.3499C1.59682 19.3248 4.42676 22.6468 8.18182 23.4002C7.49266 23.5872 6.76742 23.6873 6.0195 23.6873C5.4905 23.6873 4.97866 23.6358 4.4842 23.5411C5.52844 26.8005 8.55836 29.1724 12.1554 29.2384C9.34588 31.4385 5.80164 32.7508 1.95671 32.7508C1.29367 32.7508 0.640165 32.7119 0 32.6356C3.63391 34.9657 7.95101 36.321 12.6053 36.321C27.7314 36.321 36.0028 23.7915 36.0028 12.9238C36.0028 12.5676 35.9947 12.2139 35.979 11.8623C37.5855 10.7028 38.9839 9.27137 40 7.6433Z" fill="white"/>
                </svg>
              </a>
              <a href="#" className="w-[24px] h-[24px] 3xl:w-[32px] 3xl:h-[32px] flex items-center justify-center hover:scale-110 transition-transform bg-white rounded-full p-[4px] 3xl:p-[6px]">
                <svg className="3xl:w-[20px] 3xl:h-[20px]" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.1762 8.66347C18.7196 9.77064 20.6102 10.4221 22.6523 10.4221V6.47861C22.2658 6.47869 21.8803 6.43825 21.5023 6.35786V9.46193C19.4604 9.46193 17.57 8.81049 16.0262 7.7034V15.7509C16.0262 19.7766 12.7743 23.0399 8.76309 23.0399C7.26641 23.0399 5.87531 22.5858 4.71973 21.807C6.03864 23.1604 7.87796 24 9.91285 24C13.9243 24 17.1764 20.7367 17.1764 16.7108V8.66347H17.1762ZM18.5949 4.68499C17.8061 3.82023 17.2883 2.70267 17.1762 1.46717V0.959961H16.0864C16.3607 2.53028 17.2964 3.87187 18.5949 4.68499ZM7.25681 18.7178C6.81614 18.1379 6.578 17.4286 6.57907 16.6992C6.57907 14.858 8.06647 13.3651 9.90153 13.3651C10.2435 13.365 10.5835 13.4176 10.9094 13.5214V9.48977C10.5285 9.43739 10.1441 9.41515 9.75986 9.4233V12.5613C9.4337 12.4575 9.0936 12.4048 8.75152 12.4051C6.91646 12.4051 5.42914 13.8979 5.42914 15.7393C5.42914 17.0414 6.1726 18.1687 7.25681 18.7178Z" fill="#FF004F"/>
                  <path d="M16.0269 7.70332C17.5707 8.81041 19.4611 9.46185 21.503 9.46185V6.35778C20.3632 6.11414 19.3543 5.5164 18.5956 4.68499C17.2971 3.87179 16.3615 2.5302 16.0872 0.959961H13.2246V16.7106C13.2181 18.5468 11.7332 20.0336 9.90211 20.0336C8.82306 20.0336 7.86443 19.5174 7.25731 18.7178C6.17318 18.1687 5.42972 17.0413 5.42972 15.7394C5.42972 13.8981 6.91704 12.4052 8.7521 12.4052C9.10369 12.4052 9.44256 12.4602 9.76044 12.5614V9.42338C5.8197 9.50509 2.65039 12.7365 2.65039 16.7107C2.65039 18.6946 3.43962 20.4931 4.72055 21.8071C5.87614 22.5858 7.26724 23.04 8.76391 23.04C12.7752 23.04 16.027 19.7765 16.027 15.7509V7.70332H16.0269Z" fill="black"/>
                  <path d="M21.5025 6.3578V5.51848C20.4748 5.52005 19.4672 5.23119 18.5952 4.68493C19.3671 5.53306 20.3835 6.11787 21.5025 6.3578ZM16.0867 0.959983C16.0605 0.809911 16.0404 0.658851 16.0265 0.507214V0H12.074V15.7508C12.0677 17.5868 10.5829 19.0736 8.75164 19.0736C8.214 19.0736 7.70638 18.9455 7.25685 18.7179C7.86397 19.5174 8.82259 20.0336 9.90164 20.0336C11.7326 20.0336 13.2177 18.5469 13.2241 16.7107V0.959983H16.0867ZM9.76014 9.42341V8.52989C9.42988 8.48459 9.09691 8.46186 8.76353 8.46202C4.75192 8.46194 1.5 11.7254 1.5 15.7508C1.5 18.2745 2.77806 20.4987 4.72017 21.807C3.43924 20.493 2.65001 18.6944 2.65001 16.7106C2.65001 12.7365 5.81924 9.50511 9.76014 9.42341Z" fill="#00F2EA"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Language Selector & Buttons */}
          <div className="flex flex-col md:flex-row items-center gap-[16px] md:gap-[20px] 3xl:gap-[28px] mr-0 md:mr-[-10px] 3xl:mr-0 relative">
            
            {/* Language Selector */}
            <div className="relative">
              <div 
                className="flex items-center gap-[6px] 3xl:gap-[10px] cursor-pointer"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <span className="font-sans font-medium text-[16px] 3xl:text-[20px] text-white">
                  {language === 'fr' ? 'Français' : language === 'en' ? 'English' : 'العربية'}
                </span>
                <svg className={`3xl:w-[16px] 3xl:h-[10px] transition-transform ${isLangOpen ? 'rotate-180' : ''}`} width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 5.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {isLangOpen && (
                <div className="absolute right-0 bottom-[40px] 3xl:bottom-[48px] w-[240px] 3xl:w-[280px] bg-[#040028] border border-white/10 rounded-[8px] 3xl:rounded-[12px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.3)] py-[8px] 3xl:py-[12px] flex flex-col z-50">
                  <div 
                    className="flex flex-row items-center px-[16px] 3xl:px-[20px] h-[40px] 3xl:h-[48px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] 3xl:text-[18px] text-white">English</span>
                  </div>
                  <div 
                    className="flex flex-row items-center px-[16px] 3xl:px-[20px] h-[40px] 3xl:h-[48px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('fr'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] 3xl:text-[18px] text-white">Français</span>
                  </div>
                  <div 
                    className="flex flex-row items-center px-[16px] 3xl:px-[20px] h-[40px] 3xl:h-[48px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('ar'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] 3xl:text-[18px] text-white">العربية (Arab)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[24px] 3xl:h-[32px] w-[1px] bg-white/20 hidden md:block"></div>

            <button className="flex flex-row justify-center items-center px-[20px] md:px-[26px] 3xl:px-[32px] py-[5px] 3xl:py-[8px] w-auto min-w-[120px] md:min-w-[140px] 3xl:min-w-[180px] h-[36px] md:h-[40px] 3xl:h-[52px] bg-[#040028] border border-[#FFFFFF] rounded-[20px] 3xl:rounded-[26px] hover:bg-[#FFFFFF] text-[#FFFFFF] hover:text-[#040028] transition-colors">
              <span className="font-normal text-[14px] md:text-[16px] 3xl:text-[20px] leading-[19px] 3xl:leading-[24px] text-center whitespace-nowrap">
                {t('Sign In', 'Se connecter')}
              </span>
            </button>
            <button className="flex flex-row justify-center items-center px-[20px] md:px-[26px] 3xl:px-[32px] py-[5px] 3xl:py-[8px] w-auto min-w-[140px] md:min-w-[160px] 3xl:min-w-[200px] h-[36px] md:h-[40px] 3xl:h-[52px] bg-[#FFFFFF] border border-[#040028] rounded-[20px] 3xl:rounded-[26px] hover:bg-gray-200 text-[#040028] transition-colors">
              <span className="font-normal text-[14px] md:text-[16px] 3xl:text-[20px] leading-[19px] 3xl:leading-[24px] text-center whitespace-nowrap">
                {t('Contact Us', 'Nous contacter')}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 3xl:bottom-8 3xl:right-8 z-50 w-[44px] h-[44px] 3xl:w-[56px] 3xl:h-[56px] bg-white text-[#040028] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={t('Back to top', 'Retour en haut')}
        >
          <ArrowUp className="w-5 h-5 3xl:w-7 3xl:h-7" />
        </button>
      )}
    </footer>
  );
}
