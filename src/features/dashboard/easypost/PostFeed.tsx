'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical, AlertTriangle, Send, RefreshCw, FileCheck, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAppToast } from '@/hooks/useAppToast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { formatDateTimeInTz } from '@/lib/timezone';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, TiktokIcon, YoutubeIcon,
} from '@/components/icons/PlatformIcons';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { NeuModal } from './DashboardUI';

// --- NEU COMPONENTS ---

const NeuBadge = ({ children, className }: any) => (
  <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", className)}>
    {children}
  </span>
);

const NeuButton = ({ onClick, children, className, disabled, title }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-[10px] bg-[#F7F6F3] dark:bg-white/5 border border-transparent hover:border-[#D9D9D9] dark:hover:border-white/20 transition-all text-[#040028] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

// --- TYPES ---
interface PostMediaItem {
  id: string;
  order: number;
  media: { id: string; url: string; filename: string; mimeType: string; };
}

interface Post {
  id: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'PENDING_APPROVAL' | 'REVIEW';
  scheduledFor?: string;
  socialAccounts?: any[];
  media?: PostMediaItem[];
  errorMessage?: string;
  title?: string;
  description?: string;
}

interface Account {
  id: string;
  platform: string;
  username?: string;
  platformUsername?: string;
}

interface PostFeedProps {
  posts: Post[];
  accounts: Account[];
  workspaceId: string;
  onEdit?: (post: Post) => void;
  isLoading?: boolean;
  canApprove?: boolean;
  workspaceTimezone?: string;
}

import { Skeleton } from '@astryxdesign/core/Skeleton';

const SkeletonCard = () => (
  <div className="p-3 md:p-4 border-b border-black/5 dark:border-white/5 md:border md:rounded-[16px] bg-transparent md:bg-[#F7F6F3] md:dark:bg-[#0A0A2E]">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} radius="rounded" />
        <div className="space-y-1">
          <Skeleton width={96} height={10} radius={1} />
          <Skeleton width={64} height={8} radius={1} />
        </div>
      </div>
      <Skeleton width={64} height={20} radius="rounded" />
    </div>
    <div className="space-y-2">
      <Skeleton width="100%" height={12} radius={1} />
      <Skeleton width="80%" height={12} radius={1} />
    </div>
  </div>
);

// 🟢 MEDIA THUMBNAIL — shows a skeleton until the asset actually loads, mock or real.
// Both the skeleton and the media itself are absolutely positioned inside a wrapper
// that is purely a grid cell (sized by the fixed-size grid it lives in), so nothing
// here ever contributes to document flow — the card's height can't shift as media loads.
const MediaThumbnail = ({ pm }: { pm: PostMediaItem }) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = pm.media.mimeType?.startsWith('video/');
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Skeleton radius="none" width="100%" height="100%" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={18} className="text-black/10 dark:text-white/15" strokeWidth={1.5} />
        </div>
      </div>
      {isVideo ? (
        <video
          src={pm.media.url}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <img
          src={pm.media.url}
          alt={pm.media.filename}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
};

// 🟢 QUEUE SORT — soonest/most recent date first, undated items last
const byScheduledDateAsc = (a: Post, b: Post) => {
  if (!a.scheduledFor && !b.scheduledFor) return 0;
  if (!a.scheduledFor) return 1;
  if (!b.scheduledFor) return -1;
  return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
};

// 🟢 PLATFORM ICON HELPER
const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'twitter':
    case 'x': return <TwitterIcon size={16} />;
    case 'linkedin': return <LinkedinIcon size={16} />;
    case 'instagram': return <InstagramIcon size={16} />;
    case 'facebook': return <FacebookIcon size={16} />;
    case 'tiktok': return <TiktokIcon size={16} />;
    case 'youtube': return <YoutubeIcon size={16} />;
    default: return <span className="text-gray-400 dark:text-zinc-500 text-[10px]">#</span>;
  }
};

// 🟢 SINGLE POST CARD COMPONENT
const PostCard = ({ post, onDelete, onEdit, onCancelSchedule, onPublishNow, onRetry, onRepost, onApprove, isQueued, draggable, dragHandleProps, cardRef, isDraggingActive, canApprove, workspaceTimezone }: any) => {
  const { t } = useLanguage();
  const socialAccounts = post.socialAccounts || [];
  const firstAccount = socialAccounts[0]?.socialAccount;

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return "bg-[#174CD2]/10 text-[#174CD2]";
        case 'PUBLISHING': return "bg-green-100 text-green-700";
        case 'PUBLISHED': return "bg-green-100 text-green-700";
        case 'FAILED': return "bg-red-100 text-red-700";
        case 'PENDING_APPROVAL': return "bg-yellow-100 text-yellow-800";
        case 'REVIEW': return "bg-yellow-100 text-yellow-800";
        default: return "bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'DRAFT': return t('Draft', 'Brouillon');
        case 'SCHEDULED': return t('Scheduled', 'Planifié');
        case 'PUBLISHING': return t('Publishing…', 'Publication…');
        case 'PUBLISHED': return t('Published', 'Publié');
        case 'FAILED': return t('Failed', 'Échec');
        case 'PENDING_APPROVAL': return t('Pending approval', 'En attente d\'approbation');
        case 'REVIEW': return t('In review', 'En révision');
        default: return status;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      {...(draggable ? dragHandleProps : {})}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative transition-all duration-150 w-full max-w-full",
        // Mobile continuous list styling (transparent bg, 1px thin bottom border divider, 12-16px padding, no floating card effect)
        "bg-transparent dark:bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none p-3.5 sm:p-4 last:border-b-0 shadow-none",
        // Desktop / tablet floating card styling (100% unchanged)
        "md:bg-[#F7F6F3] md:dark:bg-[#0A0A2E] md:border md:border-black/5 md:dark:border-white/5 md:rounded-[16px] md:p-4 md:shadow-none md:last:border-b",
        draggable ? "cursor-grab active:cursor-grabbing touch-none" : "",
        isDraggingActive ? "!opacity-40 !border-dashed !border-black/10 dark:!border-white/10 !shadow-none" : ""
      )}
    >
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </div>
      )}

      {/* Desktop view */}
      <div className="hidden md:block">
        <div className={cn("flex justify-between items-start mb-3", draggable && "md:pl-4")}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {socialAccounts.map((sa: any, idx: number) => (
                  <div key={idx} className="w-8 h-8 rounded-full bg-white dark:bg-[#0A0A2E] ring-2 ring-white dark:ring-[#0A0A2E] flex items-center justify-center transition-all z-[1]">
                      <PlatformIcon platform={sa.socialAccount?.platform} />
                  </div>
              ))}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[#040028] dark:text-white">
                  {firstAccount?.username || firstAccount?.platformUsername || t("Draft", "Brouillon")}
              </p>
              <p className="text-[#8E8E8E] mt-0.5 capitalize">
                  {socialAccounts.length > 1 ? t(`${socialAccounts.length} targets`, `${socialAccounts.length} cibles`) : (firstAccount?.platform?.toLowerCase() || t("Local", "Local"))}
              </p>
            </div>
          </div>

          <NeuBadge className={getStatusColor(post.status)}>
            {getStatusLabel(post.status)}
          </NeuBadge>
        </div>

        <div className={cn("flex gap-3", draggable && "md:pl-4")}>
          {post.media && post.media.length > 0 && (
            <div className="shrink-0 flex flex-col gap-1.5">
              <div className={cn(
                "grid gap-1 relative overflow-hidden rounded-[10px]",
                post.media.length === 1 ? "w-20 h-20 grid-cols-1" : "w-32 h-32 grid-cols-2"
              )}>
                {post.media.slice(0, 4).map((pm: PostMediaItem, i: number) => (
                  <MediaThumbnail key={i} pm={pm} />
                ))}
              </div>
              <div className="space-y-0.5 max-w-[128px]">
                {post.media.slice(0, 2).map((pm: PostMediaItem, i: number) => (
                  <div key={i} className="flex items-center gap-1 min-w-0">
                    <span className={cn(
                      "text-[8px] font-semibold px-1 rounded-[3px] flex-shrink-0",
                      pm.media.mimeType?.startsWith('video/') ? "bg-[#040028] text-white" : "bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white"
                    )}>
                      {pm.media.mimeType?.startsWith('video/') ? t('Video', 'Vidéo') : t('Image', 'Image')}
                    </span>
                    <span className="text-[9px] text-[#8E8E8E] truncate">{pm.media.filename}</span>
                  </div>
                ))}
                {post.media.length > 2 && (
                  <span className="text-[9px] text-[#8E8E8E]">+{post.media.length - 2} {t('more', 'de plus')}</span>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            {post.title && <h4 className="font-semibold text-sm text-[#040028] dark:text-white truncate">{post.title}</h4>}
            <p className="text-sm font-medium text-[#040028] dark:text-white line-clamp-2 leading-relaxed">
              {post.content}
            </p>
            {post.description && <p className="text-xs text-[#8E8E8E] line-clamp-2 mt-1">{post.description}</p>}
          </div>
        </div>

        {post.status === 'FAILED' && post.errorMessage && (
          <div className="mt-3 p-2.5 rounded-[10px] bg-red-50 dark:bg-red-900/20 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertTriangle size={12} className="inline mr-1.5" />
            {post.errorMessage}
          </div>
        )}

        <div className={cn("mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center", draggable && "md:pl-4")}>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#8E8E8E]">
             {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
             <span>
               {post.scheduledFor
                 ? formatDateTimeInTz(post.scheduledFor, workspaceTimezone)
                 : t('No date set', 'Aucune date')}
             </span>
          </div>

          <div className="flex gap-1">
            {(post.status === 'PENDING_APPROVAL' || post.status === 'REVIEW') && canApprove && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onApprove?.(); }}
                title={t('Approve & publish', 'Approuver et publier')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileCheck size={14} />
              </NeuButton>
            )}

            {post.status === 'PUBLISHED' && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onRepost?.(); }}
                title={t('Repost', 'Republier')}
              >
                <RefreshCw size={14} />
              </NeuButton>
            )}

            {post.status === 'FAILED' && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onRetry?.(); }}
                title={t('Retry publication', 'Réessayer la publication')}
              >
                <RefreshCw size={14} />
              </NeuButton>
            )}

            {post.status !== 'PUBLISHED' && post.status !== 'FAILED' && post.status !== 'PUBLISHING' && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onPublishNow?.(); }}
                title={t('Publish now', 'Publier maintenant')}
              >
                <Send size={14} />
              </NeuButton>
            )}

            {isQueued && post.status === 'SCHEDULED' && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onCancelSchedule?.(); }}
                title={t('Cancel schedule', 'Annuler la planification')}
              >
                <Clock size={14} />
              </NeuButton>
            )}

            {post.status !== 'PUBLISHED' && post.status !== 'PUBLISHING' && (
              <NeuButton
                onClick={(e: any) => { e.stopPropagation(); onEdit?.(); }}
                title={t('Edit post', 'Modifier le post')}
              >
                <Edit2 size={14} />
              </NeuButton>
            )}

            <button
              onClick={(e: any) => { e.stopPropagation(); onDelete(); }}
              title={t('Delete post', 'Supprimer le post')}
              className="p-2 rounded-[10px] bg-[#F7F6F3] dark:bg-white/5 border border-transparent text-[#040028] dark:text-white hover:text-red-500 hover:border-red-500 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between w-full">
         <div className="flex -space-x-2 shrink-0 mr-3">
             {socialAccounts.map((sa: any, idx: number) => (
                 <div key={idx} className="w-8 h-8 rounded-full bg-white dark:bg-[#0A0A2E] ring-2 ring-[#F7F6F3] dark:ring-black/10 flex items-center justify-center z-[1]">
                     <PlatformIcon platform={sa.socialAccount?.platform} />
                 </div>
             ))}
         </div>

         <div className="flex-1 min-w-0 mr-3 flex flex-col justify-center">
            <p className="font-semibold text-[15px] text-[#040028] dark:text-white truncate">
                {post.title || post.content || t("Draft", "Brouillon")}
            </p>
            <p className="text-xs text-[#8E8E8E] mt-0.5 truncate">
                {getStatusLabel(post.status)} • {post.scheduledFor ? formatDateTimeInTz(post.scheduledFor, workspaceTimezone) : (socialAccounts.length > 1 ? t(`${socialAccounts.length} targets`, `${socialAccounts.length} cibles`) : (firstAccount?.platform?.toLowerCase() || t("Local", "Local")))}
            </p>
         </div>

         <div className="shrink-0 flex items-center gap-2">
            {post.media && post.media.length > 0 && (
              <div className="w-10 h-10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 relative shrink-0">
                 <MediaThumbnail pm={post.media[0]} />
                 {post.media.length > 1 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold">
                       +{post.media.length - 1}
                    </div>
                 )}
              </div>
            )}
             <Popover>
               <PopoverTrigger asChild>
                 <button className="text-[#FF2D55] p-2 -mr-2 active:opacity-70 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical size={20} />
                 </button>
               </PopoverTrigger>
               <PopoverContent align="end" className="w-56 p-1.5 bg-[#1C1C1E] border-[#333] text-white rounded-[14px] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                  {(post.status === 'PENDING_APPROVAL' || post.status === 'REVIEW') && canApprove && (
                    <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Approve & publish', 'Approuver et publier')}</span>
                      <FileCheck size={18} className="opacity-80" />
                    </button>
                  )}
                  {post.status === 'PUBLISHED' && (
                    <button onClick={(e) => { e.stopPropagation(); onRepost?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Repost', 'Republier')}</span>
                      <RefreshCw size={18} className="opacity-80" />
                    </button>
                  )}
                  {post.status === 'FAILED' && (
                    <button onClick={(e) => { e.stopPropagation(); onRetry?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Retry publication', 'Réessayer la publication')}</span>
                      <RefreshCw size={18} className="opacity-80" />
                    </button>
                  )}
                  {post.status !== 'PUBLISHED' && post.status !== 'FAILED' && post.status !== 'PUBLISHING' && (
                    <button onClick={(e) => { e.stopPropagation(); onPublishNow?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Publish now', 'Publier maintenant')}</span>
                      <Send size={18} className="opacity-80" />
                    </button>
                  )}
                  {isQueued && post.status === 'SCHEDULED' && (
                    <button onClick={(e) => { e.stopPropagation(); onCancelSchedule?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Cancel schedule', 'Annuler')}</span>
                      <Clock size={18} className="opacity-80" />
                    </button>
                  )}
                  {post.status !== 'PUBLISHED' && post.status !== 'PUBLISHING' && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm active:bg-white/10 transition-colors border-b border-[#333]">
                      <span>{t('Edit post', 'Modifier')}</span>
                      <Edit2 size={18} className="opacity-80" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full flex items-center justify-between px-3 py-3 text-sm text-[#FF2D55] active:bg-white/10 transition-colors">
                    <span>{t('Delete post', 'Retirer')}</span>
                    <Trash2 size={18} className="opacity-80" />
                  </button>
               </PopoverContent>
             </Popover>
         </div>
      </div>
    </motion.div>
  );
};

// 🟢 DRAGGABLE WRAPPER — gives a card a floating, GitHub-style drag handle
const DraggableCard = ({ id, children }: { id: string; children: (drag: { cardRef: (el: HTMLElement | null) => void; dragHandleProps: any; isDraggingActive: boolean }) => React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <>
      {children({
        cardRef: setNodeRef,
        dragHandleProps: { ...attributes, ...listeners },
        isDraggingActive: isDragging,
      })}
    </>
  );
};

// 🟢 SORTABLE WRAPPER — same floating drag handle, but also registers the card as a
// drop target so hovering over another card (not just the column) resolves to it,
// which is what lets us compute an up/down reorder position. Visual reflow on reorder
// is handled by PostCard's own framer-motion `layout` prop, not dnd-kit's transform.
const SortableCard = ({ id, children }: { id: string; children: (drag: { cardRef: (el: HTMLElement | null) => void; dragHandleProps: any; isDraggingActive: boolean }) => React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
  return (
    <>
      {children({
        cardRef: setNodeRef,
        dragHandleProps: { ...attributes, ...listeners },
        isDraggingActive: isDragging,
      })}
    </>
  );
};

// 🟢 DROPPABLE COLUMN — accepts a card dragged in from the other column
const DroppableList = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="space-y-0 md:space-y-4 min-h-[200px] z-10 w-full max-w-full bg-transparent rounded-none border-0 divide-y-0">
      {children}
    </div>
  );
};

const REVERSIBLE_STATUSES = new Set(['SCHEDULED', 'PENDING_APPROVAL', 'REVIEW', 'FAILED']);
const isReversibleStatus = (status: string) => REVERSIBLE_STATUSES.has(status);
const oneHourFromNow = () => Date.now() + 3600000;

// 🟢 DRAFTS MANUAL ORDER — user-dragged position within the Drafts column;
// untouched/new items keep their natural (fetched) order and sort to the end
const sortByManualOrder = (list: Post[], order: string[]) => {
  if (order.length === 0) return list;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...list].sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const rb = rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
};

export default function PostFeed({ posts, accounts, workspaceId, onEdit, isLoading = false, canApprove = false, workspaceTimezone = 'UTC' }: PostFeedProps) {
  const { t } = useLanguage();
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, Partial<Post>>>({});
  const [manualDraftOrder, setManualDraftOrder] = useState<string[]>([]);
  const displayPosts = posts.map(p => (optimisticOverrides[p.id] ? { ...p, ...optimisticOverrides[p.id] } : p));
  const drafts = sortByManualOrder(displayPosts.filter(p => p.status === 'DRAFT'), manualDraftOrder);
  const queued = displayPosts.filter(p => p.status !== 'DRAFT').sort(byScheduledDateAsc);
  const [dismissedMockIds, setDismissedMockIds] = useState<Set<string>>(new Set());
  const dismissMock = (id: string) => setDismissedMockIds(prev => new Set(prev).add(id));
  // Single override map for every mock-card state change (drag to queue/drafts, cancel
  // schedule, publish now) — replaces what used to be three separate id Sets.
  const [mockStatusOverrides, setMockStatusOverrides] = useState<Record<string, Post['status']>>({});
  const setMockStatus = (id: string, status: Post['status']) => setMockStatusOverrides(prev => ({ ...prev, [id]: status }));
  const moveMockToDrafts = (id: string) => setMockStatus(id, 'DRAFT');
  const moveMockToQueue = (id: string) => setMockStatus(id, 'SCHEDULED');
  const publishMockNow = (id: string) => setMockStatus(id, 'PUBLISHED');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const mockDraftDefs: Post[] = [
    {
      id: 'mock-draft-1',
      content: t('Excited to share our latest product update! Swipe to see what’s new. 🚀', 'Ravis de partager notre dernière mise à jour produit ! Swipez pour découvrir les nouveautés. 🚀'),
      status: 'DRAFT',
      socialAccounts: [{ socialAccount: { platform: 'instagram', username: '@yourbrand' } }],
    },
    {
      id: 'mock-draft-2',
      content: t('5 tips to grow your audience this month — thread below.', '5 astuces pour développer votre audience ce mois-ci — voir le fil.'),
      status: 'DRAFT',
      socialAccounts: [{ socialAccount: { platform: 'twitter', username: '@yourbrand' } }],
    },
    {
      id: 'mock-draft-3',
      content: t('New tutorial dropping this Friday — subscribe so you don’t miss it!', 'Nouveau tuto ce vendredi — abonnez-vous pour ne rien manquer !'),
      status: 'DRAFT',
      socialAccounts: [{ socialAccount: { platform: 'youtube', username: '@yourbrand' } }],
    },
    {
      id: 'mock-draft-4',
      content: t('We just hit a big milestone with the community — thank you all! 🎉', 'On vient de franchir une belle étape avec la communauté — merci à tous ! 🎉'),
      status: 'DRAFT',
      socialAccounts: [{ socialAccount: { platform: 'linkedin', username: '@yourbrand' } }],
    },
    {
      id: 'mock-draft-5',
      content: t('Quick poll: which feature should we build next?', 'Petit sondage : quelle fonctionnalité devrait-on développer ensuite ?'),
      status: 'DRAFT',
      socialAccounts: [
        { socialAccount: { platform: 'facebook', username: '@yourbrand' } },
        { socialAccount: { platform: 'instagram', username: '@yourbrand' } },
      ],
    },
    {
      id: 'mock-draft-6',
      content: t('Sneak peek from this week’s shoot — full post coming soon.', 'Petit aperçu du tournage de la semaine — le post complet arrive bientôt.'),
      status: 'DRAFT',
      scheduledFor: '2026-07-29T14:00:00.000Z',
      socialAccounts: [{ socialAccount: { platform: 'instagram', username: '@yourbrand' } }],
      media: [{ id: 'mock-media-draft-1', order: 0, media: { id: 'mock-media-draft-1', url: '/assets/brutalism5.jpg', filename: 'sneak-peek.jpg', mimeType: 'image/jpeg' } }],
    },
  ];

  const mockQueuedDefs: Post[] = [
    {
      id: 'mock-queued-1',
      content: t('Behind the scenes of our latest photoshoot 📸', 'Les coulisses de notre dernier shooting photo 📸'),
      status: 'SCHEDULED',
      scheduledFor: '2026-07-28T10:00:00.000Z',
      socialAccounts: [{ socialAccount: { platform: 'facebook', username: 'Your Brand' } }],
    },
    {
      id: 'mock-queued-2',
      content: t('Thank you to everyone who joined our live session today!', 'Merci à tous ceux qui ont rejoint notre session en direct aujourd’hui !'),
      status: 'PUBLISHED',
      scheduledFor: '2026-07-27T09:00:00.000Z',
      socialAccounts: [{ socialAccount: { platform: 'linkedin', username: 'Your Brand' } }],
    },
    {
      id: 'mock-queued-3',
      content: t('New collection is live — check it out! ✨', 'La nouvelle collection est en ligne — venez voir ! ✨'),
      status: 'SCHEDULED',
      scheduledFor: '2026-07-29T16:00:00.000Z',
      socialAccounts: [{ socialAccount: { platform: 'instagram', username: 'Your Brand' } }],
      media: [{ id: 'mock-media-queued-1', order: 0, media: { id: 'mock-media-queued-1', url: '/assets/brutalism5.jpg', filename: 'new-collection.jpg', mimeType: 'image/jpeg' } }],
    },
  ];

  const MOCK_SCHEDULE_OFFSET_HOURS: Record<string, number> = {
    'mock-draft-1': 2,
    'mock-draft-2': 5,
    'mock-draft-3': 26,
    'mock-draft-4': 30,
    'mock-draft-5': 50,
    'mock-draft-6': 55,
  };

  const MOCK_PUBLISH_FALLBACK_DATE = '2026-07-27T12:00:00.000Z';

  const applyMockOverride = (post: Post): Post => {
    const overrideStatus = mockStatusOverrides[post.id];
    if (!overrideStatus) return post;
    if (overrideStatus === 'DRAFT') return { ...post, status: 'DRAFT', scheduledFor: undefined };
    if (overrideStatus === 'SCHEDULED') {
      return {
        ...post,
        status: 'SCHEDULED',
        scheduledFor: post.scheduledFor ?? new Date(Date.parse('2026-07-28T10:00:00.000Z') + (MOCK_SCHEDULE_OFFSET_HOURS[post.id] ?? 12) * 3600000).toISOString(),
      };
    }
    if (overrideStatus === 'PUBLISHED') {
      return { ...post, status: 'PUBLISHED', scheduledFor: post.scheduledFor ?? MOCK_PUBLISH_FALLBACK_DATE };
    }
    return { ...post, status: overrideStatus };
  };

  const mockAllEffective: Post[] = [...mockDraftDefs, ...mockQueuedDefs]
    .filter(post => !dismissedMockIds.has(post.id))
    .map(applyMockOverride);

  const mockDrafts: Post[] = sortByManualOrder(mockAllEffective.filter(p => p.status === 'DRAFT'), manualDraftOrder);
  const mockQueued: Post[] = mockAllEffective.filter(p => p.status !== 'DRAFT').sort(byScheduledDateAsc);

  const activeDraftIds = (drafts.length > 0 ? drafts : mockDrafts).map(p => p.id);

  const requestDelete = (postId: string) => setConfirmDeleteId(postId);
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const postId = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
        await api.delete(`/posts/${postId}?workspaceId=${workspaceId}`);
        toast.success(t("Post deleted", "Publication supprimée"));
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
    } catch (e) {
        toast.error(t("Failed to delete", "Échec de la suppression"));
    }
  };

  const cancelSchedule = async (postId: string) => {
    setOptimisticOverrides(prev => ({ ...prev, [postId]: { status: 'DRAFT', scheduledFor: undefined } }));
    try {
        await api.post(`/posts/${postId}/cancel-schedule?workspaceId=${workspaceId}`, {});
        toast.success(t("Schedule cancelled", "Planification annulée"));
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] }),
          queryClient.invalidateQueries({ queryKey: ['calendar'] }),
        ]);
        clearOptimisticOverride(postId);
    } catch (e) {
        toast.error(t("Cancellation failed", "Échec de l'annulation"));
        clearOptimisticOverride(postId);
    }
  };

  const repostPost = async (postId: string) => {
    try {
      toast.loading(t("Reposting...", "Republication en cours..."));
      await api.post(`/posts/${postId}/repost?workspaceId=${workspaceId}`, {});
      toast.dismiss();
      toast.success(t("Reposted!", "Republié !"));
      queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    } catch (e) {
      toast.dismiss();
      toast.error(t("Repost failed", "Échec de la republication"));
    }
  };

  const approvePost = async (postId: string) => {
    try {
        await api.post(`/posts/${postId}/approve`, {});
        toast.success(t("Approved and published", "Approuvé et publié"));
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
    } catch (e) {
        toast.error(t("Approval failed", "Échec de l'approbation"));
    }
  };

  const publishPost = async (postId: string) => {
    setOptimisticOverrides(prev => ({ ...prev, [postId]: { status: 'PUBLISHED' } }));
    try {
        toast.loading(t("Publishing...", "Publication en cours..."));
        await api.post(`/posts/${postId}/publish?workspaceId=${workspaceId}`, {});
        toast.dismiss();
        toast.success(t("Published successfully", "Publié avec succès"));
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] }),
          queryClient.invalidateQueries({ queryKey: ['calendar'] }),
        ]);
        clearOptimisticOverride(postId);
    } catch (e) {
        toast.dismiss();
        toast.error(t("Publish failed", "Échec de la publication"));
        clearOptimisticOverride(postId);
    }
  };

  const clearOptimisticOverride = (postId: string) => {
    setOptimisticOverrides(prev => {
        if (!(postId in prev)) return prev;
        const next = { ...prev };
        delete next[postId];
        return next;
    });
  };

  const updateStatus = async (postId: string, status: Post['status'], scheduledFor: number) => {
    const scheduledForIso = new Date(scheduledFor).toISOString();
    setOptimisticOverrides(prev => ({ ...prev, [postId]: { status, scheduledFor: scheduledForIso } }));
    try {
        await api.patch(`/posts/${postId}`, {
            status,
            scheduledFor: scheduledForIso,
            workspaceId
        });
        toast.success(t("Post scheduled", "Publication planifiée"));
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] }),
          queryClient.invalidateQueries({ queryKey: ['calendar'] }),
        ]);
        clearOptimisticOverride(postId);
    } catch (e) {
        toast.error(t("Update failed", "Échec de la mise à jour"));
        clearOptimisticOverride(postId);
    }
  };

  // --- DRAG LOGIC (dnd-kit) ---
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const activeDragPost = activeDragId
    ? [...drafts, ...mockDrafts, ...queued, ...mockQueued].find(p => p.id === activeDragId) ?? null
    : null;

  const handleDndDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDndDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const id = active.id as string;
    const targetId = over.id as string;
    if (id === targetId) return;

    // Drafts cards are individually droppable (useSortable, for reordering), but Queue
    // cards are only draggable — so `over` can resolve to a specific draft card's id
    // (not just the 'drafts-droppable' container) when dropping a queue card onto one.
    // Check list membership instead of the literal container id so both directions
    // work regardless of whether the drop lands on empty space or on another card.
    const isSourceInDrafts = drafts.some(p => p.id === id) || mockDrafts.some(p => p.id === id);
    const isSourceInQueue = queued.some(p => p.id === id) || mockQueued.some(p => p.id === id);
    const droppedOnQueue = targetId === 'queue-droppable' || queued.some(p => p.id === targetId) || mockQueued.some(p => p.id === targetId);
    const droppedOnDrafts = targetId === 'drafts-droppable' || drafts.some(p => p.id === targetId) || mockDrafts.some(p => p.id === targetId);

    if (isSourceInDrafts && droppedOnQueue) {
      if (id.startsWith('mock-')) {
        moveMockToQueue(id);
        return;
      }
      updateStatus(id, 'SCHEDULED', oneHourFromNow());
      return;
    }

    if (isSourceInQueue && droppedOnDrafts) {
      if (id.startsWith('mock-')) {
        moveMockToDrafts(id);
        return;
      }
      cancelSchedule(id);
      return;
    }

    // Otherwise it's a reorder within Drafts (dropped on another draft card)
    if (isSourceInDrafts && droppedOnDrafts) {
      const oldIndex = activeDraftIds.indexOf(id);
      const newIndex = activeDraftIds.indexOf(targetId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setManualDraftOrder(arrayMove(activeDraftIds, oldIndex, newIndex));
      }
    }
  };

  return (
    <>
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDndDragStart} onDragEnd={handleDndDragEnd}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20 font-sans text-[#040028] dark:text-white transition-colors">
      <div className="flex flex-col gap-0 md:gap-4 px-0 box-border w-full max-w-full">
        <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] border-0 border-b md:border border-black/5 dark:border-white/5 rounded-none md:rounded-[12px] p-3 flex items-center justify-between w-full">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#040028] dark:text-white">
              <FileText className="w-4 h-4 text-[#8E8E8E]" /> {t("Drafts", "Brouillons")}
            </h3>
            {drafts.length > 0 && (
                <button
                    onClick={async () => {
                        if(confirm(t(`Publish all ${drafts.length} drafts?`, `Publier les ${drafts.length} brouillons ?`))) {
                            for(const d of drafts) await publishPost(d.id);
                        }
                    }}
                    className="bg-[#040028] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#040028]/90 transition-all"
                >
                    {t("Publish all", "Tout publier")}
                </button>
            )}
        </div>

        <DroppableList id="drafts-droppable">
          <SortableContext items={activeDraftIds} strategy={verticalListSortingStrategy}>
          {isLoading && [0,1,2].map(i => <SkeletonCard key={i} />)}
          <AnimatePresence mode="popLayout">
            {!isLoading && drafts.map((post) => (
              <SortableCard key={post.id} id={post.id}>
                {(drag) => (
                  <PostCard
                    post={post}
                    onDelete={() => requestDelete(post.id)}
                    onEdit={() => onEdit?.(post)}
                    onPublishNow={() => publishPost(post.id)}
                    onRetry={() => publishPost(post.id)}
                    onRepost={() => repostPost(post.id)}
                    onApprove={() => approvePost(post.id)}
                    canApprove={canApprove}
                    workspaceTimezone={workspaceTimezone}
                    draggable={true}
                    dragHandleProps={drag.dragHandleProps}
                    cardRef={drag.cardRef}
                    isDraggingActive={drag.isDraggingActive}
                  />
                )}
              </SortableCard>
            ))}
          </AnimatePresence>
          {!isLoading && drafts.length === 0 && (
            posts.length === 0 && mockDrafts.length > 0 ? (
              <div className="space-y-0 md:space-y-4 bg-transparent rounded-none border-0 divide-y-0">
                <AnimatePresence mode="popLayout">
                  {mockDrafts.map((post) => (
                    <SortableCard key={post.id} id={post.id}>
                      {(drag) => (
                        <PostCard
                          post={post}
                          onDelete={() => dismissMock(post.id)}
                          onEdit={() => onEdit?.(post)}
                          onPublishNow={() => publishMockNow(post.id)}
                          onRetry={() => publishMockNow(post.id)}
                          workspaceTimezone={workspaceTimezone}
                          draggable={true}
                          dragHandleProps={drag.dragHandleProps}
                          cardRef={drag.cardRef}
                          isDraggingActive={drag.isDraggingActive}
                        />
                      )}
                    </SortableCard>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center p-8 rounded-none md:rounded-[16px] border-0 border-b md:border border-dashed border-black/10 dark:border-white/10 bg-transparent md:bg-white dark:bg-transparent md:dark:bg-[#0A0A2E] text-sm font-medium text-[#8E8E8E] transition-colors">
                {posts.length === 0 ? t("No drafts yet", "Aucun brouillon") : t("No matching drafts", "Aucun brouillon correspondant")}
              </div>
            )
          )}
          </SortableContext>
        </DroppableList>
      </div>

      <div className="relative group flex flex-col gap-0 md:gap-4 px-0 box-border w-full max-w-full">
        <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] border-0 border-b md:border border-black/5 dark:border-white/5 rounded-none md:rounded-[12px] p-3 w-full">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#040028] dark:text-white">
              <Clock className="w-4 h-4 text-[#8E8E8E]" /> {t("Queue / scheduled", "File / programmé")}
            </h3>
        </div>
        <DroppableList id="queue-droppable">
          {isLoading && [0,1,2].map(i => <SkeletonCard key={i} />)}
          <AnimatePresence mode="popLayout">
            {!isLoading && queued.map((post) => (
              isReversibleStatus(post.status) ? (
                <DraggableCard key={post.id} id={post.id}>
                  {(drag) => (
                    <PostCard
                      post={post}
                      onDelete={() => requestDelete(post.id)}
                      onEdit={() => onEdit?.(post)}
                      onCancelSchedule={() => cancelSchedule(post.id)}
                      onPublishNow={() => publishPost(post.id)}
                      onRetry={() => publishPost(post.id)}
                      onRepost={() => repostPost(post.id)}
                      onApprove={() => approvePost(post.id)}
                      canApprove={canApprove}
                      workspaceTimezone={workspaceTimezone}
                      isQueued
                      draggable={true}
                      dragHandleProps={drag.dragHandleProps}
                      cardRef={drag.cardRef}
                      isDraggingActive={drag.isDraggingActive}
                    />
                  )}
                </DraggableCard>
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={() => requestDelete(post.id)}
                  onEdit={() => onEdit?.(post)}
                  onCancelSchedule={() => cancelSchedule(post.id)}
                  onPublishNow={() => publishPost(post.id)}
                  onRetry={() => publishPost(post.id)}
                  onRepost={() => repostPost(post.id)}
                  onApprove={() => approvePost(post.id)}
                  canApprove={canApprove}
                  workspaceTimezone={workspaceTimezone}
                  isQueued
                />
              )
            ))}
          </AnimatePresence>
          {!isLoading && queued.length === 0 && (
            posts.length === 0 && mockQueued.length > 0 ? (
              <div className="space-y-0 md:space-y-4 bg-transparent rounded-none border-0 divide-y-0">
                <AnimatePresence mode="popLayout">
                  {mockQueued.map((post) => (
                    isReversibleStatus(post.status) ? (
                      <DraggableCard key={post.id} id={post.id}>
                        {(drag) => (
                          <PostCard
                            post={post}
                            onDelete={() => dismissMock(post.id)}
                            onEdit={() => onEdit?.(post)}
                            onCancelSchedule={() => moveMockToDrafts(post.id)}
                            onPublishNow={() => publishMockNow(post.id)}
                            onRetry={() => publishMockNow(post.id)}
                            isQueued
                            workspaceTimezone={workspaceTimezone}
                            draggable={true}
                            dragHandleProps={drag.dragHandleProps}
                            cardRef={drag.cardRef}
                            isDraggingActive={drag.isDraggingActive}
                          />
                        )}
                      </DraggableCard>
                    ) : (
                      <PostCard key={post.id} post={post} onDelete={() => dismissMock(post.id)} onEdit={() => onEdit?.(post)} isQueued workspaceTimezone={workspaceTimezone} />
                    )
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center p-12 rounded-none md:rounded-[16px] border-0 border-b md:border border-dashed border-black/10 dark:border-white/10 bg-transparent md:bg-white dark:bg-transparent md:dark:bg-[#0A0A2E] text-sm font-medium text-[#8E8E8E] transition-colors">
                {posts.length === 0 ? t("Drag a draft here to schedule", "Glissez un brouillon ici pour planifier") : t("No matching queue items", "Aucun élément dans la file")}
              </div>
            )
          )}
        </DroppableList>
      </div>
    </div>
    <DragOverlay dropAnimation={null}>
      {activeDragPost && (
        <motion.div
          initial={{ scale: 1, rotate: 0 }}
          animate={{ scale: 1.03, rotate: 1.5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="shadow-2xl cursor-grabbing"
        >
          <PostCard post={activeDragPost} workspaceTimezone={workspaceTimezone} onDelete={() => {}} />
        </motion.div>
      )}
    </DragOverlay>
    </DndContext>
    <NeuModal
      isOpen={!!confirmDeleteId}
      onClose={() => setConfirmDeleteId(null)}
      title={t('Delete post?', 'Supprimer la publication ?')}
    >
      <div className="space-y-4">
        <p className="text-sm text-[#8E8E8E]">
          {t('This action cannot be undone.', 'Cette action est irréversible.')}
        </p>
        <div className="flex justify-end gap-3">
          <NeuButton onClick={() => setConfirmDeleteId(null)}>
            {t('Cancel', 'Annuler')}
          </NeuButton>
          <NeuButton
            onClick={confirmDelete}
            className="!bg-red-500 !text-white hover:!bg-red-600 !border-red-500"
          >
            {t('Delete', 'Supprimer')}
          </NeuButton>
        </div>
      </div>
    </NeuModal>
    </>
  );
}
