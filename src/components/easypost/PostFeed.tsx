'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Edit2, FileText, CalendarCheck, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

// --- NEU COMPONENTS ---

const NeuBadge = ({ children, className }: any) => (
  <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black", className)}>
    {children}
  </span>
);

const NeuButton = ({ onClick, children, className }: any) => (
  <button 
    onClick={onClick} 
    className={cn(
      "p-2 border-2 border-transparent hover:border-black hover:bg-yellow-200 transition-all text-black", 
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
  onEdit?: (post: Post) => void;
}

// Helper
const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'twitter': return <span className="text-black font-black text-[10px]">X</span>;
    case 'linkedin': return <span className="text-[#0077b5] font-black text-[10px]">IN</span>;
    case 'instagram': return <span className="text-[#e1306c] font-black text-[10px]">IG</span>;
    case 'facebook': return <span className="text-[#1877f2] font-black text-[10px]">FB</span>;
    default: return <span className="text-gray-400 text-[10px]">#</span>;
  }
};

export default function PostFeed({ posts, accounts, onEdit }: PostFeedProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const drafts = posts.filter(p => p.status === 'DRAFT');
  const queued = posts.filter(p => p.status !== 'DRAFT');

  // --- ACTIONS ---
  const deletePost = async (postId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
        await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("POST_DELETED");
        window.location.reload(); 
    } catch (e) {
        toast.error("FAILED_TO_DELETE");
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
        toast.success("POST_SCHEDULED");
        window.location.reload();
    } catch (e) {
        toast.error("UPDATE_FAILED");
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20 font-sans text-black">
      
      {/* --- LEFT COLUMN: DRAFTS --- */}
      <div className="flex flex-col gap-4">
        <div className="bg-yellow-400 p-2 border-2 border-black inline-block w-full">
            <h3 className="font-black text-sm uppercase flex items-center gap-2">
              <FileText className="w-4 h-4" /> Drafts ({drafts.length})
            </h3>
        </div>
        
        <div className="space-y-4 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {drafts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                accounts={accounts}
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, post.id)}
              />
            ))}
          </AnimatePresence>
          
          {drafts.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-black bg-white text-sm font-bold uppercase text-gray-400">
              {posts.length === 0 ? "No_Drafts_Yet" : "No_Matching_Drafts"}
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
        <div className="bg-black text-white p-2 border-2 border-black inline-block w-full">
            <h3 className="font-black text-sm uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" /> Queue / Scheduled ({queued.length})
            </h3>
        </div>

        {/* Drop Zone Highlight */}
        <div className="absolute inset-0 top-10 -z-10 bg-blue-100 border-2 border-black border-dashed opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        <div className="space-y-4 min-h-[200px] z-10">
          <AnimatePresence mode="popLayout">
            {queued.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                accounts={accounts}
                onDelete={() => deletePost(post.id)}
                onEdit={() => onEdit?.(post)}
                isQueued
              />
            ))}
          </AnimatePresence>
          
          {queued.length === 0 && (
             <div className="text-center p-12 border-2 border-dashed border-black bg-white text-sm font-bold uppercase text-gray-400">
               {posts.length === 0 ? "DRAG_DRAFT_HERE_TO_SCHEDULE" : "NO_MATCHING_QUEUE_ITEMS"}
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
  onEdit?: () => void;
  isQueued?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const PostCard = ({ post, accounts, onDelete, onEdit, isQueued, draggable, onDragStart }: PostCardProps) => {
  const accountId = post.socialAccountIds?.[0];
  const account = accounts.find(a => a.id === accountId);

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return "bg-[#3C48F6] text-white";
        case 'PUBLISHED': return "bg-green-500 text-black";
        case 'FAILED': return "bg-red-500 text-white";
        default: return "bg-gray-200 text-gray-600";
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
        "group relative bg-white border-2 border-black p-4 transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]",
        draggable ? "cursor-grab active:cursor-grabbing hover:bg-yellow-50" : ""
      )}
    >
      {/* Drag Handle Indicator */}
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} />
        </div>
      )}

      {/* Header */}
      <div className={cn("flex justify-between items-start mb-3", draggable && "pl-4")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
             <PlatformIcon platform={account?.platform} />
          </div>
          <div className="text-xs">
            <p className="font-black uppercase">{account?.username || account?.platformUsername || "Unknown"}</p>
            <p className="opacity-70 text-[10px] font-mono">{account?.platform || "—"}</p>
          </div>
        </div>

        <NeuBadge className={getStatusColor(post.status)}>
          {post.status}
        </NeuBadge>
      </div>

      {/* Content Body */}
      <div className={cn("flex gap-3", draggable && "pl-4")}>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
           <div className="w-16 h-16 bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0 relative shadow-[2px_2px_0px_0px_#000]">
             <img src={post.mediaUrls[0]} alt="Post Media" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
           </div>
        )}
        <p className="text-sm font-medium text-black line-clamp-2 flex-1 leading-relaxed border-l-2 border-gray-200 pl-3">
          {post.content}
        </p>
      </div>

      {/* Footer */}
      <div className={cn("mt-4 pt-3 border-t-2 border-black flex justify-between items-center", draggable && "pl-4")}>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500">
           {isQueued ? <CalendarCheck className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
           <span>
             {post.scheduledFor 
               ? new Date(post.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) 
               : 'NO_DATE_SET'}
           </span>
        </div>
        
        <div className="flex gap-1">
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