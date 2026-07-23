'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import {
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, TiktokIcon, YoutubeIcon,
} from '@/components/icons/PlatformIcons';

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
      "p-2 rounded-[10px] bg-white dark:bg-white/5 hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all text-[#040028] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed",
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
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
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
}

import { Skeleton } from '@/components/ui/skeleton';

const SkeletonCard = () => (
  <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-4">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-24 rounded-[4px]" />
          <Skeleton className="h-2 w-16 rounded-[4px]" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2 pl-3 border-l-2 border-black/5 dark:border-white/10">
      <Skeleton className="h-3 w-full rounded-[4px]" />
      <Skeleton className="h-3 w-4/5 rounded-[4px]" />
    </div>
  </div>
);

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
const PostCard = ({ post, onDelete, onEdit, onCancelSchedule, onPublishNow, onRetry, onRepost, isQueued, draggable, onDragStart }: any) => {
  const { t } = useLanguage();
  const socialAccounts = post.socialAccounts || [];
  const firstAccount = socialAccounts[0]?.socialAccount;

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return "bg-[#174CD2]/10 text-[#174CD2]";
        case 'PUBLISHING': return "bg-green-100 text-green-700";
        case 'PUBLISHED': return "bg-green-100 text-green-700";
        case 'FAILED': return "bg-red-100 text-red-700";
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
        default: return status;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable={draggable}
      onDragStart={onDragStart as any}
      className={cn(
        "group relative bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 p-4 transition-all rounded-[16px]",
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      )}
    >
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} />
        </div>
      )}

      <div className={cn("flex justify-between items-start mb-3", draggable && "pl-4")}>
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

      <div className={cn("flex gap-3", draggable && "pl-4")}>
        {post.media && post.media.length > 0 && (
          <div className="shrink-0 flex flex-col gap-1.5">
            <div className={cn(
              "grid gap-1 relative overflow-hidden rounded-[10px]",
              post.media.length === 1 ? "w-20 h-20 grid-cols-1" : "w-32 h-32 grid-cols-2"
            )}>
              {post.media.slice(0, 4).map((pm: PostMediaItem, i: number) => (
                pm.media.mimeType?.startsWith('video/') ? (
                  <video key={i} src={pm.media.url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img key={i} src={pm.media.url} alt={pm.media.filename} className="w-full h-full object-cover" />
                )
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
          <p className="text-sm font-medium text-[#040028] dark:text-white line-clamp-2 leading-relaxed border-l-2 border-black/5 dark:border-white/10 pl-3">
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

      <div className={cn("mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#8E8E8E]">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
           <span>
             {post.scheduledFor
               ? new Date(post.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})
               : t('No date set', 'Aucune date')}
           </span>
        </div>

        <div className="flex gap-1">
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
            className="p-2 rounded-[10px] bg-white dark:bg-white/5 text-[#040028] dark:text-white hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function PostFeed({ posts, accounts, workspaceId, onEdit, isLoading = false }: PostFeedProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const drafts = posts.filter(p => p.status === 'DRAFT');
  const queued = posts.filter(p => p.status !== 'DRAFT');

  const deletePost = async (postId: string) => {
    if (!confirm(t("Delete this post?", "Supprimer cette publication ?"))) return;
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
    try {
        await api.post(`/posts/${postId}/cancel-schedule?workspaceId=${workspaceId}`, {});
        toast.success(t("Schedule cancelled", "Planification annulée"));
    } catch (e) {
        toast.error(t("Cancellation failed", "Échec de l'annulation"));
    }
  };

  const repostPost = async (postId: string) => {
    try {
      toast.loading(t("Reposting...", "Republication en cours..."));
      await api.post(`/posts/${postId}/repost?workspaceId=${workspaceId}`, {});
      toast.dismiss();
      toast.success(t("Reposted!", "Republié !"));
    } catch (e) {
      toast.dismiss();
      toast.error(t("Repost failed", "Échec de la republication"));
    }
  };

  const publishPost = async (postId: string) => {
    try {
        toast.loading(t("Publishing...", "Publication en cours..."));
        await api.post(`/posts/${postId}/publish?workspaceId=${workspaceId}`, {});
        toast.dismiss();
        toast.success(t("Published successfully", "Publié avec succès"));
    } catch (e) {
        toast.dismiss();
        toast.error(t("Publish failed", "Échec de la publication"));
    }
  };

  const updateStatus = async (postId: string, status: string, scheduledFor: number) => {
    try {
        await api.patch(`/posts/${postId}`, {
            status,
            scheduledFor: new Date(scheduledFor).toISOString(),
            workspaceId
        });
        toast.success(t("Post scheduled", "Publication planifiée"));
    } catch (e) {
        toast.error(t("Update failed", "Échec de la mise à jour"));
    }
  };

  // --- DRAG LOGIC ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("postId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropToQueue = async (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("postId");
    await updateStatus(id, 'SCHEDULED', Date.now() + 3600000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20 font-sans text-[#040028] dark:text-white transition-colors">
      <div className="flex flex-col gap-4">
        <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-none p-3 flex items-center justify-between w-full">
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
                    className="bg-[#174CD2] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#123a9e] transition-all"
                >
                    {t("Publish all", "Tout publier")}
                </button>
            )}
        </div>

        <div className="space-y-4 min-h-[200px]">
          {isLoading && [0,1,2].map(i => <SkeletonCard key={i} />)}
          <AnimatePresence mode="popLayout">
            {!isLoading && drafts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                onPublishNow={() => publishPost(post.id)}
                onRetry={() => publishPost(post.id)}
                onRepost={() => repostPost(post.id)}
                draggable={true}
                onDragStart={(e: any) => handleDragStart(e, post.id)}
              />
            ))}
          </AnimatePresence>
          {!isLoading && drafts.length === 0 && (
            <div className="text-center p-8 rounded-[16px] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-sm font-medium text-[#8E8E8E] transition-colors">
              {posts.length === 0 ? t("No drafts yet", "Aucun brouillon") : t("No matching drafts", "Aucun brouillon correspondant")}
            </div>
          )}
        </div>
      </div>

      <div onDrop={handleDropToQueue} onDragOver={handleDragOver} className="relative group flex flex-col gap-4">
        <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-none p-3 w-full">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#040028] dark:text-white">
              <Clock className="w-4 h-4 text-[#8E8E8E]" /> {t("Queue / scheduled", "File / programmé")}
            </h3>
        </div>
        <div className="space-y-4 min-h-[200px] z-10">
          {isLoading && [0,1,2].map(i => <SkeletonCard key={i} />)}
          <AnimatePresence mode="popLayout">
            {!isLoading && queued.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                onCancelSchedule={() => cancelSchedule(post.id)}
                onPublishNow={() => publishPost(post.id)}
                onRetry={() => publishPost(post.id)}
                onRepost={() => repostPost(post.id)}
                isQueued
              />
            ))}
          </AnimatePresence>
          {!isLoading && queued.length === 0 && (
             <div className="text-center p-12 rounded-[16px] border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-sm font-medium text-[#8E8E8E] transition-colors">
               {posts.length === 0 ? t("Drag a draft here to schedule", "Glissez un brouillon ici pour planifier") : t("No matching queue items", "Aucun élément dans la file")}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
