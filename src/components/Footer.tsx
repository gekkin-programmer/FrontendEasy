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

  // --- DATA: Updated with Legal Section for Meta Compliance ---
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
      title: t('Legal', 'Légal'), // 👈 CRITICAL FOR META
      links: [
        { label: t('Privacy Policy', 'Politique de confidentialité'), href: '/legal/privacy' },
        { label: t('Terms of Service', "Conditions d'utilisation"), href: '/legal/terms' },
        { label: t('Data Deletion', 'Suppression des données'), href: '/legal/data-deletion' },
        { label: t('Cookie Policy', 'Cookies'), href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Instagram', Icon: FaInstagram, href: '#', className: 'group-hover:text-[#E1306C]' },
    { name: 'Facebook', Icon: FaFacebookF, href: '#', className: 'group-hover:text-[#1877F2]' },
    { name: 'Twitter', Icon: FaTwitter, href: '#', className: 'group-hover:text-[#1DA1F2]' },
    { name: 'LinkedIn', Icon: FaLinkedinIn, href: '#', className: 'group-hover:text-[#0A66C2]' },
    { name: 'YouTube', Icon: FaYoutube, href: '#', className: 'group-hover:text-[#FF0000]' },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Logo Section */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img
                className="h-10 w-auto"
                src="/assets/WiggleLogo.png" 
                alt="EasyPost Logo"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">EasyPost</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xs leading-relaxed">
              {t(
                'The simplest way to plan, create, and share content on social media across Africa and beyond.',
                'La manière la plus simple de planifier, créer et partager du contenu sur les réseaux sociaux en Afrique et au-delà.'
              )}
            </p>
          </div>

          {/* Links Section */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(0, 2).map((section) => (
                <div key={section.title} className="mb-10 md:mb-0">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-[#3C48F6]">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#3C48F6] dark:hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(2, 4).map((section) => (
                <div key={section.title} className="mb-10 md:mb-0">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-[#3C48F6]">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#3C48F6] dark:hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-500 md:order-1">
            &copy; {new Date().getFullYear()} EasyPost Inc. {t('All rights reserved.', 'Tous droits réservés.')}
          </p>
          <div className="flex space-x-6 md:order-2 mt-4 md:mt-0">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-400 hover:scale-110 transition-transform duration-200"
              >
                <span className="sr-only">{link.name}</span>
                <link.Icon
                  className={`h-5 w-5 transition-colors duration-300 ${link.className}`}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
