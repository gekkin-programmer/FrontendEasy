"use client";

import React, { useState } from 'react';
import { FaCheck, FaInstagram, FaLinkedinIn, FaPaintBrush, FaStore } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext'; 
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
  { imgSrc: '/assets/PBD.jpg', name: 'PBD', followers: '8.2K', platform: 'Facebook', platformIcon: <FaStore size={14}/>, iconBgClass: 'bg-green-600' },
  { imgSrc: '/assets/meetormatch.jpg', name: 'MeetOrMatch', followers: '15.7K', platform: 'Pinterest', platformIcon: <FaPaintBrush size={14}/>, iconBgClass: 'bg-red-500' },
  { imgSrc: '/assets/logo.JFN.png', name: 'JFN High Tech', followers: '25.3K', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const agenciesData: CreatorData[] = [
  { imgSrc: '/assets/YungEra.jpg', name: 'Yung Era', followers: '150+', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
  { imgSrc: '/assets/VirtualKnit.jpg', name: 'Creative Labs', followers: '99K', platform: 'LinkedIn', platformIcon: <FaLinkedinIn size={14}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/assets/brutalism5.jpg', name: 'Pixel Perfect', followers: 'Top Rated', platform: 'Dribbble', platformIcon: <FaPaintBrush size={14}/>, iconBgClass: 'bg-pink-500' },
];

// --- COMPONENTS ---

const FolderTab = ({ children, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3 font-black text-sm uppercase tracking-widest border-t-4 border-l-4 border-r-4 border-black transition-all -mb-1 z-10
      ${isActive 
        ? 'bg-yellow-300 text-black h-14 translate-y-0' 
        : 'bg-gray-200 text-gray-500 h-12 translate-y-2 hover:bg-gray-100'
      }
    `}
  >
    {children}
  </button>
);

const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-4 p-2 hover:bg-yellow-100 transition-colors border-2 border-transparent hover:border-black cursor-default">
    <div className="bg-black text-white p-1 border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_#000]">
      <FaCheck className="h-3 w-3" />
    </div>
    <span className="text-black font-bold text-lg leading-tight">{children}</span>
  </li>
);

const CreatorCard = ({ imgSrc, name, followers, platform, platformIcon, iconBgClass }: CreatorData) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white border-4 border-black p-4 flex flex-col items-center text-center shadow-[8px_8px_0px_0px_#000] relative group hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300"
    >
      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/80 rotate-2 border-l border-r border-white/50"></div>

      <div className="relative mb-4">
        <img src={imgSrc} alt={name} className="w-24 h-24 border-4 border-black object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
        <div className={`absolute -bottom-3 -right-3 h-10 w-10 border-4 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000] ${iconBgClass}`}>
          {platformIcon}
        </div>
      </div>
      <p className="font-black text-black text-xl uppercase tracking-tight mt-2">{name}</p>
      
      <div className="mt-3 w-full bg-black text-white py-1 px-2 font-mono text-xs flex justify-between">
        <span>{platform}</span>
        <span className="text-yellow-300">{followers}</span>
      </div>
    </motion.div>
  );
};

const GrowSection = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Creators');

  const tabs = [
    { key: 'creators', label: 'Creators' },
    { key: 'smallBusinesses', label: 'Small businesses' },
    { key: 'agencies', label: 'Agencies' },
  ];

  const tabContent: { [key: string]: CreatorData[] } = {
    'Creators': creatorsData,
    'Small businesses': businessesData,
    'Agencies': agenciesData,
  };

  const currentData = tabContent[activeTab] || [];

  return (
    <section className="bg-[#E6E6E6] dark:bg-black/90 border-b-4 border-black dark:border-white/5 py-24 px-4 font-sans overflow-hidden pattern-grid">
      <style jsx>{`
        .pattern-grid {
          background-image: radial-gradient(#000 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="container mx-auto max-w-7xl">
        
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left content (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8 text-left bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">
            <h2 className="text-5xl md:text-7xl font-black text-black leading-[0.85] tracking-tighter uppercase">
              {t("ZERO TO", "DE ZERO A")}<br/>
              <span className="text-[#3C48F6] underline decoration-4 underline-offset-4 decoration-black">ONE MILLION.</span>
            </h2>
            
            <p className="text-xl font-bold text-gray-800 leading-snug">
              {t(
                "Whether you're just getting started or scaling to new heights, Wiggle gets your content in front of more people.",
                "Que vous commenciez ou que vous passiez à la vitesse supérieure, Wiggle propulse votre contenu."
              )}
            </p>
            
            <ul className="space-y-2 mt-4">
              <ChecklistItem>{t("Save ideas instantly", "Sauvegardez instantanément")}</ChecklistItem>
              <ChecklistItem>{t("Learn what works best", "Apprenez ce qui marche")}</ChecklistItem>
              <ChecklistItem>{t("Create once, post everywhere", "Créez une fois, publiez partout")}</ChecklistItem>
            </ul>
          </div>

          {/* Right cards (8 cols) */}
          <div className="lg:col-span-7">
            {/* Folder Tabs */}
            <div className="flex items-end pl-4 border-b-4 border-black">
                {tabs.map((tab) => (
                    <FolderTab 
                    key={tab.key} 
                    isActive={tab.label === activeTab} 
                    onClick={() => setActiveTab(tab.label)}
                    >
                    {t(tab.key, tab.label)}
                    </FolderTab>
                ))}
            </div>

            {/* The Folder Content */}
            <div className="bg-yellow-300 border-4 border-t-0 border-black dark:border-white/5 p-8 min-h-[400px] shadow-[12px_12px_0px_0px_#000]">
                <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                    <h3 className="font-black text-2xl text-black uppercase">COMMUNITY_SHOWCASE.EXE</h3>
                    <div className="flex gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                        <div className="w-4 h-4 bg-black border-2 border-black rounded-full"></div>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <AnimatePresence mode='wait'>
                        {currentData.map((creator) => (
                            <CreatorCard key={creator.name} {...creator} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GrowSection;
