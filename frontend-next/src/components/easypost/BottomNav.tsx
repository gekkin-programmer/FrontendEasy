'use client';

import React from 'react';
import { Layers, BarChart2, MessageCircle, Settings, PlusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onCompose: () => void; // Special action for center button
}

export default function BottomNav({ activeTab, setActiveTab, onCompose }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t-2 border-black dark:border-white z-50 px-6 flex items-center justify-between backdrop-blur-lg pb-safe transition-colors">
      
      {/* Queue (Home) */}
      <NavButton 
        active={activeTab === 'queue'} 
        onClick={() => setActiveTab('queue')} 
        icon={Layers} 
        label="Queue"
      />

      {/* Analytics */}
      <NavButton 
        active={activeTab === 'analytics'} 
        onClick={() => setActiveTab('analytics')} 
        icon={BarChart2} 
        label="Stats"
      />

      {/* BIG COMPOSE BUTTON (Center) */}
      <div className="relative -top-5">
        <button 
          onClick={onCompose}
          className="w-14 h-14 rounded-full bg-[#3C48F6] text-white flex items-center justify-center shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95 transition-transform border-4 border-black dark:border-white"
        >
          <PlusCircle size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Engagement */}
      <NavButton 
        active={activeTab === 'engagement'} 
        onClick={() => setActiveTab('engagement')} 
        icon={MessageCircle} 
        label="Inbox"
      />

      {/* Settings/Profile */}
      <NavButton 
        active={activeTab === 'settings'} 
        onClick={() => setActiveTab('settings')} 
        icon={Settings} 
        label="Settings"
      />

    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors w-12",
        active ? "text-[#3C48F6] dark:text-blue-400" : "text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white"
      )}
    >
      <Icon size={20} strokeWidth={active ? 3 : 2} />
      <span className="text-[10px] font-black uppercase">{label}</span>
    </button>
  );
}