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
        { label: t('Publishing', 'Publication'), href: '/pricing' },
        { label: t('Analytics', 'Analytique'), href: '/pricing' },
        { label: t('AI Assistant', 'Assistant IA'), href: '/pricing' },
        { label: t('Pricing', 'Tarifs'), href: '/pricing' },
      ],
    },
    {
      title: t('Resources', 'Ressources'),
      links: [
        { label: t('Blog', 'Blog'), href: '/about' },
        { label: t('Community', 'Communauté'), href: '/community' },
        { label: t('Creator Fund', 'Fonds Créateur'), href: '/pricing' },
        { label: t('Help Center', "Centre d'aide"), href: '/help' },
        { label: t('Contact', 'Contact'), href: '/about' },
      ],
    },
    {
      title: t('Company', 'Entreprise'),
      links: [
        { label: t('About Us', 'À propos'), href: '/about' },
        { label: t('Careers', 'Carrières'), href: '/about' },
        { label: t('Partners', 'Partenaires'), href: '/about' },
        { label: t('Press', 'Presse'), href: '/about' },
      ],
    },
    {
      title: t('Legal', 'Légal'),
      links: [
        { label: t('Privacy Policy', 'Politique de confidentialité'), href: '/legal/privacy' },
        { label: t('Terms of Service', "Conditions d'utilisation"), href: '/legal/terms' },
        { label: t('Data Deletion', 'Suppression des données'), href: '/legal/data-deletion' },
        { label: t('Cookie Policy', 'Cookies'), href: '/legal/cookies' },
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
    <footer className="bg-[#F4F4F0] dark:bg-black text-black dark:text-white border-t-4 border-black/10 dark:border-white/10 font-sans">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <img
                className="h-12 w-auto"
                src="/assets/WiggleLogo.png"
                alt="EazyPost Logo"
              />
            </Link>
            <p className="text-lg font-medium text-black/60 dark:text-white/60 max-w-sm leading-relaxed uppercase">
              {t(
                'One platform. Every platform. Built for African creators.',
                'Une plateforme. Toutes les plateformes. Faite pour les créateurs africains.'
              )}
            </p>

            <div className="flex gap-4">
                {socialLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.href}
                    className={`
                        w-10 h-10 flex items-center justify-center border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-black dark:text-white
                        hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all ${link.className}
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
                      className="text-sm font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:underline decoration-2 decoration-[#3C48F6] underline-offset-4 transition-all uppercase"
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
        <div className="border-t-2 border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-mono text-black/40 dark:text-white/40 uppercase">
            &copy; {new Date().getFullYear()} EAZYPOST INC. {t('ALL RIGHTS RESERVED.', 'TOUS DROITS RÉSERVÉS.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
