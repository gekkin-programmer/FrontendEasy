'use client';

import React, { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { useLanguage } from '@/src/context/LanguageContext';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  q: string;
  a: string;
}

export default function HelpPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);

  const categories = [
    {
      label: t('Getting Started', 'Démarrage'),
      items: [
        {
          q: t('How do I create an account?', 'Comment créer un compte ?'),
          a: t(
            'Click "Start Free" on the homepage, enter your email and a password, then verify your email with the OTP we send you.',
            'Cliquez sur "Gratuit" sur la page d\'accueil, entrez votre email et un mot de passe, puis vérifiez votre email avec le code OTP que nous vous envoyons.'
          ),
        },
        {
          q: t('How do I connect my social accounts?', 'Comment connecter mes comptes sociaux ?'),
          a: t(
            'Go to Dashboard → Connect Accounts, then click the platform you want to add. You\'ll be redirected to authorize EasyPost.',
            'Allez dans Tableau de bord → Connecter des comptes, puis cliquez sur la plateforme que vous souhaitez ajouter. Vous serez redirigé pour autoriser EasyPost.'
          ),
        },
        {
          q: t('Is there a free plan?', 'Y a-t-il un plan gratuit ?'),
          a: t(
            'Yes! The free plan lets you connect up to 3 social accounts, schedule up to 10 posts per month, and access basic analytics.',
            'Oui ! Le plan gratuit vous permet de connecter jusqu\'à 3 comptes sociaux, planifier jusqu\'à 10 publications par mois et accéder aux analyses de base.'
          ),
        },
      ],
    },
    {
      label: t('Publishing & Scheduling', 'Publication & Planification'),
      items: [
        {
          q: t('How do I schedule a post?', 'Comment planifier une publication ?'),
          a: t(
            'Open the Composer, write your content, select the social accounts to publish to, choose a date/time, and click "Schedule".',
            'Ouvrez le Compositeur, rédigez votre contenu, sélectionnez les comptes sociaux sur lesquels publier, choisissez une date/heure et cliquez sur "Planifier".'
          ),
        },
        {
          q: t('Can I post to multiple platforms at once?', 'Puis-je publier sur plusieurs plateformes à la fois ?'),
          a: t(
            'Yes. In the Composer, simply select all the social accounts you want to publish to before scheduling.',
            'Oui. Dans le Compositeur, sélectionnez simplement tous les comptes sociaux sur lesquels vous souhaitez publier avant de planifier.'
          ),
        },
        {
          q: t('What is the AI Smart Scheduling feature?', 'Qu\'est-ce que la fonctionnalité de planification intelligente IA ?'),
          a: t(
            'Smart Scheduling analyzes your historical post performance to suggest the best times to publish for maximum engagement on each platform.',
            'La planification intelligente analyse les performances de vos publications historiques pour suggérer les meilleurs moments pour publier afin d\'obtenir un engagement maximum sur chaque plateforme.'
          ),
        },
      ],
    },
    {
      label: t('Billing & Plans', 'Facturation & Plans'),
      items: [
        {
          q: t('How do I upgrade my plan?', 'Comment mettre à niveau mon plan ?'),
          a: t(
            'Go to Settings → Billing and select the plan that fits your needs. Upgrades take effect immediately.',
            'Allez dans Paramètres → Facturation et sélectionnez le plan qui correspond à vos besoins. Les mises à niveau prennent effet immédiatement.'
          ),
        },
        {
          q: t('Can I cancel at any time?', 'Puis-je annuler à tout moment ?'),
          a: t(
            'Yes, you can cancel your subscription at any time from Settings → Billing. You\'ll keep access until the end of your billing period.',
            'Oui, vous pouvez annuler votre abonnement à tout moment depuis Paramètres → Facturation. Vous garderez l\'accès jusqu\'à la fin de votre période de facturation.'
          ),
        },
        {
          q: t('What payment methods do you accept?', 'Quels modes de paiement acceptez-vous ?'),
          a: t(
            'We accept major credit cards, Mobile Money (MTN, Orange), and PayPal.',
            'Nous acceptons les principales cartes de crédit, Mobile Money (MTN, Orange) et PayPal.'
          ),
        },
      ],
    },
    {
      label: t('Account & Security', 'Compte & Sécurité'),
      items: [
        {
          q: t('How do I reset my password?', 'Comment réinitialiser mon mot de passe ?'),
          a: t(
            'On the login page, click "Forgot password?", enter your email, and follow the instructions sent to your inbox.',
            'Sur la page de connexion, cliquez sur "Mot de passe oublié ?", entrez votre email et suivez les instructions envoyées dans votre boîte de réception.'
          ),
        },
        {
          q: t('How do I delete my account?', 'Comment supprimer mon compte ?'),
          a: t(
            'Go to Settings → Account → Danger Zone and click "Delete Account". This action is irreversible.',
            'Allez dans Paramètres → Compte → Zone de danger et cliquez sur "Supprimer le compte". Cette action est irréversible.'
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="border-b-4 border-black dark:border-white/10 bg-white dark:bg-zinc-950 py-20 md:py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute top-6 left-6 w-10 h-10 bg-[#3C48F6] border-4 border-black dark:border-white/20 rotate-12 hidden md:block" />
        <div className="absolute bottom-6 right-10 w-14 h-14 bg-[#3C48F6]/20 border-4 border-black dark:border-white/20 -rotate-6 hidden md:block" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-xs font-black uppercase tracking-widest mb-6">
            {t('HELP CENTER', "CENTRE D'AIDE")}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-white uppercase leading-[0.9] tracking-tighter mb-6">
            {t('HOW CAN WE', 'COMMENT POUVONS-')}<br />
            <span className="bg-black dark:bg-white text-white dark:text-black px-3 mt-1 inline-block">
              {t('HELP YOU?', 'NOUS AIDER ?')}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 text-lg font-bold max-w-md mx-auto">
            {t(
              'Find answers to the most common questions about EasyPost.',
              'Trouvez des réponses aux questions les plus fréquentes sur EasyPost.'
            )}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 bg-white dark:bg-zinc-950 border-b-4 border-black dark:border-white/10">
        <div className="max-w-3xl mx-auto space-y-12">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#3C48F6] mb-4 border-b-2 border-black dark:border-white/10 pb-2">
                {cat.label}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, ii) => {
                  const idx = ci * 10 + ii;
                  const isOpen = open === idx;
                  return (
                    <div key={ii} className="border-2 border-black dark:border-white/20 bg-white dark:bg-zinc-900 overflow-hidden">
                      <button
                        onClick={() => setOpen(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left group"
                      >
                        <span className="font-black text-sm uppercase text-black dark:text-white group-hover:text-[#3C48F6] transition-colors">
                          {item.q}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-black dark:text-white flex-shrink-0 ml-4"
                        >
                          <ChevronDown size={18} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm text-gray-600 dark:text-zinc-400 font-medium leading-relaxed border-t-2 border-black dark:border-white/10 pt-4">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 md:py-20 px-4 text-center bg-zinc-50 dark:bg-zinc-950 border-b-4 border-black dark:border-white/10">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase text-black dark:text-white mb-4">
            {t('Still need help?', 'Besoin d\'aide supplémentaire ?')}
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 font-medium mb-8">
            {t(
              'Our team is available 24/7 to assist you.',
              'Notre équipe est disponible 24h/24 et 7j/7 pour vous aider.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@easypost.cm"
              className="inline-flex items-center justify-center gap-2 bg-[#3C48F6] text-white font-black uppercase px-6 py-4 border-4 border-black dark:border-white/20 shadow-[6px_6px_0px_0px_#000] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-none transition-all"
            >
              <Mail size={18} /> {t('Email Support', 'Contacter par Email')}
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbC0LNr9WtCDNpRnPn27"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-black dark:text-white font-black uppercase px-6 py-4 border-4 border-black dark:border-white/20 shadow-[6px_6px_0px_0px_#000] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-none transition-all hover:bg-green-400"
            >
              <FaWhatsapp size={18} /> {t('WhatsApp Community', 'Communauté WhatsApp')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
