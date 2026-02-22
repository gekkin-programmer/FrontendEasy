"use client";
import React from 'react';
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaYoutube, FaStore, FaGoogle
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext'; 

interface SocialLinkProps {
  name: string;
  icon: React.ReactElement<{ className?: string }>; 
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, icon, hoverColor }) => {
  return (
    <div className="relative group flex flex-col items-center">
      <a
        href="#"
        className="
          flex h-16 w-16 md:h-20 md:w-20 items-center justify-center 
          bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]
          hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200
        "
        aria-label={name}
      >
        {React.cloneElement(icon, {
          className: `h-6 w-6 md:h-8 md:w-8 text-black transition-colors duration-300 ${hoverColor}`,
        })}
      </a>
      
      {/* Tooltip (Desktop Only) */}
      <div className="hidden md:block absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-[10px] font-bold py-1 px-2 uppercase tracking-wider whitespace-nowrap z-10 pointer-events-none">
        {name}
      </div>
    </div>
  );
};

const ConnectSection = () => {
  const { t } = useLanguage();

  const socialIcons = [
    { id: 'facebook', name: 'Facebook x EazyPost', icon: <FaFacebookF />, hoverColor: 'group-hover:text-[#1877F2]' },
    { id: 'instagram', name: 'Instagram x EazyPost', icon: <FaInstagram />, hoverColor: 'group-hover:text-[#E1306C]' },
    { id: 'x', name: 'X (Twitter) x EazyPost', icon: <FaXTwitter />, hoverColor: 'group-hover:text-gray-600' },
    { id: 'linkedin', name: 'LinkedIn x EazyPost', icon: <FaLinkedinIn />, hoverColor: 'group-hover:text-[#0A66C2]' },
    { id: 'tiktok', name: 'TikTok x EazyPost', icon: <FaTiktok />, hoverColor: 'group-hover:text-black' },
    { id: 'youtube', name: 'YouTube x EazyPost', icon: <FaYoutube />, hoverColor: 'group-hover:text-[#FF0000]' },
    { id: 'threads', name: 'Threads x EazyPost', icon: <SiThreads />, hoverColor: 'group-hover:text-black' },
    { id: 'pinterest', name: 'Pinterest x EazyPost', icon: <FaPinterestP />, hoverColor: 'group-hover:text-[#E60023]' },
    { id: 'google', name: 'Google x EazyPost', icon: <FaGoogle />, hoverColor: 'group-hover:text-blue-500' },
  ];

  return (
    <section 
      className="bg-gray-50 dark:bg-black/90 border-b-4 border-black dark:border-white/5 py-16 md:py-20 px-4 font-sans relative overflow-hidden"
      aria-label="Integrations"
    >
      
      {/* Decorative Bars */}
      <div className="absolute top-0 left-0 w-full h-2 md:h-4 bg-black pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 md:h-4 bg-black pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl text-center">
        
        <div className="inline-block bg-black dark:bg-white/10 text-white font-black text-sm md:text-lg px-4 py-1 md:px-6 md:py-2 border-4 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] mb-6 md:mb-8 uppercase tracking-widest">
            {t("Integrations", "Intégrations")}
        </div>

        <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-black dark:text-white mb-10 md:mb-16 uppercase leading-none tracking-tight">
          {t('CONNECT YOUR', 'CONNECTEZ VOS')}<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3C48F6] to-[#3D49F9]">
             SOCIAL MEDIA.
          </span>
        </h3>
        
        {/* Responsive Grid: 3 cols mobile, 4 cols tablet, 6+ cols desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-6 md:gap-8 justify-items-center">
          {socialIcons.map((props) => (
            <SocialLink key={props.id} {...props} />
          ))}
        </div>

        <div className="mt-12 md:mt-16">
            <p className="text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest">
                & {t("more coming soon", "plus à venir")}
            </p>
        </div>

      </div>
    </section>
  );
};

export default ConnectSection;
