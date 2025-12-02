import React from 'react';

// Components
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

// Icons for the Social Proof section
import { FaGoogle, FaMicrosoft, FaSpotify, FaAmazon, FaApple } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      
      <Hero />
      
      {/* Social Proof Section */}
      <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
              Powering the fastest-growing brands you love
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <FaGoogle className="w-8 h-8 text-gray-600 dark:text-gray-300" />
               <FaMicrosoft className="w-8 h-8 text-gray-600 dark:text-gray-300" />
               <FaSpotify className="w-8 h-8 text-gray-600 dark:text-gray-300" />
               <FaAmazon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
               <FaApple className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
        </div>
      </section>

      <StatsSection />
      <PublishSection />
      <CreateSection />
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 px-4 py-12">
        <CollaborateSection />
        <EngageSection />
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 px-4">
        <AnalyzeSection />
      </div>
      
      <ConnectSection />
      <GrowSection />
      <SupportSection />
      
    </main>
  );
}