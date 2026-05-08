'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { useLanguage } from '@/src/context/LanguageContext';

// --- NEU COMPONENTS ---

const NeuBadge = ({ children, className }: any) => (
  <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase border-2", className)}>
    {children}
  </span>
);

const NeuButton = ({ onClick, children, className, disabled, title }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed",
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
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
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
  <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 border-2 border-black dark:border-white" />
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 border-2 border-black dark:border-white" />
    </div>
    <div className="space-y-2 pl-3 border-l-2 border-gray-200 dark:border-zinc-700">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

// 🟢 PLATFORM ICON HELPER
const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'twitter': return <FaXTwitter className="text-black dark:text-white text-sm" />;
    case 'linkedin': return <FaLinkedinIn className="text-[#0077b5] text-sm" />;
    case 'instagram': return <FaInstagram className="text-[#e1306c] text-sm" />;
    case 'facebook': return <FaFacebookF className="text-[#1877f2] text-sm" />;
    case 'tiktok': return <FaTiktok className="text-black dark:text-white text-sm" />;
    case 'youtube': return <FaYoutube className="text-[#ff0000] text-sm" />;
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
        case 'SCHEDULED': return "bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-white";
        case 'PUBLISHED': return "bg-white dark:bg-zinc-800 text-black dark:text-white border-black dark:border-white";
        case 'FAILED': return "bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-white";
        default: return "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-600";
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
        "group relative bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 transition-all shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] rounded-lg",
        draggable ? "cursor-grab active:cursor-grabbing hover:bg-yellow-50 dark:hover:bg-zinc-800" : ""
      )}
    >
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} />
        </div>
      )}

      <div className={cn("flex justify-between items-start mb-3", draggable && "pl-4")}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {socialAccounts.map((sa: any, idx: number) => (
                <div key={idx} className="w-8 h-8 rounded-none bg-white dark:bg-zinc-900 border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all z-[1]">
                    <PlatformIcon platform={sa.socialAccount?.platform} />
                </div>
            ))}
          </div>
          <div className="text-xs">
            <p className="font-black uppercase text-black dark:text-white">
                {firstAccount?.username || firstAccount?.platformUsername || "Draft_Node"}
            </p>
            <p className="opacity-70 text-[10px] font-mono text-black dark:text-white">
                {socialAccounts.length > 1 ? `${socialAccounts.length}_TARGETS` : (firstAccount?.platform || "LOCAL")}
            </p>
          </div>
        </div>

        <NeuBadge className={getStatusColor(post.status)}>
          {post.status}
        </NeuBadge>
      </div>

      <div className={cn("flex gap-3", draggable && "pl-4")}>
        {post.media && post.media.length > 0 && (
          <div className="shrink-0 flex flex-col gap-1.5">
            <div className={cn(
              "grid gap-1 relative overflow-hidden shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
              post.media.length === 1 ? "w-20 h-20 grid-cols-1" : "w-32 h-32 grid-cols-2"
            )}>
              {post.media.slice(0, 4).map((pm: PostMediaItem, i: number) => (
                pm.media.mimeType?.startsWith('video/') ? (
                  <video key={i} src={pm.media.url} className="w-full h-full object-cover border border-black dark:border-white" muted playsInline />
                ) : (
                  <img key={i} src={pm.media.url} alt={pm.media.filename} className="w-full h-full object-cover border border-black dark:border-white" />
                )
              ))}
            </div>
            <div className="space-y-0.5 max-w-[128px]">
              {post.media.slice(0, 2).map((pm: PostMediaItem, i: number) => (
                <div key={i} className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "text-[6px] font-black px-0.5 border border-black dark:border-white flex-shrink-0",
                    pm.media.mimeType?.startsWith('video/') ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
                  )}>
                    {pm.media.mimeType?.startsWith('video/') ? 'VID' : 'IMG'}
                  </span>
                  <span className="text-[7px] font-mono text-gray-400 dark:text-zinc-500 truncate">{pm.media.filename}</span>
                </div>
              ))}
              {post.media.length > 2 && (
                <span className="text-[7px] font-mono text-gray-400 dark:text-zinc-500">+{post.media.length - 2} more</span>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          {post.title && <h4 className="font-bold text-sm text-black dark:text-white uppercase truncate">{post.title}</h4>}
          <p className="text-sm font-medium text-black dark:text-white line-clamp-2 leading-relaxed border-l-2 border-gray-200 dark:border-zinc-700 pl-3">
            {post.content}
          </p>
          {post.description && <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 italic">{post.description}</p>}
        </div>
      </div>

      {post.status === 'FAILED' && post.errorMessage && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase font-mono">
          <AlertTriangle size={10} className="inline mr-1" />
          {post.errorMessage}
        </div>
      )}

      <div className={cn("mt-4 py-3 border-t-2 border-black dark:border-white flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-black dark:text-white">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5 text-black dark:text-white" /> : <Edit2 className="w-3.5 h-3.5 text-black dark:text-white" />}
           <span className="text-black dark:text-white">
             {post.scheduledFor 
               ? new Date(post.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) 
               : 'NO_DATE_SET'}
           </span>
        </div>
        
        <div className="flex gap-1">
          {post.status === 'PUBLISHED' && (
            <NeuButton
              onClick={(e: any) => { e.stopPropagation(); onRepost?.(); }}
              title="Repost"
              className="bg-white hover:bg-white border-black hover:border-black"
            >
              <RefreshCw size={14} className="text-black dark:text-white" />
            </NeuButton>
          )}

          {post.status === 'FAILED' && (
            <NeuButton
              onClick={(e: any) => { e.stopPropagation(); onRetry?.(); }}
              title="Retry Publication"
              className="bg-white hover:bg-white border-black hover:border-black"
            >
              <RefreshCw size={14} className="text-black" />
            </NeuButton>
          )}

          {post.status !== 'PUBLISHED' && post.status !== 'FAILED' && (
            <NeuButton
              onClick={(e: any) => { e.stopPropagation(); onPublishNow?.(); }}
              title="Publish Now"
              className="bg-white hover:bg-white border-black hover:border-black"
            >
              <Send size={14} className="text-black dark:text-white" />
            </NeuButton>
          )}

          {isQueued && post.status === 'SCHEDULED' && (
            <NeuButton
              onClick={(e: any) => { e.stopPropagation(); onCancelSchedule?.(); }}
              title="Cancel Schedule"
              className="bg-white hover:bg-white border-black hover:border-black"
            >
              <Clock size={14} className="text-black dark:text-white" />
            </NeuButton>
          )}

          {post.status !== 'PUBLISHED' && (
            <NeuButton
              onClick={(e: any) => { e.stopPropagation(); onEdit?.(); }}
              title="Edit Post"
            >
              <Edit2 size={14} className="text-black dark:text-white" />
            </NeuButton>
          )}

          <button
            onClick={(e: any) => { e.stopPropagation(); onDelete(); }}
            title="Delete Post"
            className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-red-500 hover:border-red-600 hover:text-white hover:shadow-[2px_2px_0px_0px_#991b1b] dark:hover:bg-red-500 dark:hover:border-red-600 dark:hover:text-white transition-all"
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
  const drafts = posts.filter(p => p.status === 'DRAFT');
  const queued = posts.filter(p => p.status !== 'DRAFT');

  const deletePost = async (postId: string) => {
    try {
        await api.delete(`/posts/${postId}?workspaceId=${workspaceId}`);
        toast.success(t("Post deleted from all platforms", "Publication supprimée de toutes les plateformes"));
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20 font-sans text-black dark:text-white transition-colors">
      <div className="flex flex-col gap-4">
        <div className="bg-black dark:bg-white p-2 border-2 border-black dark:border-white flex items-center justify-between w-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <h3 className="font-black text-sm uppercase flex items-center gap-2 text-white dark:text-black">
              <FileText className="w-4 h-4" /> {t("Drafts", "Brouillons")} ({drafts.length})
            </h3>
            {drafts.length > 0 && (
                <button
                    onClick={async () => {
                        if(confirm(t(`Publish all ${drafts.length} drafts?`, `Publier les ${drafts.length} brouillons ?`))) {
                            for(const d of drafts) await publishPost(d.id);
                        }
                    }}
                    className="bg-black text-white text-[10px] font-bold px-2 py-1 border border-white hover:bg-white hover:text-black transition-all"
                >
                    {t("PUBLISH ALL", "TOUT PUBLIER")}
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
            <div className="text-center p-8 border-2 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 text-sm font-bold uppercase text-gray-400 transition-colors">
              {posts.length === 0 ? t("No drafts yet", "Aucun brouillon") : t("No matching drafts", "Aucun brouillon correspondant")}
            </div>
          )}
        </div>
      </div>

      <div onDrop={handleDropToQueue} onDragOver={handleDragOver} className="relative group flex flex-col gap-4">
        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white inline-block w-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <h3 className="font-black text-sm uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t("Queue / Scheduled", "File / Programmé")} ({queued.length})
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
             <div className="text-center p-12 border-2 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 text-sm font-bold uppercase text-gray-400 transition-colors">
               {posts.length === 0 ? t("Drag a draft here to schedule", "Glissez un brouillon ici pour planifier") : t("No matching queue items", "Aucun élément dans la file")}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
