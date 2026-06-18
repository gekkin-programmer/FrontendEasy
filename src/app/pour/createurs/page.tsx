import React from 'react';
import Navbar from '@/components/Navbar';
import CareerHeroLayout from '@/components/pour/CareerHeroLayout';
import AboutUsSection from '@/components/pour/AboutUsSection';
import WhyChooseUsSection from '@/components/pour/WhyChooseUsSection';
import CtaSection from '@/components/pour/CtaSection';

export default function CreateursPage() {
  return (
    <div className="relative font-sans flex flex-col">
      
      <div className="relative z-50 bg-white">
        <Navbar />
      </div>
      
      {/* Main Content Area */}
      <main className="w-full flex flex-col relative z-10">
        
        {/* Primary Hero Section Restored */}
        <CareerHeroLayout hideBackground={true} />
        <AboutUsSection />
        <WhyChooseUsSection />
        <CtaSection />

      </main>
    </div>
  );
}
