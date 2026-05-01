'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiTrendingUp, FiLayers, FiZap, FiCpu } from 'react-icons/fi';

// --- HERO SECTION ---
export const Hero = () => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    {/* Background Gradients */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>

    <div className="container mx-auto px-4 text-center relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-800">
          🚀 V 2.0 is live
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          Manage your brand <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">like a fortune 500.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one workspace for creators and teams. Schedule content, analyze growth, and collaborate in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-[#0F172A] text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
              Get Started Free <FiArrowRight />
            </button>
          </Link>
          <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
             View Demo
          </button>
        </div>
      </motion.div>

      {/* Hero Image / Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mt-20 relative mx-auto max-w-5xl"
      >
        <div className="rounded-3xl border-8 border-gray-900/5 shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
            <img src="https://cdn.dribbble.com/userupload/13663948/file/original-54754767604d193b61817f460206429b.png?resize=2400x1800" alt="Dashboard Preview" className="w-full" />
        </div>
      </motion.div>
    </div>
  </section>
);

// --- STATS SECTION ---
export const StatsSection = () => (
  <section className="py-20 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {[
        { label: 'Active Creators', value: '50K+' },
        { label: 'Posts Scheduled', value: '2M+' },
        { label: 'Time Saved', value: '100yrs' },
        { label: 'Growth Rate', value: '300%' },
      ].map((stat, i) => (
        <div key={i}>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</h3>
          <p className="text-gray-500 font-medium uppercase text-sm tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

// --- FEATURE SECTIONS ---
export const PublishSection = () => (
  <section className="py-24 overflow-hidden">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 space-y-6">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4"><FiLayers /></div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Publish everywhere, <br/>from one place.</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Stop switching tabs. Create content once and distribute it to Instagram, Twitter, LinkedIn, and TikTok instantly.</p>
        <ul className="space-y-3 mt-4">
          {['Auto-resize for platforms', 'Best time to post predictions', 'First comment auto-posting'].map(item => (
            <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm"><FiCheck /></div>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 min-h-[400px] w-full relative group">
         {/* Mock UI Card */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
             <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
             </div>
             <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
             <div className="h-4 w-2/3 bg-gray-100 rounded mb-4"></div>
             <div className="aspect-video bg-blue-50 rounded-xl"></div>
         </div>
      </div>
    </div>
  </section>
);

export const CreateSection = () => (
  <section className="py-24 bg-[#0F172A] text-white rounded-[3rem] mx-4 md:mx-8">
    <div className="container mx-auto px-4 text-center max-w-3xl">
       <span className="text-blue-400 font-bold tracking-wider uppercase text-sm mb-4 block">Creator Studio</span>
       <h2 className="text-4xl md:text-5xl font-black mb-8">Built for the modern <br/>creative workflow.</h2>
       <p className="text-gray-400 text-lg mb-12">Includes a built-in AI copilot that helps you write captions, generate hashtags, and brainstorm viral ideas in seconds.</p>
       <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-colors flex items-center gap-2 mx-auto">
          <FiZap /> Try AI Assistant
       </button>
    </div>
  </section>
);

// --- GRID SECTIONS ---
export const CollaborateSection = () => (
  <div className="bg-purple-50 dark:bg-gray-800 p-10 rounded-3xl border border-purple-100 dark:border-gray-700">
     <FiUsersIcon className="text-4xl text-purple-600 mb-6" />
     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Real-time Collaboration</h3>
     <p className="text-gray-600 dark:text-gray-400">Invite your team, assign roles, and approve content before it goes live. No more messy email threads.</p>
  </div>
);

export const EngageSection = () => (
  <div className="bg-orange-50 dark:bg-gray-800 p-10 rounded-3xl border border-orange-100 dark:border-gray-700">
     <FiTrendingUp className="text-4xl text-orange-600 mb-6" />
     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Growth Analytics</h3>
     <p className="text-gray-600 dark:text-gray-400">Understand what works. Track engagement, follower growth, and reach across all channels in one dashboard.</p>
  </div>
);

export const AnalyzeSection = () => (
    <div className="bg-gray-900 text-white p-12 rounded-3xl text-center relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
       <div className="relative z-10">
         <h2 className="text-3xl font-bold mb-4">Deep Dive Analytics</h2>
         <p className="text-gray-400 max-w-2xl mx-auto">Export PDF reports to impress your clients or stakeholders with a single click.</p>
       </div>
    </div>
);

// --- PLACEHOLDERS FOR OTHERS ---
const Placeholder = ({ title, bg }: {title: string, bg: string}) => (
  <section className={`py-20 ${bg}`}>
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold opacity-50">{title}</h2>
    </div>
  </section>
);

export const ConnectSection = () => <Placeholder title="Integrations Section" bg="bg-white dark:bg-gray-900" />;
export const GrowSection = () => <Placeholder title="Growth Tools" bg="bg-gray-50 dark:bg-gray-800/50" />;
export const SupportSection = () => <Placeholder title="24/7 Support" bg="bg-white dark:bg-gray-900" />;

export const Footer = () => (
  <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="font-black text-xl">BrandOS</div>
      <div className="text-sm text-gray-500">© 2024 Hackathon Demo</div>
    </div>
  </footer>
);

// Helper for Icon
const FiUsersIcon = ({ className }: { className?: string }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);