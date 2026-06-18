import React from 'react';
import Navbar from '@/components/Navbar';
import CareerHeroLayout from '@/components/pour/CareerHeroLayout';
import AboutUsSection from '@/components/pour/AboutUsSection';
import WhyChooseUsSection from '@/components/pour/WhyChooseUsSection';
import CtaSection from '@/components/pour/CtaSection';

export default function AgencesPage() {
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
