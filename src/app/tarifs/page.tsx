'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/context/LanguageContext';

type FeatureState = 'check' | 'cross';
// Comparison table entry: either a blue section header bar or a feature row.
type ComparisonRow =
  | { header: string }
  | { name: string; desc: string; values: string[] };
interface PlanFeature {
  label: string;
  state: FeatureState;
  soon?: boolean;
  info?: string;
}

function FeatureIcon({ state, dark }: { state: FeatureState; dark: boolean }) {
  if (state === 'cross') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <circle cx="11" cy="11" r="8.3" fill="#FF0000" />
        <path d="M8 8L14 14M14 8L8 14" stroke="#FFFFFF" strokeWidth="1.85" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <circle cx="11" cy="11" r="8.3" fill={dark ? '#FFFFFF' : '#141414'} />
      <path d="M7.5 11L10 13.5L14.5 8.5" stroke="#CCD2E3" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({
  badge,
  description,
  price,
  perLabel,
  features,
  cta,
  ctaHref,
  soonLabel,
  dark = false,
  popularLabel,
}: {
  badge: string;
  description: string;
  price: string;
  perLabel: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  soonLabel: string;
  dark?: boolean;
  popularLabel?: string;
}) {
  return (
    <div
      className={`w-full max-w-[364px] rounded-[9px] px-[40px] py-[43px] flex flex-col gap-[28px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] ${
        dark ? 'bg-[#184CD1] lg:-translate-y-[71px] pb-[60px]' : 'bg-white'
      }`}
    >
      {/* Badge block */}
      <div className="flex flex-col items-start gap-[15px]">
        {popularLabel && (
          <span className="bg-black text-white rounded-[4px] px-[14px] h-[22px] flex items-center text-[14.77px] leading-[22px]">
            {popularLabel}
          </span>
        )}
        <span className={`rounded-[5.5px] px-[14px] py-[5.5px] font-semibold text-[14.77px] leading-[28px] tracking-[0.01em] uppercase text-[#000B33] ${
          dark ? 'bg-[#F1F1F1]' : 'bg-white border border-gray-300'
        }`}>
          {badge}
        </span>
        <p className={`text-[14.77px] leading-[22px] font-light max-w-[253px] ${dark ? 'text-white' : 'text-black'}`}>
          {description}
        </p>
      </div>

      <hr className={`w-full border-t ${dark ? 'border-white opacity-40' : 'border-[#001C80] opacity-30'}`} />

      {/* Price — currency prefix/suffix rendered smaller so long values (e.g. FCFA) stay inside the card */}
      <div className="flex flex-col">
        <span className={`font-semibold tracking-[-0.46px] flex items-baseline flex-wrap gap-x-[6px] ${dark ? 'text-white' : 'text-[#000B33]'}`}>
          {(() => {
            const m = price.match(/^([^\d]*)([\d\s.,]*\d)(.*)$/);
            if (!m) return <span className="text-[66px] leading-[73px]">{price}</span>;
            const [, prefix, number, suffix] = m;
            return (
              <>
                {prefix && <span className="text-[28px] leading-[34px]">{prefix.trim()}</span>}
                <span className="text-[66px] leading-[73px]">{number.trim()}</span>
                {suffix && <span className="text-[28px] leading-[34px]">{suffix.trim()}</span>}
              </>
            );
          })()}
        </span>
        <span className={`font-semibold text-[14.77px] leading-[24px] opacity-80 ${dark ? 'text-white' : 'text-black'}`}>
          {perLabel}
        </span>
      </div>

      <hr className={`w-full border-t ${dark ? 'border-white opacity-40' : 'border-[#001C80] opacity-30'}`} />

      {/* Features */}
      <ul className="flex flex-col gap-[14px]">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-[5px]">
            <FeatureIcon state={f.state} dark={dark} />
            <span className={`text-[14.77px] leading-[24px] ${dark ? 'text-white' : 'text-black'}`}>{f.label}</span>
            {f.soon && (
              <span className="bg-[#C9FAD6] text-[#1AA703] rounded-[4px] px-[5px] h-[17px] flex items-center text-[9.2px] whitespace-nowrap">
                {soonLabel}
              </span>
            )}
            <div className="relative group/tooltip flex items-center cursor-help ml-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-opacity duration-300 ${dark ? 'text-white opacity-30 group-hover/tooltip:opacity-80' : 'text-[#B0B0B0] opacity-60 group-hover/tooltip:opacity-100'}`}>
                <path d="M11 15V11M11 7H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[12px] w-[400px] opacity-0 translate-y-[6px] pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:pointer-events-auto transition-all duration-300 ease-out z-50">
                <div className="relative filter drop-shadow-[0px_9px_13px_rgba(0,0,0,0.1)] flex flex-col items-center">
                  <div className="bg-[#FFFDE8] w-full min-h-[54px] flex items-center px-[20px] py-[12px] relative z-10">
                    <p className="font-sans text-[15.4px] leading-[18px] text-[#1B1B1B] opacity-80 w-full text-center">
                      {f.info || f.label}
                    </p>
                    <div className="absolute bottom-0 left-0 w-[calc(50%-13px)] h-[1.28px] bg-[#FFB342]"></div>
                    <div className="absolute bottom-0 right-0 w-[calc(50%-13px)] h-[1.28px] bg-[#FFB342]"></div>
                  </div>
                  <div className="absolute bottom-[-11px] w-[26.48px] h-[23.27px] bg-[#FFFDE8] border-b-[1.28px] border-r-[1.28px] border-[#FFB342] transform rotate-45 z-0"></div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex flex-col items-center mt-auto">
        <Link
          href={ctaHref}
          className={`w-full h-[37px] rounded-[4px] font-bold text-[14.77px] leading-[22px] flex items-center justify-center transition-transform hover:scale-[1.02] ${
            dark ? 'bg-white text-[#000B6B]' : 'bg-[#184CD1] text-white'
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default function TarifsPage() {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const [accounts, setAccounts] = useState(1);
  const [currency, setCurrency] = useState('FCFA');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const CURRENCIES = ['FCFA', 'EUR', 'USD'];

  // FCFA per unit of currency. EUR is the fixed CFA peg (1 EUR = 655.957 FCFA);
  // the USD rate is an approximation — adjust when rates move.
  const FCFA_RATES: Record<string, number> = { FCFA: 1, EUR: 655.957, USD: 600 };

  // Price per member/month: FCFA base × number of social accounts, -20% on yearly,
  // converted to the selected currency.
  const planPrice = (base: number) => {
    const fcfa = base * accounts * (isYearly ? 0.8 : 1);
    const amount = fcfa / FCFA_RATES[currency];
    if (currency === 'EUR') {
      return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(fcfa).toLocaleString('fr-FR')} FCFA`;
  };

  // Carries the pricing selections over to /checkout so the summary matches.
  const checkoutHref = (plan: string) =>
    `/checkout?plan=${plan}&accounts=${accounts}&billing=${isYearly ? 'yearly' : 'monthly'}&currency=${currency}`;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Pricing Header */}
      <section className="w-full flex flex-col items-center px-4 pt-[80px] md:pt-[120px]">
        {/* Heading + decorative swash */}
        <div className="relative w-full max-w-[920px] text-center">
          <h1 className="text-[#000B33] font-black text-[44px] leading-[52px] md:text-[72px] md:leading-[82px]">
            {t("Pick a plan that's", 'Choisissez le plan')}{' '}
            <span className="relative inline-block">
              <span className="relative z-10">{t('right for you', "qu'il vous faut")}</span>
              {/* Calligraphic swash flourish (Figma: 'Elrotex Swash' glyph) */}
              <svg
                viewBox="0 0 316 71"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-1/2 -translate-x-1/2 bottom-[-22px] w-[105%] h-[44px] z-0 pointer-events-none"
                style={{ transform: 'translateX(-50%) rotate(0.86deg)' }}
                aria-hidden="true"
              >
                {/* Tapered main sweep with a curled hook at the right */}
                <path
                  d="M8 50
                     C 80 26, 190 14, 280 22
                     C 304 26, 316 38, 304 47
                     C 296 53, 278 53, 264 49
                     C 190 34, 96 42, 34 58
                     C 18 63, 6 57, 8 50 Z"
                  fill="#184CD1"
                />
                {/* Thin echo stroke below, tapering out */}
                <path
                  d="M 46 64 C 120 52, 220 48, 292 54"
                  stroke="#184CD1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-[416px] text-center text-[16px] leading-[26px] text-[#0D0303] mt-[22px]">
          {t(
            'Pricing plans for businesses at every stage of growth. Try our risk-free for 14 days. No credit card required.',
            'Des tarifs adaptés aux entreprises à chaque étape de leur croissance. Essayez sans risque pendant 14 jours. Aucune carte bancaire requise.'
          )}
        </p>

        {/* Billing cycle toggle + currency dropdown */}
        <div className="relative w-full flex flex-col items-center gap-[24px] mt-[56px]">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`h-[53px] px-[45px] rounded-l-[5px] rounded-r-none text-[21px] leading-[32px] transition-colors ${
              !isYearly
                ? 'bg-[#184CD1] text-white'
                : 'bg-white text-black border border-black border-r-0'
            }`}
          >
            {t('Monthly', 'Mensuel')}
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`h-[53px] pl-[28px] pr-[14px] rounded-r-[5px] rounded-l-none text-[21px] leading-[32px] flex items-center gap-[17px] transition-colors ${
              isYearly
                ? 'bg-[#184CD1] text-white'
                : 'bg-white text-black border border-black border-l-0'
            }`}
          >
            {t('Yearly', 'Annuel')}
            <span className={`rounded-[5px] px-[14px] py-[2px] text-[16px] leading-[28px] transition-colors ${
              isYearly ? 'bg-white text-[#184CD1]' : 'bg-[#184CD1] text-white'
            }`}>
              -20%
            </span>
          </button>
        </div>

        {/* Currency dropdown — sits on the right of the toggle row on desktop */}
        <div className="lg:absolute lg:right-[6%] lg:mr-[108px] lg:top-1/2 lg:-translate-y-1/2">
          {currencyOpen && (
            <div className="fixed inset-0 z-10" onClick={() => setCurrencyOpen(false)} aria-hidden="true" />
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={currencyOpen}
              aria-label={t('Currency', 'Devise')}
              className="w-[134px] h-[51px] bg-white border border-black/50 rounded-[10px] flex items-center justify-center gap-[10px] font-medium text-[24px] leading-[28px] text-black"
            >
              {currency}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform ${currencyOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path d="M6 9L12 15L18 9" stroke="#171717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {currencyOpen && (
              <ul
                role="listbox"
                className="absolute top-full left-0 mt-[6px] w-[134px] bg-white border border-black/50 rounded-[10px] overflow-hidden z-20 shadow-[0px_10px_40px_rgba(0,0,0,0.08)]"
              >
                {CURRENCIES.map((c) => (
                  <li key={c} role="option" aria-selected={c === currency}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className="w-full h-[44px] font-medium text-[20px] leading-[28px] text-center text-black"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative w-full flex justify-center px-4 mt-[64px] lg:mt-[100px] pb-[60px]">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-[36px]">
          <PlanCard
            badge={t('FREE', 'Gratuit')}
            description={t(
              'Connect up to 02 channels',
              'Connecter jusqu’a 02 canaux'
            )}
            price={planPrice(0)}
            perLabel={t('per month', 'par mois')}
            features={[
              { label: t('10 scheduled posts per channel recharge anytime', '10 publications programmées par canal rechargez à tout moment'), state: 'check' },
              { label: t('100 ideas', '100 idées'), state: 'check' },
              { label: t('3 tags', '3 étiquettes'), state: 'check' },
              { label: t('Unlimited drafts', 'Brouillons illimités'), state: 'check' },
              { label: t('Templates', 'Modèles'), state: 'check' },
              { label: t('Board view', 'Vue tableau'), state: 'check' },
              { label: t('1 user account', '1 compte utilisateur·rice'), state: 'check' },
              { label: t('Basic analytics', 'Analyses de base'), state: 'check' },
              { label: t('Community Inbox', 'Boîte de réception communauté'), state: 'check' },
              { label: t('Top-tier customer support', 'Support client de premier ordre'), state: 'check' },
            ]}
            cta={t('Get Started', 'Commencer')}
            ctaHref="/signup"
            soonLabel={t('Coming Soon', 'Bientôt disponible')}
          />
          <PlanCard
            dark
            popularLabel={t('Popular', 'Populaire')}
            badge={t('ESSENTIAL', 'Essentiel')}
            description={t(
              'For professional domain names investors with a big portfolio.',
              'Pour les investisseurs professionnels avec un grand portefeuille.'
            )}
            price={planPrice(1500)}
            perLabel={t('Per member, per Month', 'Par membre, par mois')}
            features={[
              { label: t('Unlimited scheduled posts per channel', 'Publications programmées illimitées par canal'), state: 'check' },
              { label: t('Unlimited ideas', 'Idées illimitées'), state: 'check' },
              { label: t('250 tags', '250 étiquettes'), state: 'check' },
              { label: t('Unlimited drafts', 'Brouillons illimités'), state: 'check' },
              { label: t('Templates', 'Modèles'), state: 'check' },
              { label: t('Board view', 'Vue tableau'), state: 'check' },
              { label: t('1 user account', '1 compte utilisateur·rice'), state: 'check' },
              { label: t('Advanced analytics', 'Analyses avancées'), state: 'check' },
              { label: t('Community Inbox', 'Boîte de réception communauté'), state: 'check' },
              { label: t('Hashtag manager', 'Gestionnaire de hashtags'), state: 'check' },
              { label: t('First comment scheduling', 'Programmation du premier commentaire'), state: 'check' },
              { label: t('Top-tier customer support', 'Support client de premier ordre'), state: 'check' },
            ]}
            cta={t('Get Started', 'Commencer')}
            ctaHref={checkoutHref('ESSENTIEL')}
            soonLabel={t('Coming Soon', 'Bientôt disponible')}
          />
          <PlanCard
            badge={t('ADVANCED', 'AVANCÉ')}
            description={t(
              'For all individuals and starters who want to start with domaining.',
              'Pour tous les particuliers et débutants qui veulent se lancer.'
            )}
            price={planPrice(5000)}
            perLabel={t('Per member, per Month', 'Par membre, par mois')}
            features={[
              { label: t('Unlimited scheduled posts per channel', 'Publications programmées illimitées par canal'), state: 'check' },
              { label: t('Unlimited ideas', 'Idées illimitées'), state: 'check' },
              { label: t('250 tags', '250 étiquettes'), state: 'check' },
              { label: t('Unlimited drafts', 'Brouillons illimités'), state: 'check' },
              { label: t('Templates', 'Modèles'), state: 'check' },
              { label: t('Board view', 'Vue tableau'), state: 'check' },
              { label: t('1 user account', '1 compte utilisateur·rice'), state: 'check' },
              { label: t('Advanced analytics', 'Analyses avancées'), state: 'check' },
              { label: t('Community Inbox', 'Boîte de réception communauté'), state: 'check' },
              { label: t('Hashtag manager', 'Gestionnaire de hashtags'), state: 'check' },
              { label: t('First comment scheduling', 'Programmation du premier commentaire'), state: 'check' },
              { label: t('Top-tier customer support', 'Support client de premier ordre'), state: 'check' },
            ]}
            cta={t('Get Started', 'Commencer')}
            ctaHref={checkoutHref('AVANCE')}
            soonLabel={t('Coming Soon', 'Bientôt disponible')}
          />

        </div>

        {/* Social accounts stepper — floats above the cards on the right; prices scale with the count */}
        <div className="flex flex-col items-center gap-[20px] mt-[40px] lg:mt-0 lg:absolute lg:right-[6%] lg:mr-[108px] lg:-top-[320px]">
          <h3 className="text-[#000B33] font-semibold text-[18px] leading-[24px] text-center">
            {t('Social accounts', 'Comptes sociaux')}
          </h3>
          <div className="flex items-center gap-[16px]">
            <button
              type="button"
              onClick={() => setAccounts((n) => Math.max(1, n - 1))}
              disabled={accounts <= 1}
              aria-label={t('Remove a social account', 'Retirer un compte social')}
              className="w-[40px] h-[40px] rounded-full bg-white border border-black text-black text-[22px] leading-none flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="min-w-[48px] text-center text-[#000B33] font-semibold text-[36px] leading-[40px]">
              {accounts}
            </span>
            <button
              type="button"
              onClick={() => setAccounts((n) => Math.min(50, n + 1))}
              aria-label={t('Add a social account', 'Ajouter un compte social')}
              className="w-[40px] h-[40px] rounded-full bg-[#184CD1] text-white text-[22px] leading-none flex items-center justify-center transition-colors hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Plan comparison table */}
      <section className="w-full flex justify-center px-4 pb-[64px]">
        <div className="w-full max-w-[1500px] overflow-x-auto">
          <div className="min-w-[1000px]">
            <h2 className="text-black font-bold text-[48px] leading-[57px] mb-[20px]">
              {t('Comparison', 'Comparaison')}
            </h2>

            {/* Plan name headers */}
            <div className="grid grid-cols-[minmax(280px,1fr)_300px_300px_300px] gap-x-[38px] items-end pb-[18px]">
              <div />
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Free', 'Gratuit')}</div>
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Essential', 'Essentiel')}</div>
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Enterprise plan', 'Entreprise')}</div>
            </div>

            {/* Bordered table */}
            <div className="bg-white border border-black/50 rounded-[10px] overflow-hidden">
              {/* Blue header bar */}
              <div className="bg-[#174CD2] rounded-t-[10px] h-[103px] flex items-center px-[27px]">
                <span className="text-white font-medium text-[24px] leading-[29px]">
                  {t('Content creation', 'Création de contenu')}
                </span>
              </div>

              {/* Feature rows */}
              {([
                {
                  name: t('Ideas', 'Idées'),
                  desc: t('Capture and store your content ideas as soon as they come to you.', 'Capturez et stockez vos idées de contenu dès qu’elles vous viennent.'),
                  values: [t('100 ideas', '100 idées'), t('Unlimited', 'Illimité'), t('Unlimited', 'Illimité')],
                },
                {
                  name: t('Tags', 'Étiquettes'),
                  desc: t('Save and organize your content by campaign or theme.', 'Enregistrez et organisez votre contenu par campagne ou par thème.'),
                  values: [t('3 tags', '3 étiquettes'), t('250 tags', '250 étiquettes'), t('250 tags', '250 étiquettes')],
                },
                {
                  name: t('Drafts', 'Brouillons'),
                  desc: t('Capture and store your content ideas as soon as they come to you.', 'Capturez et stockez vos idées de contenu dès qu’elles vous viennent.'),
                  values: [t('Unlimited', 'Illimité'), t('Unlimited', 'Illimité'), t('Unlimited', 'Illimité')],
                },
                {
                  name: t('Templates', 'Modèles'),
                  desc: t('Social post ideas to inspire you', 'Des idées de publications sociales pour vous inspirer'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('AI Assistant', 'AI Assistant'),
                  desc: t('Refine and repurpose your content with AI. Unlimited credits.', 'Peaufinez et réutilisez votre contenu grâce à l’IA. Crédits illimités.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Board view', 'Vue tableau'),
                  desc: t('Organize your ideas in kanban-style columns.', 'Organisez vos idées en colonnes de type kanban.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Browser extension', 'Extension de navigateur'),
                  desc: t('Open EazyPost on any web page and add content directly to your queue.', 'Ouvrez EazyPost sur n’importe quelle page web et ajoutez du contenu directement à votre file d’attente.'),
                  values: ['check', 'check', 'check'],
                },
                { header: t('Publishing', 'Publication') },
                {
                  name: t('Scheduled posts per channel', 'Publications programmées par canal'),
                  desc: t('The number of scheduled posts per channel at any given time.', 'Le nombre de publications programmées par canal à un instant donné.'),
                  values: ['10', t('Unlimited', 'Illimité'), t('Unlimited', 'Illimité')],
                },
                {
                  name: t('Thread posts', 'Publications en fil'),
                  desc: t('Publish threads on X, Bluesky, Threads and Mastodon', 'Publiez des fils sur X, Bluesky, Threads et Mastodon'),
                  values: ['1', t('Unlimited', 'Illimité'), t('Unlimited', 'Illimité')],
                },
                {
                  name: t('Queue', 'File d\'attente'),
                  desc: t('Create a queue of posts you can reorder or shuffle.', 'Créez une file de publications que vous pouvez réorganiser ou mélanger.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Visual content calendar', 'Calendrier visuel de contenu'),
                  desc: t('Visualize your content schedule across weeks or months', 'Visualisez votre programmation de contenu sur plusieurs semaines ou mois'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Reminder notifications', 'Notifications de rappel'),
                  desc: t('Get a mobile notification when it\'s time to publish, to finish your post directly in the app. Available for Instagram, TikTok and YouTube.', 'Recevez une notification mobile au moment de publier pour finaliser votre publication directement dans l’app. Disponible pour Instagram, TikTok et YouTube.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Start Page', 'Start Page'),
                  desc: t('A landing page with links to your content. A Start Page counts as a channel in your plan.', 'Une page d’accueil avec des liens vers votre contenu. Une Start Page compte comme un canal dans votre offre.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Duplicate posts', 'Dupliquer les publications'),
                  desc: t('Clone your posts and reuse them.', 'Clonez vos publications et réutilisez-les.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('Link shortening', 'Raccourcissement de liens'),
                  desc: t('Automatically shorten the links you share.', 'Raccourcissez automatiquement les liens que vous partagez.'),
                  values: ['check', 'check', 'check'],
                },
                {
                  name: t('First comment scheduling', 'Programmation du premier commentaire'),
                  desc: t('Schedule a first comment with your Instagram, Facebook or LinkedIn posts.', 'Programmez un premier commentaire avec vos publications Instagram, Facebook ou LinkedIn.'),
                  values: ['check', 'check', 'check'],
                },
              ] as ComparisonRow[]).map((row) =>
                'header' in row ? (
                  <div key={row.header} className="bg-[#174CD2] rounded-t-[10px] h-[103px] flex items-center px-[27px]">
                    <span className="text-white font-medium text-[24px] leading-[29px]">{row.header}</span>
                  </div>
                ) : (
                  <div
                    key={row.name}
                    className="grid grid-cols-[minmax(280px,1fr)_300px_300px_300px] gap-x-[38px] items-center px-[27px] py-[28px] border-t border-black/10 first:border-t-0"
                  >
                    <div className="pl-[23px]">
                      <h4 className="text-black text-[28px] leading-[33px]">{row.name}</h4>
                      <p className="text-black font-light text-[16px] leading-[19px] mt-[6px] max-w-[371px]">{row.desc}</p>
                    </div>
                    {row.values.map((v, i) => (
                      <div key={i} className="flex justify-center">
                        {v === 'check' ? (
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="✓">
                            <path d="M6 14.5L11.5 20L22 9" stroke="#174CD2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className="text-black text-[24px] leading-[28px] text-center">{v}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Free plan banner */}
      <section className="w-full flex flex-col items-center px-4 pb-[53px]">
        <h2 className="text-[#000B33] font-bold text-[32px] leading-[40px] md:text-[48px] md:leading-[58px] tracking-[-0.5px] text-center">
          {t('Try our 100% free Plan', 'Essayez notre plan 100% gratuit')}
        </h2>
        <div className="w-full max-w-[887px] bg-white rounded-[24px] md:rounded-full border border-black/10 mt-[22px] px-[54px] py-[24px] flex flex-col md:flex-row items-center justify-between gap-[20px]">
          <p className="text-black text-[16px] leading-[26px] text-center md:text-left">
            {t(
              'Get started with our free plan and make 10 lookups per month absolutely free!',
              'Commencez avec notre plan gratuit et effectuez 10 recherches par mois, absolument gratuitement !'
            )}
          </p>
          <Link
            href="/signup"
            className="flex-shrink-0 w-[181px] h-[40px] rounded-[4px] bg-[#184CD1] text-white font-bold text-[16px] leading-[24px] flex items-center justify-center transition-transform hover:scale-[1.03]"
          >
            {t('Get Started', 'Commencer')}
          </Link>
        </div>
      </section>

      {/* Payment methods */}
      <section className="w-full flex flex-col items-center px-4 pb-[64px]">
        <h3 className="text-[#0D0303] text-[25px] leading-[26px] text-center">
          {t('Payment Methods', 'Moyens de paiement')}
        </h3>
        <div className="flex items-center gap-[32px] mt-[36px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-orange.webp" alt="Orange Money" className="h-[45px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-mtn.webp" alt="MTN Mobile Money" className="h-[45px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-mastercard.webp" alt="Mastercard" className="h-[27px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-visa.webp" alt="Visa" className="h-[27px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-paypal.webp" alt="PayPal" className="h-[27px] w-auto" />
        </div>
        <p className="text-[#0D0303] opacity-[0.33] text-[16px] leading-[26px] text-center mt-[26px] max-w-[492px]">
          {t(
            'We accept Orange Money, MTN Mobile Money, Visa, Mastercard and PayPal',
            'Nous acceptons Orange Money, MTN Mobile Money, Visa, Mastercard et PayPal'
          )}
        </p>
      </section>

    </div>
  );
}
