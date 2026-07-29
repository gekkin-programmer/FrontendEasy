'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO,
  addDays, subDays, startOfDay, endOfDay, setMinutes, setHours
} from 'date-fns';
import { ChevronLeft, ChevronRight, GripVertical, Download, Pencil, FileCheck, Plus } from 'lucide-react';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { motion } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa6';
import {
  DndContext,
  DragOverlay,
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
import { useAppToast } from '@/hooks/useAppToast';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, TWITTER: FaTwitter, INSTAGRAM: FaInstagram,
  LINKEDIN: FaLinkedinIn, TIKTOK: FaTiktok, YOUTUBE: FaYoutube, WHATSAPP: FaWhatsapp
};

// ---------------------------------------------------------------------------
// TEMP PREVIEW DATA — remove once the API returns real calendar posts.
// Only kicks in when the query comes back empty, so real data always wins.
// Dates are relative to "today" so they always land inside the visible grid.
// ---------------------------------------------------------------------------
const acc = (platform: string) => [{ socialAccount: { platform } }];
const MOCK_CALENDAR_POSTS = [
  { id: 'mock-cal-1', content: 'Ravis de partager notre dernière mise à jour produit !', status: 'PUBLISHED', scheduledFor: addDays(new Date(), -3).toISOString(), socialAccounts: acc('INSTAGRAM') },
  { id: 'mock-cal-2', content: '5 astuces pour développer votre audience ce mois-ci.', status: 'PUBLISHED', scheduledFor: addDays(new Date(), -2).toISOString(), socialAccounts: acc('TIKTOK') },
  { id: 'mock-cal-3', content: 'Les coulisses de notre dernier shooting photo 📸', status: 'PUBLISHED', scheduledFor: addDays(new Date(), -1).toISOString(), socialAccounts: acc('FACEBOOK') },
  { id: 'mock-cal-4', content: 'Merci à tous ceux qui ont rejoint notre session en direct !', status: 'SCHEDULED', scheduledFor: new Date().toISOString(), socialAccounts: acc('LINKEDIN') },
  { id: 'mock-cal-5', content: 'La nouvelle collection est en ligne — venez voir ! ✨', status: 'SCHEDULED', scheduledFor: new Date().toISOString(), socialAccounts: acc('INSTAGRAM') },
  { id: 'mock-cal-6', content: 'Petit sondage : quelle fonctionnalité devrait-on développer ensuite ?', status: 'PENDING_APPROVAL', scheduledFor: addDays(new Date(), 2).toISOString(), socialAccounts: acc('TWITTER') },
  { id: 'mock-cal-7', content: 'Nouveau tuto vidéo cette semaine, restez connectés.', status: 'SCHEDULED', scheduledFor: addDays(new Date(), 4).toISOString(), socialAccounts: acc('YOUTUBE') },
  { id: 'mock-cal-8', content: 'On recrute ! Rejoignez une équipe passionnée.', status: 'SCHEDULED', scheduledFor: addDays(new Date(), 6).toISOString(), socialAccounts: acc('FACEBOOK') },
  { id: 'mock-cal-9', content: 'Behind-the-scenes de notre prochaine campagne.', status: 'SCHEDULED', scheduledFor: addDays(new Date(), 9).toISOString(), socialAccounts: acc('WHATSAPP') },
  { id: 'mock-cal-10', content: 'Question du jour : votre fonctionnalité préférée ?', status: 'SCHEDULED', scheduledFor: addDays(new Date(), 12).toISOString(), socialAccounts: acc('TIKTOK') },
];

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-px bg-black/5 dark:bg-white/5">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="min-h-[100px] p-2 bg-white dark:bg-[#0A0A2E] space-y-2">
          <Skeleton width={20} height={20} radius="rounded" />
          {i % 3 === 0 && <Skeleton width="100%" height={32} radius={2} />}
          {i % 5 === 0 && <Skeleton width="100%" height={32} radius={2} />}
        </div>
      ))}
    </div>
  );
}

type ViewType = 'month' | 'week' | 'day';

// 🟢 TRACKING HELPER
const trackAction = (action: string, metadata: any = {}) => {
    console.log(`[ANALYTICS] ${action}`, metadata);
};

// 🟢 DROPPABLE CELL COMPONENT
const CalendarCell = ({ id, children, className, isToday, isPast, dayNum, dayLabel, onQuickCreate }: any) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(className, "group/cell")}
    >
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                    isToday ? 'bg-[#040028] text-white dark:bg-white dark:text-[#040028]' : 'bg-[#F7F6F3] dark:bg-transparent text-[#040028] dark:text-white'
                )}>
                    {dayNum}
                </span>
                {dayLabel && <span className="text-xs font-semibold text-[#8E8E8E]">{dayLabel}</span>}
            </div>
            <div className="flex items-center gap-1.5">
                {!isPast && onQuickCreate && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickCreate(); }}
                        title="Quick post"
                        className="opacity-0 group-hover/cell:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white hover:bg-[#040028] hover:text-white dark:hover:bg-white dark:hover:text-[#040028] transition-all"
                    >
                        <Plus size={12} strokeWidth={2.5} />
                    </button>
                )}
            </div>
        </div>
        {children}
    </div>
  );
};

// 🟢 DRAGGABLE ITEM COMPONENT
const DraggablePost = ({ post, onClick, viewType, canApprove, onApprove }: { post: any, onClick: (post: any) => void, viewType: ViewType, canApprove?: boolean, onApprove?: (post: any) => void }) => {
  const { t } = useLanguage();
  const needsApproval = post.status === 'PENDING_APPROVAL' || post.status === 'REVIEW';
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
      {...listeners}
      className={cn(
          "group relative flex items-center gap-1.5 p-1.5 rounded-[8px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 text-[10px] font-medium transition-all cursor-grab active:cursor-grabbing",
          viewType === 'day' ? "p-3 text-xs" : ""
      )}
    >
      <div className="text-[#8E8E8E] shrink-0">
        <GripVertical size={viewType === 'day' ? 14 : 10} />
      </div>

      <div className="flex -space-x-1 overflow-hidden shrink-0">
        {socialAccounts.map((sa: any, idx: number) => {
            const platform = sa.socialAccount?.platform || sa.platform || 'FACEBOOK';
            const Icon = ICONS[platform] || ICONS.FACEBOOK;
            return (
                <div key={idx} className="bg-white dark:bg-[#0A0A2E] rounded-full ring-2 ring-white dark:ring-[#0A0A2E] p-0.5 z-[1] text-[#040028] dark:text-white">
                    <Icon size={viewType === 'day' ? 12 : 8} />
                </div>
            );
        })}
      </div>

      <span className="truncate flex-1 ml-1 text-[#040028] dark:text-white">{post.content || t('No content', 'Aucun contenu')}</span>

      {needsApproval && (
        <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-semibold uppercase bg-yellow-100 text-yellow-800">
          {t('Pending', 'En attente')}
        </span>
      )}

      {needsApproval && canApprove && (
        <button
          onClick={(e) => { e.stopPropagation(); onApprove?.(post); }}
          title={t('Approve & publish', 'Approuver et publier')}
          className="p-0.5 text-green-600 hover:text-green-700 transition-colors shrink-0"
        >
          <FileCheck size={viewType === 'day' ? 12 : 8} />
        </button>
      )}

      {post.status !== 'PUBLISHED' && post.status !== 'PUBLISHING' && (
        <button
          onClick={(e) => { e.stopPropagation(); onClick(post); }}
          className="p-0.5 text-[#8E8E8E] hover:text-[#174CD2] transition-colors shrink-0"
        >
          <Pencil size={viewType === 'day' ? 12 : 8} />
        </button>
      )}
    </div>
  );
};

export default function CalendarView({ workspaceId, onPostClick, onDateClick, canApprove = false, workspaceTimezone = 'UTC' }: { workspaceId: string, onPostClick?: (post: any) => void, onDateClick?: (dateStr: string) => void, canApprove?: boolean, workspaceTimezone?: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [activePost, setActivePost] = useState<any>(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const toast = useAppToast();

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

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ['calendar', workspaceId, viewType, format(currentDate, 'yyyy-MM-dd')],
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`),
    enabled: !!workspaceId,
    gcTime: 0,
  });
  const posts = rawPosts.length > 0 ? rawPosts : MOCK_CALENDAR_POSTS;

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date }: { id: string, date: string }) =>
        api.patch(`/posts/${id}`, { scheduledFor: date }),
    onSuccess: () => {
        trackAction('calendar_drag_drop', { workspaceId });
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
    },
    onError: () => toast.error(t("Reschedule failed", "Échec de la replanification"))
  });

  const approveMutation = useMutation({
    mutationFn: (postId: string) => api.post(`/posts/${postId}/approve`, {}),
    onSuccess: () => {
        toast.success(t("Approved and published", "Approuvé et publié"));
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
    },
    onError: () => toast.error(t("Approval failed", "Échec de l'approbation"))
  });

  const days = eachDayOfInterval({ start, end });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6, delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActivePost(posts.find(p => p.id === event.active.id) || null);
  };

  const handleDragEnd = (event: any) => {
    setActivePost(null);
    const { active, over } = event;
    if (!over) return;

    const postId = active.id;
    const targetDateStr = over.id;

    if (postId && targetDateStr && /^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.status === 'PUBLISHED' || post.status === 'PUBLISHING') {
            toast.info(t("Published posts cannot be rescheduled", "Les publications publiées ne peuvent pas être replanifiées"));
            return;
        }

        const newDate = parseISO(targetDateStr);
        const oldDate = post.scheduledFor ? parseISO(post.scheduledFor) : new Date();
        const updatedDate = setMinutes(setHours(newDate, oldDate.getHours()), oldDate.getMinutes());

        queryClient.setQueryData(['calendar', workspaceId, viewType, format(currentDate, 'yyyy-MM-dd')], (old: any) => {
            return old?.map((p: any) => p.id === postId ? { ...p, scheduledFor: updatedDate.toISOString() } : p) || [];
        });

        rescheduleMutation.mutate({ id: postId, date: updatedDate.toISOString() });
    }
  };

  const handleExport = () => {
      const headers = [t('Date', 'Date'), t('Platform', 'Plateforme'), t('Content', 'Contenu'), t('Status', 'Statut')];
      const rows = posts.map(p => {
          const content = (p.content || '').replace(/"/g, '""');
          return [
            format(parseISO(p.scheduledFor), 'yyyy-MM-dd HH:mm'),
            p.socialAccounts?.[0]?.socialAccount?.platform || 'UNKNOWN',
            `"${content}"`,
            p.status
          ];
      });
      const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["﻿" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `calendar_export_${format(new Date(), 'yyyy_MM_dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      trackAction('calendar_export', { workspaceId, postCount: posts.length });
      toast.success(t("Export generated", "Export généré"));
  };

  const navigate = (direction: 'prev' | 'next') => {
      let nextDate;
      if (viewType === 'month') nextDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
      else if (viewType === 'week') nextDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
      else nextDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
      setCurrentDate(nextDate);
  };

  return (
    <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-none transition-all overflow-hidden">

      <div className="flex flex-col lg:flex-row items-center justify-between p-6 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white gap-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold leading-none">
                {format(currentDate, viewType === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
                </h2>
            </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="flex bg-white dark:bg-white/5 border border-[#D9D9D9] dark:border-white/10 p-1 rounded-[10px]">
              {(['month', 'week', 'day'] as ViewType[]).map(v => (
                  <button
                    key={v}
                    onClick={() => { setViewType(v); trackAction('calendar_view_change', { type: v }); }}
                    className={cn(
                        "px-3 py-1.5 rounded-[8px] text-xs font-semibold capitalize transition-all",
                        viewType === v ? "bg-[#F7F6F3] dark:bg-[#0A0A2E] text-[#040028] dark:text-white" : "text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white"
                    )}
                  >
                      {t(v, v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour')}
                  </button>
              ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigate('prev')} className="p-2.5 rounded-[10px] bg-white dark:bg-white/5 border border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"><ChevronLeft size={18} /></button>
            <button onClick={() => navigate('next')} className="p-2.5 rounded-[10px] bg-white dark:bg-white/5 border border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"><ChevronRight size={18}/></button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white font-semibold text-sm hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all"
          >
            <Download size={16} /> {t("Export", "Exporter")}
          </button>
        </div>
      </div>

      {viewType !== 'day' && (
        <div className="grid grid-cols-7 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
            {[t('Sun','Dim'), t('Mon','Lun'), t('Tue','Mar'), t('Wed','Mer'), t('Thu','Jeu'), t('Fri','Ven'), t('Sat','Sam')].map((day, i) => (
            <div key={i} className="p-3 text-center font-semibold text-xs text-[#8E8E8E]">{day}</div>
            ))}
        </div>
      )}

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={cn(
                "grid gap-px bg-black/5 dark:bg-white/5",
                viewType === 'day' ? "grid-cols-1" : "grid-cols-7 auto-rows-fr"
            )}>
            {days.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayPosts = posts.filter(p => p.scheduledFor && isSameDay(parseISO(p.scheduledFor), day));
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isPast = day < startOfDay(new Date());

                return (
                <CalendarCell
                    key={dayStr}
                    id={dayStr}
                    dayNum={format(day, 'd')}
                    dayLabel={viewType === 'day' ? format(day, 'EEEE MMMM yyyy') : null}
                    isToday={isToday}
                    isPast={isPast}
                    onQuickCreate={onDateClick ? () => onDateClick(dayStr) : undefined}
                    className={cn(
                        "transition-colors relative flex flex-col gap-2 p-2",
                        viewType === 'day' ? "min-h-[400px]" : "min-h-[140px]",
                        !isCurrentMonth && viewType === 'month' ? 'bg-[#F7F6F3] dark:bg-white/[0.02] opacity-50' : 'bg-white dark:bg-[#0A0A2E]'
                    )}
                >
                    <div className={cn(
                        "flex-1 space-y-2 overflow-y-auto scrollbar-hide",
                        viewType === 'day' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""
                    )}>
                        <SortableContext items={dayPosts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            {dayPosts.map((post: any) => (
                                <DraggablePost
                                    key={post.id}
                                    post={post}
                                    onClick={onPostClick || (() => {})}
                                    viewType={viewType}
                                    canApprove={canApprove}
                                    onApprove={(p) => approveMutation.mutate(p.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </CalendarCell>
                );
            })}
            </div>
            <DragOverlay dropAnimation={null}>
                {activePost && (
                    <motion.div
                        initial={{ scale: 1, rotate: 0 }}
                        animate={{ scale: 1.03, rotate: 1.5 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex items-center gap-1.5 p-1.5 rounded-[8px] bg-white dark:bg-[#0A0A2E] shadow-2xl text-[10px] font-medium w-56 cursor-grabbing"
                    >
                        <GripVertical size={10} className="text-[#8E8E8E] shrink-0" />
                        <span className="truncate flex-1 ml-1 text-[#040028] dark:text-white">{activePost.content || t('No content', 'Aucun contenu')}</span>
                    </motion.div>
                )}
            </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}