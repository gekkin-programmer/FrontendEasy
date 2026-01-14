"use client";
import React from 'react';
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaYoutube, FaStore
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext'; 

interface SocialLinkProps {
  name: string;
  icon: React.ReactElement<{ className?: string }>; 
  hoverColor: string;
  delay: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, icon, hoverColor, delay }) => {
  return (
    <div className={`relative group transition-transform duration-300 hover:-translate-y-2`}>
      <a
        href="#"
        className="
          flex h-20 w-20 items-center justify-center 
          bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]
          hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200
        "
      >
        {React.cloneElement(icon, {
          className: `h-8 w-8 text-black transition-colors duration-300 ${hoverColor}`,
        })}
      </a>
      
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-[10px] font-bold py-1 px-2 uppercase tracking-wider">
        {name}
      </div>
    </div>
  );
};

const ConnectSection = () => {
  const { t } = useLanguage();

  const socialIcons = [
    { id: 'facebook', name: 'Facebook x EasyPost', icon: <FaFacebookF />, hoverColor: 'group-hover:text-[#1877F2]', delay: '0s' },
    { id: 'instagram', name: 'Instagram x EasyPost', icon: <FaInstagram />, hoverColor: 'group-hover:text-[#E1306C]', delay: '0.1s' },
    { id: 'x', name: 'X x EasyPost', icon: <FaXTwitter />, hoverColor: 'group-hover:text-gray-600', delay: '0.2s' },
    { id: 'linkedin', name: 'LinkedIn x EasyPost', icon: <FaLinkedinIn />, hoverColor: 'group-hover:text-[#0A66C2]', delay: '0.3s' },
    { id: 'tiktok', name: 'TikTok x EasyPost', icon: <FaTiktok />, hoverColor: 'group-hover:text-black', delay: '0.4s' },
    { id: 'youtube', name: 'YouTube x EasyPost', icon: <FaYoutube />, hoverColor: 'group-hover:text-[#FF0000]', delay: '0.5s' },
    { id: 'threads', name: 'Threads x EasyPost', icon: <SiThreads />, hoverColor: 'group-hover:text-black', delay: '0.6s' },
    { id: 'pinterest', name: 'Pinterest x EasyPost', icon: <FaPinterestP />, hoverColor: 'group-hover:text-[#E60023]', delay: '0.7s' },
    { id: 'google', name: 'Google x EasyPost', icon: <FaStore />, hoverColor: 'group-hover:text-blue-500', delay: '0.8s' },
  ];

  return (
    <section className="bg-gray-50 border-b-4 border-black py-20 px-4 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-4 bg-black"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-black"></div>

      <div className="container mx-auto max-w-6xl text-center">
        
        <div className="inline-block bg-black text-white font-black text-lg px-6 py-2 border-4 border-transparent hover:border-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] mb-8 uppercase tracking-widest">
            {t("Integrations", "Intégrations")}
        </div>

        <h3 className="text-4xl md:text-6xl font-black text-black mb-16 uppercase leading-none tracking-tight">
          {t('CONNECT YOUR', 'CONNECTEZ VOS')}<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3C48F6] to-[#3D49F9]">
             SOCIAL MEDIA.
          </span>
        </h3>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {socialIcons.map((props) => (
            <SocialLink key={props.id} {...props} />
          ))}
        </div>

        <div className="mt-16">
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">
                &  more coming soon
            </p>
        </div>

      </div>
    </section>
  );
};

export default ConnectSection;
