import React from 'react';
import Navbar from '@/components/layout/Navbar';
import CareerHeroLayout from '@/features/pour/components/CareerHeroLayout';
import AgencesWhyChooseUsSection from '@/features/pour/components/AgencesWhyChooseUsSection';
import CtaSection from '@/features/pour/components/CtaSection';
import AgencesFeaturesSection from '@/features/pour/components/AgencesFeaturesSection';

export default function AgencesPage() {
  return (
    <div className="bg-white relative font-sans flex flex-col">
      
      <div className="relative z-50 bg-white">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <CareerHeroLayout 
        heroImage="/assets/magnific__background__82223.png"
        titleNode={
          <h1 className="flex flex-col font-['Rubik_One'] font-normal m-0 w-full gap-[4px] md:gap-[8px]">
            <span className="text-[#000000] text-[24px] md:text-[36px] leading-tight">
              EazyPost pour les
            </span>
            <span className="text-[#174CD2] text-[40px] md:text-[70px] leading-[1.1] capitalize">
              Agences
            </span>
          </h1>
        }
        subtitle="EazyPost offre aux agences une vision centralisée de tous les comptes clients, pour produire, publier et rapporter plus vite et plus proprement."
      />
      
      {/* Main Content Area */}
      <main className="w-full flex flex-col relative z-10">
        <AgencesFeaturesSection />
        <AgencesWhyChooseUsSection />
        <CtaSection />
      </main>
    </div>
  );
}
