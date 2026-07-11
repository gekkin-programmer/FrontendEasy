'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import CareerHeroLayout from '@/features/pour/components/CareerHeroLayout';
import AgencesWhyChooseUsSection from '@/features/pour/components/AgencesWhyChooseUsSection';
import CtaSection from '@/features/pour/components/CtaSection';
import AgencesFeaturesSection from '@/features/pour/components/AgencesFeaturesSection';
import { useLanguage } from '@/context/LanguageContext';

export default function AgencesPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-white relative font-sans flex flex-col">

      <div className="relative z-50 bg-white">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="w-full flex flex-col relative z-10">

        <CareerHeroLayout
          heroImage="/assets/magnific__background__82223.png"
          titleNode={
            <h1 className="flex flex-col font-['Rubik_One'] font-normal m-0 w-full gap-[4px] md:gap-[8px]">
              <span className="text-[#000000] text-[24px] md:text-[36px] leading-tight">
                {t("EazyPost for", "EazyPost pour les")}
              </span>
              <span className="text-[#174CD2] text-[40px] md:text-[70px] leading-[1.1] capitalize">
                {t("Agencies", "Agences")}
              </span>
            </h1>
          }
          subtitle={t("EazyPost gives agencies a centralized view of all client accounts, to produce, publish and report faster and cleaner.", "EazyPost offre aux agences une vision centralisée de tous les comptes clients, pour produire, publier et rapporter plus vite et plus proprement.")}
        />
        <AgencesFeaturesSection />
        <AgencesWhyChooseUsSection />
        <CtaSection />

      </main>
    </div>
  );
}
