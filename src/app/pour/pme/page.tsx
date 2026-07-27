'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import CareerHeroLayout from '@/features/pour/components/CareerHeroLayout';
import PmeFeaturesSection from '@/features/pour/components/PmeFeaturesSection';
import WhyChooseUsSection from '@/features/pour/components/WhyChooseUsSection';
import CtaSection from '@/features/pour/components/CtaSection';
import { useLanguage } from '@/context/LanguageContext';

export default function PmePage() {
  const { t } = useLanguage();
  return (
    <div className="bg-white relative font-sans flex flex-col">

      <div className="relative z-50 bg-white">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="w-full flex flex-col relative z-10">

        <CareerHeroLayout
          heroImage="/assets/magnific_l7uVXlugv9.png"
          hideBackground={true}
          titleNode={
            <h1 className="flex flex-col font-['Rubik_One'] font-normal m-0 w-full gap-[4px] md:gap-[8px]">
              <span className="text-[#000000] text-[24px] md:text-[36px] leading-tight">
                {t("Eazlypost for", "Eazlypost pour les")}
              </span>
              <span className="text-[#174CD2] text-[40px] md:text-[70px] leading-[1.1] capitalize">
                {t("Small", "Petites")}
              </span>

              <div className="flex flex-row items-baseline gap-[12px] md:gap-[16px]">
                <span className="text-[#000000] text-[24px] md:text-[36px] leading-tight">{t("and", "et")}</span>
                <span className="text-[#174CD2] text-[40px] md:text-[70px] leading-[1.1] capitalize">{t("Medium", "Moyennes")}</span>
              </div>

              <span className="text-[#174CD2] text-[40px] md:text-[70px] leading-[1.1] capitalize">
                {t("Businesses", "Entreprises")}
              </span>
            </h1>
          }
          subtitle={t("simplify your social media management, attract new local customers and free up time for your core business.", "simplifie ta gestion des réseaux sociaux, attire de nouveaux clients locaux et libère du temps pour ton activité principale.")}
        />
        <PmeFeaturesSection />
        <WhyChooseUsSection />
        <CtaSection />

      </main>
    </div>
  );
}
