'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Calendar, PenTool, BarChart3, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
// Ensure these paths match your shadcn installation
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './Sidebar'; 

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: LayoutGrid, label: 'Queue', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: PenTool, label: 'Create', path: '/dashboard/composer', primary: true }, 
    { icon: BarChart3, label: 'Stats', path: '/dashboard/analytics' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-black z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all active:scale-95",
                item.primary ? "bg-yellow-400 border-x-2 border-black -mt-[2px] h-[calc(100%+2px)]" : ""
              )}
            >
              <item.icon 
                size={item.primary ? 24 : 20} 
                className={cn(isActive ? "text-black fill-current" : "text-gray-500")}
                strokeWidth={2.5}
              />
              {!item.primary && (
                <span className={cn("text-[10px] font-bold uppercase mt-1", isActive ? "text-black" : "text-gray-400")}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Hamburger Menu for the rest (Settings, Team, etc.) */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full active:scale-95">
              <Menu size={20} className="text-gray-500" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase mt-1 text-gray-400">Menu</span>
            </button>
          </SheetTrigger>
          
          {/* Reuse Sidebar inside Sheet */}
          <SheetContent side="left" className="p-0 w-[85%] border-r-4 border-black bg-[#F4F4F0]">
             <Sidebar isMobile={true} onClose={() => setIsOpen(false)} /> 
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}