'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO,
  addDays, subDays, startOfDay, endOfDay, setMinutes, setHours
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, GripVertical, Download, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CalendarHeatmap from './CalendarHeatmap';

const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, TWITTER: FaTwitter, INSTAGRAM: FaInstagram,
  LINKEDIN: FaLinkedinIn, TIKTOK: FaTiktok, YOUTUBE: FaYoutube, WHATSAPP: FaWhatsapp
};

type ViewType = 'month' | 'week' | 'day';

// 🟢 TRACKING HELPER
const trackAction = (action: string, metadata: any = {}) => {
    console.log(`[ANALYTICS] ${action}`, metadata);
};

// 🟢 DROPPABLE CELL COMPONENT
const CalendarCell = ({ id, children, className, isToday, dayNum, dayLabel, postCount }: any) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "ring-4 ring-[#3C48F5] ring-inset bg-blue-50 dark:bg-blue-900/20 z-10"
      )}
    >
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-xs font-black w-7 h-7 flex items-center justify-center border-2 transition-colors",
                    isToday ? 'bg-black text-white dark:bg-white dark:text-black border-black' : 'text-black dark:text-white border-transparent'
                )}>
                    {dayNum}
                </span>
                {dayLabel && <span className="text-[10px] font-black uppercase opacity-60 font-mono">{dayLabel}</span>}
            </div>
            {postCount > 0 && (
                <span className="text-[8px] font-mono font-black border border-black dark:border-white px-1.5 py-0.5 bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]">
                    {postCount}_NODES
                </span>
            )}
        </div>
        {children}
    </div>
  );
};

// 🟢 DRAGGABLE ITEM COMPONENT
const DraggablePost = ({ post, onClick, viewType }: { post: any, onClick: (post: any) => void, viewType: ViewType }) => {
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

  const socialAccounts = post.socialAccounts || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
          "group relative flex items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-[10px] font-black cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
          viewType === 'day' ? "p-3 text-xs" : ""
      )}
      onClick={() => onClick(post)}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black dark:hover:text-white">
        <GripVertical size={viewType === 'day' ? 14 : 10} />
      </div>
      
      <div className="flex -space-x-1 overflow-hidden shrink-0">
        {socialAccounts.map((sa: any, idx: number) => {
            const platform = sa.socialAccount?.platform || sa.platform || 'FACEBOOK';
            const Icon = ICONS[platform] || ICONS.FACEBOOK;
            return (
                <div key={idx} className="bg-white dark:bg-black border border-black dark:border-white p-0.5 z-[1]">
                    <Icon size={viewType === 'day' ? 12 : 8} />
                </div>
            );
        })}
      </div>

      <span className="truncate flex-1 uppercase tracking-tighter ml-1">{post.content || 'No Content'}</span>

      <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-black text-white p-2 text-[10px] z-[100] mb-2 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
          <p className="line-clamp-3 font-bold">{post.content}</p>
          <div className="flex flex-col mt-2 pt-2 border-t border-white/20 font-mono text-[8px] opacity-70 uppercase gap-1">
              <div className="flex justify-between">
                <span>Targets:</span>
                <span>{socialAccounts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{post.scheduledFor ? format(parseISO(post.scheduledFor), 'HH:mm') : 'N/A'}</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default function CalendarView({ workspaceId, onPostClick }: { workspaceId: string, onPostClick?: (post: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const queryClient = useQueryClient();

  const { start, end } = useMemo(() => {
    if (viewType === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return { start: startOfWeek(monthStart), end: endOfWeek(monthEnd) };
    } else if (viewType === 'week') {
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    } else {
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    }
  }, [currentDate, viewType]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['calendar', workspaceId, viewType, format(currentDate, 'yyyy-MM-dd')],
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`),
    enabled: !!workspaceId
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date }: { id: string, date: string }) => 
        api.patch(`/posts/${id}`, { scheduledFor: date }),
    onSuccess: () => {
        trackAction('calendar_drag_drop', { workspaceId });
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error("RESCHEDULE_FAILED")
  });

  const days = eachDayOfInterval({ start, end });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id;
    const targetDateStr = over.id;

    if (postId && targetDateStr) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newDate = parseISO(targetDateStr);
        const oldDate = parseISO(post.scheduledFor);
        const updatedDate = setMinutes(setHours(newDate, oldDate.getHours()), oldDate.getMinutes());

        queryClient.setQueryData(['calendar', workspaceId, viewType, format(currentDate, 'yyyy-MM-dd')], (old: any) => {
            return old?.map((p: any) => p.id === postId ? { ...p, scheduledFor: updatedDate.toISOString() } : p) || [];
        });

        rescheduleMutation.mutate({ id: postId, date: updatedDate.toISOString() });
    }
  };

  const handleExport = () => {
      const headers = ['Date', 'Platform', 'Content', 'Status'];
      const rows = posts.map(p => {
          const content = (p.content || '').replace(/"/g, '""');
          return [
            format(parseISO(p.scheduledFor), 'yyyy-MM-dd HH:mm'),
            p.socialAccounts?.[0]?.socialAccount?.platform || 'UNKNOWN',
            `"${content}"`,
            p.status
          ];
      });
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.body.appendChild(document.createElement("a"));
      link.href = encodedUri;
      link.download = `calendar_export_${format(new Date(), 'yyyy_MM_dd')}.csv`;
      link.click();
      link.remove();
      
      trackAction('calendar_export', { workspaceId, postCount: posts.length });
      toast.success("EXPORT_GENERATED");
  };

  const navigate = (direction: 'prev' | 'next') => {
      let nextDate;
      if (viewType === 'month') nextDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
      else if (viewType === 'week') nextDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
      else nextDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
      setCurrentDate(nextDate);
  };

  return (
    <div className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] transition-all overflow-hidden">
      
      <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b-4 border-black dark:border-white bg-[#3C48F5] text-white gap-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <CalendarIcon size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                {format(currentDate, viewType === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
                </h2>
                <p className="font-mono text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">{viewType}_VIEW // ENGINE_READY</p>
            </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="flex bg-black/20 p-1 border-2 border-black/30">
              {(['month', 'week', 'day'] as ViewType[]).map(v => (
                  <button 
                    key={v}
                    onClick={() => { setViewType(v); trackAction('calendar_view_change', { type: v }); }}
                    className={cn(
                        "px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all",
                        viewType === v ? "bg-white text-black shadow-[2px_2px_0px_0px_#000]" : "hover:text-yellow-300"
                    )}
                  >
                      {v}
                  </button>
              ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigate('prev')} className="p-3 bg-white text-black border-2 border-black hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"><ChevronLeft size={18} strokeWidth={3} /></button>
            <button onClick={() => navigate('next')} className="p-3 bg-white text-black border-2 border-black hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"><ChevronRight size={18} strokeWidth={3}/></button>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 p-3 bg-yellow-400 text-black border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Download size={16} /> Export
          </button>

          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
                "flex items-center gap-2 p-3 border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all",
                showHeatmap ? "bg-black text-white" : "bg-white text-black"
            )}
          >
            <Sparkles size={16} className={cn(showHeatmap ? "text-yellow-400" : "text-gray-400")} /> Insights
          </button>
        </div>
      </div>

      {viewType !== 'day' && (
        <div className="grid grid-cols-7 border-b-2 border-black dark:border-white transition-colors bg-zinc-100 dark:bg-zinc-900 font-mono">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="p-3 text-center border-r-2 border-black dark:border-white last:border-r-0 font-black text-[9px] tracking-widest text-black dark:text-white uppercase">{day}</div>
            ))}
        </div>
      )}

      <AnimatePresence>
        {showHeatmap && <CalendarHeatmap workspaceId={workspaceId} onClose={() => setShowHeatmap(false)} />}
      </AnimatePresence>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-white dark:bg-zinc-900"><Loader2 className="w-12 h-12 animate-spin text-[#3C48F5]" /></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className={cn(
                "grid bg-black dark:bg-white gap-[2px]",
                viewType === 'day' ? "grid-cols-1" : "grid-cols-7 auto-rows-fr"
            )}>
            {days.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayPosts = posts.filter(p => p.scheduledFor && isSameDay(parseISO(p.scheduledFor), day));
                const totalNodes = dayPosts.reduce((sum, p) => sum + (p.socialAccounts?.length || 0), 0);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                <CalendarCell 
                    key={dayStr} 
                    id={dayStr}
                    dayNum={format(day, 'd')}
                    dayLabel={viewType === 'day' ? format(day, 'EEEE MMMM yyyy') : null}
                    isToday={isToday}
                    postCount={totalNodes}
                    className={cn(
                        "transition-colors relative flex flex-col gap-2 p-2",
                        viewType === 'day' ? "min-h-[400px]" : "min-h-[140px]",
                        !isCurrentMonth && viewType === 'month' ? 'bg-gray-100 dark:bg-zinc-800 opacity-40' : 'bg-white dark:bg-zinc-900'
                    )}
                >
                    <div className={cn(
                        "flex-1 space-y-2 overflow-y-auto scrollbar-hide",
                        viewType === 'day' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""
                    )}>
                        <SortableContext items={dayPosts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            {dayPosts.map((post: any) => (
                                <DraggablePost key={post.id} post={post} onClick={onPostClick || (() => {})} viewType={viewType} />
                            ))}
                        </SortableContext>
                    </div>
                </CalendarCell>
                );
            })}
            </div>
        </DndContext>
      )}
    </div>
  );
}