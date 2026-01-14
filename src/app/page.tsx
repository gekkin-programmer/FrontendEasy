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
import Footer from '../components/Footer';
import EasyAI from '../components/easypost/EasyAI';

// Icons for the Social Proof section
import { FaGoogle, FaMicrosoft, FaSpotify, FaAmazon, FaApple } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      
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
      <Footer />
      <EasyAI />
    </main>
  );
}