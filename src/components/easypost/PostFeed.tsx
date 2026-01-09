'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

// --- TYPES ---
interface Post {
  id: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledFor?: string;
  socialAccountIds?: string[];
  mediaUrls?: string[];
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
}

// Helper
const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'twitter': return <span className="text-blue-400 font-bold text-[10px]">𝕏</span>;
    case 'linkedin': return <span className="text-blue-600 font-bold text-[10px]">in</span>;
    case 'instagram': return <span className="text-pink-600 font-bold text-[10px]">IG</span>;
    case 'facebook': return <span className="text-blue-600 font-bold text-[10px]">FB</span>;
    default: return <span className="text-gray-400 text-[10px]">#</span>;
  }
};

export default function PostFeed({ posts, accounts }: PostFeedProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const drafts = posts.filter(p => p.status === 'DRAFT');
  const queued = posts.filter(p => p.status !== 'DRAFT'); // Include Published/Failed too

  // --- ACTIONS ---
  const deletePost = async (postId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
        await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Post deleted");
        window.location.reload(); 
    } catch (e) {
        toast.error("Failed to delete");
    }
  };

  const updateStatus = async (postId: string, status: string, scheduledFor: number) => {
    const token = localStorage.getItem('accessToken');
    try {
        await fetch(`${API_URL}/posts/${postId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                status, 
                scheduledFor: new Date(scheduledFor).toISOString() 
            })
        });
        toast.success("Post scheduled!");
        window.location.reload();
    } catch (e) {
        toast.error("Failed to update status");
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20">
      
      {/* --- LEFT COLUMN: DRAFTS --- */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 px-1">
          <FileText className="w-3.5 h-3.5" /> Drafts ({drafts.length})
        </h3>
        
        <div className="space-y-3 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {drafts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                accounts={accounts}
                onDelete={() => deletePost(post.id)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, post.id)}
              />
            ))}
          </AnimatePresence>
          
          {drafts.length === 0 && (
            <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground text-sm bg-card/50">
              No drafts yet. Start writing!
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: QUEUE (DROP ZONE) --- */}
      <div 
        onDrop={handleDropToQueue} 
        onDragOver={handleDragOver}
        className="relative group flex flex-col gap-4"
      >
        <h3 className="font-bold text-[#304AEB] text-xs uppercase tracking-wider flex items-center gap-2 px-1">
          <Clock className="w-3.5 h-3.5" /> Queue / Scheduled ({queued.length})
        </h3>

        {/* Drop Zone Highlight */}
        <div className="absolute inset-0 top-8 -z-10 bg-[#304AEB]/5 rounded-xl border-2 border-[#304AEB]/20 border-dashed opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        <div className="space-y-3 min-h-[200px] z-10">
          <AnimatePresence mode="popLayout">
            {queued.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                accounts={accounts}
                onDelete={() => deletePost(post.id)}
                isQueued
              />
            ))}
          </AnimatePresence>
          
          {queued.length === 0 && (
             <div className="text-center p-12 border border-dashed border-border bg-card/50 rounded-xl text-muted-foreground text-sm">
               Drag a draft here to schedule it automatically.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SINGLE POST CARD COMPONENT ---

interface PostCardProps {
  post: Post;
  accounts: Account[];
  onDelete: () => void;
  isQueued?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const PostCard = ({ post, accounts, onDelete, isQueued, draggable, onDragStart }: PostCardProps) => {
  const accountId = post.socialAccountIds?.[0];
  const account = accounts.find(a => a.id === accountId);

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return "bg-[#304AEB]/15 text-[#304AEB] border border-[#304AEB]/20";
        case 'PUBLISHED': return "bg-green-500/15 text-green-400 border border-green-500/20";
        case 'FAILED': return "bg-red-500/15 text-red-400 border border-red-500/20";
        default: return "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border border-border";
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
        "group relative bg-card border rounded-xl p-4 shadow-sm transition-all hover:shadow-md",
        draggable ? "cursor-grab active:cursor-grabbing hover:border-[#304AEB]/50" : "border-border"
      )}
    >
      {/* Drag Handle Indicator */}
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>
      )}

      {/* Header */}
      <div className={cn("flex justify-between items-start mb-3", draggable && "pl-4")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
             <PlatformIcon platform={account?.platform} />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{account?.username || account?.platformUsername || "Unknown"}</p>
            <p className="opacity-70 text-[10px] uppercase">{account?.platform || "—"}</p>
          </div>
        </div>

        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 shadow-none", getStatusColor(post.status))}>
          {post.status}
        </Badge>
      </div>

      {/* Content Body */}
      <div className={cn("flex gap-3", draggable && "pl-4")}>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
           <div className="w-16 h-16 rounded-lg bg-background overflow-hidden flex-shrink-0 border border-border relative">
             <img src={post.mediaUrls[0]} alt="Post Media" className="w-full h-full object-cover" />
           </div>
        )}
        <p className="text-sm text-foreground/90 line-clamp-2 flex-1 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Footer */}
      <div className={cn("mt-4 pt-3 border-t border-border flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
           <span className="font-medium">
             {post.scheduledFor 
               ? new Date(post.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) 
               : 'No date set'}
           </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </motion.div>
  );
};