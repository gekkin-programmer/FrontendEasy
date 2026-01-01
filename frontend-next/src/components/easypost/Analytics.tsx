'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from 'framer-motion';

// Charting
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// Icons
import { 
  ThumbsUp, MessageCircle, Share2, TrendingUp, Clock, 
  Eye, Search, AlertCircle, LayoutDashboard, List, 
  Filter, Sparkles, Hash, Tag
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// --- MAIN COMPONENT ---

export default function Analytics() {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  // View State (Tabs)
  const [viewMode, setViewMode] = useState<'stream' | 'strategy'>('stream');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 gap-6">
      
      {/* 1. Header & Tabs */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
           <p className="text-gray-500 text-sm">Track performance and optimize your content strategy.</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
           <button 
             onClick={() => setViewMode('stream')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
               viewMode === 'stream' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
             )}
           >
             <List size={16} /> Live Monitor
           </button>
           <button 
             onClick={() => setViewMode('strategy')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
               viewMode === 'strategy' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
             )}
           >
             <LayoutDashboard size={16} /> Niche Intelligence
           </button>
        </div>
      </div>

      {/* 2. Content Views */}
      <div className="flex-1 min-h-0 relative">
         <AnimatePresence mode="wait">
            {viewMode === 'stream' ? (
                <LiveStreamView key="stream" workspaceId={workspaceId} />
            ) : (
                <StrategyView key="strategy" workspaceId={workspaceId} />
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 1: STRATEGY (NICHE INTELLIGENCE)
// ============================================================================

function StrategyView({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
    const nicheData = useQuery(api.analytics.getNichePerformance, { workspaceId });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full overflow-y-auto pr-2"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                
                {/* CHART 1: CATEGORY PERFORMANCE */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-blue-500" />
                                Category Performance
                            </h3>
                            <p className="text-sm text-gray-500">Average likes per post by category</p>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        {nicheData?.categories && nicheData.categories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={nicheData.categories} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        tick={{fontSize: 13, fill: '#374151', fontWeight: 600}} 
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#F9FAFB'}} 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                    />
                                    <Bar 
                                        dataKey="avgLikes" 
                                        name="Avg Likes"
                                        fill="#3C48F6" 
                                        radius={[0, 4, 4, 0]} 
                                        barSize={24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="Categorize your posts to see insights here." />
                        )}
                    </div>
                </div>

                {/* CHART 2: HASHTAGS & AI */}
                <div className="space-y-6">
                    {/* Hashtags */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-gray-500" />
                            Winning Hashtags
                        </h3>
                        <div className="space-y-3">
                            {nicheData?.topTags && nicheData.topTags.length > 0 ? (
                                nicheData.topTags.map((tag, i) => (
                                    <div key={tag.tag} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                #{i + 1}
                                            </span>
                                            <span className="font-medium text-gray-700">{tag.tag}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-gray-900">{tag.totalLikes}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-medium">Total Likes</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">No hashtag data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* AI Insight Box (Future Integration) */}
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} className="text-purple-600" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-purple-100 rounded-md">
                                <Sparkles size={16} className="text-purple-600" />
                            </div>
                            <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide">AI Insight</h4>
                        </div>
                        
                        <p className="text-sm text-purple-900/80 leading-relaxed relative z-10 font-medium">
                            "Based on your recent data, your <strong className="text-purple-700">Technology</strong> posts generate <strong className="text-purple-700">2.4x more engagement</strong> when posted in the morning. Consider increasing frequency in this category."
                        </p>
                        
                        <div className="mt-4 flex gap-2">
                             <span className="text-[10px] bg-white/50 px-2 py-1 rounded text-purple-700 border border-purple-100">GPT-4 Analysis</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


// ============================================================================
// VIEW 2: LIVE MONITOR (The Split View)
// ============================================================================

function LiveStreamView({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
    // 1. Fetch Real Data
    const allPosts = useQuery(api.posts.getWorkspacePosts, { workspaceId });
    // Filter strictly for published
    const publishedPosts = allPosts?.filter(p => p.status === 'published') || [];

    // 2. State
    const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Auto-select first post
    useEffect(() => {
        if (publishedPosts.length > 0 && !selectedPostId) {
            setSelectedPostId(publishedPosts[0]._id);
        }
    }, [publishedPosts, selectedPostId]);

    const selectedPost = publishedPosts.find(p => p._id === selectedPostId);
    const filteredPosts = publishedPosts.filter(p => 
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col md:flex-row gap-6 h-full"
        >
            {/* LEFT: Stream */}
            <div className="w-full md:w-[380px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" /> Live Stream
                        </h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                            {publishedPosts.length} Active
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search active posts..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/30 scrollbar-thin scrollbar-thumb-gray-200">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                            <AlertCircle size={24} className="opacity-20" />
                            <p className="text-sm">No active posts found.</p>
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <PostListCard 
                                key={post._id} 
                                post={post} 
                                isSelected={selectedPostId === post._id} 
                                onClick={() => setSelectedPostId(post._id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Details */}
            <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {selectedPost ? (
                    <PostAnalyticsDetail post={selectedPost} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
                        <TrendingUp size={64} className="mb-4 text-gray-200" />
                        <p className="font-medium">Select a post to view real-time data</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// --- SHARED SUB-COMPONENTS ---

function PostListCard({ post, isSelected, onClick }: { post: any, isSelected: boolean, onClick: () => void }) {
    const stats = post.currentStats || { likes: 0, comments: 0, shares: 0 };
    return (
        <motion.div 
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group",
                isSelected 
                  ? "bg-white border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500" 
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
            )}
        >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                     {formatDistanceToNow(post.publishedTime || Date.now(), { addSuffix: true })}
                </span>
                <div className="flex gap-1">
                    {post.category && post.category !== 'General' && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[60px]">{post.category}</span>
                    )}
                </div>
            </div>
            <p className="text-sm text-gray-800 line-clamp-2 mb-3 font-medium leading-relaxed">
                {post.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-2">
                <div className="flex items-center gap-1.5">
                    <ThumbsUp size={12} className={stats.likes > 0 ? "text-blue-500 fill-blue-500" : ""} />
                    <span className="font-semibold text-gray-700">{stats.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={12} className={stats.comments > 0 ? "text-green-500 fill-green-500" : ""} />
                    <span className="font-semibold text-gray-700">{stats.comments}</span>
                </div>
            </div>
        </motion.div>
    )
}

function PostAnalyticsDetail({ post }: { post: any }) {
    const history = useQuery(api.analytics.getPostHistory, { postId: post._id });
    const chartData = history ? [...history].reverse().map(h => ({
        ...h,
        timeLabel: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})
    })) : [];
    const stats = post.currentStats || { likes: 0, comments: 0, shares: 0, impressions: 0 };
    const engagementRate = stats.impressions > 0 
        ? ((stats.likes + stats.comments + stats.shares) / stats.impressions * 100).toFixed(1) 
        : "0.0";

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm relative group">
                    {post.mediaUrl ? (
                         post.mediaType === 'video' ? (
                            <video src={post.mediaUrl} className="w-full h-full object-cover" />
                         ) : (
                            <img src={post.mediaUrl} className="w-full h-full object-cover" />
                         )
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl">TxT</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border border-green-200">Live</span>
                        <span className="text-gray-300">|</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium">{post.category || "General"}</span>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{post.content}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags?.map((t: string) => (
                            <span key={t} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/30">
                <BigStatBox label="Likes" value={stats.likes} icon={ThumbsUp} color="text-blue-600" />
                <BigStatBox label="Comments" value={stats.comments} icon={MessageCircle} color="text-green-600" />
                <BigStatBox label="Impressions" value={stats.impressions} icon={Eye} color="text-purple-600" />
                <div className="p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Eng. Rate</span>
                    <span className="text-3xl font-black text-gray-900">{engagementRate}%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="p-8 flex-1 min-h-[350px] relative">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-gray-900 text-lg">Growth Trajectory</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                        <Clock size={12} className="text-blue-500" /> Hourly
                    </div>
                </div>
                <div className="w-full h-[280px]">
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3C48F6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#3C48F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="timeLabel" tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} minTickGap={40} dy={10} />
                                <YAxis tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} cursor={{ stroke: '#3C48F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area type="monotone" dataKey="likes" stroke="#3C48F6" strokeWidth={3} fill="url(#colorLikes)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3C48F6' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                            <Clock className="w-10 h-10 text-gray-300 mb-3" />
                            <p className="text-gray-900 font-bold">Data Collection in Progress</p>
                            <p className="text-sm text-gray-500 text-center mt-1">Check back after the next hourly scan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-white transition-colors cursor-default">
            <div className={cn("p-2 rounded-full mb-2 bg-opacity-10", color.replace('text-', 'bg-'))}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <span className="text-3xl font-black text-gray-900 tracking-tight tabular-nums mb-1">
                {value.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/10">
            <Filter className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">{message}</p>
        </div>
    )
}