'use client';

import React from 'react';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Helper to look up account details
const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform) {
    case 'twitter': return <span className="text-blue-400">𝕏</span>;
    case 'linkedin': return <span className="text-blue-700">in</span>;
    case 'instagram': return <span className="text-pink-600">IG</span>;
    default: return <span className="text-gray-400">#</span>;
  }
};

interface PostFeedProps {
  posts: Doc<"posts">[]; 
  accounts: Doc<"accounts">[];
}

export default function PostFeed({ posts, accounts }: PostFeedProps) {
  const updateStatus = useMutation(api.posts.updateStatus);
  const deletePost = useMutation(api.posts.deletePost);

  const drafts = posts.filter(p => p.status === 'draft');
  const queued = posts.filter(p => p.status === 'scheduled' || p.status === 'published');

  // --- DRAG LOGIC ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    // We are using Native HTML5 Drag, not Framer gestures
    e.dataTransfer.setData("postId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropToQueue = async (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("postId") as Id<"posts">;
    
    try {
      await updateStatus({ 
        postId: id, 
        status: 'scheduled', 
        scheduledTime: Date.now() + 3600000 
      });
    } catch (err) {
      console.error("Failed to schedule", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20">
      
      {/* --- LEFT COLUMN: DRAFTS --- */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" /> Drafts ({drafts.length})
        </h3>
        
        <div className="space-y-3 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {drafts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                accounts={accounts}
                onDelete={() => deletePost({ postId: post._id })}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, post._id)}
              />
            ))}
          </AnimatePresence>
          
          {drafts.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
              No drafts. Start writing!
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
        <h3 className="font-bold text-blue-600 text-sm uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Queue / Scheduled ({queued.length})
        </h3>

        <div className="absolute inset-0 top-8 -z-10 bg-blue-50/50 rounded-xl border-2 border-blue-200 border-dashed opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        <div className="space-y-3 min-h-[200px] z-10">
          <AnimatePresence mode="popLayout">
            {queued.map((post) => (
              <PostCard 
                key={post._id} 
                post={post}
                accounts={accounts}
                onDelete={() => deletePost({ postId: post._id })}
                isQueued
              />
            ))}
          </AnimatePresence>
          
          {queued.length === 0 && (
             <div className="text-center p-12 border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-xl text-blue-400 text-sm">
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
  post: Doc<"posts">;
  accounts: Doc<"accounts">[];
  onDelete: () => void;
  isQueued?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const PostCard = ({ post, accounts, onDelete, isQueued, draggable, onDragStart }: PostCardProps) => {
  const account = accounts.find(a => a._id === post.accountId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable={draggable}
      // FIX: Cast to 'any' to resolve conflict between Framer's onDragStart and HTML5 onDragStart
      onDragStart={onDragStart as any}
      className={cn(
        "group relative bg-white dark:bg-zinc-900 border rounded-xl p-4 shadow-sm transition-all",
        draggable ? "cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300" : "border-blue-100 dark:border-blue-900/50"
      )}
    >
      {/* Drag Handle Indicator */}
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>
      )}

      {/* Header */}
      <div className={cn("flex justify-between items-start mb-3", draggable && "pl-4")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center shadow-sm">
             <PlatformIcon platform={account?.platform} />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{account?.platformUsername || "Unknown Account"}</p>
            <p className="opacity-70">{account?.platform}</p>
          </div>
        </div>

        <Badge variant={isQueued ? "secondary" : "outline"} className={isQueued ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}>
          {post.status}
        </Badge>
      </div>

      {/* Content Body */}
      <div className={cn("flex gap-3", draggable && "pl-4")}>
        {post.mediaStorageIds && post.mediaStorageIds.length > 0 && (
           <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border">
             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">IMG</div>
           </div>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 flex-1 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Footer */}
      <div className={cn("mt-4 pt-3 border-t flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
           <span className="font-medium">
             {post.scheduledTime 
               ? new Date(post.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) 
               : 'No date set'}
           </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </motion.div>
  );
};