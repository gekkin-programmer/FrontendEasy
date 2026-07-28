'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/context/LanguageContext';

// Section palette from the Figma spec, ink swapped for the brand navy
const INK = '#040028';
const LIME = '#D2E823';
const PINK = '#E9C0E9';
const PURPLE = '#502274';
const BLUE = '#061492';
const MAROON = '#780016';
// User feedback: former #F3F3F1 sections are pure white
const GREY = '#FFFFFF';

function PillCta({
  label,
  href,
  bg,
  color,
}: {
  label: string;
  href: string;
  bg: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center h-[62px] px-[30px] rounded-full font-extrabold text-[14px] leading-[24px] tracking-[0.16px] transition-transform hover:scale-[1.03]"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </Link>
  );
}

function PlanChips({ plans, color }: { plans: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {plans.map((p) => (
        <span
          key={p}
          className="h-[37px] px-[15px] rounded-full border flex items-center text-[13px] leading-[20px] tracking-[0.13px]"
          style={{ borderColor: color, color }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

// Trustpilot-style rating row: 4.5 green star tiles + official wordmark
function RatingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-[16px]">
      <span className="text-[17px] leading-[18px] font-medium text-[#191919]">{label}</span>
      <div className="flex gap-[2px]">
        {[1, 1, 1, 1, 0.9].map((fill, i) => (
          <span key={i} className="relative w-[18px] h-[18px] bg-[#DCDCE6] overflow-hidden">
            <span className="absolute inset-y-0 left-0 bg-[#00B67A]" style={{ width: `${fill * 100}%` }} />
            <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full" aria-hidden="true">
              <path
                d="M12 3.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8-5.2-2.9-5.2 2.9 1.2-5.8-4.4-4 5.9-.7L12 3.6z"
                fill="#FFFFFF"
              />
            </svg>
          </span>
        ))}
      </div>
      <svg width="72" height="18" viewBox="0 0 72 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Trustpilot">
        <g clipPath="url(#tp-clip)">
          <path d="M18.9126 6.32178H26.1899V7.67189H23.3285V15.2616H21.755V7.67189H18.9062V6.32178H18.9126ZM25.879 8.78858H27.224V10.0378H27.2494C27.2938 9.8611 27.3763 9.69076 27.4969 9.52673C27.6174 9.36269 27.7633 9.20497 27.9346 9.07248C28.106 8.93368 28.2963 8.82643 28.5057 8.73811C28.715 8.65609 28.9308 8.61193 29.1465 8.61193C29.3114 8.61193 29.432 8.61824 29.4954 8.62455C29.5589 8.63085 29.6223 8.64347 29.6921 8.64978V10.0251C29.5906 10.0062 29.4891 9.99359 29.3812 9.98097C29.2734 9.96835 29.1718 9.96204 29.0703 9.96204C28.8292 9.96204 28.6008 10.0125 28.3851 10.1072C28.1694 10.2018 27.9854 10.3469 27.8268 10.5299C27.6682 10.7191 27.5413 10.9462 27.4461 11.2238C27.3509 11.5014 27.3065 11.8169 27.3065 12.1765V15.2553H25.8726V8.78858L25.879 8.78858ZM36.2842 15.2616H34.8757V14.3594H34.8503C34.6726 14.6874 34.4125 14.9461 34.0635 15.1417C33.7146 15.3373 33.3593 15.4382 32.9977 15.4382C32.1411 15.4382 31.5194 15.23 31.1387 14.8073C30.758 14.3846 30.5677 13.7474 30.5677 12.8957V8.78858H32.0015V12.7569C32.0015 13.3247 32.1094 13.7285 32.3315 13.9619C32.5472 14.1954 32.8581 14.3152 33.2514 14.3152C33.556 14.3152 33.8034 14.2711 34.0064 14.1764C34.2095 14.0818 34.3744 13.9619 34.495 13.8042C34.6219 13.6528 34.7107 13.4635 34.7678 13.249C34.8249 13.0345 34.8503 12.8011 34.8503 12.5487V8.79489H36.2842V15.2616ZM38.7268 13.1859C38.7713 13.6023 38.9299 13.8925 39.2027 14.0629C39.4819 14.2269 39.8118 14.3152 40.1988 14.3152C40.332 14.3152 40.4843 14.3026 40.6556 14.2837C40.8269 14.2647 40.9919 14.2206 41.1378 14.1638C41.2901 14.107 41.4106 14.0187 41.5121 13.9051C41.6073 13.7916 41.6517 13.6465 41.6454 13.4635C41.639 13.2806 41.5692 13.1291 41.4423 13.0156C41.3155 12.8957 41.1568 12.8074 40.9602 12.7317C40.7635 12.6623 40.5414 12.5992 40.2876 12.5487C40.0338 12.4982 39.7801 12.4415 39.5199 12.3847C39.2535 12.3279 38.9933 12.2522 38.7459 12.1702C38.4984 12.0882 38.2764 11.9746 38.0797 11.8295C37.883 11.6907 37.7244 11.5077 37.6102 11.2869C37.4896 11.0661 37.4325 10.7948 37.4325 10.4668C37.4325 10.1135 37.5214 9.82325 37.6927 9.58351C37.864 9.34377 38.086 9.1545 38.3462 9.00939C38.6126 8.86429 38.9045 8.76334 39.2281 8.70025C39.5516 8.64347 39.8625 8.61193 40.1544 8.61193C40.4907 8.61193 40.8142 8.64978 41.1188 8.71918C41.4233 8.78858 41.7025 8.90214 41.9499 9.06617C42.1974 9.2239 42.4004 9.43209 42.5653 9.68445C42.7303 9.93681 42.8318 10.2459 42.8762 10.6056H41.3789C41.3091 10.2649 41.1568 10.0314 40.9094 9.91788C40.662 9.79801 40.3764 9.74123 40.0592 9.74123C39.9577 9.74123 39.8372 9.74754 39.6976 9.76647C39.558 9.78539 39.4311 9.81694 39.3042 9.8611C39.1837 9.90526 39.0821 9.97466 38.9933 10.063C38.9108 10.1513 38.8664 10.2649 38.8664 10.41C38.8664 10.5866 38.9299 10.7254 39.0504 10.8327C39.171 10.9399 39.3296 11.0283 39.5263 11.104C39.7229 11.1734 39.945 11.2365 40.1988 11.2869C40.4526 11.3374 40.7127 11.3942 40.9792 11.451C41.2393 11.5077 41.4931 11.5834 41.7469 11.6655C42.0007 11.7475 42.2227 11.861 42.4194 12.0061C42.6161 12.1512 42.7747 12.3279 42.8953 12.5424C43.0158 12.7569 43.0793 13.0282 43.0793 13.3436C43.0793 13.7285 42.9904 14.0502 42.8128 14.3215C42.6351 14.5865 42.4067 14.8073 42.1276 14.9714C41.8484 15.1354 41.5312 15.2616 41.1886 15.3373C40.846 15.413 40.5033 15.4508 40.1671 15.4508C39.7547 15.4508 39.374 15.4067 39.025 15.312C38.6761 15.2174 38.3715 15.0786 38.1178 14.8956C37.864 14.7064 37.6609 14.4729 37.515 14.1954C37.3691 13.9178 37.293 13.5834 37.2803 13.1985H38.7268V13.1859ZM43.4599 8.78858H44.5449V6.84542H45.9787V8.78858H47.2731V9.85479H45.9787V13.3121C45.9787 13.4635 45.9851 13.5897 45.9978 13.7033C46.0105 13.8105 46.0422 13.9051 46.0866 13.9808C46.131 14.0566 46.2008 14.1133 46.296 14.1512C46.3911 14.189 46.5117 14.208 46.6767 14.208C46.7782 14.208 46.8797 14.208 46.9812 14.2017C47.0827 14.1954 47.1842 14.1827 47.2857 14.1575V15.2616C47.1271 15.2805 46.9685 15.2931 46.8226 15.312C46.6703 15.331 46.518 15.3373 46.3594 15.3373C45.9787 15.3373 45.6742 15.2994 45.4458 15.23C45.2174 15.1606 45.0334 15.0534 44.9065 14.9146C44.7733 14.7758 44.6908 14.6054 44.64 14.3972C44.5956 14.189 44.5639 13.9493 44.5576 13.6843V9.86741H43.4726V8.78858H43.4599ZM48.2882 8.78858H49.6459V9.66552H49.6713C49.8743 9.28699 50.1535 9.02201 50.5152 8.85798C50.8768 8.69394 51.2638 8.61193 51.6889 8.61193C52.2028 8.61193 52.6469 8.70025 53.0276 8.88321C53.4083 9.05986 53.7255 9.30591 53.9793 9.62136C54.2331 9.93681 54.4171 10.3027 54.544 10.7191C54.6709 11.1355 54.7343 11.5834 54.7343 12.0566C54.7343 12.4919 54.6772 12.9146 54.563 13.3184C54.4488 13.7285 54.2775 14.0881 54.0491 14.4035C53.8207 14.719 53.5288 14.965 53.1735 15.1543C52.8183 15.3436 52.4058 15.4382 51.9237 15.4382C51.7143 15.4382 51.5049 15.4193 51.2955 15.3814C51.0862 15.3436 50.8831 15.2805 50.6928 15.1985C50.5025 15.1165 50.3185 15.0092 50.1599 14.8767C49.9949 14.7442 49.8617 14.5928 49.7475 14.4225H49.7221V17.6527H48.2882V8.78858ZM53.3004 12.0314C53.3004 11.7412 53.2624 11.4573 53.1862 11.1797C53.1101 10.9021 52.9959 10.6623 52.8436 10.4478C52.6914 10.2333 52.501 10.063 52.279 9.93681C52.0505 9.81063 51.7904 9.74123 51.4986 9.74123C50.8958 9.74123 50.439 9.94943 50.1345 10.3658C49.8299 10.7822 49.6777 11.3374 49.6777 12.0314C49.6777 12.3594 49.7157 12.6623 49.7982 12.9399C49.8807 13.2175 49.9949 13.4572 50.1599 13.6591C50.3185 13.861 50.5088 14.0187 50.7309 14.1323C50.9529 14.2521 51.2131 14.3089 51.5049 14.3089C51.8348 14.3089 52.1077 14.2395 52.3361 14.107C52.5645 13.9745 52.7485 13.7979 52.8944 13.5897C53.0403 13.3752 53.1482 13.1354 53.2116 12.8642C53.2687 12.5929 53.3004 12.3153 53.3004 12.0314ZM55.8319 6.32178H57.2658V7.67189H55.8319V6.32178ZM55.8319 8.78858H57.2658V15.2616H55.8319V8.78858ZM58.5474 6.32178H59.9813V15.2616H58.5474V6.32178ZM64.3781 15.4382C63.8579 15.4382 63.3947 15.3499 62.9887 15.1795C62.5826 15.0092 62.24 14.7695 61.9545 14.4729C61.6753 14.1701 61.4596 13.8105 61.3137 13.3941C61.1678 12.9777 61.0916 12.5172 61.0916 12.0188C61.0916 11.5267 61.1678 11.0724 61.3137 10.656C61.4596 10.2396 61.6753 9.88003 61.9545 9.5772C62.2337 9.27437 62.5826 9.04094 62.9887 8.87059C63.3947 8.70025 63.8579 8.61193 64.3781 8.61193C64.8984 8.61193 65.3616 8.70025 65.7676 8.87059C66.1737 9.04094 66.5163 9.28068 66.8018 9.5772C67.081 9.88003 67.2967 10.2396 67.4426 10.656C67.5885 11.0724 67.6647 11.5267 67.6647 12.0188C67.6647 12.5172 67.5885 12.9777 67.4426 13.3941C67.2967 13.8105 67.081 14.1701 66.8018 14.4729C66.5226 14.7758 66.1737 15.0092 65.7676 15.1795C65.3616 15.3499 64.8984 15.4382 64.3781 15.4382ZM64.3781 14.3089C64.6954 14.3089 64.9745 14.2395 65.2093 14.107C65.444 13.9745 65.6344 13.7979 65.7867 13.5834C65.9389 13.3689 66.0468 13.1228 66.1229 12.8515C66.1927 12.5803 66.2308 12.3027 66.2308 12.0188C66.2308 11.7412 66.1927 11.4699 66.1229 11.1923C66.0531 10.9147 65.9389 10.675 65.7867 10.4605C65.6344 10.2459 65.444 10.0756 65.2093 9.94312C64.9745 9.81063 64.6954 9.74123 64.3781 9.74123C64.0609 9.74123 63.7818 9.81063 63.547 9.94312C63.3123 10.0756 63.1219 10.2523 62.9696 10.4605C62.8174 10.675 62.7095 10.9147 62.6334 11.1923C62.5636 11.4699 62.5255 11.7412 62.5255 12.0188C62.5255 12.3027 62.5636 12.5803 62.6334 12.8515C62.7032 13.1228 62.8174 13.3689 62.9696 13.5834C63.1219 13.7979 63.3123 13.9745 63.547 14.107C63.7818 14.2458 64.0609 14.3089 64.3781 14.3089ZM68.0834 8.78858H69.1683V6.84542H70.6022V8.78858H71.8965V9.85479H70.6022V13.3121C70.6022 13.4635 70.6086 13.5897 70.6213 13.7033C70.6339 13.8105 70.6657 13.9051 70.7101 13.9808C70.7545 14.0566 70.8243 14.1133 70.9194 14.1512C71.0146 14.189 71.1352 14.208 71.3001 14.208C71.4016 14.208 71.5032 14.208 71.6047 14.2017C71.7062 14.1954 71.8077 14.1827 71.9092 14.1575V15.2616C71.7506 15.2805 71.592 15.2931 71.4461 15.312C71.2938 15.331 71.1415 15.3373 70.9829 15.3373C70.6022 15.3373 70.2977 15.2994 70.0693 15.23C69.8409 15.1606 69.6569 15.0534 69.53 14.9146C69.3967 14.7758 69.3143 14.6054 69.2635 14.3972C69.2191 14.189 69.1874 13.9493 69.181 13.6843V9.86741H68.0961V8.78858L68.0834 8.78858Z" fill="#191919" />
          <path d="M17.2364 6.3217H10.6634L8.63309 0.101074L6.59647 6.3217L0.0234375 6.31539L5.34657 10.1639L3.30995 16.3782L8.63309 12.536L13.9499 16.3782L11.9196 10.1639L17.2364 6.3217Z" fill="#00B67A" />
          <path d="M12.3761 11.5707L11.9193 10.1638L8.63281 12.536L12.3761 11.5707Z" fill="#005128" />
        </g>
        <defs>
          <clipPath id="tp-clip">
            <rect width="72" height="17.7031" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

// Alternating text/image band (Figma: 1344px row, 56px heading, pill CTA)
function SplitSection({
  bg,
  titleColor,
  textColor,
  title,
  text,
  ctaLabel,
  ctaHref,
  ctaBg,
  ctaColor,
  image,
  imageAlt,
  imageLeft = false,
}: {
  bg: string;
  titleColor: string;
  textColor: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  ctaBg: string;
  ctaColor: string;
  image: string;
  imageAlt: string;
  imageLeft?: boolean;
}) {
  return (
    <section className="w-full" style={{ backgroundColor: bg }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] py-[100px] lg:py-[128px]">
        <div className={`flex flex-col ${imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-[48px] lg:gap-[80px]`}>
          <div className="flex-1 max-w-[664px] flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2
              className="font-extrabold text-[40px] leading-[44px] lg:text-[56px] lg:leading-[59px] tracking-[-1.12px]"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
            <p className="mt-[40px] font-medium text-[18px] leading-[30px] tracking-[-0.4px] max-w-[577px]" style={{ color: textColor }}>
              {text}
            </p>
            <div className="mt-[46px] flex justify-center lg:justify-start w-full">
              <PillCta label={ctaLabel} href={ctaHref} bg={ctaBg} color={ctaColor} />
            </div>
          </div>
          <div className="flex-1 w-full max-w-[664px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt} className="w-full h-[380px] lg:h-[560px] object-cover rounded-[16px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  bg,
  titleColor,
  textColor,
  chipColor,
  image,
  title,
  text,
  plans,
}: {
  bg: string;
  titleColor: string;
  textColor: string;
  chipColor: string;
  image: string;
  title: string;
  text: string;
  plans: string[];
}) {
  return (
    <div className="rounded-[32px] p-[40px] flex flex-col gap-[40px]" style={{ backgroundColor: bg }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="w-full h-[220px] object-cover rounded-[16px]" />
      <div className="flex flex-col gap-[20px]">
        <h3 className="font-extrabold text-[26px] leading-[36px] tracking-[-0.28px]" style={{ color: titleColor }}>
          {title}
        </h3>
        <p className="font-medium text-[18px] leading-[30px] tracking-[-0.4px]" style={{ color: textColor }}>
          {text}
        </p>
        <PlanChips plans={plans} color={chipColor} />
      </div>
    </div>
  );
}

// Shared landing template for every /canaux/* channel page.
// The channel display name is injected into the headline copy.
export default function ChannelLanding({ channelName }: { channelName: string }) {
  const { t } = useLanguage();

  const planFree = t('Free', 'Gratuit');
  const planEssential = t('Essential', 'Essentiel');
  const planAdvanced = t('Advanced', 'Avancé');
  const startCta = t('Start for free', 'Commencer gratuitement');

  // Creator cards for the marquee strip
  const creators = [
    { img: '/assets/selena.png', handle: '@sarah.creates', bg: MAROON, radius: 'rounded-[16px]' },
    { img: '/assets/rainbow.png', handle: '@blanche.b', bg: PINK, radius: 'rounded-[16px]' },
    { img: '/assets/Sarah.jpg', handle: '@nadia.cuisine', bg: LIME, radius: 'rounded-[64px]' },
    { img: '/assets/Rosine 3.jpg', handle: '@rosine.style', bg: MAROON, radius: 'rounded-full' },
    { img: '/assets/Creatriceee.png', handle: '@lifeofkarl', bg: PINK, radius: 'rounded-[64px]' },
  ];

  return (
    <div className="bg-white font-sans">
      <style>{`
        @keyframes canaux-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="relative z-50 bg-white">
        <Navbar />
      </div>

      {/* Hero — white */}
      <section className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] pt-[100px] pb-[40px] lg:pt-[140px] lg:pb-[150px]">
          <div className="flex flex-col lg:flex-row items-center gap-[48px] lg:gap-[16px]">
           <div className="flex-1 max-w-[664px]flex flex-col items-center lg:items-start text-center lg:text-left">
             <h1 className="font-extrabold text-[42px] leading-[46px] lg:text-[56px] lg:leading-[59px] tracking-[-1.12px] text-[#040028] text-balance">
                {t(
                  'The easiest way to plan and publish on',
                  'La façon la plus simple de planifier et publier sur'
                )} <span className="text-[#061492]">{channelName}</span>
              </h1>
              <p className="mt-[24px] font-medium text-[20px] leading-[30px] tracking-[-0.4px] max-w-[562px] text-[#040028]">
                {t(
                  'Schedule your posts, manage your account and grow your community. Eazlypost brings your whole social presence into one simple place.',
                  'Programmez vos publications, gérez votre compte et développez votre communauté. Eazlypost réunit toute votre présence sociale en un seul endroit.'
                )}
              </p>
              <div className="mt-[42px] flex justify-center lg:justify-start w-full">
                {/* User asked for #040028 text — unreadable on #061492, so white until confirmed */}
                <PillCta label={startCta} href="/signup" bg="#061492" color="#FFFFFF" />
              </div>
            </div>
            <div className="flex-1 w-full max-w-[664px]">
              {/* Figma frame: 664 × 723.66, transparent image — no background card  flex flex-col items-center lg:items-start text-center lg:text-left */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/representations-facebook.png" alt="Eazlypost dashboard" className="w-full h-[420px] lg:h-[724px] object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof + creators marquee — white */}
      <section className="w-full overflow-hidden bg-white">
        <div className="pt-[16px] lg:pt-[40px]">
          <RatingRow label={t('Excellent', 'Excellent')} />
          <h2 className="mt-[36px] text-center font-extrabold text-[38px] leading-[44px] lg:text-[55px] lg:leading-[59px] tracking-[-1.12px]" style={{ color: INK }}>
            {t('Eazlypost is for', 'Eazlypost est fait pour les')}{' '}
            <span className="text-[#2665D6]">{t('creators', 'créateurs')}</span>
          </h2>
        </div>
        <div className="mt-[32px] lg:mt-[48px] pb-[80px] lg:pb-[100px]">
          {/* Marquee left untouched, as requested */}
          <div
            className="flex w-max gap-[16px]"
            style={{ animation: 'canaux-marquee 40s linear infinite' }}
            aria-hidden="true"
          >
            {[...creators, ...creators].map((c, i) => (
              <div key={i} className={`relative w-[316px] h-[400px] overflow-hidden flex-shrink-0 ${c.radius}`} style={{ backgroundColor: c.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute left-[24px] top-[178px] h-[42px] px-[18px] bg-transparent border border-white rounded-full flex items-center text-[15px] text-white">
                  {c.handle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share every kind of content — white, image left */}
      <SplitSection
        bg="#FFFFFF"
        titleColor={INK}
        textColor={INK}
        title={t('Share every kind of content', 'Partagez tous vos formats de contenu')}
        text={t(
          'Photos, videos, Reels, links, events… Prepare everything in advance, preview exactly how it will look, and let Eazlypost publish at the perfect time.',
          'Photos, vidéos, Reels, liens, événements… Préparez tout à l’avance, prévisualisez le rendu exact et laissez Eazlypost publier au moment parfait.'
        )}
        ctaLabel={startCta}
        ctaHref="/signup"
        ctaBg="#184CD1"
        ctaColor="#FFFFFF"
        image="/assets/image-face.png"
        imageAlt="Eazlypost content board"
        imageLeft
      />

      {/* More eyes — blue */}
      <SplitSection
        bg={BLUE}
        titleColor="#FFFFFF"
        textColor="#FFFFFF"
        title={t('Get more eyes on every post', 'Plus de visibilité sur chaque publication')}
        text={t(
          'Publish consistently, at the times your audience is actually online. Consistency is what turns visitors into followers — Eazlypost makes it automatic.',
          'Publiez régulièrement, aux heures où votre audience est vraiment en ligne. C’est la régularité qui transforme les visiteurs en abonnés — Eazlypost la rend automatique.'
        )}
        ctaLabel={startCta}
        ctaHref="/signup"
        ctaBg="#FFFFFF"
        ctaColor="#061492"
        image="/assets/image-face2.png"
        imageAlt="Audience engagement"
      />

      {/* Manage easily — grey, image left */}
      <SplitSection
        bg={GREY}
        titleColor={INK}
        textColor={INK}
        title={t('Manage your Page without the headache', 'Gérez votre Page sans prise de tête')}
        text={t(
          'No more juggling tabs and reminders. Draft, preview, approve and schedule from a single dashboard — no code, no technical skills, just publish and grow.',
          'Fini de jongler entre les onglets et les rappels. Rédigez, prévisualisez, validez et programmez depuis un seul tableau de bord — sans code ni compétences techniques.'
        )}
        ctaLabel={startCta}
        ctaHref="/signup"
        ctaBg="#184CD1"
        ctaColor="#FFFFFF"
        image="/assets/LandingPage.png"
        imageAlt="Eazlypost dashboard"
        imageLeft
      />

      {/* Integrations — brand blue */}
      <SplitSection
        bg={BLUE}
        titleColor="#FFFFFF"
        textColor="#FFFFFF"
        title={t('Connect the tools you already use', 'Connectez les outils que vous utilisez déjà')}
        text={t(
          'Canva, Google Drive, Dropbox and more — bring your designs and files straight into your posts and keep your whole workflow in one powerful place.',
          'Canva, Google Drive, Dropbox et plus encore — importez vos visuels et fichiers directement dans vos publications et gardez tout votre workflow au même endroit.'
        )}
        ctaLabel={t('Explore integrations', 'Découvrir les intégrations')}
        ctaHref="/signup"
        ctaBg="#FFFFFF"
        ctaColor="#061492"
        image="/Image Publier.png"
        imageAlt="Eazlypost integrations"
      />

      {/* Feature grid — grey */}
      <section className="w-full" style={{ backgroundColor: GREY }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] py-[128px]">
          <h2 className="text-center font-extrabold text-[38px] leading-[44px] lg:text-[55px] lg:leading-[59px] tracking-[-1.12px] max-w-[1018px] mx-auto" style={{ color: INK }}>
            {t('Everything you need to grow on', 'Tout ce qu’il faut pour grandir sur')} {channelName}
          </h2>
          <div className="mt-[64px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout1.png"
              title={t('Unlimited posts', 'Publications illimitées')}
              text={t(
                'You have a lot to say — so we don’t cap it. Schedule as many posts per channel as you need.',
                'Vous avez beaucoup à dire — alors pas de limite. Programmez autant de publications par canal que nécessaire.'
              )}
              plans={[planEssential, planAdvanced]}
            />
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout2.png"
              title={t('Video & Reels', 'Vidéo & Reels')}
              text={t(
                'Engage your community with video. Schedule Reels and video posts and control exactly how they display.',
                'Captivez votre communauté avec la vidéo. Programmez vos Reels et vidéos et contrôlez exactement leur affichage.'
              )}
              plans={[planFree, planEssential, planAdvanced]}
            />
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout3.png"
              title={t('Best time to post', 'Meilleur moment pour publier')}
              text={t(
                'Let Eazlypost pick the time slots where your audience is most active, so every post lands when it matters.',
                'Laissez Eazlypost choisir les créneaux où votre audience est la plus active, pour que chaque publication tombe au bon moment.'
              )}
              plans={[planEssential, planAdvanced]}
            />
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout4.png"
              title={t('First comment scheduling', 'Premier commentaire programmé')}
              text={t(
                'Schedule the first comment with your post — perfect for hashtags, links and extra context.',
                'Programmez le premier commentaire avec votre publication — idéal pour les hashtags, les liens et le contexte.'
              )}
              plans={[planEssential, planAdvanced]}
            />
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout5.png"
              title={t('Community inbox', 'Boîte de réception communauté')}
              text={t(
                'Reply to comments and messages from one inbox and never leave your community waiting.',
                'Répondez aux commentaires et messages depuis une seule boîte de réception et ne faites plus attendre votre communauté.'
              )}
              plans={[planFree, planEssential, planAdvanced]}
            />
            <FeatureCard
              bg={LIME}
              titleColor={INK}
              textColor={INK}
              chipColor={INK}
              image="/assets/tout6.png"
              title={t('Analytics', 'Analyses')}
              text={t(
                'See what drives the most engagement in real time and understand your audience with powerful insights.',
                'Voyez en temps réel ce qui génère le plus d’engagement et comprenez votre audience grâce à des analyses puissantes.'
              )}
              plans={[planEssential, planAdvanced]}
            />
          </div>
        </div>
      </section>

      {/* Testimonial — grey */}
      <section className="w-full" style={{ backgroundColor: GREY }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] pb-[128px] flex flex-col items-center gap-[64px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/influence.png" alt="" className="w-full max-w-[830px] h-[300px] lg:h-[420px] object-cover rounded-full" />
          <div className="max-w-[1065px] text-center">
            <blockquote className="font-extrabold text-[34px] leading-[40px] lg:text-[55px] lg:leading-[59px] tracking-[-1.12px]" style={{ color: INK }}>
              {t(
                '“Eazlypost changed how I run my page, everything lives in one place and it saves me hours every week.”',
                '« Eazlypost a changé ma façon de gérer ma page, tout est au même endroit et je gagne des heures chaque semaine. »'
              )}
            </blockquote>
            <p className="mt-[24px] text-[20px] leading-[30px] tracking-[-0.4px] text-[#676B5F]">
              Rosine K.,
              <br />
              {t('Content creator, Douala', 'Créatrice de contenu, Douala')}
            </p>
          </div>
        </div>
      </section>

      {/* Paid plan cards — grey */}
      <section className="w-full" style={{ backgroundColor: GREY }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] pb-[128px]">
          <h2 className="text-center font-extrabold text-[38px] leading-[44px] lg:text-[54px] lg:leading-[59px] tracking-[-1.12px]" style={{ color: INK }}>
            {t('Do more, get more on a paid plan.', 'Faites plus, obtenez plus avec un plan payant.')}
          </h2>
          <div className="mt-[64px] grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
            {[
              {
                icon: '/assets/plan-doodle-automation.svg',
                iconClass: 'h-[150px] w-auto self-center',
                title: t('Save time with automation', 'Gagnez du temps avec l’automatisation'),
                text: t(
                  'Build a queue, let posts go live at the right time and keep your Page active even when you’re offline.',
                  'Créez une file d’attente, laissez vos publications partir au bon moment et gardez votre Page active même hors ligne.'
                ),
              },
              {
                icon: '/assets/plan-doodle-control.svg',
                iconClass: 'h-[150px] w-auto self-center',
                title: t('Control how your posts appear', 'Contrôlez l’apparence de vos publications'),
                text: t(
                  'Preview every post before it goes out, fine-tune each format and highlight what matters most.',
                  'Prévisualisez chaque publication avant l’envoi, ajustez chaque format et mettez en avant l’essentiel.'
                ),
              },
              {
                icon: '/assets/plan-doodle-insights.svg',
                iconClass: 'h-[150px] w-auto self-center',
                title: t('Understand what works', 'Comprenez ce qui fonctionne'),
                text: t(
                  'Track engagement in real time and use advanced analytics to double down on your best content.',
                  'Suivez l’engagement en temps réel et appuyez-vous sur des analyses avancées pour miser sur vos meilleurs contenus.'
                ),
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-[32px] p-[40px] flex flex-col gap-[39px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.icon} alt="" className={card.iconClass} />
                <div className="flex flex-col gap-[24px]">
                  <h3 className="font-extrabold text-[26px] leading-[36px] tracking-[-0.28px]" style={{ color: INK }}>
                    {card.title}
                  </h3>
                  <p className="font-medium text-[18px] leading-[30px] tracking-[-0.4px]" style={{ color: INK }}>
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare plans banner — grey bg, pink pill */}
      <section className="w-full" style={{ backgroundColor: GREY }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-[48px] pb-[128px]">
          <Link
            href="/tarifs"
            className="relative block rounded-full h-[240px] lg:h-[436px]"
            style={{ backgroundColor: '#174CD2' }}
          >
            <span className="absolute inset-[6px] rounded-full border-2 border-white/30 pointer-events-none" />
            <span className="absolute inset-0 flex items-center justify-center text-center font-extrabold text-[26px] lg:text-[38px] leading-[32px] lg:leading-[52px] tracking-[-0.4px] text-white px-[24px]">
              {t('Compare paid plans', 'Comparer les plans payants')}
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
}