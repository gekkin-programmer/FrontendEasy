'use client';

import React from 'react';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { useLanguage } from '@/context/LanguageContext';

export default function ImpactSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-white border-b-[4px] border-[#D9D9D9] rounded-t-[30px] min-h-[400px] md:min-h-[600px] flex items-center overflow-hidden">
      <div className="max-w-[1440px] 3xl:max-w-[1900px] mx-auto w-full flex flex-col xl:flex-row items-center justify-between py-[12px] md:py-[24px] px-[16px] md:px-[20px] lg:px-[52px] 3xl:gap-32 gap-10 xl:gap-20">
        
        {/* Left Side: Titles */}
        <div className="flex flex-col relative flex-shrink-0">
          <h2 className="font-['Rubik_One'] font-normal text-[24px] md:text-[30px] lg:text-[36px] leading-tight lg:leading-[45px] text-black relative z-2">
            Eazlypost
          </h2>
          <h1 className="font-['Rubik_One'] font-normal text-[48px] md:text-[58px] lg:text-[70px] leading-tight lg:leading-[87px] text-[#174CD2] mt-[-5px] md:mt-[-10px] lg:mt-[-20px] relative z-1">
            Impact
          </h1>
        </div>

        {/* Right Side: Stats */}
        <div className="flex flex-row flex-wrap items-center justify-center xl:justify-end gap-[24px] md:gap-[40px] lg:gap-[60px] xl:gap-[120px] w-full">
          {/* Stat 1 */}
          <div className="flex flex-col items-center gap-[10px] w-[140px] md:w-[192px]">
            <img src="/engagement.svg" alt="Engagement Icon" className="w-[40px] h-[40px] md:w-[60px] md:h-[60px]" />
            <div className="font-['Rubik'] font-extrabold text-[18px] md:text-[24px] lg:text-[32px] leading-tight text-black text-center">
              {t("Social Platforms", "Plateformes Sociales")}
            </div>
            <div className="font-['Rubik'] font-medium text-[24px] md:text-[30px] lg:text-[36px] leading-tight text-black text-center">
              <AnimatedCounter end={12} />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center gap-[10px] w-[140px] md:w-[192px]">
            <img src="/user.svg" alt="User Icon" className="w-[40px] h-[40px] md:w-[60px] md:h-[60px]" />
            <div className="font-['Rubik'] font-extrabold text-[18px] md:text-[24px] lg:text-[32px] leading-tight text-black text-center">
              {t("Our users", "Nos utilisateurs")}
            </div>
            <div className="font-['Rubik'] font-medium text-[24px] md:text-[30px] lg:text-[36px] leading-tight text-black text-center">
              <AnimatedCounter end={123908} separator="," />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center gap-[10px] w-[140px] md:w-[192px]">
            <img src="/email.svg" alt="Email Icon" className="w-[40px] h-[40px] md:w-[60px] md:h-[60px]" />
            <div className="font-['Rubik'] font-extrabold text-[18px] md:text-[24px] lg:text-[32px] leading-tight text-black text-center">
              {t("Posts per month", "Publications par mois")}
            </div>
            <div className="font-['Rubik'] font-medium text-[24px] md:text-[30px] lg:text-[36px] leading-tight text-black text-center">
              <AnimatedCounter end={156} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
