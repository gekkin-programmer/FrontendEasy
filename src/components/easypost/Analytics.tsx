'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from 'framer-motion';

// Charting
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons
import { 
  ThumbsUp, MessageCircle, Share2, TrendingUp, Clock, 
  Eye, Search, AlertCircle
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// --- MAIN COMPONENT ---

export default function Analytics() {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  // 1. Fetch Real Data
  const allPosts = useQuery(api.posts.getWorkspacePosts, { workspaceId });
  
  // FIX: Strictly filter ONLY 'published' posts. 
  // We exclude 'archived' (deleted on FB) and 'failed'.
  const publishedPosts = allPosts?.filter(p => p.status === 'published') || [];

  // 2. State
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-select first post on load
  useEffect(() => {
    if (publishedPosts.length > 0 && !selectedPostId) {
        setSelectedPostId(publishedPosts[0]._id);
    }
  }, [publishedPosts, selectedPostId]);

  // 3. Derived State
  const selectedPost = publishedPosts.find(p => p._id === selectedPostId);
  const filteredPosts = publishedPosts.filter(p => 
     p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* --- LEFT PANEL: LIVE STREAM --- */}
      <div className="w-full md:w-[380px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-green-600" />
               Live Posts
             </h3>
             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shadow-sm border border-green-200">
                {publishedPosts.length} Active
             </span>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search live posts..." 
               className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Scrollable List */}
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

      {/* --- RIGHT PANEL: REAL-TIME DEEP DIVE --- */}
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
    </div>
  );
}

// --- SUB-COMPONENT: LEFT CARD ---

function PostListCard({ post, isSelected, onClick }: { post: any, isSelected: boolean, onClick: () => void }) {
    // This uses REAL data cached in your DB by the Cron Job
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
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                     {formatDistanceToNow(post.publishedTime || Date.now(), { addSuffix: true })}
                   </span>
                </div>
                {post.mediaType === 'image' && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">IMG</span>}
                {post.mediaType === 'video' && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 font-medium">VID</span>}
            </div>

            <p className="text-sm text-gray-800 line-clamp-2 mb-3 font-medium leading-relaxed">
                {post.content}
            </p>

            {/* REAL Stats Row */}
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

// --- SUB-COMPONENT: RIGHT DETAIL VIEW ---

function PostAnalyticsDetail({ post }: { post: any }) {
    // 1. Fetch REAL History from 'daily_metrics' table
    const history = useQuery(api.analytics.getPostHistory, { postId: post._id });
    
    // Reverse history for chart (API returns Descending, Chart needs Ascending Time)
    const chartData = history ? [...history].reverse().map(h => ({
        ...h,
        timeLabel: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})
    })) : [];

    // Use cached stats for the big numbers
    const stats = post.currentStats || { likes: 0, comments: 0, shares: 0, impressions: 0 };
    
    // Calculate basic engagement rate
    const engagementRate = stats.impressions > 0 
        ? ((stats.likes + stats.comments + stats.shares) / stats.impressions * 100).toFixed(1) 
        : "0.0";

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            
            {/* 1. Detail Header */}
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
                    {/* View External Link Button */}
                    <a 
                        href="#" // In a real app, store the 'permalink' from FB/LinkedIn in the DB to link here
                        target="_blank"
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                    >
                        View External
                    </a>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border border-green-200">
                            Status: Live
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 text-sm font-medium">{new Date(post.publishedTime).toLocaleString()}</span>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{post.content}</h1>
                </div>
            </div>

            {/* 2. Real-Time Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/30">
                <BigStatBox label="Likes" value={stats.likes} icon={ThumbsUp} color="text-blue-600" />
                <BigStatBox label="Comments" value={stats.comments} icon={MessageCircle} color="text-green-600" />
                <BigStatBox label="Impressions" value={stats.impressions} icon={Eye} color="text-purple-600" />
                <div className="p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Engagement Rate</span>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-gray-900">{engagementRate}%</span>
                    </div>
                </div>
            </div>

            {/* 3. Time Collection Chart */}
            <div className="p-8 flex-1 min-h-[350px] relative">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Growth Trajectory</h3>
                        <p className="text-sm text-gray-500">Real-time data collection (Updates hourly)</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                        <Clock size={12} className="text-blue-500" />
                        Last 30 Snapshots
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
                                <XAxis 
                                    dataKey="timeLabel" 
                                    tick={{fontSize: 10, fill: '#9CA3AF'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={40}
                                    dy={10}
                                />
                                <YAxis 
                                    tick={{fontSize: 10, fill: '#9CA3AF'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#3C48F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="likes" 
                                    stroke="#3C48F6" 
                                    strokeWidth={3} 
                                    fill="url(#colorLikes)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3C48F6' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                            <Clock className="w-10 h-10 text-gray-300 mb-3" />
                            <p className="text-gray-900 font-bold">Data Collection in Progress</p>
                            <p className="text-sm text-gray-500 max-w-xs text-center mt-1">
                                We just started tracking this post. Check back after the next hourly scan for the trend chart.
                            </p>
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