import React from 'react';
import Logo from '../assets/Wiggle Logo.png';
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext'; // <-- added

const Footer: React.FC = () => {
  const { t } = useLanguage(); // <-- added for translation

  // --- DATA: Updated with bilingual text ---
  const footerSections = [
    {
      title: t('Tools', 'Outils'),
      links: [
        { label: t('Publishing', 'Publication'), href: '#' },
        { label: t('Analytics', 'Analytique'), href: '#' },
        { label: t('Engagement', 'Engagement'), href: '#' },
        { label: t('AI Assistant', 'Assistant IA'), href: '#' },
      ],
    },
    {
      title: t('Resources', 'Ressources'),
      links: [
        { label: t('Blog', 'Blog'), href: '#' },
        { label: t('Content Library', 'Bibliothèque de contenu'), href: '#' },
        { label: t('Browser Extension', 'Extension de navigateur'), href: '#' },
        { label: t('Free Image Editor', 'Éditeur d’images gratuit'), href: '#' },
      ],
    },
    {
      title: t('Support', 'Assistance'),
      links: [
        { label: t('Help Center', "Centre d'aide"), href: '#' },
        { label: t('Status', 'Statut'), href: '#' },
        { label: t('Changelog', 'Journal des modifications'), href: '#' },
        { label: t('Contact Us', 'Contactez-nous'), href: '#' },
      ],
    },
    {
      title: t('Company', 'Entreprise'),
      links: [
        { label: t('About', 'À propos'), href: '#' },
        { label: t('Transparency', 'Transparence'), href: '#' },
        { label: t('Careers', 'Carrières'), href: '#' },
        { label: t('Press', 'Presse'), href: '#' },
      ],
    },
  ];

  // --- DATA: Social links with brand hover colors ---
  const socialLinks = [
    { name: 'Instagram', Icon: FaInstagram, href: '#', hoverColor: 'text-[#E1306C]' },
    { name: 'Facebook', Icon: FaFacebookF, href: '#', hoverColor: 'text-[#1877F2]' },
    { name: 'Twitter', Icon: FaTwitter, href: '#', hoverColor: 'text-[#1DA1F2]' },
    { name: 'LinkedIn', Icon: FaLinkedinIn, href: '#', hoverColor: 'text-[#0A66C2]' },
    { name: 'YouTube', Icon: FaYoutube, href: '#', hoverColor: 'text-[#FF0000]' },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and company description section */}
          <div className="space-y-8 xl:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <img
                className="h-8 w-auto"
                src={Logo}
                alt="EasyPost Logo"
              />
            </a>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              {t(
                'The simplest way to plan, create, and share content on social media.',
                'La manière la plus simple de planifier, créer et partager du contenu sur les réseaux sociaux.'
              )}
            </p>
          </div>

          {/* Link columns section */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <h3
                    className="text-sm font-semibold tracking-wider uppercase"
                    style={{ color: '#3C48F6' }}
                  >
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-base text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(2, 4).map((section) => (
                <div key={section.title} className="mt-12 md:mt-0">
                  <h3
                    className="text-sm font-semibold tracking-wider uppercase"
                    style={{ color: '#3C48F6' }}
                  >
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-base text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar with copyright and social links */}
        <div className="mt-12 border-t border-slate-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-base text-slate-500 dark:text-slate-400 md:order-1">
            &copy; {new Date().getFullYear()} EasyPost, Inc.{' '}
            {t('All rights reserved.', 'Tous droits réservés.')}
          </p>
          <div className="flex space-x-6 md:order-2 mt-4 md:mt-0">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-400 group transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="sr-only">{link.name}</span>
                <link.Icon
                  className={`h-6 w-6 transition-colors duration-300 group-hover:${link.hoverColor}`}
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
