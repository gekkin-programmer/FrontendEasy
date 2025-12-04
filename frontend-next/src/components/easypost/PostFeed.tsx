'use client';
import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import MediaGallery from './MediaGallery'; 
import { FiImage } from 'react-icons/fi';
import { FiClock, FiMoreHorizontal, FiTrash2, FiEdit, FiCopy, FiRefreshCw, FiCalendar, FiList, FiAlertCircle, FiColumns, FiCheckCircle } from 'react-icons/fi';
import { Post, CHANNELS, getChannelIcon, PostStatus } from './types';
import { toast } from 'sonner';

interface FeedProps {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
}

export default function PostFeed({ posts, setPosts }: FeedProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban' | 'gallery'>('kanban');

  const handleDelete = (id: number) => {
    if(confirm('Delete post?')) setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div>
      {/* View Switcher */}
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
    <button onClick={() => setViewMode('list')} title="List" className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><FiList /></button>
    <button onClick={() => setViewMode('kanban')} title="Board" className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><FiColumns /></button>
    <button onClick={() => setViewMode('calendar')} title="Calendar" className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><FiCalendar /></button>
    {/* NEW GALLERY BUTTON */}
    <button onClick={() => setViewMode('gallery')} title="Asset Library" className={`p-2 rounded ${viewMode === 'gallery' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><FiImage /></button>
    </div>

      {/* --- KANBAN VIEW (BUFFER STYLE) --- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4 h-[600px] overflow-x-auto pb-4">
            <KanbanColumn title="Drafts" color="bg-gray-200" posts={posts.filter(p => p.status === 'draft')} onDelete={handleDelete} />
            <KanbanColumn title="In Review" color="bg-orange-200" posts={posts.filter(p => p.status === 'review')} onDelete={handleDelete} />
            <KanbanColumn title="Scheduled" color="bg-blue-200" posts={posts.filter(p => p.status === 'queued')} onDelete={handleDelete} />
            <KanbanColumn title="Published" color="bg-green-200" posts={posts.filter(p => p.status === 'published')} onDelete={handleDelete} />
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="space-y-4 pb-20">
          {posts.map((post) => (
              <div key={post.id} className={`bg-white border rounded-xl p-5 flex shadow-sm hover:shadow-md transition-all group relative
                  ${post.status === 'failed' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                <div className={`w-1.5 rounded-l-xl absolute left-0 top-0 bottom-0 
                    ${post.status === 'queued' ? 'bg-blue-500' : post.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}>
                </div>
                <div className="pl-4 flex-1">
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex gap-1">
                       {post.channels.map(cId => {
                          const ch = CHANNELS.find(c => c.id === cId);
                          const Icon = ch ? getChannelIcon(ch.type) : FiAlertCircle;
                          return (
                            <div key={cId} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-white shadow-sm">
                                <Icon size={10} />
                            </div>
                          );
                       })}
                     </div>
                     <span className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded uppercase">
                        {post.status}
                     </span>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1"><p className="text-gray-700 text-sm font-medium leading-relaxed">{post.content}</p></div>
                     {post.media && <img src={post.media} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}

      {/* --- CALENDAR VIEW --- */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-4 text-center mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 31}).map((_, i) => {
                    const dayPosts = posts.filter(p => i % 7 === 0 && p.id % 2 === 0);
                    return (
                        <div key={i} className="min-h-[100px] border border-gray-100 rounded-lg p-2 bg-gray-50/30 hover:bg-white transition-colors relative group">
                            <span className="text-xs font-bold text-gray-400">{i+1}</span>
                            <div className="mt-2 space-y-1">
                                {dayPosts.slice(0,2).map((p, idx) => (
                                    <div key={idx} className="bg-blue-100 text-blue-700 text-[10px] px-1 py-0.5 rounded truncate font-bold">
                                        {p.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
}

// --- KANBAN COLUMN COMPONENT ---
const KanbanColumn = ({ title, color, posts, onDelete }: { title: string, color: string, posts: Post[], onDelete: (id: number) => void }) => {
    return (
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col h-full border border-gray-200">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color.replace('bg-', 'bg-').replace('200', '500')}`}></div>
                    {title}
                </h3>
                <span className="text-xs font-bold text-gray-400">{posts.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                {posts.length === 0 && (
                    <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-xs font-medium">
                        Empty
                    </div>
                )}
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                        <div className="flex gap-1 mb-2">
                            {post.channels.map(cId => {
                                const ch = CHANNELS.find(c => c.id === cId);
                                const Icon = ch ? getChannelIcon(ch.type) : FiAlertCircle;
                                return <Icon key={cId} size={12} className="text-gray-400" />
                            })}
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-3 mb-2 font-medium">{post.content}</p>
                        {post.media && <div className="h-24 w-full rounded-md overflow-hidden mb-2"><img src={post.media} className="w-full h-full object-cover" /></div>}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                <FiClock /> {new Date(post.scheduledTime || Date.now()).toLocaleDateString()}
                            </span>
                            <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-red-500"><FiTrash2 size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}