'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa';

// Map icons
const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, TWITTER: FaTwitter, INSTAGRAM: FaInstagram, LINKEDIN: FaLinkedinIn, TIKTOK: FaTiktok
};

export default function CalendarView({ workspaceId }: { workspaceId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate Range for API
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // 🟢 FETCH CALENDAR DATA
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['calendar', workspaceId, format(currentDate, 'yyyy-MM')],
    queryFn: () => api.get<any[]>(`/calendar?workspaceId=${workspaceId}&start=${format(calendarStart, 'yyyy-MM-dd')}&end=${format(calendarEnd, 'yyyy-MM-dd')}`),
    enabled: !!workspaceId
  });

  // Generate Grid Days
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b-2 border-black bg-yellow-400">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* DAYS HEADER */}
      <div className="grid grid-cols-7 border-b-2 border-black">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-3 text-center border-r-2 border-black last:border-r-0 font-black text-xs bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, dayIdx) => {
            // Find posts for this day
            const dayPosts = posts.filter(p => isSameDay(parseISO(p.scheduledFor), day));
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()} 
                className={`
                  min-h-[120px] p-2 border-b-2 border-r-2 border-black last:border-r-0
                  ${!isCurrentMonth ? 'bg-gray-100 opacity-50' : 'bg-white'}
                  ${(dayIdx + 1) % 7 === 0 ? 'border-r-0' : ''} /* Fix right border on last col */
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-transparent
                    ${isToday ? 'bg-red-500 text-white border-black rounded-full' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {dayPosts.length > 0 && <span className="text-[10px] font-mono bg-black text-white px-1">{dayPosts.length}</span>}
                </div>

                {/* POST PILLS */}
                <div className="space-y-1">
                  {dayPosts.map((post: any) => {
                    // Logic to find icon (using first account)
                    const platform = post.socialAccounts?.[0]?.platform || 'FACEBOOK';
                    const Icon = ICONS[platform] || ICONS.FACEBOOK;
                    
                    return (
                      <div key={post.id} className="group relative flex items-center gap-1 p-1 bg-yellow-100 border border-black text-[10px] font-bold cursor-pointer hover:bg-yellow-300 transition-colors truncate">
                        <Icon size={10} />
                        <span className="truncate">{post.content}</span>
                        
                        {/* TOOLTIP */}
                        <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-black text-white p-2 text-xs z-10 mb-1 border-2 border-white shadow-xl">
                            <p className="line-clamp-3">{post.content}</p>
                            <p className="text-[9px] mt-1 text-gray-400">{format(parseISO(post.scheduledFor), 'HH:mm')}</p>
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