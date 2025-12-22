import React, { useState } from 'react';
import Rosine from '../assets/Rosine 3.jpg';
import ProfilePic from '../assets/Profile pic.svg';
import JDK from '../assets/JDK.jpg';
import PBD from '../assets/PBD.jpg';
import MeetOrMatch from '../assets/meetormatch.jpg';
import JFN from '../assets/logo.JFN.png'; 
import { FaCheck, FaInstagram, FaLinkedinIn, FaPaintBrush, FaStore, FaBullhorn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext'; // adjust path if needed

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
      rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200
      ${isActive
        ? 'bg-purple-100 text-[#3C48F6] border border-purple-300'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
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
      <FaCheck className="h-5 w-5 mt-1 text-purple-600 flex-shrink-0" />
      <span className="text-gray-700">{t(children as string, children as string)}</span>
    </li>
  );
};


const CreatorCard: React.FC<CreatorData> = ({ 
  imgSrc, name, followers, platform, platformIcon, iconBgClass 
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white/60 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm h-full">
      <div className="relative mb-4">
        <img src={imgSrc} alt={name} className="w-28 h-28 rounded-full object-cover" />
        <div 
          className={`
            absolute -bottom-1 -right-1 h-9 w-9 rounded-full 
            flex items-center justify-center text-white border-2 border-white
            ${iconBgClass}
          `}
        >
          {platformIcon}
        </div>
      </div>
      <p className="font-bold text-gray-800 text-lg">{name}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
        {followers} {t(platform, platform)}
      </p>
    </div>
  );
};

// --- MOCK DATA ---
const creatorsData: CreatorData[] = [
  { imgSrc: Rosine, name: '@rosine_ng', followers: '34.9K', platform: 'Followers on X', platformIcon: <FaXTwitter size={16}/>, iconBgClass: 'bg-black' },
  { imgSrc: ProfilePic, name: '@Pauldelabaume', followers: '21K', platform: 'Followers on LinkedIn', platformIcon: <FaLinkedinIn size={16}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: JDK, name: '@jdk_fashion', followers: '14.6K', platform: 'Followers on Instagram', platformIcon: <FaInstagram size={16}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const businessesData: CreatorData[] = [
  { imgSrc: PBD, name: 'PBD', followers: '8.2K', platform: 'Fans on Facebook', platformIcon: <FaStore size={16}/>, iconBgClass: 'bg-green-600' },
  { imgSrc: MeetOrMatch, name: 'MeetOrMatch', followers: '15.7K', platform: 'Followers on Pinterest', platformIcon: <FaPaintBrush size={16}/>, iconBgClass: 'bg-red-500' },
  { imgSrc: JFN, name: 'JFN High Tech University', followers: '25.3K', platform: 'Followers on Instagram', platformIcon: <FaInstagram size={16}/>, iconBgClass: 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600' },
];

const agenciesData: CreatorData[] = [
  { imgSrc: '/agency1.jpg', name: 'Yung Era Agency', followers: '150+', platform: 'Instagram', platformIcon: <FaInstagram size={16}/>, iconBgClass: 'bg-gradient-to-br from yellow-400 via red-500 to purple-600' },
  { imgSrc: '/agency2.jpg', name: 'Creative Labs', followers: '99K', platform: 'Followers on LinkedIn', platformIcon: <FaLinkedinIn size={16}/>, iconBgClass: 'bg-[#0A66C2]' },
  { imgSrc: '/agency3.jpg', name: 'Pixel Perfect', followers: 'Top Rated', platform: 'on Dribbble', platformIcon: <FaPaintBrush size={16}/>, iconBgClass: 'bg-pink-500' },
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
    <section className="bg-[#FDFDFC] py-20 px-4 sm:px-8 font-sans">
      <div className="container mx-auto max-w-screen-xl">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-12">
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
          <div className="flex flex-col gap-6 lg:col-span-2">
            <h2 className="text-5xl font-bold text-gray-800 leading-tight">
              {t("Grow from zero → one → one million", "Grandir de zéro → un → un million")}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t(
                "Whether you're just getting started on your creator journey or scaling your audience to new heights, Buffer will get your content in front of more people.",
                "Que vous commenciez votre parcours de créateur ou que vous développiez votre audience, Buffer fera connaître votre contenu à plus de personnes."
              )}
            </p>
            <ul className="space-y-4 mt-4">
              <ChecklistItem>{t("Save all your ideas as inspiration strikes", "Enregistrez toutes vos idées dès que l'inspiration frappe")}</ChecklistItem>
              <ChecklistItem>{t("Learn exactly what content work best and why", "Découvrez exactement quel contenu fonctionne le mieux et pourquoi")}</ChecklistItem>
              <ChecklistItem>{t("Create once, crosspost everywhere", "Créez une fois, publiez partout")}</ChecklistItem>
            </ul>
          </div>

          {/* Right cards */}
          <div className="bg-[#f3e8ff] border border-purple-200/80 rounded-3xl p-8 lg:col-span-3">


            <h3 className="text-sm font-semibold text-purple-800/90 tracking-widest mb-6">
              {t("THE BUFFER", "LA COMMUNAUTÉ BUFFER")} {t(activeTab.toLowerCase(), activeTab)} {t("COMMUNITY", "COMMUNAUTÉ")}

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
