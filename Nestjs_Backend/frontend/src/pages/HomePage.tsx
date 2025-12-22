import React from 'react';

// Import all the sections needed for the home page
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import PublishSection from '../components/PublishSection';
import CreateSection from '../components/CreateSection';
import CollaborateSection from '../components/CollaborateSection';
import EngageSection from '../components/EngageSection';
import AnalyzeSection from '../components/AnalyzeSection';
import ConnectSection from '../components/ConnectSection';
import GrowSection from '../components/GrowSection';
import SupportSection from '../components/SupportSection';
import ResourcesSection from '../components/ResourcesSection'; // Cleaned up duplicate import
// Assuming you have a LogoCarousel component


const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      {/* A good place for social proof like the logo carousel */}
      <section className="py-12 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto text-center">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Powering the fastest-growing brands you love
            </h2>
        </div>
      </section>
      <StatsSection />
      <PublishSection />
      <CreateSection />
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 px-4">
        <CollaborateSection />
        <EngageSection />
      </div>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        <AnalyzeSection />
      </div>
      <ConnectSection />
      <GrowSection />
      <SupportSection />
    </>
  );
};

export default HomePage;