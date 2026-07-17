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
        ? 'bg-[#174CD2] text-white shadow-[0_4px_14px_rgba(23,76,210,0.3)]'
        : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white hover:bg-[#174CD2]/8'
    }`}
  >
    <Icon size={18} strokeWidth={2} />
    {label}
  </button>
);
