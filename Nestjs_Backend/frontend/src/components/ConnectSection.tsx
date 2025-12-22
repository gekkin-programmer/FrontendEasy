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
import { useLanguage } from '../context/LanguageContext'; // adjust path

interface SocialLinkProps {
  name: string;
  icon: React.ReactElement;
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
          rounded-xl border border-gray-400/80 bg-white
          shadow-lg
          transition-all duration-300 ease-in-out
          group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-gray-800
        "
      >
        {React.cloneElement(icon, {
          className: `h-10 w-10 text-gray-800 transition-colors duration-300 ${hoverColor}`,
        })}
      </a>
      <p
        className="
          absolute -bottom-8 whitespace-nowrap text-sm font-medium text-gray-600
          opacity-0 transition-all duration-300 ease-in-out
          group-hover:opacity-100
        "
      >

        {t(`Connect with ${name}`, `Connectez-vous à ${name}`)} &rarr;
      </p>
    </div>
  );
};

const ConnectSection = () => {
  const socialIcons = [
    { id: 'facebook', name: 'Facebook', icon: <FaFacebookF />, hoverColor: 'group-hover:text-[#1877F2]' },
    { id: 'google', name: 'Google', icon: <FaStore />, hoverColor: 'group-hover:text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram />, hoverColor: 'group-hover:text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedinIn />, hoverColor: 'group-hover:text-[#0A66C2]' },
    { id: 'pinterest', name: 'Pinterest', icon: <FaPinterestP />, hoverColor: 'group-hover:text-[#E60023]' },
    { id: 'threads', name: 'Threads', icon: <SiThreads />, hoverColor: 'group-hover:text-black' },
    { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, hoverColor: 'group-hover:text-black' },
    { id: 'x', name: 'X', icon: <FaXTwitter />, hoverColor: 'group-hover:text-black' },
    { id: 'youtube', name: 'YouTube', icon: <FaYoutube />, hoverColor: 'group-hover:text-[#FF0000]' },
  ];

  const { t } = useLanguage();

  return (
    <section className="font-sans py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="
          flex flex-col items-center gap-12 rounded-3xl 
          border border-gray-200/70 bg-[#FDFDFC] 
          p-16 shadow-sm
        ">
          <p className="text-3xl font-semibold text-gray-800">
            {t('Connect Your Social Accounts', 'Connectez vos comptes sociaux')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-20 pt-4">
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
