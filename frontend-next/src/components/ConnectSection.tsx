"use client";
import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaTiktok,
  FaYoutube,
  FaStore,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext'; 

// --- FIX: Typed the icon to accept className ---
interface SocialLinkProps {
  name: string;
  icon: React.ReactElement<{ className?: string }>; 
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, icon, hoverColor }) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col items-center group">
      <a
        href="#"
        className="
          flex h-20 w-20 items-center justify-center 
          rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700
          shadow-md hover:shadow-xl
          transition-all duration-300 ease-in-out
          group-hover:-translate-y-2 group-hover:border-primary
        "
      >
        {/* The cloneElement will now work without error */}
        {React.cloneElement(icon, {
          className: `h-9 w-9 text-gray-700 dark:text-gray-300 transition-colors duration-300 ${hoverColor}`,
        })}
      </a>
      
      <p
        className="
          absolute -bottom-10 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
          opacity-0 transition-all duration-300 ease-in-out translate-y-2
          group-hover:opacity-100 group-hover:translate-y-0
        "
      >
        {t(`Connect ${name}`, `Connecter ${name}`)} &rarr;
      </p>
    </div>
  );
};

const ConnectSection = () => {
  const { t } = useLanguage();

  const socialIcons = [
    { id: 'facebook', name: 'Facebook', icon: <FaFacebookF />, hoverColor: 'group-hover:text-[#1877F2]' },
    { id: 'google', name: 'Google', icon: <FaStore />, hoverColor: 'group-hover:text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram />, hoverColor: 'group-hover:text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedinIn />, hoverColor: 'group-hover:text-[#0A66C2]' },
    { id: 'pinterest', name: 'Pinterest', icon: <FaPinterestP />, hoverColor: 'group-hover:text-[#E60023]' },
    { id: 'threads', name: 'Threads', icon: <SiThreads />, hoverColor: 'group-hover:text-black dark:group-hover:text-white' },
    { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, hoverColor: 'group-hover:text-black dark:group-hover:text-white' },
    { id: 'x', name: 'X', icon: <FaXTwitter />, hoverColor: 'group-hover:text-black dark:group-hover:text-white' },
    { id: 'youtube', name: 'YouTube', icon: <FaYoutube />, hoverColor: 'group-hover:text-[#FF0000]' },
  ];

  return (
    <section className="font-sans py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="
          flex flex-col items-center gap-12 rounded-3xl 
          bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800
          p-10 md:p-16 shadow-sm
        ">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">
            {t('Connect Your Social Accounts', 'Connectez vos comptes sociaux')}
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-12 pt-4">
            {socialIcons.map(({ id, name, icon, hoverColor }) => (
              <SocialLink key={id} name={name} icon={icon} hoverColor={hoverColor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;
