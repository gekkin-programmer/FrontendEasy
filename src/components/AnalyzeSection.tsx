"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLightbulb } from 'react-icons/fa';
import { IoScanSharp } from 'react-icons/io5';
import { FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import SectionBackground from './SectionBackground';

// --- UTILS ---

const AnimatedCounter = ({ value, duration = 1 }: { value: string | number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;

  useEffect(() => {
    let start = 0;
    const end = numeric;
    if (start === end) return;
    const stepTime = Math.abs(Math.floor((duration * 1000) / end));
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        start = end;
        clearInterval(timer);
        setDisplay(end); 
      } else {
        setDisplay(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration, numeric]);

  if (typeof value === 'string' && value.includes('k')) return <>{(display / 10).toFixed(1)}k</>;
  return <>{display}{typeof value === 'string' && value.includes('%') ? '%' : ''}</>;
};

// --- NEUBRUTALIST COMPONENTS ---

const HardCard = ({ children, className = "", color = "bg-white", rivets = false }: any) => (
  <div className={`relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${color} ${className}`}>
    {rivets && (
      <>
        <div className="absolute top-1 left-1 w-2 h-2 text-black/20 text-[8px] flex items-center justify-center pointer-events-none">+</div>
        <div className="absolute top-1 right-1 w-2 h-2 text-black/20 text-[8px] flex items-center justify-center pointer-events-none">+</div>
        <div className="absolute bottom-1 left-1 w-2 h-2 text-black/20 text-[8px] flex items-center justify-center pointer-events-none">+</div>
        <div className="absolute bottom-1 right-1 w-2 h-2 text-black/20 text-[8px] flex items-center justify-center pointer-events-none">+</div>
      </>
    )}
    {children}
  </div>
);

const HardBadge = ({ children, color = "bg-[#3C48F5]" }: any) => (
  <span className={`inline-block px-3 py-1 font-bold text-xs uppercase tracking-widest border-2 border-black ${color} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
    {children}
  </span>
);

const FeatureItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <li className="flex items-center gap-4 p-4 border-2 border-black bg-white dark:bg-black dark:border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:bg-yellow-50 dark:hover:bg-zinc-900 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
    <div className="flex-shrink-0">{icon}</div>
    <span className="text-black dark:text-white font-bold text-base md:text-lg leading-tight">{children}</span>
  </li>
);

// --- VISUAL SECTION (Right Column) ---

const InsightCard = ({ animationKey }: { animationKey: number }) => (
  <motion.div 
    key={`insight-${animationKey}`}
    initial={{ x: 20, opacity: 0, rotate: 5 }}
    animate={{ x: 0, opacity: 1, rotate: -2 }}
    transition={{ delay: 2.5, type: "spring" }}
    className="absolute top-4 -right-2 md:-right-10 z-20 w-48 md:w-56"
  >
    <HardCard color="bg-blue-50" className="p-4" rivets={true}>
      <div className="absolute -top-3 -left-3 bg-black text-white px-2 py-1 text-[10px] font-mono font-bold border border-white">
        PRIORITY_HIGH
      </div>
      <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-black border-dashed">
        <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black">
          <FaLightbulb size={16} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-tighter">Trend_Detection</p>
          <p className="text-sm font-bold leading-none">Format Spike</p>
        </div>
      </div>
      <p className="text-xs font-bold mb-3 leading-snug font-mono">
         Carousels: <span className="bg-white px-1 border border-black">80%</span> saves detected.
      </p>
      <div className="bg-black text-white p-2 font-mono text-[10px] flex items-center gap-2 border border-white/20">
        <FiCheckCircle className="text-green-400" />
        <span>ACTION: CREATE_2</span>
      </div>
    </HardCard>
  </motion.div>
);

const AudienceNode = ({ animationKey }: { animationKey: number }) => (
  <motion.div 
    key={`audience-${animationKey}`}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 2.8, type: "spring" }}
    className="absolute -bottom-8 -left-4 md:-left-12 z-20 w-48 md:w-56"
  >
    <HardCard color="bg-[#00F0FF]" className="p-3" rivets={true}>
        <div className="flex justify-between items-center mb-2">
            <p className="font-black text-[10px] text-black uppercase font-mono">Target_Cluster_01</p>
        </div>
        <div className="flex -space-x-3 mb-3 pl-1">
            {[1,2,3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-none border-2 border-black bg-white overflow-hidden relative`}>
                    <img 
                      src={`https://i.pravatar.cc/150?img=${i + 15}`} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover grayscale contrast-125"
                      loading="lazy" 
                    />
                </div>
            ))}
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                +4k
            </div>
        </div>
        <p className="font-mono text-[10px] font-bold bg-white border-2 text-black border-black px-2 py-1 inline-block">
          Seg: Creators (18-24)
        </p>
    </HardCard>
  </motion.div>
);

const MainDashboardVisual = () => {
  const [animationKey, setAnimationKey] = useState(0);
  const barHeights = [40, 70, 50, 90, 60, 80, 100];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto md:ml-auto p-4 select-none">
      
      {/* Decorative Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000015_2px,transparent_2px),linear-gradient(to_bottom,#00000015_2px,transparent_2px)] bg-[size:24px_24px] z-0 pointer-events-none"></div>

      {/* Main Card */}
      <HardCard className="p-6 md:p-8 z-10 min-h-[360px] bg-white overflow-hidden" rivets={true}>
        
        {/* Raw Data Stream */}
        <div className="absolute top-2 right-2 font-mono text-[8px] text-black/30 leading-tight pointer-events-none text-right">
             <motion.div
               key={`data-${animationKey}`}
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 2 }}
             >
                DAT_STREAM_01<br/>
                CONN_ESTABLISHED<br/>
                FETCHING_METRICS...
             </motion.div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-8 border-b-4 border-black pb-4 bg-white">
          <div>
            <h3 className="text-3xl font-black text-black uppercase italic leading-none">
              Weekly<br/>Growth
            </h3>
          </div>
          <div className="w-12 h-12 bg-[#3C48F6] border-4 border-black flex items-center justify-center text-white text-xl shadow-[2px_2px_0px_0px_#000]">
            <motion.div
                key={`icon-${animationKey}`}
                animate={{ rotate: [0, 90, 0] }}
                transition={{ delay: 2, duration: 0.8, ease: "easeInOut" }}
            >
                <IoScanSharp />
            </motion.div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="relative h-40 w-full mb-6 flex items-end justify-between px-2 gap-2 border-b-2 border-dashed border-black/30">
          
          {/* Scanner Line */}
          <motion.div 
            key={`scanner-${animationKey}`}
            className="absolute top-0 bottom-0 w-[2px] bg-[#3C48F5] z-30 shadow-[0px_0px_8px_rgba(60,72,245,0.8)]"
            initial={{ left: "-5%", opacity: 1 }}
            animate={{ left: "110%", opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          >
             <div className="absolute top-0 -left-[20px] bg-black text-white text-[8px] font-mono font-bold px-1 py-0.5 uppercase">
                SCANNING
             </div>
          </motion.div>

          {/* Bars */}
          {barHeights.map((h, i) => (
             <div key={i} className="relative w-full h-full flex items-end group">
                 <div className="absolute bottom-0 w-full bg-neutral-100 border border-neutral-200" style={{ height: `${h}%` }}></div>
                 
                 <motion.div
                    key={`bar-${i}-${animationKey}`}
                    initial={{ height: "0%" }}
                    animate={{ height: `${h}%` }}
                    transition={{ 
                        duration: 0.3, 
                        delay: 0.6 + (i * 0.2), 
                        type: "spring", stiffness: 150 
                    }}
                    className="w-full bg-black relative z-10 border-x border-t border-black hover:bg-[#3C48F6] transition-colors"
                 >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-100 border-2 border-black px-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-40 shadow-[2px_2px_0px_0px_#000]">
                        {h}%
                    </div>
                 </motion.div>
             </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-black">
             <StatBox label="Reach" value="12%" delay={2.1} animationKey={animationKey} />
             <StatBox label="Saves" value="402" color="bg-[#3C48F6] text-white" delay={2.3} animationKey={animationKey} />
             <StatBox label="Clicks" value="8.2k" delay={2.5} animationKey={animationKey} />
        </div>
      </HardCard>

      <InsightCard animationKey={animationKey} />
      <AudienceNode animationKey={animationKey} />

    </div>
  );
};

const StatBox = ({ label, value, color = "bg-gray-100", delay, animationKey }: any) => (
  <motion.div 
    key={`stat-${label}-${animationKey}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className={`${color} border-2 border-black p-1 py-2 shadow-[2px_2px_0px_0px_#000]`}
  >
    <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 font-mono">{label}</p>
    <p className="font-black text-lg leading-none mt-1 font-mono">
       <AnimatedCounter value={value} />
    </p>
  </motion.div>
);

// --- MAIN SECTION EXPORT ---

const AnalyzeSection = () => {
  const { t } = useLanguage();

  return (
    <section 
      className="bg-white dark:bg-black border-y-4 border-black dark:border-white/5 py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden"
      aria-label="Analytics Features"
    >
      <SectionBackground />
      <div className="container mx-auto max-w-7xl relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text Column */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div>
              <HardBadge color="bg-[#3C48F6] text-white">SYSTEM_ANALYZE</HardBadge>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-gray-200 leading-[0.95] mt-4 tracking-tighter uppercase">
                ANSWERS.<br/>
                NOT JUST<br/>
                <span className="text-[#3C48F6]">NUMBERS.</span>
              </h2>
            </div>

            <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-300 leading-snug border-l-8 border-[#3C48F5] pl-6 py-2 bg-gray-50 dark:bg-black">
              {t("Most tools just show you a graph and wish you luck. EasyPost analyzes your data to tell you exactly what to post next to grow faster.", "La plupart des outils vous montrent un graphique et vous souhaitent bonne chance. EasyPost analyse vos données pour vous dire exactement quoi publier pour grandir.")}
            </p>

            <ul className="space-y-4 mt-4">
              <FeatureItem icon={<lord-icon src="https://cdn.lordicon.com/abfverha.json" trigger="hover" colors="primary:#3C48F6,secondary:#000000" style={{ width: '40px', height: '40px' }} />}>
                {t("AI-driven suggestions on when to post", "Suggestions IA sur le moment de publication")}
              </FeatureItem>
              <FeatureItem icon={<lord-icon src="https://cdn.lordicon.com/dxjqoygy.json" trigger="hover" colors="primary:#3C48F6,secondary:#000000" style={{ width: '40px', height: '40px' }} />}>
                {t("Breakdown of your most loyal followers", "Analyse de vos abonnés les plus fidèles")}
              </FeatureItem>
              <FeatureItem icon={<lord-icon src="https://cdn.lordicon.com/uukerzzv.json" trigger="hover" colors="primary:#3C48F6,secondary:#000000" style={{ width: '40px', height: '40px' }} />}>
                {t("Content recycling engine for high performers", "Moteur de recyclage pour les contenus performants")}
              </FeatureItem>
            </ul>

            <div className="pt-6">
              <a
                  href="/signup"
                  className="inline-flex items-center gap-3 bg-black dark:bg-gray-200 text-white dark:text-black font-black text-lg md:text-xl py-3 md:py-4 px-8 border-4 border-transparent hover:border-black hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_#3C48F6] hover:shadow-none hover:translate-x-2 hover:translate-y-2 group"
              >
                <span className="group-hover:animate-pulse">{t("START ANALYZING", "COMMENCEZ")}</span> <FaArrowRight />
              </a>
            </div>
          </div>

          {/* Right: Analytics illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <img
              src="/assets/undraw_analytics-setup.svg"
              alt="Analytics illustration"
              className="w-full max-w-lg mx-auto"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default AnalyzeSection;