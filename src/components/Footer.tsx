"use client";

import React from 'react';
import Link from 'next/link';
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const footerSections = [
    {
      title: t('Product', 'Produit'),
      links: [
        { label: t('Publishing', 'Publication'), href: '#' },
        { label: t('Analytics', 'Analytique'), href: '#' },
        { label: t('AI Assistant', 'Assistant IA'), href: '#' },
        { label: t('Pricing', 'Tarifs'), href: '/pricing' },
      ],
    },
    {
      title: t('Resources', 'Ressources'),
      links: [
        { label: t('Blog', 'Blog'), href: '#' },
        { label: t('Community', 'Communauté'), href: '/community' },
        { label: t('Creator Fund', 'Fonds Créateur'), href: '/creator-fund' },
        { label: t('Help Center', "Centre d'aide"), href: '#' },
        { label: t('Contact', 'Contact'), href: '#' },
      ],
    },
    {
      title: t('Company', 'Entreprise'),
      links: [
        { label: t('About Us', 'À propos'), href: '#' },
        { label: t('Careers', 'Carrières'), href: '#' },
        { label: t('Partners', 'Partenaires'), href: '#' },
        { label: t('Press', 'Presse'), href: '#' },
      ],
    },
    {
      title: t('Legal', 'Légal'),
      links: [
        { label: t('Privacy Policy', 'Politique de confidentialité'), href: '/legal/privacy' },
        { label: t('Terms of Service', "Conditions d'utilisation"), href: '/legal/terms' },
        { label: t('Data Deletion', 'Suppression des données'), href: '/legal/data-deletion' },
        { label: t('Cookie Policy', 'Cookies'), href: '/legal/privacy#cookie-policy' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Instagram', Icon: FaInstagram, href: '#', className: 'hover:text-[#E1306C]' },
    { name: 'Facebook', Icon: FaFacebookF, href: '#', className: 'hover:text-[#1877F2]' },
    { name: 'Twitter', Icon: FaTwitter, href: '#', className: 'hover:text-[#1DA1F2]' },
    { name: 'LinkedIn', Icon: FaLinkedinIn, href: '#', className: 'hover:text-[#0A66C2]' },
    { name: 'YouTube', Icon: FaYoutube, href: '#', className: 'hover:text-[#FF0000]' },
  ];

  return (
    <footer className="bg-black dark:bg-zinc-950 text-white border-t-4 border-white dark:border-zinc-800 font-sans transition-colors">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                className="h-12 w-auto bg-white dark:bg-zinc-800 p-1 rounded-none border-2 border-white dark:border-zinc-700 group-hover:rotate-3 transition-transform"
                src="/assets/WiggleLogo.png" 
                alt="EazyPost Logo"
              />
              <span className="text-3xl font-black uppercase tracking-tighter text-white">EazyPost</span>
            </Link>
            <p className="text-lg font-medium text-gray-400 dark:text-zinc-500 max-w-sm leading-relaxed border-l-4 border-[#3C48F6] pl-4 uppercase">
              {t(
                'The social OS for Africa. Plan, create, and dominate.',
                'L\'OS social pour l\'Afrique. Planifiez, créez et dominez.'
              )}
            </p>
            
            <div className="flex gap-4">
                {socialLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.href}
                    className={`
                        w-10 h-10 flex items-center justify-center border-2 border-white dark:border-zinc-700 bg-black dark:bg-zinc-900
                        hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all ${link.className}
                    `}
                >
                    <span className="sr-only">{link.name}</span>
                    <link.Icon className="h-5 w-5" />
                </a>
                ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#3C48F6]">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-gray-300 dark:text-zinc-400 hover:text-white dark:hover:text-white hover:underline decoration-2 decoration-yellow-400 underline-offset-4 transition-all uppercase"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-800 dark:border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-mono text-gray-500 dark:text-zinc-600 uppercase">
            &copy; {new Date().getFullYear()} EAZYPOST INC. {t('ALL RIGHTS RESERVED.', 'TOUS DROITS RÉSERVÉS.')}
          </p>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
