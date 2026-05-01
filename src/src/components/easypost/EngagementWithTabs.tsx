'use client';

import React, { useState } from 'react';
import { MessageCircle, BarChart2 } from 'lucide-react';
import Engagement from "./Engagement";
import EngagementAnalytics from './EngagementAnalytics';
import { useLanguage } from '@/src/context/LanguageContext';

export const EngagementWithTabs = () => {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 border-b-2 border-black dark:border-white pb-4 transition-colors">
        <button
          onClick={() => setSubTab('inbox')}
          className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black dark:border-white transition-all ${
            subTab === 'inbox'
              ? 'bg-[#3C48F5] text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] -translate-y-1'
              : 'bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          <MessageCircle size={16} /> {t("Inbox", "Messages")}
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black dark:border-white transition-all ${
            subTab === 'analytics'
              ? 'bg-[#3C48F5] text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] -translate-y-1'
              : 'bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          <BarChart2 size={16} /> {t("Performance", "Performance")}
        </button>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'inbox' ? <Engagement /> : <EngagementAnalytics />}
      </div>
    </div>
  ); 
};
