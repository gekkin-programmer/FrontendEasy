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
      <svg width="18" height="18" className="md:w-[22px] md:h-[22px] flex-shrink-0" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8.3" fill="#FF0000" />
        <path d="M8 8L14 14M14 8L8 14" stroke="#FFFFFF" strokeWidth="1.85" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" className="md:w-[22px] md:h-[22px] flex-shrink-0" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      className={`w-full h-full rounded-[9px] px-[20px] md:px-[30px] lg:px-[40px] py-[30px] md:py-[43px] flex flex-col gap-[20px] md:gap-[28px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] ${
        dark ? 'bg-[#184CD1] xl:-translate-y-[71px] pb-[40px] md:pb-[60px]' : 'bg-white'
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
        <p className={`text-[14.77px] leading-[22px] font-light max-w-[320px] ${dark ? 'text-white' : 'text-black'}`}>
          {description}
        </p>
      </div>

      <hr className={`w-full border-t ${dark ? 'border-white opacity-40' : 'border-[#001C80] opacity-30'}`} />

      {/* Price — currency prefix/suffix rendered smaller so long values (e.g. FCFA) stay inside the card */}
      <div className="flex flex-col">
        <span className={`font-semibold tracking-[-0.46px] flex items-baseline flex-wrap gap-x-[6px] ${dark ? 'text-white' : 'text-[#000B33]'}`}>
          {(() => {
            const m = price.match(/^([^\d]*)([\d\s.,]*\d)(.*)$/);
            if (!m) return <span className="text-[40px] sm:text-[48px] md:text-[66px] leading-[48px] sm:leading-[56px] md:leading-[73px]">{price}</span>;
            const [, prefix, number, suffix] = m;
            return (
              <>
                {prefix && <span className="text-[18px] sm:text-[20px] md:text-[28px] leading-[26px] sm:leading-[28px] md:leading-[34px]">{prefix.trim()}</span>}
                <span className="text-[40px] sm:text-[48px] md:text-[66px] leading-[48px] sm:leading-[56px] md:leading-[73px]">{number.trim()}</span>
                {suffix && <span className="text-[18px] sm:text-[20px] md:text-[28px] leading-[26px] sm:leading-[28px] md:leading-[34px]">{suffix.trim()}</span>}
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
      <ul className="flex flex-col gap-[10px] md:gap-[14px]">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-[5px] flex-wrap">
            <FeatureIcon state={f.state} dark={dark} />
            <span className={`text-[12px] md:text-[14.77px] leading-[20px] md:leading-[24px] ${dark ? 'text-white' : 'text-black'}`}>{f.label}</span>
            {f.soon && (
              <span className="bg-[#C9FAD6] text-[#1AA703] rounded-[4px] px-[5px] h-[17px] flex items-center text-[9.2px] whitespace-nowrap">
                {soonLabel}
              </span>
            )}
            <div className="relative group/tooltip flex items-center cursor-help ml-1">
              <svg width="18" height="18" className="md:w-[22px] md:h-[22px] transition-opacity duration-300" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 15V11M11 7H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[12px] w-[min(280px,80vw)] md:w-[min(400px,60vw)] opacity-0 translate-y-[6px] pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:pointer-events-auto transition-all duration-300 ease-out z-50">
                <div className="relative filter drop-shadow-[0px_9px_13px_rgba(0,0,0,0.1)] flex flex-col items-center">
                  <div className="bg-[#FFFDE8] w-full min-h-[54px] flex items-center px-[20px] py-[12px] relative z-10">
                    <p className="font-sans text-[12px] md:text-[15.4px] leading-[16px] md:leading-[18px] text-[#1B1B1B] opacity-80 w-full text-center">
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
  // Below `lg` the comparison table shows one plan's values at a time via tabs,
  // instead of forcing a horizontal scroll across 3 columns.
  const [activePlanIdx, setActivePlanIdx] = useState(0);

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
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Pricing Header */}
      <section className="w-full flex flex-col items-center px-4 pt-[80px] sm:pt-[110px] md:pt-[160px] xl:pt-[217px]">
        {/* Heading + decorative swash */}
        <div className="relative w-full max-w-[920px] text-center">
          <h1 className="text-[28px] leading-[36px] sm:text-[44px] sm:leading-[52px] md:text-[72px] md:leading-[82px] text-[#000B33] font-black">
            {t("Pick a plan that's", 'Choisissez le plan')}{' '}
            <span className="relative inline-block">
              <span className="relative z-10">{t('right for you', "qu'il vous faut")}</span>
              {/* Calligraphic swash flourish (Figma: 'Elrotex Swash' glyph) */}
              <svg
                viewBox="0 0 316 71"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-1/2 -translate-x-1/2 bottom-[-16px] sm:bottom-[-22px] w-[105%] h-[30px] sm:h-[44px] z-0 pointer-events-none"
                style={{ transform: 'translateX(-50%) rotate(0.86deg)' }}
                aria-hidden="true"
              >
                <path
                  d="M8 50
                     C 80 26, 190 14, 280 22
                     C 304 26, 316 38, 304 47
                     C 296 53, 278 53, 264 49
                     C 190 34, 96 42, 34 58
                     C 18 63, 6 57, 8 50 Z"
                  fill="#184CD1"
                />
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
        <p className="max-w-[280px] sm:max-w-[380px] md:max-w-[416px] text-center text-[14px] md:text-[16px] leading-[22px] md:leading-[26px] text-[#0D0303] mt-[18px] sm:mt-[22px]">
          {t(
            'Pricing plans for businesses at every stage of growth. Try our risk-free for 14 days. No credit card required.',
            'Des tarifs adaptés aux entreprises à chaque étape de leur croissance. Essayez sans risque pendant 14 jours. Aucune carte bancaire requise.'
          )}
        </p>

        {/* Billing cycle toggle + currency dropdown — plain flex, no absolute hacks so it holds up at any width */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-[16px] md:gap-[24px] mt-[48px] sm:mt-[60px] md:mt-[80px]">
          <div className="flex items-center flex-nowrap">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`h-[42px] sm:h-[45px] md:h-[53px] px-[16px] sm:px-[20px] md:px-[45px] rounded-l-[5px] rounded-r-none text-[14px] sm:text-[16px] md:text-[21px] leading-[22px] sm:leading-[24px] md:leading-[32px] whitespace-nowrap transition-colors ${
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
              className={`h-[42px] sm:h-[45px] md:h-[53px] pl-[12px] sm:pl-[14px] md:pl-[28px] pr-[8px] sm:pr-[10px] md:pr-[14px] rounded-r-[5px] rounded-l-none text-[14px] sm:text-[16px] md:text-[21px] leading-[22px] sm:leading-[24px] md:leading-[32px] flex items-center gap-[8px] sm:gap-[10px] md:gap-[17px] whitespace-nowrap transition-colors ${
                isYearly
                  ? 'bg-[#184CD1] text-white'
                  : 'bg-white text-black border border-black border-l-0'
              }`}
            >
              {t('Yearly', 'Annuel')}
              <span className={`rounded-[5px] px-[8px] sm:px-[10px] md:px-[14px] py-[2px] text-[11px] sm:text-[12px] md:text-[16px] leading-[18px] sm:leading-[20px] md:leading-[28px] transition-colors ${
                isYearly ? 'bg-white text-[#184CD1]' : 'bg-[#184CD1] text-white'
              }`}>
                -20%
              </span>
            </button>
          </div>

          {/* Currency dropdown */}
          <div className="relative">
            {currencyOpen && (
              <div className="fixed inset-0 z-10" onClick={() => setCurrencyOpen(false)} aria-hidden="true" />
            )}
            <div className="relative z-30">
              <button
                type="button"
                onClick={() => setCurrencyOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={currencyOpen}
                aria-label={t('Currency', 'Devise')}
                className="w-[100px] md:w-[134px] h-[42px] sm:h-[45px] md:h-[51px] bg-white border border-black/50 rounded-[10px] flex items-center justify-center gap-[10px] font-medium text-[16px] sm:text-[18px] md:text-[24px] leading-[24px] md:leading-[28px] text-black"
              >
                {currency}
                <svg
                  width="20"
                  height="20"
                  className="md:w-[24px] md:h-[24px] transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 9L12 15L18 9" stroke="#171717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {currencyOpen && (
                <ul
                  role="listbox"
                  className="absolute top-full left-0 mt-[6px] w-[100px] md:w-[134px] bg-white border border-black/50 rounded-[10px] overflow-hidden z-30 shadow-[0px_10px_40px_rgba(0,0,0,0.08)]"
                >
                  {CURRENCIES.map((c) => (
                    <li key={c} role="option" aria-selected={c === currency}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrency(c);
                          setCurrencyOpen(false);
                        }}
                        className="w-full h-[44px] font-medium text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] text-center text-black"
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

      {/* Pricing Cards + Social accounts stepper — flex layout that adapts at every width instead of a fixed absolute offset */}
      <section className="relative w-full flex flex-col items-center px-4 mt-[48px] md:mt-[80px] pb-[40px] md:pb-[60px]">
        <div className="w-full max-w-[1320px] mx-auto flex flex-col xl:flex-row xl:items-start gap-[32px] xl:gap-[28px]">
          {/* Stepper: sits above the cards on mobile/tablet, as a side column on xl+ */}
          <div className="order-1 xl:order-2 flex flex-col items-center gap-[16px] xl:w-[170px] xl:pt-[8px] xl:flex-shrink-0">
            <h3 className="text-[#000B33] font-semibold text-[16px] md:text-[18px] leading-[22px] md:leading-[24px] text-center">
              {t('Social accounts', 'Comptes sociaux')}
            </h3>
            <div className="flex items-center justify-center gap-[16px]">
              <button
                type="button"
                onClick={() => setAccounts((n) => Math.max(1, n - 1))}
                disabled={accounts <= 1}
                aria-label={t('Remove a social account', 'Retirer un compte social')}
                className="w-[44px] h-[44px] xl:w-[40px] xl:h-[40px] rounded-full bg-white border border-black text-black text-[22px] leading-none flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="min-w-[44px] text-center text-[#000B33] font-semibold text-[26px] xl:text-[32px] leading-[34px] xl:leading-[38px]">
                {accounts}
              </span>
              <button
                type="button"
                onClick={() => setAccounts((n) => Math.min(50, n + 1))}
                aria-label={t('Add a social account', 'Ajouter un compte social')}
                className="w-[44px] h-[44px] xl:w-[40px] xl:h-[40px] rounded-full bg-[#184CD1] text-white text-[22px] leading-none flex items-center justify-center transition-colors hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Cards: 1 col mobile → 2 cols tablet → 3 cols desktop, via CSS grid instead of flex-wrap */}
          <div className="order-2 xl:order-1 flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[24px] md:gap-[32px] items-stretch">
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
            {/* Wrapped so it can span both columns and center itself in the 2-col tablet layout,
                then fall back to a normal single column once we hit the 3-col desktop layout */}
            <div className="sm:col-span-2 sm:max-w-[420px] sm:mx-auto xl:col-span-1 xl:max-w-none xl:mx-0 w-full">
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
          </div>
        </div>
      </section>

      {/* Plan comparison table - CENTRÉ */}
      <section className="w-full flex justify-center px-4 pb-[60px] md:pb-[140px]">
        <div className="w-full max-w-[1500px] mx-auto">
          <div className="w-full">
            <h2 className="text-black font-bold text-[28px] sm:text-[32px] md:text-[48px] leading-[36px] sm:leading-[40px] md:leading-[57px] mb-[20px] text-center md:text-left">
              {t('Comparison', 'Comparaison')}
            </h2>

            {/* Plan name headers — full 3-column row, desktop only (lg+) */}
            <div className="hidden lg:grid grid-cols-[minmax(280px,1fr)_300px_300px_300px] gap-x-[38px] items-end pb-[18px]">
              <div />
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Free', 'Gratuit')}</div>
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Essential', 'Essentiel')}</div>
              <div className="text-black font-medium text-[24px] leading-[29px] text-center">{t('Enterprise plan', 'Entreprise')}</div>
            </div>

            {/* Plan tabs — mobile/tablet only, replaces the 3-column header + lets you pick which
                plan's values show next to each feature, instead of scrolling sideways */}
            <div className="lg:hidden flex items-center justify-center gap-[8px] mb-[18px]">
              {[t('Free', 'Gratuit'), t('Essential', 'Essentiel'), t('Enterprise plan', 'Entreprise')].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActivePlanIdx(i)}
                  aria-pressed={activePlanIdx === i}
                  className={`px-[14px] sm:px-[18px] h-[38px] sm:h-[42px] rounded-full border-2 border-black text-[13px] sm:text-[14px] font-semibold whitespace-nowrap transition-colors ${
                    activePlanIdx === i ? 'bg-[#184CD1] text-white border-[#184CD1]' : 'bg-white text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Bordered table */}
            <div className="bg-white border border-black/50 rounded-[10px] overflow-hidden">
              {/* Blue header bar */}
              <div className="bg-[#174CD2] rounded-t-[10px] h-[60px] md:h-[80px] lg:h-[103px] flex items-center px-[12px] md:px-[20px] lg:px-[27px]">
                <span className="text-white font-medium text-[16px] md:text-[20px] lg:text-[24px] leading-[20px] md:leading-[29px]">
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
                  <div key={row.header} className="bg-[#174CD2] rounded-t-[10px] h-[60px] md:h-[80px] lg:h-[103px] flex items-center px-[12px] md:px-[20px] lg:px-[27px]">
                    <span className="text-white font-medium text-[16px] md:text-[20px] lg:text-[24px] leading-[20px] md:leading-[29px]">{row.header}</span>
                  </div>
                ) : (
                  <div
                    key={row.name}
                    className="grid grid-cols-[minmax(0,1fr)_90px] sm:grid-cols-[minmax(0,1fr)_120px] md:grid-cols-[minmax(0,1fr)_150px] lg:grid-cols-[minmax(280px,1fr)_300px_300px_300px] gap-x-[10px] sm:gap-x-[16px] md:gap-x-[24px] lg:gap-x-[38px] items-center px-[12px] md:px-[20px] lg:px-[27px] py-[14px] md:py-[20px] lg:py-[28px] border-t border-black/10 first:border-t-0"
                  >
                    <div className="pl-[8px] md:pl-[16px] lg:pl-[23px]">
                      <h4 className="text-black text-[16px] md:text-[22px] lg:text-[28px] leading-[20px] md:leading-[33px]">{row.name}</h4>
                      <p className="text-black font-light text-[11px] md:text-[14px] lg:text-[16px] leading-[14px] md:leading-[19px] mt-[3px] md:mt-[6px] max-w-[371px]">{row.desc}</p>
                    </div>
                    {row.values.map((v, i) => (
                      <div
                        key={i}
                        className={`justify-center ${i === activePlanIdx ? 'flex' : 'hidden'} lg:flex`}
                      >
                        {v === 'check' ? (
                          <svg width="18" height="18" className="md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="✓">
                            <path d="M6 14.5L11.5 20L22 9" stroke="#174CD2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className="text-black text-[13px] sm:text-[14px] md:text-[20px] lg:text-[24px] leading-[18px] md:leading-[28px] text-center">{v}</span>
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
      <section className="w-full flex flex-col items-center px-4 pb-[40px] md:pb-[53px]">
        <h2 className="text-[#000B33] font-bold text-[22px] sm:text-[24px] md:text-[48px] leading-[30px] sm:leading-[32px] md:leading-[58px] tracking-[-0.5px] text-center">
          {t('Try our 100% free Plan', 'Essayez notre plan 100% gratuit')}
        </h2>
        <div className="w-full max-w-[887px] bg-white rounded-[24px] md:rounded-full border border-black/10 mt-[22px] px-[20px] md:px-[54px] py-[20px] md:py-[24px] flex flex-col md:flex-row items-center justify-between gap-[16px] md:gap-[20px]">
          <p className="text-black text-[14px] md:text-[16px] leading-[22px] md:leading-[26px] text-center md:text-left">
            {t(
              'Get started with our free plan and make 10 lookups per month absolutely free!',
              'Commencez avec notre plan gratuit et effectuez 10 recherches par mois, absolument gratuitement !'
            )}
          </p>
          <Link
            href="/signup"
            className="flex-shrink-0 w-full md:w-[181px] h-[40px] rounded-[4px] bg-[#184CD1] text-white font-bold text-[16px] leading-[24px] flex items-center justify-center transition-transform hover:scale-[1.03]"
          >
            {t('Get Started', 'Commencer')}
          </Link>
        </div>
      </section>

      {/* Payment methods */}
      <section className="w-full flex flex-col items-center px-4 pb-[60px] md:pb-[140px]">
        <h3 className="text-[#0D0303] text-[18px] sm:text-[20px] md:text-[25px] leading-[24px] sm:leading-[26px] text-center">
          {t('Payment Methods', 'Moyens de paiement')}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-x-[20px] gap-y-[16px] md:gap-x-[32px] md:gap-y-[20px] mt-[24px] md:mt-[36px] max-w-[320px] md:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-orange.webp" alt="Orange Money" className="h-[26px] sm:h-[30px] lg:h-[45px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-mtn.webp" alt="MTN Mobile Money" className="h-[26px] sm:h-[30px] lg:h-[45px] w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-mastercard.webp" alt="Mastercard" className="h-[26px] sm:h-[30px] lg:h-[45px] w-auto object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-visa.webp" alt="Visa" className="h-[26px] sm:h-[30px] lg:h-[45px] w-auto object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pay-paypal.webp" alt="PayPal" className="h-[26px] sm:h-[30px] lg:h-[45px] w-auto object-contain" />
        </div>
        <p className="text-[#0D0303] opacity-[0.33] text-[13px] sm:text-[14px] md:text-[16px] leading-[20px] sm:leading-[22px] md:leading-[26px] text-center mt-[20px] md:mt-[26px] max-w-[280px] md:max-w-[492px]">
          {t(
            'We accept Orange Money, MTN Mobile Money, Visa, Mastercard and PayPal',
            'Nous acceptons Orange Money, MTN Mobile Money, Visa, Mastercard et PayPal'
          )}
        </p>
      </section>

    </div>
  );
}