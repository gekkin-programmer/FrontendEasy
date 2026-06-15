'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, ShieldCheck, 
  MessageSquare, BarChart3, Settings, 
  ArrowLeft, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/admin' },
    { icon: <Users size={20} />, label: 'Users', href: '/admin/users' },
    { icon: <ShieldCheck size={20} />, label: 'Access Grants', href: '/admin/grants' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', href: '/admin/feedback' },
    { icon: <BarChart3 size={20} />, label: 'Usage', href: '/admin/usage' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r-4 border-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b-4 border-white flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3C48F5] border-2 border-white shadow-[2px_2px_0px_0px_#fff]" />
          <span className="font-black uppercase tracking-tighter text-xl">Easy_Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 font-black uppercase text-xs tracking-widest transition-all border-2
                  ${isActive 
                    ? 'bg-[#3C48F5] border-white shadow-[4px_4px_0px_0px_#fff] translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-transparent hover:bg-zinc-900'}
                `}>
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-4 border-white space-y-2">
           <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 font-black uppercase text-[10px] text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Exit to App
           </Link>
           <button className="w-full flex items-center gap-3 px-4 py-3 font-black uppercase text-[10px] text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
