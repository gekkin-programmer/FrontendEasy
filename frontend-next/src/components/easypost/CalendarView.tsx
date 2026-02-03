'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa';

const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, TWITTER: FaTwitter, INSTAGRAM: FaInstagram, LINKEDIN: FaLinkedinIn, TIKTOK: FaTiktok
};

export default function CalendarView({ workspaceId, onPostClick }: { workspaceId: string, onPostClick?: (post: any) => void }) {
  // Defaults to today. If your posts are in 2026, ensure this matches!
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['calendar', workspaceId, format(currentDate, 'yyyy-MM')],
    queryFn: () => api.get<any[]>(`/calendar?workspaceId=${workspaceId}&start=${format(calendarStart, 'yyyy-MM-dd')}&end=${format(calendarEnd, 'yyyy-MM-dd')}`),
    enabled: !!workspaceId
  });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] transition-colors">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b-2 border-black dark:border-white bg-yellow-400 dark:bg-yellow-600 transition-colors">
        {/* Shows Month AND Year */}
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:shadow-none"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:shadow-none"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* DAYS HEADER */}
      <div className="grid grid-cols-7 border-b-2 border-black dark:border-white transition-colors">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-3 text-center border-r-2 border-black dark:border-white last:border-r-0 font-black text-xs bg-gray-50 dark:bg-zinc-800 text-black dark:text-white transition-colors">{day}</div>
        ))}
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-white dark:bg-black transition-colors"><Loader2 className="w-12 h-12 animate-spin text-black dark:text-white" /></div>
      ) : (
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, dayIdx) => {
            // Filter posts for this day
            const dayPosts = posts.filter(p => p.scheduledFor && isSameDay(parseISO(p.scheduledFor), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div key={day.toString()} className={`min-h-[120px] p-2 border-b-2 border-r-2 border-black dark:border-white last:border-r-0 transition-colors ${!isCurrentMonth ? 'bg-gray-100 dark:bg-zinc-900 opacity-50' : 'bg-white dark:bg-zinc-900'} ${(dayIdx + 1) % 7 === 0 ? 'border-r-0' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-transparent ${isToday ? 'bg-red-500 text-white border-black dark:border-white rounded-full' : 'text-gray-700 dark:text-zinc-400'}`}>{format(day, 'd')}</span>
                  {dayPosts.length > 0 && <span className="text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black px-1">{dayPosts.length}</span>}
                </div>

                <div className="space-y-1">
                  {dayPosts.map((post: any) => {
                    // 🟢 FIX: Handle the Nested Structure from your logs
                    // socialAccounts -> [0] -> socialAccount -> platform
                    const rawAccount = post.socialAccounts?.[0];
                    const platform = rawAccount?.socialAccount?.platform // Nested (DB)
                                  || rawAccount?.platform            // Flat (if backend fixes)
                                  || 'FACEBOOK';                     // Fallback
                    
                    const Icon = ICONS[platform] || ICONS.FACEBOOK;
                    
                    return (
                      <div key={post.id} 
                        onClick={(e) => { e.stopPropagation(); onPostClick?.(post); }}
                        className="group relative flex items-center gap-1 p-1 bg-yellow-100 dark:bg-yellow-900/30 border border-black dark:border-white text-[10px] font-bold cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors truncate text-black dark:text-white">
                        <Icon size={10} />
                        <span className="truncate">{post.content}</span>
                        
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-black dark:bg-zinc-900 text-white dark:text-white p-2 text-xs z-10 mb-1 border-2 border-white dark:border-white shadow-xl">
                            <p className="line-clamp-3">{post.content}</p>
                            <p className="text-[9px] mt-1 text-gray-400 dark:text-zinc-500 font-mono">
                                {format(parseISO(post.scheduledFor), 'HH:mm')}
                            </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}