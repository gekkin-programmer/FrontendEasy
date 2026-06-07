'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('countdownEndTime');
    let endTime: number;
    
    if (savedEndTime) {
      endTime = parseInt(savedEndTime, 10);
    } else {
      endTime = Date.now() + 72 * 60 * 60 * 1000;
      localStorage.setItem('countdownEndTime', endTime.toString());
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <h2 className="text-[#3C48F5] text-3xl font-bold mb-4 font-mono tracking-widest tabular-nums min-w-[260px] transform-gpu">
      {formatTime(timeLeft)}
    </h2>
  );
};

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#3C48F5]">
      {/* Background blurred ellipses for the glowing effect */}
      <div className="absolute left-0 top-0 w-[305px] h-[314px] bg-white rounded-full blur-[150px] opacity-80 pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 w-[305px] h-[314px] bg-white rounded-full blur-[150px] opacity-80 pointer-events-none"></div>

      {/* Main Card */}
      <div className="font-outfit relative z-10 w-full max-w-[1170px] min-h-[685px] bg-[#FFFFFF] rounded-[36px] p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_20px_70px_rgba(0,0,0,0.1)]">
        
        {/* Left Content Column */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 w-full max-w-[500px]">
          <div className="flex items-center text-[#3C48F5] font-bold text-4xl tracking-tight mb-12 font-rubik">
            <img src="/applogo.png" alt="E" className="h-10 w-auto mr-1" />
            azypost
          </div>
          
          <Countdown />
          
          <h1 className="text-[#2D2D2D] text-2xl sm:text-3xl font-medium leading-relaxed mb-12 max-w-[450px] font-rubik">
            {t("It’s not here yet, but we'll let you know it’s coming really really soon. Sit tight and check back in on June 27.", "Ce n'est pas encore là, mais nous vous ferons savoir que ça arrive très bientôt. Restez à l'écoute et revenez le 27 juin.")}
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
            <input 
              type="email" 
              placeholder={t("Enter your email", "Entrez votre email")}
              className="flex-1 px-6 py-4 bg-white shadow-[0px_20px_70px_rgba(0,39,96,0.12)] rounded-lg text-lg text-[#2D2D2D] outline-none placeholder:text-[#A7A7A7] transition-shadow focus:shadow-[0px_20px_70px_rgba(0,103,255,0.2)]"
            />
            <button className="px-8 py-4 bg-[#3C48F5] text-white rounded-lg text-lg font-semibold hover:bg-[#2d38cf] transition-colors shrink-0">
              {t("Subscribe", "S'abonner")}
            </button>
          </div>
          
          {/* Social Icons for Mobile */}
          <div className="flex lg:hidden flex-row gap-6 mt-12 text-[#A7A7A7] text-2xl">
            <FaFacebookF className="hover:text-[#0067FF] transition-colors cursor-pointer" />
            <FaTwitter className="hover:text-[#0067FF] transition-colors cursor-pointer" />
            <FaInstagram className="hover:text-[#0067FF] transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Right Content Column */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-end justify-center relative mt-8 lg:mt-0">
          {/* By Bestcorp Label for Desktop */}
          <a 
            href="https://www.bestcorpcmr.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:flex absolute -top-12 right-4 items-center gap-2 text-black text-xl font-medium tracking-wide hover:opacity-80 transition-opacity font-rubik"
          >
            By <img src="/logos/BC-violet.png" alt="Bestcorp" className="h-14 w-auto" />
          </a>

          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full max-w-[512px] aspect-square object-cover rounded-[36px] border-none outline-none ring-0 shadow-none"
          >
            <source src="/coming-soon.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap');
        
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        .font-rubik {
          font-family: 'Rubik', sans-serif;
        }
      `}} />
    </div>
  );
}