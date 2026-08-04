'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-semibold transition-colors ${
      active
        ? 'bg-[#040028] dark:bg-black text-white'
        : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white hover:bg-[#040028]/10 dark:hover:bg-white/10'
    }`}
  >
    <Icon size={18} strokeWidth={2} />
    {label}
  </button>
);
