import React from 'react';
import HeroBackground from '@/components/HeroBackground';
import Navbar from '@/components/Navbar';

export default function TestHero() {
  return (
    <main className="min-h-screen bg-black">
      <HeroBackground>
        <div className="flex flex-col w-full h-full">
          <Navbar />
          {/* Hero Content below Navbar */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* The main hero content will go here */}
          </div>
        </div>
      </HeroBackground>
      
      {/* Spacer to prove scrolling works to the next section */}
      <section className="h-[1000px] flex items-center justify-center bg-zinc-900 text-white text-3xl font-bold">
        Next Section Begins Here
      </section>
    </main>
  );
}
