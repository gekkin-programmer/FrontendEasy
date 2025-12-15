"use client";

import React, { useState } from 'react';
import { FaCheck, FaInstagram, FaLinkedinIn, FaPaintBrush, FaStore } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext'; 

// --- TYPE DEFINITIONS ---
type CreatorData = {
  imgSrc: string;
  name: string;
  followers: string;
  platform: string;
  platformIcon: React.ReactNode;
  iconBgClass: string;
};

interface TabButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface ChecklistItemProps {
  children: React.ReactNode;
}

// --- LOCAL COMPONENTS ---
const TabButton: React.FC<TabButtonProps> = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200
      ${isActive
        ? 'bg-purple-100 text-primary border border-purple-300 shadow-sm'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }
    `}
  >
    {children}
  </button>
);

const ChecklistItem: React.FC<ChecklistItemProps> = ({ children }) => {
  const { t } = useLanguage();
  return (
    <li className="flex items-start gap-3">
      <div className="bg-purple-100 p-1 rounded-full mt-0.5">
        <FaCheck className="h-3 w-3 text-purple-600 flex-shrink-0" />
      </div>
      <span className="text-gray-700 leading-relaxed">{t(children as string, children as string)}</span>
    </li>
  );
};

const CreatorCard: React.FC<CreatorData> = ({ 
  imgSrc, name, followers, platform, platformIcon, iconBgClass 
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow h-full border border-white/50">
      <div className="relative mb-4">
        <img src={imgSrc} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
        <div 
          className={`
            absolute -bottom-1 -right-1 h-8 w-8 rounded-full 
            flex items-center justify-center text-white border-2 border-white shadow-sm
            ${iconBgClass}
          `}
        >
          {platformIcon}
        </div>
      </div>
      <p className="font-bold text-gray-900 text-base">{name}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-medium">
        {followers} {t(platform, platform)}
      </p>
    </div>
  );
};

// --- DATA (Using /assets/ path) ---
const creatorsData: CreatorData[] = [
  { imgSrc: '/assets/Rosine 3.jpg', name: '@rosine_ng', followers: '34.9K', platform: 'Followers on X', platformIcon: <FaXTwitter size={14}/>, iconBgClass: 'bg-black' },
  { imgSrc: '/assets/Profile pic.svg', name: '@Pauldelabaume', followers: '21K', platform: 'Followers on LinkedIn', platformIcon: <FaLinkedinIn size={14}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/assets/JDK.jpg', name: '@jdk_fashion', followers: '14.6K', platform: 'Followers on Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const businessesData: CreatorData[] = [
  { imgSrc: '/assets/PBD.jpg', name: 'PBD', followers: '8.2K', platform: 'Fans on Facebook', platformIcon: <FaStore size={14}/>, iconBgClass: 'bg-green-600' },
  { imgSrc: '/assets/meetormatch.jpg', name: 'MeetOrMatch', followers: '15.7K', platform: 'Followers on Pinterest', platformIcon: <FaPaintBrush size={14}/>, iconBgClass: 'bg-red-500' },
  { imgSrc: '/assets/logo.JFN.png', name: 'JFN High Tech', followers: '25.3K', platform: 'Followers on Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

// Note: Make sure you have these images or reuse existing ones for agencies
const agenciesData: CreatorData[] = [
  { imgSrc: '/assets/YungEra.jpg', name: 'Yung Era Agency', followers: '150+', platform: 'Instagram', platformIcon: <FaInstagram size={14}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
  { imgSrc: '/assets/VirtualKnit.jpg', name: 'Creative Labs', followers: '99K', platform: 'Followers on LinkedIn', platformIcon: <FaLinkedinIn size={14}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/assets/brutalism5.jpg', name: 'Pixel Perfect', followers: 'Top Rated', platform: 'on Dribbble', platformIcon: <FaPaintBrush size={14}/>, iconBgClass: 'bg-pink-500' },
];

// --- MAIN COMPONENT ---
const GrowSection = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Creators');

  // Tab definitions with translation keys
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
    <section className="bg-white dark:bg-gray-900 py-20 px-4 sm:px-8 font-sans border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto max-w-screen-xl">
        
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-16 flex-wrap">
          {tabs.map((tab) => (
            <TabButton 
              key={tab.key} 
              isActive={tab.label === activeTab} 
              onClick={() => setActiveTab(tab.label)}
            >
              {t(tab.key, tab.label)}
            </TabButton>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-8 lg:col-span-2 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              {t("Grow from zero → one → one million", "Grandir de zéro → un → un million")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t(
                "Whether you're just getting started on your creator journey or scaling your audience to new heights, Wiggle will get your content in front of more people.",
                "Que vous commenciez votre parcours de créateur ou que vous développiez votre audience, Wiggle fera connaître votre contenu à plus de personnes."
              )}
            </p>
            <ul className="space-y-4 mt-2 inline-block text-left mx-auto lg:mx-0">
              <ChecklistItem>{t("Save all your ideas as inspiration strikes", "Enregistrez toutes vos idées dès que l'inspiration frappe")}</ChecklistItem>
              <ChecklistItem>{t("Learn exactly what content work best and why", "Découvrez exactement quel contenu fonctionne le mieux et pourquoi")}</ChecklistItem>
              <ChecklistItem>{t("Create once, crosspost everywhere", "Créez une fois, publiez partout")}</ChecklistItem>
            </ul>
          </div>

          {/* Right cards */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-[2rem] p-8 lg:col-span-3 relative">
            <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 tracking-widest mb-8 uppercase text-center md:text-left">
              {t("THE WIGGLE", "LA COMMUNAUTÉ WIGGLE")} {t(activeTab.toLowerCase(), activeTab)} {t("COMMUNITY", "COMMUNAUTÉ")}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {currentData.map((creator) => (
                <CreatorCard key={creator.name} {...creator} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowSection;
