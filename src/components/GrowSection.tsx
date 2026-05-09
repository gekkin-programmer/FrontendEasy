"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCheck, FaInstagram, FaLinkedinIn, FaFacebookF, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
type CreatorData = {
  imgSrc: string;
  name: string;
  followers: string;
  platform: string;
  platformIcon: React.ReactNode;
  iconBgClass: string;
};

// --- DATA ---
const creatorsData: CreatorData[] = [
  { imgSrc: '/assets/Rosine 3.jpg', name: '@rosine_ng', followers: '34.9K', platform: 'X', platformIcon: <FaXTwitter size={14}/>, iconBgClass: 'bg-black' },
  { imgSrc: '/assets/brutalism5.jpg', name: '@YungKids', followers: '21K', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/assets/JDK.jpg', name: '@jdk_fashion', followers: '14.6K', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const businessesData: CreatorData[] = [
  { imgSrc: '/assets/PBD.jpg', name: 'PBD', followers: '8.2K', platform: 'Facebook', platformIcon: <FaFacebookF size={14}/>, iconBgClass: 'bg-[#1877F2]' },
  { imgSrc: '/assets/meetormatch.jpg', name: 'MeetOrMatch', followers: '15.7K', platform: 'Pinterest', platformIcon: <FaPinterestP size={14}/>, iconBgClass: 'bg-[#E60023]' },
  { imgSrc: '/logos/BestCorp.png', name: 'Bestcorp', followers: '12.1K', platform: 'YouTube', platformIcon: <FaYoutube size={14}/>, iconBgClass: 'bg-[#FF0000]' },
  { imgSrc: '/assets/logo.JFN.png', name: 'JFN High Tech', followers: '25.3K', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const agenciesData: CreatorData[] = [
  { imgSrc: '/assets/YungEra.jpg', name: 'Yung Era', followers: '150+', platform: 'TikTok', platformIcon: <FaTiktok size={14}/>, iconBgClass: 'bg-black' },
  { imgSrc: '/assets/VirtualKnit.jpg', name: 'Creative Labs', followers: '99K', platform: 'LinkedIn', platformIcon: <FaLinkedinIn size={14}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/assets/brutalism5.jpg', name: 'Pixel Perfect', followers: 'Top Rated', platform: 'Threads', platformIcon: <SiThreads size={14}/>, iconBgClass: 'bg-black' },
];

// --- COMPONENTS ---

const FolderTab = ({ children, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`
      relative px-3 md:px-6 py-2 md:py-3 font-black text-[10px] md:text-sm uppercase tracking-wider border-t-4 border-l-4 border-r-4 border-black transition-all -mb-1 z-10 whitespace-nowrap flex-shrink-0
      ${isActive 
        ? 'bg-[#3C48F5] text-white h-10 md:h-14 translate-y-0'
        : 'bg-gray-200 text-black h-8 md:h-12 translate-y-2 hover:bg-gray-100'
      }
    `}
  >
    {children}
  </button>
);

const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 md:gap-4 p-2 rounded-full hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-black cursor-default">
    <div className="bg-black text-white p-1 border-2 border-black flex-shrink-0 rounded-full shadow-[2px_2px_0px_0px_#000]">
      <FaCheck className="h-2.5 w-2.5 md:h-3 md:w-3" />
    </div>
    <span className="text-black dark:text-white font-bold text-sm md:text-lg leading-tight">{children}</span>
  </li>
);

const CreatorCard = ({ imgSrc, name, followers, platform, platformIcon, iconBgClass }: CreatorData) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white border-4 border-black dark:border-white p-3 md:p-4 flex flex-col items-center text-center shadow-[6px_6px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] relative group hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_#000] transition-all duration-300"
    >
      {/* Tape Effect */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 md:w-16 h-4 md:h-6 bg-blue-200/80 rotate-2 border-l border-r border-white/50"></div>

      <div className="relative mb-3 md:mb-4 w-20 h-20 md:w-24 md:h-24 mt-2">
        <div className="w-full h-full border-4 border-black overflow-hidden relative">
            <Image 
                src={imgSrc} 
                alt={name} 
                fill
                className="object-cover group-hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 100px, 150px"
            />
        </div>
        <div className={`absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 h-8 w-8 md:h-10 md:w-10 border-4 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000] ${iconBgClass}`}>
          {platformIcon}
        </div>
      </div>
      <p className="font-black text-black text-base md:text-xl uppercase tracking-tight mt-1 truncate w-full">{name}</p>
      
      <div className="mt-2 md:mt-3 w-full bg-black text-white py-1 px-2 font-mono text-[10px] md:text-xs flex justify-between">
        <span className="truncate max-w-[60%]">{platform}</span>
        <span className="text-white">{followers}</span>
      </div>
    </motion.div>
  );
};

const GrowSection = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Creators');

  const tabs = [
    { key: 'Creators', en: 'Creators', fr: 'Créateurs' },
    { key: 'Small businesses', en: 'Small businesses', fr: 'Petites entreprises' },
    { key: 'Agencies', en: 'Agencies', fr: 'Agences' },
  ];

  const tabContent: { [key: string]: CreatorData[] } = {
    'Creators': creatorsData,
    'Small businesses': businessesData,
    'Agencies': agenciesData,
  };

  const currentData = tabContent[activeTab] || [];

  return (
    <section 
      className="bg-white dark:bg-black border-b-4 border-black dark:border-black py-12 md:py-24 px-4 font-sans overflow-hidden pattern-grid relative"
      aria-label="Growth Success Stories"
    >
      <SectionBackground />
      <style jsx>{`
        .pattern-grid {
          background-image: radial-gradient(#000 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="container mx-auto max-w-7xl relative z-10 px-0 md:px-4">
        
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left content (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 text-left bg-white dark:bg-black border-4 border-black dark:border-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] md:shadow-[12px_12px_0px_0px_#000] md:dark:shadow-[12px_12px_0px_0px_#fff]">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-black dark:text-white leading-[0.9] tracking-tighter uppercase">
              {t("ZERO TO", "DE ZÉRO À")}<br/>
              <span className="text-[#3C48F6]">{t("ONE MILLION.", "UN MILLION.")}</span>
            </h2>
            
            <p className="text-base md:text-xl font-bold text-gray-800 dark:text-white leading-snug">
              {t(
                "Whether you're just getting started or scaling to new heights, EasyPost gets your content in front of more people.",
                "Que vous commenciez ou que vous passiez à la vitesse supérieure, EasyPost propulse votre contenu."
              )}
            </p>
            
            <ul className="space-y-2 mt-2 md:mt-4">
              <ChecklistItem>{t("Save ideas instantly", "Sauvegardez instantanément")}</ChecklistItem>
              <ChecklistItem>{t("Learn what works best", "Apprenez ce qui marche")}</ChecklistItem>
              <ChecklistItem>{t("Create once, post everywhere", "Créez une fois, publiez partout")}</ChecklistItem>
            </ul>
          </div>

          {/* Right cards (8 cols) */}
          <div className="lg:col-span-7 w-full overflow-hidden rounded-xl">
            {/* Folder Tabs (Horizontal Scroll for Mobile) */}
            <div className="flex items-end pl-2 md:pl-4 border-b-4 border-black overflow-x-auto scrollbar-hide w-full pb-[2px]">
                <div className="flex space-x-1 md:space-x-0 min-w-max">
                    {tabs.map((tab) => (
                        <FolderTab
                            key={tab.key}
                            isActive={tab.key === activeTab}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {t(tab.en, tab.fr)}
                        </FolderTab>
                    ))}
                </div>
            </div>

            {/* The Folder Content */}
            <div className="bg-[#3C48F5] border-4 border-t-0 border-black dark:border-white p-4 md:p-8 min-h-[300px] md:min-h-[400px] shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000]">
                <div className="flex justify-between items-center mb-4 md:mb-8 border-b-2 border-black pb-4">
                    <h3 className="font-black text-lg md:text-2xl text-white uppercase truncate">COMMUNITY.EXE</h3>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-white border-2 border-black rounded-full"></div>
                        <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-black border-2 border-black rounded-full"></div>
                    </div>
                </div>
                
                <motion.div 
                    layout 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {currentData.map((creator) => (
                            <CreatorCard key={creator.name} {...creator} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GrowSection;
