'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Smartphone } from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/context/LanguageContext';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handlePlanSelection = (plan: { name: string; price: number | string }) => {
    if (plan.name === 'Free') {
      router.push('/dashboard');
      return;
    }
    if (plan.name === 'Enterprise') {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = 'mailto:sales@easypost.io';
      return;
    }
    const params = new URLSearchParams({
      plan: plan.name.toUpperCase(),
      price: plan.price.toString(),
      cycle: isYearly ? 'YEARLY' : 'MONTHLY',
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const plans = [
    {
      name: 'Free',
      displayName: t('Free', 'Gratuit'),
      price: 0,
      description: t(
        'For individuals and beginner freelancers.',
        'Pour les particuliers et freelancers débutants.'
      ),
      features: [
        { text: t('10 Posts / month', '10 Posts / mois'), included: true },
        { text: '1 Workspace', included: true },
        { text: t('2 Social Accounts', '2 Comptes Sociaux'), included: true },
        { text: t('10 AI Requests', '10 Requêtes IA'), included: true },
        { text: t('500 MB Storage', '500 MB Stockage'), included: true },
        { text: t('Basic Scheduling', 'Scheduling Basique'), included: true },
        { text: t('Basic Analytics', 'Analytics Basique'), included: true },
        { text: t('Email Support', 'Support Email'), included: true },
        { text: 'White Label', included: false },
        { text: 'API Access', included: false },
      ],
      cta: t('Start for Free', 'Commencer Gratuitement'),
      popular: false,
    },
    {
      name: 'Starter',
      displayName: 'Starter',
      price: isYearly ? 49000 : 4900,
      period: isYearly ? t('/yr', '/an') : t('/mo', '/mois'),
      description: t(
        'Ideal for SMEs and growing startups.',
        'Idéal pour les PME et Startups en croissance.'
      ),
      features: [
        { text: t('100 Posts / month', '100 Posts / mois'), included: true },
        { text: '3 Workspaces', included: true },
        { text: t('5 Social Accounts', '5 Comptes Sociaux'), included: true },
        { text: t('100 AI Requests', '100 Requêtes IA'), included: true },
        { text: t('5 GB Storage', '5 GB Stockage'), included: true },
        { text: t('Advanced Scheduling', 'Scheduling Avancé'), included: true },
        { text: t('Basic Analytics', 'Analytics Basique'), included: true },
        { text: t('Email Support', 'Support Email'), included: true },
        { text: 'White Label', included: false },
        { text: 'API Access', included: false },
      ],
      cta: t('Choose Starter', 'Choisir Starter'),
      popular: true,
      popularLabel: t('Most popular', 'Le plus populaire'),
    },
    {
      name: 'PRO',
      displayName: 'PRO',
      price: isYearly ? 149000 : 14900,
      period: isYearly ? t('/yr', '/an') : t('/mo', '/mois'),
      description: t(
        'For agencies and professional creators.',
        'Pour les agences et créateurs professionnels.'
      ),
      features: [
        { text: t('Unlimited Posts', 'Posts Illimités'), included: true },
        { text: '10 Workspaces', included: true },
        { text: t('15 Social Accounts', '15 Comptes Sociaux'), included: true },
        { text: t('Unlimited AI', 'AI Illimitée'), included: true },
        { text: t('50 GB Storage', '50 GB Stockage'), included: true },
        { text: t('Advanced Scheduling', 'Scheduling Avancé'), included: true },
        { text: t('Advanced Analytics', 'Analytics Avancé'), included: true },
        { text: t('Priority Support', 'Support Prioritaire'), included: true },
        { text: 'API Access', included: true },
        { text: 'White Label', included: false },
      ],
      cta: t('Go PRO', 'Passer au PRO'),
      popular: false,
    },
    {
      name: 'Enterprise',
      displayName: 'Enterprise',
      price: t('Custom quote', 'Sur devis'),
      period: '',
      description: t(
        'Tailored solutions for large enterprises.',
        'Solutions sur mesure pour grandes entreprises.'
      ),
      features: [
        { text: t('Everything Unlimited', 'Tout en Illimité'), included: true },
        { text: t('500 GB Storage', '500 GB Stockage'), included: true },
        { text: t('Dedicated 24/7 Support', 'Support Dédié 24/7'), included: true },
        { text: t('Full White Label', 'White Label Complet'), included: true },
        { text: 'Custom Integrations', included: true },
        { text: t('Guaranteed SLA', 'SLA Garanti'), included: true },
        { text: t('Team Training', 'Formation Équipe'), included: true },
        { text: t('Advanced Security', 'Sécurité Avancée'), included: true },
      ],
      cta: t('Contact Sales', 'Contacter Sales'),
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-[#3C48F5] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <section className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-6">
            <span className="bg-[#3C48F5] text-white px-4 py-2 font-black text-xs uppercase tracking-[0.2em] border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
              {t('Flexible_Pricing', 'Prix_Flexibles')}
            </span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            {t('Dominate the', 'Dominez le')}<br />
            <span className="text-black dark:text-transparent dark:text-stroke-white italic">
              {t('Market.', 'Marché.')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-bold mb-12">
            {t(
              'Plans adapted to every stage of your growth. Pay in FCFA via Mobile Money or Credit Card.',
              'Des plans adaptés à chaque étape de votre croissance. Payez en FCFA via Mobile Money ou Carte Bancaire.'
            )}
          </p>

          {/* TOGGLE */}
          <div className="flex items-center justify-center gap-6 mb-16">
            <span className={`text-sm font-black uppercase tracking-widest ${!isYearly ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              {t('Monthly', 'Mensuel')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 bg-gray-200 dark:bg-zinc-800 border-2 border-black dark:border-white rounded-full relative p-1 transition-colors"
            >
              <div
                className={`w-6 h-6 bg-[#3C48F5] border-2 border-black dark:border-white rounded-full shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-transform duration-200 ${isYearly ? 'translate-x-7' : ''}`}
              />
            </button>
            <span className={`text-sm font-black uppercase tracking-widest ${isYearly ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              {t('Yearly', 'Annuel')}
            </span>
          </div>
        </section>

        {/* PRICING GRID */}
        <div className="grid lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} onSelect={() => handlePlanSelection(plan)} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- COMPONENTS ---

function PricingCard({ plan, onSelect }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative flex flex-col h-full border-4 border-black dark:border-white p-8 transition-all ${
        plan.popular
          ? 'shadow-[12px_12px_0px_0px_#3C48F5]'
          : 'shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#222]'
      } ${
        plan.name === 'Free'    ? 'bg-zinc-50 dark:bg-zinc-900' :
        plan.name === 'Starter' ? 'bg-[#3C48F5]' :
        plan.name === 'PRO'     ? 'bg-white dark:bg-zinc-900' :
                                  'bg-white dark:bg-black'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 font-black text-[10px] uppercase border-2 border-black whitespace-nowrap">
          {plan.popularLabel}
        </div>
      )}

      <div className="mb-8">
        <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${plan.name === 'Starter' ? 'text-white' : 'text-black dark:text-white'}`}>
          {plan.displayName}
        </h3>
        <p className={`text-xs font-bold leading-relaxed mb-6 ${plan.name === 'Starter' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {plan.description}
        </p>
        <div className={`flex items-baseline gap-2 ${plan.name === 'Starter' ? 'text-white' : 'text-black dark:text-white'}`}>
          <span className="text-4xl font-black">
            {typeof plan.price === 'number' ? plan.price.toLocaleString() : plan.price}
          </span>
          {typeof plan.price === 'number' && (
            <span className={`text-sm font-black uppercase tracking-widest ${plan.name === 'Starter' ? 'text-blue-200' : 'text-black dark:text-gray-400'}`}>
              FCFA{plan.period}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {plan.features.map((feat: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 text-xs font-bold ${
            plan.name === 'Starter'
              ? (feat.included ? 'text-white' : 'text-blue-900/50')
              : (feat.included ? 'text-gray-800 dark:text-gray-200' : 'text-gray-300 dark:text-zinc-700')
          }`}>
            {feat.included
              ? <Check size={14} className={plan.name === 'Starter' ? 'text-green-300' : 'text-black dark:text-green-500'} />
              : <X size={14} />
            }
            {feat.text}
          </div>
        ))}
      </div>

      <button
        onClick={onSelect}
        className={`w-full py-4 font-black uppercase text-xs border-4 transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
          plan.name === 'Starter'
            ? 'bg-white text-black border-black shadow-[4px_4px_0px_0px_#000]'
            : plan.name === 'PRO'
            ? 'bg-white dark:bg-[#3C48F5] text-black dark:text-white border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]'
            : 'bg-transparent text-black dark:text-white border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#3C48F5]'
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}

function PaymentIcon({ name, color }: any) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 border-2 border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-black dark:group-hover:border-white transition-colors">
        <Smartphone className={color} size={32} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">{name}</span>
    </div>
  );
}
