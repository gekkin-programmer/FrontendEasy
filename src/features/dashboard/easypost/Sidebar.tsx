'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PenTool, BarChart3, Settings, Users, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { icon: LayoutGrid, label: t('Queue', 'File'), path: '/dashboard' },
    { icon: Calendar, label: t('Calendar', 'Calendrier'), path: '/dashboard/calendar' },
    { icon: PenTool, label: t('Composer', 'Compositeur'), path: '/dashboard/composer' },
    { icon: BarChart3, label: t('Analytics', 'Analytique'), path: '/dashboard/analytics' },
    { icon: Users, label: t('Team', 'Équipe'), path: '/dashboard/team' },
    { icon: Settings, label: t('Settings', 'Paramètres'), path: '/dashboard/settings' },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-[#0A0A2E] transition-colors", isMobile ? "w-full" : "w-64 border-r border-black/5 dark:border-white/5")}>

      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#174CD2] text-white flex items-center justify-center font-bold">E</div>
          <span className="font-bold text-xl text-[#040028] dark:text-white">Easypost</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose} // Close sheet on mobile click
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-[10px] font-semibold text-sm transition-all",
                isActive
                  ? "bg-[#174CD2]/10 text-[#174CD2]"
                  : "text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={18} className={isActive ? "text-[#174CD2]" : "text-[#8E8E8E]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">
        <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-[10px] font-semibold text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut size={18} />
          {t('Logout', 'Déconnexion')}
        </button>
      </div>
    </div>
  );
}