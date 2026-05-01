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
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-wider border-2 border-black dark:border-white transition-all ${
      active
        ? 'bg-[#3C48F5] text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]'
        : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-blue-50 dark:hover:bg-zinc-800 hover:translate-x-1'
    }`}
  >
    <Icon size={18} strokeWidth={2.5} />
    {label}
  </button>
);
