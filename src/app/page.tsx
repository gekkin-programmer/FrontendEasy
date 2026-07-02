'use client';

import React from 'react';
import HeroBackground from '@/components/landing/HeroBackground';
import Navbar from '@/components/layout/Navbar';
import HeroLines from '@/components/landing/hero/HeroLines';
import IsometricCube from '@/components/landing/hero/IsometricCube';
import HeroText from '@/components/landing/hero/HeroText';
import ImpactSection from '@/components/landing/ImpactSection';
import PublishSection from '@/components/landing/PublishSection';
import UsersSection from '@/components/landing/UsersSection';
import ConnectSection from '@/components/landing/ConnectSection';
import AProposSection from '@/components/landing/AProposSection';
import FaqSection from '@/components/landing/FaqSection';
import ContactSection from '@/components/landing/ContactSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1135A7] overflow-x-hidden">
      <style>{`
        @keyframes slide1 {
          0% { transform: translate(-1544px, -1068px); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(451px, 317px); opacity: 0; }
        }
        @keyframes slide2 {
          0% { transform: translate(-1452px, -1128px); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(521px, 257px); opacity: 0; }
        }
        @keyframes slide1-right {
          0% { transform: translate(-1544px, -1068px) scaleX(-1); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(451px, 317px) scaleX(-1); opacity: 0; }
        }
        @keyframes slide2-right {
          0% { transform: translate(-1452px, -1128px) scaleX(-1); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(521px, 257px) scaleX(-1); opacity: 0; }
        }
        .icon-lane1 { animation: slide1 20s linear infinite; }
        .icon-lane2 { animation: slide2 20s linear infinite; }
        .icon-lane1-right { animation: slide1-right 20s linear infinite; }
        .icon-lane2-right { animation: slide2-right 20s linear infinite; }
      `}</style>
      <Navbar />
      <HeroBackground>
        <div className="flex flex-col w-full h-full">
          {/* Hero Content below Navbar */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden w-full mt-[87px] min-h-[400px] md:min-h-[500px]">
            <div className="relative w-[240px] h-[220px] sm:w-[300px] sm:h-[275px] md:w-[350px] md:h-[320px] lg:w-[393px] lg:h-[355px] scale-[0.6] md:scale-[0.8] lg:scale-[0.95] xl:scale-[1.0] 2xl:scale-[1.15] transition-transform duration-300">
              {/* Left Lines Behind Cube */}
              <div className="absolute top-[-100px] md:top-[-120px] lg:top-[-142px] left-[-200px] md:left-[-250px] lg:left-[-300px] -z-10 pointer-events-none">
                <HeroLines />
              </div>

              {/* Right Lines Behind Cube (Mirrored) */}
              <div className="absolute top-[-100px] md:top-[-120px] lg:top-[-142px] right-[-200px] md:right-[-250px] lg:right-[-300px] -z-10 pointer-events-none scale-x-[-1]">
                <HeroLines right={true} />
              </div>

              {/* Cube Foreground */}
              <IsometricCube />
            </div>
            
            <HeroText />
          </div>
        </div>
      </HeroBackground>
      
      <ImpactSection />
      <PublishSection />
      <ConnectSection />
      <UsersSection />
      <AProposSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}