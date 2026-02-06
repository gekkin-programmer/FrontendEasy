'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO,
  addDays, setHours, setMinutes
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, GripVertical } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa6';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, TWITTER: FaTwitter, INSTAGRAM: FaInstagram, 
  LINKEDIN: FaLinkedinIn, TIKTOK: FaTiktok, YOUTUBE: FaYoutube, WHATSAPP: FaWhatsapp
};

// 🟢 DRAGGABLE ITEM COMPONENT
const DraggablePost = ({ post, onClick }: { post: any, onClick: (post: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const rawAccount = post.socialAccounts?.[0];
  const platform = rawAccount?.socialAccount?.platform || rawAccount?.platform || 'FACEBOOK';
  const Icon = ICONS[platform] || ICONS.FACEBOOK;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative flex items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-[10px] font-black cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      onClick={() => onClick(post)}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black dark:hover:text-white">
        <GripVertical size={10} />
      </div>
      <Icon size={10} className="flex-shrink-0" />
      <span className="truncate flex-1 uppercase tracking-tighter">{post.content || 'No Content'}</span>
      
      {/* Tooltip */}
      <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-black text-white p-2 text-[10px] z-[100] mb-2 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
          <p className="line-clamp-3 font-bold">{post.content}</p>
          <div className="flex justify-between mt-2 pt-2 border-t border-white/20 font-mono text-[8px] opacity-70 uppercase">
              <span>{platform}</span>
              <span>{format(parseISO(post.scheduledFor), 'HH:mm')}</span>
          </div>
      </div>
    </div>
  );
};

export default function CalendarView({ workspaceId, onPostClick }: { workspaceId: string, onPostClick?: (post: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['calendar', workspaceId, format(currentDate, 'yyyy-MM')],
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&start=${format(calendarStart, 'yyyy-MM-dd')}&end=${format(calendarEnd, 'yyyy-MM-dd')}`),
    enabled: !!workspaceId
  });

  // 🟢 MUTATION FOR DRAG & DROP RESCHEDULING
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date }: { id: string, date: string }) => 
        api.patch(`/posts/${id}`, { scheduledFor: date }),
    onSuccess: () => {
        toast.success("CONTENT_RESCHEDULED");
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error("RESCHEDULE_FAILED")
  });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id;
    const targetDateStr = over.id; // Cell ID is the date string

    if (postId && targetDateStr) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newDate = parseISO(targetDateStr);
        const oldDate = parseISO(post.scheduledFor);
        
        // Preserve original time
        const updatedDate = setMinutes(setHours(newDate, oldDate.getHours()), oldDate.getMinutes());

        // Optimistic Update
        queryClient.setQueryData(['calendar', workspaceId, format(currentDate, 'yyyy-MM')], (old: any) => {
            return old.map((p: any) => p.id === postId ? { ...p, scheduledFor: updatedDate.toISOString() } : p);
        });

        rescheduleMutation.mutate({ id: postId, date: updatedDate.toISOString() });
    }
  };

  return (
    <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] transition-all overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b-4 border-black dark:border-white bg-[#3C48F5] text-white">
        <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
            {format(currentDate, 'MMMM')}
            </h2>
            <p className="font-mono text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">{format(currentDate, 'yyyy')} // Content_Timeline</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 bg-white text-black border-2 border-black hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"><ChevronLeft size={20} strokeWidth={3} /></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 bg-white text-black border-2 border-black hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"><ChevronRight size={20} strokeWidth={3}/></button>
        </div>
      </div>

      {/* DAYS HEADER */}
      <div className="grid grid-cols-7 border-b-2 border-black dark:border-white transition-colors bg-zinc-100 dark:bg-zinc-900">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-3 text-center border-r-2 border-black dark:border-white last:border-r-0 font-black text-[10px] tracking-widest text-black dark:text-white uppercase">{day}</div>
        ))}
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-white dark:bg-zinc-900"><Loader2 className="w-12 h-12 animate-spin text-[#3C48F5]" /></div>
      ) : (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-7 auto-rows-fr bg-black dark:bg-white gap-[2px]">
            {days.map((day, dayIdx) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayPosts = posts.filter(p => p.scheduledFor && isSameDay(parseISO(p.scheduledFor), day));
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                <div 
                    key={dayStr} 
                    id={dayStr}
                    className={`min-h-[140px] p-2 transition-colors relative flex flex-col gap-2 ${
                        !isCurrentMonth ? 'bg-gray-100 dark:bg-zinc-800 opacity-40' : 'bg-white dark:bg-zinc-900'
                    }`}
                >
                    <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-black w-7 h-7 flex items-center justify-center border-2 ${
                        isToday ? 'bg-black text-white dark:bg-white dark:text-black border-black' : 'text-black dark:text-white border-transparent'
                    }`}>{format(day, 'd')}</span>
                    {dayPosts.length > 0 && (
                        <span className="text-[8px] font-mono font-black border border-black dark:border-white px-1.5 py-0.5 bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]">
                            {dayPosts.length}_NODES
                        </span>
                    )}
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                        <SortableContext 
                            items={dayPosts.map(p => p.id)} 
                            strategy={verticalListSortingStrategy}
                        >
                            {dayPosts.map((post: any) => (
                                <DraggablePost 
                                    key={post.id} 
                                    post={post} 
                                    onClick={onPostClick || (() => {})} 
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>
                );
            })}
            </div>
        </DndContext>
      )}
    </div>
  );
}