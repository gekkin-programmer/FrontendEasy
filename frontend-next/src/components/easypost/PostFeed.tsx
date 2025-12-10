'use client';
import React from 'react';
import { FiTrash2, FiClock, FiEdit2, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, CHANNELS, getChannelIcon } from './types';

interface PostFeedProps {
  posts: Post[];
  onDelete: (id: number, status: string) => void;
  onStatusChange: (id: number, newStatus: 'queued' | 'draft') => void;
}

export default function PostFeed({ posts, onDelete, onStatusChange }: PostFeedProps) {
  
  const drafts = posts.filter(p => p.status === 'draft');
  const queued = posts.filter(p => p.status === 'queued' || p.status === 'published');

  // --- DRAG LOGIC ---
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("postId", id.toString());
  };

  const handleDropToQueue = (e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("postId"));
    const post = posts.find(p => p.id === id);
    
    // Only allow dragging Draft -> Queue
    if (post && post.status === 'draft') {
      onStatusChange(id, 'queued');
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20">
      
      {/* --- LEFT COLUMN: DRAFTS --- */}
      <div>
        <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiFileText /> Drafts ({drafts.length})
        </h3>
        
        <div className="space-y-4 min-h-[200px]">
          <AnimatePresence>
            {drafts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => onDelete(post.id, 'draft')} 
                draggable={true}
                onDragStart={(e: any) => handleDragStart(e, post.id)}
              />
            ))}
            {drafts.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                No drafts saved.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- RIGHT COLUMN: QUEUE (DROP ZONE) --- */}
      <div 
        onDrop={handleDropToQueue} 
        onDragOver={handleDragOver}
        className="relative group"
      >
        <h3 className="font-bold text-[#3C48F6] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiClock /> Queue / Scheduled ({queued.length})
        </h3>

        {/* Visual Drop Zone Hint */}
        <div className="absolute inset-0 -z-10 bg-blue-50 rounded-xl border-2 border-blue-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"></div>

        <div className="space-y-4 min-h-[200px] rounded-xl transition-colors">
          <AnimatePresence>
            {queued.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => onDelete(post.id, post.status)} 
                isQueued
              />
            ))}
            {queued.length === 0 && (
               <div className="text-center p-8 border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-xl text-blue-400 text-sm">
                 Drag a draft here to schedule it!
               </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

// --- SINGLE POST CARD COMPONENT ---
const PostCard = ({ post, onDelete, isQueued, draggable, onDragStart }: any) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-default ${draggable ? 'cursor-grab active:cursor-grabbing border-gray-200' : 'border-blue-100'}`}
    >
      {/* Header: Channels & Status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex -space-x-2">
          {post.channels.map((c: string) => {
            // Mock finding channel icon
            const ch = CHANNELS.find(x => x.id === c);
            const Icon = ch ? getChannelIcon(ch.type) : FiCheckCircle;
            return (
              <div key={c} className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-gray-500">
                <Icon size={12} />
              </div>
            )
          })}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isQueued ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          {post.status}
        </span>
      </div>

      {/* Content */}
      <div className="flex gap-3">
        {post.media && (
           <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
             <img src={post.media} className="w-full h-full object-cover" alt="Post media" />
           </div>
        )}
        <p className="text-sm text-gray-700 line-clamp-2 flex-1">{post.content}</p>
      </div>

      {/* Footer: Time & Actions */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-gray-400">
           {isQueued ? <FiClock /> : <FiEdit2 />}
           <span>{post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : 'Unscheduled'}</span>
        </div>
        
        <button 
          onClick={onDelete} 
          className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
          title="Delete Post"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};