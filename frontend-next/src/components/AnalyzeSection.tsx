"use client";


import React from 'react';
import { 
  FaArrowRight, 
  FaChartLine, 
  FaLightbulb, 
  FaUserFriends 
} from 'react-icons/fa';
import { IoBarChartOutline } from 'react-icons/io5';
import { FiUsers, FiTag, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext'; 

// --- LEFT COLUMN COMPONENTS (Kept Same) ---
interface FeatureItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, children }) => (
  <li className="flex items-start gap-4">
    <div className="text-primary mt-1 flex-shrink-0">{icon}</div>
    <span className="text-gray-800 font-medium">{children}</span>
  </li>
);

// --- NEW ORIGINAL VISUAL COMPONENTS ---

const InsightCard = () => (
  <div className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 w-64 z-20 animate-float-slow">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
        <FaLightbulb size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Insight</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">Format Trend</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-snug">
      Carousels are generating <span className="text-green-600 font-bold">2.4x more saves</span> than single images this week.
    </p>
    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg flex items-center gap-2">
      <FiCheckCircle className="text-primary" />
      <span className="text-xs font-semibold text-primary">Suggestion: Schedule 2 Carousels</span>
    </div>
  </div>
);

const AudienceNode = () => (
  <div className="absolute -bottom-6 -left-4 md:-left-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 flex items-center gap-4 animate-float-medium">
    <div className="flex -space-x-3">
       {[1,2,3].map((i) => (
         <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden`}>
           <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
         </div>
       ))}
    </div>
    <div>
       <p className="text-sm font-bold text-gray-900 dark:text-white">Top Audience</p>
       <p className="text-xs text-gray-500">Creators (18-24)</p>
    </div>
  </div>
);

const MainDashboardVisual = () => (
  <div className="relative w-full max-w-md mx-auto md:ml-auto perspective-1000">
    {/* Background Decorative Blob */}
    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-[40px] opacity-40 blur-2xl transform rotate-6"></div>

    {/* Main Card */}
    <div className="relative bg-white dark:bg-gray-900 rounded-[30px] shadow-2xl border border-white/50 overflow-hidden p-6 md:p-8 z-10">
      
      {/* Card Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Weekly Growth</h3>
          <p className="text-sm text-gray-500">Oct 12 - Oct 19</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <FaChartLine />
        </div>
      </div>

      {/* Custom CSS Graph (Looking more organic than standard charts) */}
      <div className="relative h-48 w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
           {[1,2,3,4].map(i => <div key={i} className="h-px w-full bg-gray-100 dark:bg-gray-800 dash" />)}
        </div>
        
        {/* The Organic Curve (SVG) */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
           <defs>
             <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#3C48F6" stopOpacity="0.3" />
               <stop offset="100%" stopColor="#3C48F6" stopOpacity="0" />
             </linearGradient>
           </defs>
           {/* The Fill */}
           <path d="M0,150 C50,150 80,100 120,110 C160,120 200,40 250,50 C300,60 350,10 400,20 L400,200 L0,200 Z" fill="url(#gradientGraph)" />
           {/* The Line */}
           <path d="M0,150 C50,150 80,100 120,110 C160,120 200,40 250,50 C300,60 350,10 400,20" fill="none" stroke="#3C48F6" strokeWidth="4" strokeLinecap="round" />
           
           {/* The "Peak" Point - Connecting to Insight Card */}
           <circle cx="250" cy="50" r="6" fill="white" stroke="#3C48F6" strokeWidth="3" className="animate-pulse" />
        </svg>
      </div>

      {/* Bottom Stats */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
         <div>
           <p className="text-xs text-gray-500">Engagement</p>
           <p className="font-bold text-gray-800 dark:text-white">+12.5%</p>
         </div>
         <div>
           <p className="text-xs text-gray-500">Reach</p>
           <p className="font-bold text-gray-800 dark:text-white">+8.2k</p>
         </div>
         <div>
           <p className="text-xs text-gray-500">Saves</p>
           <p className="font-bold text-gray-800 dark:text-white">+402</p>
         </div>
      </div>
    </div>

    {/* Floating Elements */}
    <InsightCard />
    <AudienceNode />

  </div>
);

const AnalyzeSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#D6EFFF] mt-20 py-20 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden">
      <div className="container mx-auto grid lg:grid-cols-2 gap-y-20 lg:gap-x-16 items-center max-w-7xl">
        
        {/* Left Column (Text Content) */}
        <div className="flex flex-col gap-8 text-gray-800 max-w-lg lg:max-w-none relative z-10">
          <div>
            <span className="font-bold tracking-widest text-xs uppercase text-primary bg-blue-100 px-3 py-1 rounded-full">{t("ANALYZE", "ANALYSER")}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#232323] leading-[1.1] mt-4">
              {t("Answers, not just analytics", "Des réponses, pas seulement des analyses")}
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            {t("Most tools just show you a graph and wish you luck. Wiggle analyzes your data to tell you exactly what to post next to grow faster.", "La plupart des outils vous montrent un graphique et vous souhaitent bonne chance. Wiggle analyse vos données pour vous dire exactement quoi publier pour grandir.")}
          </p>
          
          <ul className="space-y-5 mt-2">
            <FeatureItem icon={<IoBarChartOutline size={24} />}>
              {t("AI-driven suggestions on when to post", "Suggestions IA sur le moment de publication")}
            </FeatureItem>
            <FeatureItem icon={<FaUserFriends size={24} />}>
              {t("Breakdown of your most loyal followers", "Analyse de vos abonnés les plus fidèles")}
            </FeatureItem>
            <FeatureItem icon={<FiTag size={24} />}>
              {t("Content recycling engine for high performers", "Moteur de recyclage pour les contenus performants")}
            </FeatureItem>
          </ul>

          <div className="pt-2">
            <a href="#" className="bg-primary text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 w-fit hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-1">
              {t("Start analyzing free", "Commencez l'analyse")} <FaArrowRight />
            </a>
          </div>
        </div>
        
        {/* Right Column (New Visual) */}
        <div className="relative flex items-center justify-center lg:justify-end">
            <MainDashboardVisual />
        </div>

      </div>
    </section>
  );
};

export default AnalyzeSection;
