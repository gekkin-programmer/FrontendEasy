'use client';

import React from 'react';
import HeroBackground from '@/components/HeroBackground';
import Navbar from '@/components/Navbar';
import HeroLines from '@/components/hero/HeroLines';
import IsometricCube from '@/components/hero/IsometricCube';
import HeroText from '@/components/hero/HeroText';
import ImpactSection from '@/components/ImpactSection';
import PublishSection from '@/components/PublishSection';
import UsersSection from '@/components/UsersSection';
import ConnectSection from '@/components/ConnectSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1135A7]">
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
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden w-full mt-[87px]">
            <div className="relative w-[393px] h-[355px] scale-[1.15]">
              {/* Left Lines Behind Cube */}
              <div className="absolute top-[-142px] left-[-300px] -z-10 pointer-events-none">
                <HeroLines />
              </div>

              {/* Right Lines Behind Cube (Mirrored) */}
              <div className="absolute top-[-142px] right-[-300px] -z-10 pointer-events-none scale-x-[-1]">
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
    </main>
  );
}