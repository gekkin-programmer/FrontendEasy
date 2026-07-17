'use client';

import React, { useState } from 'react';
import { MessageCircle, BarChart2 } from 'lucide-react';
import Engagement from "./Engagement";
import EngagementAnalytics from './EngagementAnalytics';
import { useLanguage } from '@/context/LanguageContext';

export const EngagementWithTabs = () => {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-6 mb-6 border-b border-black/5 dark:border-white/5">
        <button
          onClick={() => setSubTab('inbox')}
          className={`flex items-center gap-2 font-semibold text-sm pb-3 border-b-2 transition-all ${
            subTab === 'inbox'
              ? 'text-[#174CD2] border-[#174CD2]'
              : 'text-[#8E8E8E] border-transparent hover:text-[#040028] dark:hover:text-white'
          }`}
        >
          <MessageCircle size={16} /> {t("Inbox", "Messages")}
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 font-semibold text-sm pb-3 border-b-2 transition-all ${
            subTab === 'analytics'
              ? 'text-[#174CD2] border-[#174CD2]'
              : 'text-[#8E8E8E] border-transparent hover:text-[#040028] dark:hover:text-white'
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
