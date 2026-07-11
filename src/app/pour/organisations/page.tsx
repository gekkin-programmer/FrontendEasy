import React from 'react';
import Navbar from '@/components/layout/Navbar';
import CareerHeroLayout from '@/features/pour/components/CareerHeroLayout';
import AboutUsSection from '@/features/pour/components/AboutUsSection';
import WhyChooseUsSection from '@/features/pour/components/WhyChooseUsSection';
import CtaSection from '@/features/pour/components/CtaSection';

export default function OrganisationsPage() {
  return (
    <div className="bg-white relative font-sans flex flex-col">
      
      <div className="relative z-50 bg-white">
        <Navbar />
      </div>
      
      {/* Main Content Area */}
      <main className="w-full flex flex-col relative z-10">
        
        <CareerHeroLayout />
        <AboutUsSection />
        <WhyChooseUsSection />
        <CtaSection />

      </main>
    </div>
  );
}
