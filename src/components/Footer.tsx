"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <footer className="w-full bg-[#060830] rounded-t-[30px] md:rounded-t-[50px] pt-[40px] md:pt-[70px] pb-[30px] md:pb-[40px] relative font-sans overflow-hidden flex flex-col mt-[30px] md:mt-[50px]">
      <div className="w-full max-w-[1328px] mx-auto px-4 lg:px-0 flex flex-col justify-between h-full min-h-[400px] md:min-h-[655px]">
        
        {/* Top Grid: Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-[90px]">
          
          {/* Fonctionnalités */}
          <div className="flex flex-col gap-[20px] md:gap-[34px]">
            <h3 className="font-sans font-semibold text-[20px] md:text-[28px] lg:text-[36px] leading-tight text-[#024AFF]">
              {t('Features', 'Fonctionnalités')}
            </h3>
            <div className="flex flex-col gap-[10px] md:gap-[15px]">
              {['Publier', 'Créer', 'Collaborer', 'Planifier'].map(item => (
                <Link key={item} href="#" className="font-sans font-medium text-[16px] md:text-[24px] lg:text-[32px] leading-tight text-white hover:text-gray-300 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Canaux */}
          <div className="flex flex-col gap-[20px] md:gap-[34px]">
            <h3 className="font-sans font-semibold text-[20px] md:text-[28px] lg:text-[36px] leading-tight text-[#024AFF]">
              {t('Channels', 'Canaux')}
            </h3>
            <div className="flex flex-col gap-[10px] md:gap-[15px]">
              {['Facebook', 'Tiktok', 'Instagram', 'Snapchat', 'Youtube', 'Télégram', 'Whatsapp', 'Pinterest', 'Twitter'].map(item => (
                <Link key={item} href="#" className="font-sans font-normal text-[16px] md:text-[24px] lg:text-[32px] leading-tight text-white hover:text-gray-300 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Pour qui */}
          <div className="flex flex-col gap-[20px] md:gap-[34px]">
            <h3 className="font-sans font-semibold text-[20px] md:text-[28px] lg:text-[36px] leading-tight text-[#024AFF]">
              {t('For who', 'Pour qui')}
            </h3>
            <div className="flex flex-col gap-[10px] md:gap-[15px]">
              {['Influenceur', 'Créateur de contenu', 'PME', 'Agences', 'Organisation', 'Institutions'].map(item => (
                <Link key={item} href="#" className="font-sans font-normal text-[16px] md:text-[24px] lg:text-[32px] leading-tight text-white hover:text-gray-300 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Ressources */}
          <div className="flex flex-col gap-[20px] md:gap-[34px]">
            <h3 className="font-sans font-semibold text-[20px] md:text-[28px] lg:text-[36px] leading-tight text-[#024AFF]">
              {t('Resources', 'Ressources')}
            </h3>
            <div className="flex flex-col gap-[10px] md:gap-[15px]">
              {['Blog', 'Communauté', 'Centre d\'aide', 'Contact'].map(item => (
                <Link key={item} href="#" className="font-sans font-normal text-[16px] md:text-[24px] lg:text-[32px] leading-tight text-white hover:text-gray-300 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* A propos */}
          <div className="flex flex-col gap-[20px] md:gap-[34px]">
            <h3 className="font-sans font-semibold text-[20px] md:text-[28px] lg:text-[36px] leading-tight text-[#024AFF]">
              {t('About', 'A propos')}
            </h3>
            <div className="flex flex-col gap-[10px] md:gap-[15px]">
              {['Equipe', 'Entreprise'].map(item => (
                <Link key={item} href="#" className="font-sans font-normal text-[16px] md:text-[24px] lg:text-[32px] leading-tight text-white hover:text-gray-300 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Area: Logo & Socials */}
        <div className="w-full flex flex-col md:flex-row justify-between items-end mt-20">
          
          {/* Logo */}
          <div className="flex items-end pl-2">
            <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] lg:w-[85px] lg:h-[85px] bg-no-repeat bg-contain bg-center" style={{ backgroundImage: "url('/assets/WiggleLogo.png')" }}></div>
            <span className="font-['Rubik_One'] font-normal text-[40px] md:text-[52px] lg:text-[64px] leading-tight text-white ml-[-6px] md:ml-[-8px] lg:ml-[-10px] pb-1">
              azypost
            </span>
          </div>

          {/* Right Side: Language & Socials */}
          <div className="flex flex-col items-end gap-[30px] pb-4 pr-2">
            
            {/* Language Toggler */}
            <div className="relative">
              <div 
                className="flex items-center gap-[8px] cursor-pointer transition-colors text-white hover:text-gray-300"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <Globe size={24} className="w-[24px] h-[24px]" />
                <span className="text-[18px] uppercase font-bold">{language}</span>
              </div>

              {isLangOpen && (
                <div className="absolute right-0 bottom-[40px] w-[240px] bg-[#040028] border border-white/10 rounded-[8px] shadow-2xl py-[8px] flex flex-col z-50">
                  <div 
                    className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] text-white">English</span>
                  </div>
                  <div 
                    className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('fr'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] text-white">Français</span>
                  </div>
                  <div 
                    className="flex flex-row items-center px-[16px] h-[40px] cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setLanguage('ar'); setIsLangOpen(false); }}
                  >
                    <span className="font-['Rubik'] font-medium text-[14px] text-white">العربية (Arab)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-[25px]">
              <a href="#" className="w-[40px] h-[40px] flex items-center justify-center hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 29.986 7.32047 38.2573 16.875 39.7554V25.7812H11.7969V20H16.875V15.5859C16.875 10.5844 19.8516 7.8125 24.4172 7.8125C26.6047 7.8125 28.8828 8.20312 28.8828 8.20312V13.125H26.3656C23.8875 13.125 23.125 14.6641 23.125 16.2422V20H28.6719L27.7852 25.7812H23.125V39.7554C32.6795 38.2573 40 29.986 40 20Z" fill="white"/>
                </svg>
              </a>
              <a href="#" className="w-[40px] h-[40px] flex items-center justify-center hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 3.63664C25.2933 3.63664 25.9202 3.65651 28.0267 3.75338C30.01 3.84439 31.0968 4.18182 31.819 4.46279C32.7766 4.83446 33.4578 5.27506 34.1754 5.99266C34.893 6.71026 35.3336 7.39145 35.7053 8.349C35.9862 9.07129 36.3237 10.1581 36.4147 12.1413C36.5115 14.2478 36.5314 14.8748 36.5314 20.008C36.5314 25.1413 36.5115 25.7682 36.4147 27.8748C36.3237 29.858 35.9862 30.9448 35.7053 31.6671C35.3336 32.6246 34.893 33.3058 34.1754 34.0234C33.4578 34.741 32.7766 35.1816 31.819 35.5533C31.0968 35.8343 30.01 36.1717 28.0267 36.2627C25.9202 36.3596 25.2933 36.3794 20 36.3794C14.7067 36.3794 14.0798 36.3596 11.9733 36.2627C9.99 36.1717 8.90317 35.8343 8.18096 35.5533C7.22341 35.1816 6.54222 34.741 5.82462 34.0234C5.10702 33.3058 4.66642 32.6246 4.29475 31.6671C4.01378 30.9448 3.67635 29.858 3.58534 27.8748C3.48847 25.7682 3.4686 25.1413 3.4686 20.008C3.4686 14.8748 3.48847 14.2478 3.58534 12.1413C3.67635 10.1581 4.01378 9.07129 4.29475 8.349C4.66642 7.39145 5.10702 6.71026 5.82462 5.99266C6.54222 5.27506 7.22341 4.83446 8.18096 4.46279C8.90317 4.18182 9.99 3.84439 11.9733 3.75338C14.0798 3.65651 14.7067 3.63664 20 3.63664ZM20 0C14.57 0 13.8893 0.0231557 11.7214 0.122197C9.55839 0.221238 8.08183 0.56455 6.78652 1.06913C5.44857 1.58985 4.31688 2.27898 3.18738 3.40848C2.05788 4.53798 1.36875 5.66967 0.848031 7.00762C0.34345 8.30293 0.000138407 9.77949 0 11.9425C0 14.1104 0 14.7911 0 20.2211C0 25.6511 0.0231557 26.3318 0.122197 28.4997C0.221238 30.6627 0.56455 32.1393 1.06913 33.4346C1.58985 34.7725 2.27898 35.9042 3.40848 37.0337C4.53798 38.1632 5.66967 38.8523 7.00762 39.373C8.30293 39.8776 9.77949 40.2209 11.9425 40.32C14.1104 40.4214 14.7911 40.4423 20.2211 40.4423C25.6511 40.4423 26.3318 40.4191 28.4997 40.3201C30.6627 40.221 32.1393 39.8777 33.4346 39.3731C34.7725 38.8524 35.9042 38.1633 37.0337 37.0338C38.1632 35.9043 38.8523 34.7726 39.373 33.4346C39.8776 32.1393 40.2209 30.6628 40.32 28.4997C40.4214 26.3318 40.4423 25.6511 40.4423 20.2211C40.4423 14.7911 40.4191 14.1104 40.3201 11.9425C40.221 9.77949 39.8777 8.30293 39.3731 7.00762C38.8524 5.66967 38.1633 4.53798 37.0338 3.40848C35.9043 2.27898 34.7726 1.58985 33.4346 1.06913C32.1393 0.56455 30.6628 0.221238 28.4997 0.122197C26.3318 0.0231557 25.6511 0 20.2211 0H20ZM20 9.80004C14.3666 9.80004 9.80004 14.3666 9.80004 20C9.80004 25.6334 14.3666 30.2 20 30.2C25.6334 30.2 30.2 25.6334 30.2 20C30.2 14.3666 25.6334 9.80004 20 9.80004ZM20 26.5651C16.3756 26.5651 13.4349 23.6244 13.4349 20C13.4349 16.3756 16.3756 13.4349 20 13.4349C23.6244 13.4349 26.5651 16.3756 26.5651 20C26.5651 23.6244 23.6244 26.5651 20 26.5651ZM33.2753 9.42699C33.2753 10.7533 32.2001 11.8285 30.8738 11.8285C29.5475 11.8285 28.4723 10.7533 28.4723 9.42699C28.4723 8.10068 29.5475 7.02549 30.8738 7.02549C32.2001 7.02549 33.2753 8.10068 33.2753 9.42699Z" fill="white"/>
                </svg>
              </a>
              <a href="#" className="w-[40px] h-[40px] flex items-center justify-center hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 7.6433C38.5284 8.29524 36.9388 8.73356 35.2676 8.92878C36.9741 7.90708 38.2831 6.28628 38.8988 4.36442C37.3117 5.30514 35.5539 5.98064 33.6845 6.34757C32.1868 4.75017 30.0465 3.75342 27.6835 3.75342C23.1492 3.75342 19.4729 7.42971 19.4729 11.964C19.4729 12.6074 19.5456 13.2323 19.6865 13.8344C12.8624 13.4917 6.81604 10.2184 2.77583 5.30514C2.06821 6.51864 1.66289 7.93043 1.66289 9.42845C1.66289 12.278 3.11218 14.8021 5.31688 16.2753C3.9723 16.2325 2.70932 15.8631 1.59765 15.2464C1.59682 15.2804 1.59682 15.3149 1.59682 15.3499C1.59682 19.3248 4.42676 22.6468 8.18182 23.4002C7.49266 23.5872 6.76742 23.6873 6.0195 23.6873C5.4905 23.6873 4.97866 23.6358 4.4842 23.5411C5.52844 26.8005 8.55836 29.1724 12.1554 29.2384C9.34588 31.4385 5.80164 32.7508 1.95671 32.7508C1.29367 32.7508 0.640165 32.7119 0 32.6356C3.63391 34.9657 7.95101 36.321 12.6053 36.321C27.7314 36.321 36.0028 23.7915 36.0028 12.9238C36.0028 12.5676 35.9947 12.2139 35.979 11.8623C37.5855 10.7028 38.9839 9.27137 40 7.6433Z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}

