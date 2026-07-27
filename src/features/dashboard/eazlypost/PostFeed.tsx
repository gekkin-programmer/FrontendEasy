'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// --- NEU COMPONENTS ---

const NeuBadge = ({ children, className }: any) => (
  <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black dark:border-white", className)}>
    {children}
  </span>
);

const NeuButton = ({ onClick, children, className, disabled }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={cn(
      "p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-yellow-200 dark:hover:bg-zinc-800 transition-all text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed", 
      className
    )}
  >
    {children}
  </button>
);

// --- TYPES ---
interface Post {
  id: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledFor?: string;
  socialAccounts?: any[]; 
  mediaUrls?: string[];
  errorMessage?: string;
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
}

import { 
  SiFacebook, SiX, SiInstagram, SiLinkedin, SiTiktok, SiYoutube 
} from 'react-icons/si';

// 🟢 PLATFORM ICON HELPER
const PlatformIcon = ({ platform }: { platform?: string }) => {
  const iconSize = 14;
  switch (platform?.toLowerCase()) {
    case 'twitter': 
    case 'x': 
      return <SiX size={iconSize} className="text-black dark:text-white" />;
    case 'linkedin': 
      return <SiLinkedin size={iconSize} className="text-[#0A66C2]" />;
    case 'instagram': 
      return <SiInstagram size={iconSize} className="text-[#E4405F]" />;
    case 'facebook': 
      return <SiFacebook size={iconSize} className="text-[#1877F2]" />;
    case 'tiktok': 
      return <SiTiktok size={iconSize} className="text-black dark:text-white" />;
    case 'youtube': 
      return <SiYoutube size={iconSize} className="text-[#FF0000]" />;
    default: 
      return <span className="text-gray-400 dark:text-zinc-500 text-[10px]">#</span>;
  }
};

// 🟢 SINGLE POST CARD COMPONENT
const PostCard = ({ post, onDelete, onEdit, onCancelSchedule, onPublishNow, onRetry, isQueued, draggable, onDragStart }: any) => {
  const socialAccounts = post.socialAccounts || [];
  const firstAccount = socialAccounts[0]?.socialAccount;

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return "bg-[#174CD2] text-white";
        case 'PUBLISHED': return "bg-green-500 text-black";
        case 'FAILED': return "bg-red-500 text-white";
        default: return "bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400";
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
        "group relative bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 transition-all shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff]",
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
        {post.mediaUrls && post.mediaUrls.length > 0 && (
           <div className={cn(
             "grid gap-1 shrink-0 relative shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
             post.mediaUrls.length === 1 ? "w-16 h-16 grid-cols-1" : "w-24 h-24 grid-cols-2"
           )}>
             {post.mediaUrls.slice(0, 4).map((url: string, i: number) => (
               <img key={i} src={url} alt="Post Media" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all border border-black dark:border-white" />
             ))}
           </div>
        )}
        <p className="text-sm font-medium text-black dark:text-white line-clamp-2 flex-1 leading-relaxed border-l-2 border-gray-200 dark:border-zinc-700 pl-3">
          {post.content}
        </p>
      </div>

      {post.status === 'FAILED' && post.errorMessage && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase font-mono">
          <AlertTriangle size={10} className="inline mr-1" />
          {post.errorMessage}
        </div>
      )}

      <div className={cn("mt-4 pt-3 border-t-2 border-black dark:border-white flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 dark:text-zinc-400">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
           <span>
             {post.scheduledFor 
               ? new Date(post.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) 
               : 'NO_DATE_SET'}
           </span>
        </div>
        
        <div className="flex gap-1">
          {post.status === 'FAILED' && (
            <NeuButton 
              onClick={(e: any) => { e.stopPropagation(); onRetry?.(); }}
              title="Retry Publication"
              className="bg-red-100 dark:bg-red-900/20 hover:bg-red-300 dark:hover:bg-red-800 text-red-700 dark:text-red-400"
            >
              <RefreshCw size={14} />
            </NeuButton>
          )}

          {post.status !== 'PUBLISHED' && post.status !== 'FAILED' && (
            <NeuButton 
              onClick={(e: any) => { e.stopPropagation(); onPublishNow?.(); }}
              title="Publish Now"
              className="bg-green-100 dark:bg-green-900/20 hover:bg-green-300 dark:hover:bg-green-800"
            >
              <Send size={14} className="text-green-700 dark:text-green-400" />
            </NeuButton>
          )}

          {isQueued && post.status === 'SCHEDULED' && (
            <NeuButton 
              onClick={(e: any) => { e.stopPropagation(); onCancelSchedule?.(); }}
              title="Cancel Schedule"
              className="bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-300 dark:hover:bg-yellow-800"
            >
              <Clock size={14} className="text-yellow-700 dark:text-yellow-400" />
            </NeuButton>
          )}

          <NeuButton 
            disabled={post.status === 'PUBLISHED'}
            onClick={(e: any) => { 
              e.stopPropagation(); 
              if (post.status === 'PUBLISHED') return toast.error("CANNOT_EDIT_PUBLISHED");
              onEdit?.(); 
            }}
            title={post.status === 'PUBLISHED' ? "Cannot edit published post" : "Edit Post"}
          >
            <Edit2 size={14} className={post.status === 'PUBLISHED' ? 'opacity-30' : ''} />
          </NeuButton>

          <NeuButton onClick={(e: any) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={14} />
          </NeuButton>
        </div>
      </div>
    </motion.div>
  );
};

export default function PostFeed({ posts, accounts, workspaceId, onEdit }: PostFeedProps) {
  const drafts = posts.filter(p => p.status === 'DRAFT');
  const queued = posts.filter(p => p.status !== 'DRAFT');

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status, scheduledFor }: { postId: string, status: string, scheduledFor: string }) => {
        return api.patch(`/posts/${postId}`, { status, scheduledFor, workspaceId });
    },
    onMutate: async ({ postId, status, scheduledFor }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['posts', workspaceId] });
        // Snapshot the previous value
        const previousPosts = queryClient.getQueryData(['posts', workspaceId]);
        // Optimistically update to the new value
        queryClient.setQueryData(['posts', workspaceId], (old: any[]) => {
            return old?.map(p => p.id === postId ? { ...p, status, scheduledFor } : p) || [];
        });
        return { previousPosts };
    },
    onError: (err, variables, context) => {
        queryClient.setQueryData(['posts', workspaceId], context?.previousPosts);
        toast.error("UPDATE_FAILED");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
    }
  });

  const deletePost = async (postId: string) => {
    try {
        await api.delete(`/posts/${postId}?workspaceId=${workspaceId}`);
        toast.success("POST_DELETED");
    } catch (e) {
        toast.error("FAILED_TO_DELETE");
    }
  };

  const cancelSchedule = async (postId: string) => {
    try {
        await api.post(`/posts/${postId}/cancel-schedule?workspaceId=${workspaceId}`, {});
        toast.success("SCHEDULE_CANCELLED");
    } catch (e) {
        toast.error("CANCEL_FAILED");
    }
  };

  const publishPost = async (postId: string) => {
    try {
        toast.loading("PUBLISHING...");
        await api.post(`/posts/${postId}/publish?workspaceId=${workspaceId}`, {});
        toast.dismiss();
        toast.success("PUBLISHED_SUCCESSFULLY");
    } catch (e) {
        toast.dismiss();
        toast.error("PUBLISH_FAILED");
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
    if (id) {
        updateStatusMutation.mutate({ 
            postId: id, 
            status: 'SCHEDULED', 
            scheduledFor: new Date(Date.now() + 3600000).toISOString() 
        });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20 font-sans text-black dark:text-white transition-colors">
      <div className="flex flex-col gap-4">
        <div className="bg-yellow-400 p-2 border-2 border-black dark:border-white flex items-center justify-between w-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <h3 className="font-black text-sm uppercase flex items-center gap-2 text-black">
              <FileText className="w-4 h-4" /> Drafts ({drafts.length})
            </h3>
            {drafts.length > 0 && (
                <button 
                    onClick={async () => {
                        if(confirm(`Publish all ${drafts.length} drafts?`)) {
                            for(const d of drafts) await publishPost(d.id);
                        }
                    }}
                    className="bg-black text-white text-[10px] font-bold px-2 py-1 border border-white hover:bg-white hover:text-black transition-all"
                >
                    PUBLISH_ALL
                </button>
            )}
        </div>
        
        <div className="space-y-4 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {drafts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                onPublishNow={() => publishPost(post.id)}
                onRetry={() => publishPost(post.id)}
                draggable={true}
                onDragStart={(e: any) => handleDragStart(e, post.id)}
              />
            ))}
          </AnimatePresence>
          {drafts.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 text-sm font-bold uppercase text-gray-400 transition-colors">
              {posts.length === 0 ? "No_Drafts_Yet" : "No_Matching_Drafts"}
            </div>
          )}
        </div>
      </div>

      <div onDrop={handleDropToQueue} onDragOver={handleDragOver} className="relative group flex flex-col gap-4">
        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white inline-block w-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <h3 className="font-black text-sm uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" /> Queue / Scheduled ({queued.length})
            </h3>
        </div>
        <div className="space-y-4 min-h-[200px] z-10">
          <AnimatePresence mode="popLayout">
            {queued.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                onCancelSchedule={() => cancelSchedule(post.id)}
                onPublishNow={() => publishPost(post.id)}
                onRetry={() => publishPost(post.id)}
                isQueued
              />
            ))}
          </AnimatePresence>
          {queued.length === 0 && (
             <div className="text-center p-12 border-2 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 text-sm font-bold uppercase text-gray-400 transition-colors">
               {posts.length === 0 ? "DRAG_DRAFT_HERE_TO_SCHEDULE" : "NO_MATCHING_QUEUE_ITEMS"}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
