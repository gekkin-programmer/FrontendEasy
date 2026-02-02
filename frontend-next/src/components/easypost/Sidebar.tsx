'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PenTool, BarChart3, Settings, Users, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useLanguage } from '@/src/context/LanguageContext';

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
    <div className={cn("flex flex-col h-full bg-[#F4F4F0] border-r-2 border-black", isMobile ? "w-full" : "w-64")}>
      
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b-2 border-black bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black border-2 border-transparent">E</div>
          <span className="font-black text-xl tracking-tighter">EASYPOST.</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 border-2 border-black hover:bg-red-500 hover:text-white transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose} // Close sheet on mobile click
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-bold text-sm uppercase border-2 border-transparent transition-all hover:translate-x-1",
                isActive 
                  ? "bg-white border-black shadow-[4px_4px_0px_0px_#000]" 
                  : "text-gray-500 hover:text-black hover:bg-white hover:border-black"
              )}
            >
              <item.icon size={18} strokeWidth={2.5} className={isActive ? "text-black" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t-2 border-black bg-white">
        <button className="flex items-center gap-3 w-full px-4 py-3 font-bold text-sm uppercase text-red-600 border-2 border-transparent hover:border-black hover:bg-red-50 transition-all">
          <LogOut size={18} strokeWidth={2.5} />
          {t('Logout', 'Déconnexion')}
        </button>
      </div>
    </div>
  );
}