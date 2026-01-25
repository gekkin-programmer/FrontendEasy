import React from 'react';

// Components
import Hero from '../components/Hero';
import SocialProof from '../components/SocialProof';
import StatsSection from '../components/StatsSection';
import PublishSection from '../components/PublishSection';
import CreateSection from '../components/CreateSection';
import CollaborateSection from '../components/CollaborateSection';
import EngageSection from '../components/EngageSection';
import AnalyzeSection from '../components/AnalyzeSection';
import ConnectSection from '../components/ConnectSection';
import GrowSection from '../components/GrowSection';
import SupportSection from '../components/SupportSection';
import EasyAI from '../components/easypost/EasyAI';

export default function Home() {
  return (
    
    <>
      <Hero />
      <SocialProof />
      
      <StatsSection />
      <PublishSection />
      <CreateSection />
      
      <CollaborateSection />
      <AnalyzeSection />
      
      <ConnectSection />
      <GrowSection />
      <SupportSection />
      
      {/* Floating Widget */}
      <EasyAI />
    </>
  );
}