'use client';

import React, { useState } from 'react';
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';

// Charting
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

// Icons
import { 
  ThumbsUp, MessageCircle, TrendingUp, Clock, 
  Eye, Search, AlertCircle, LayoutDashboard, List, 
  Sparkles, Hash, Tag, Filter, Share2
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const generateMockHistory = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    timeLabel: `${i}:00`,
    likes: Math.floor(Math.random() * 50) + (i * 2),
    timestamp: Date.now() - (24 - i) * 3600000
  }));
};

const MOCK_NICHE_DATA = {
  categories: [
    { name: 'Tech', avgLikes: 120 },
    { name: 'Lifestyle', avgLikes: 85 },
    { name: 'Education', avgLikes: 200 },
    { name: 'Meme', avgLikes: 450 },
  ],
  topTags: [
    { tag: 'marketing', totalLikes: 5000 },
    { tag: 'growth', totalLikes: 3200 },
    { tag: 'business', totalLikes: 2100 },
  ]
};

// --- MAIN COMPONENT ---

export default function Analytics() {
  const params = useParams();
  const workspaceId = params.id as string;

  // View State (Tabs)
  const [viewMode, setViewMode] = useState<'stream' | 'strategy'>('stream');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 gap-6">
      
      {/* 1. Header & Tabs */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-foreground tracking-tight">Analytics & Insights</h2>
           <p className="text-muted-foreground text-sm">Track performance and optimize your content strategy.</p>
        </div>

        <div className="flex p-1 bg-card border border-border rounded-xl">
           <button 
             onClick={() => setViewMode('stream')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
               viewMode === 'stream' 
                 ? "bg-[#304AEB] text-white shadow-md shadow-blue-900/20" 
                 : "text-muted-foreground hover:text-foreground hover:bg-white/5"
             )}
           >
             <List size={16} /> Live Monitor
           </button>
           <button 
             onClick={() => setViewMode('strategy')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
               viewMode === 'strategy' 
                 ? "bg-[#304AEB] text-white shadow-md shadow-blue-900/20" 
                 : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
// VIEW 1: STRATEGY (PREMIUM SAAS REDESIGN)
// ============================================================================

function StrategyView({ workspaceId }: { workspaceId: string }) {
    const nicheData = MOCK_NICHE_DATA;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full overflow-y-auto pr-2 pb-20"
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* --- CARD 1: CATEGORY PERFORMANCE (The Hero Chart) --- */}
                <div className="md:col-span-8 bg-[#111] rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Tag size={14} className="text-[#304AEB]" /> Category Efficiency
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Engagement ratio per niche.</p>
                        </div>
                        <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5 text-[10px] font-mono text-zinc-400">
                            LAST 30 DAYS
                        </div>
                    </div>

                    <div className="h-[280px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nicheData.categories} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tick={{fontSize: 12, fill: '#71717a', fontFamily: 'var(--font-mono)'}} 
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(48, 74, 235, 0.05)'}} 
                                    contentStyle={{backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                                />
                                <Bar dataKey="avgLikes" barSize={32} radius={[0, 4, 4, 0]}>
                                    {nicheData.categories.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === 3 ? '#304AEB' : '#27272a'} 
                                            className="transition-all duration-300 hover:opacity-80"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- CARD 2: HASHTAG INTELLIGENCE (The Data Table) --- */}
                <div className="md:col-span-4 bg-[#111] rounded-2xl border border-white/5 p-0 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 bg-zinc-900/50">
                        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Hash size={14} className="text-[#304AEB]" /> Hashtag ROI
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {nicheData.topTags.map((tag, i) => (
                            <div key={tag.tag} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-zinc-600">0{i + 1}</span>
                                    <span className="text-sm text-zinc-300 font-medium group-hover:text-[#304AEB] transition-colors">
                                        #{tag.tag}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-mono text-zinc-200 tabular-nums">
                                        {(tag.totalLikes / 1000).toFixed(1)}k
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-zinc-900/30 border-t border-white/5 text-center">
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
                            View all tags <Filter size={10} />
                        </button>
                    </div>
                </div>

                {/* --- CARD 3: AI TACTICAL ADVICE (System Log Style) --- */}
                <div className="md:col-span-12">
                    <div className="bg-gradient-to-r from-[#111] to-[#0a0a0a] rounded-2xl border border-white/10 p-1 overflow-hidden relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-0 w-[300px] h-full bg-[#304AEB]/10 blur-[100px] pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row gap-6 p-6 items-start md:items-center relative z-10">
                            
                            <div className="flex-shrink-0 p-3 bg-[#304AEB]/10 border border-[#304AEB]/20 rounded-xl">
                                <Sparkles size={24} className="text-[#304AEB]" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                                        Strategy Signal
                                    </h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20">
                                        HIGH CONFIDENCE
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                                    Your <span className="text-white font-medium">Technology</span> content is outperforming other niches by <span className="text-green-400 font-mono">240%</span>. 
                                    The algorithm currently favors long-form text in this category.
                                </p>
                            </div>

                            <button className="flex-shrink-0 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                Apply Strategy
                            </button>
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

function LiveStreamView({ workspaceId }: { workspaceId: string }) {
    // 🛑 MOCK Data
    const [publishedPosts] = useState<any[]>([
      { _id: '1', content: 'Launching our new product! #startup', status: 'published', currentStats: { likes: 120, comments: 15, shares: 5, impressions: 500 }, publishedTime: Date.now() - 3600000, category: 'Launch' },
      { _id: '2', content: 'Monday motivation for developers.', status: 'published', currentStats: { likes: 45, comments: 2, shares: 0, impressions: 120 }, publishedTime: Date.now() - 7200000, category: 'Motivation' }
    ]);

    // 2. State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            {/* LEFT: Stream List */}
            <div className="w-full md:w-[380px] flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-border bg-background/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" /> Live Stream
                        </h3>
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                            {publishedPosts.length} Active
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search active posts..." 
                            className="w-full pl-9 pr-4 py-2 bg-[#111] border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#304AEB] transition-all placeholder:text-muted-foreground/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background/30 scrollbar-thin scrollbar-thumb-border">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
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

            {/* RIGHT: Details Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {selectedPost ? (
                    <PostAnalyticsDetail post={selectedPost} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background/20">
                        <TrendingUp size={64} className="mb-4 text-border" />
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
                  ? "bg-card border-[#304AEB] shadow-[0_0_15px_rgba(48,74,235,0.1)] ring-1 ring-[#304AEB]" 
                  : "bg-card border-border hover:border-[#304AEB]/50 hover:bg-[#1a1a1a]"
            )}
        >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#304AEB]" />}
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-muted-foreground font-medium bg-background px-1.5 py-0.5 rounded-full border border-border">
                     Just now
                </span>
                <div className="flex gap-1">
                    {post.category && post.category !== 'General' && (
                        <span className="text-[10px] bg-background text-muted-foreground px-1.5 py-0.5 rounded font-medium truncate max-w-[60px] border border-border">{post.category}</span>
                    )}
                </div>
            </div>
            <p className="text-sm text-foreground/90 line-clamp-2 mb-3 font-medium leading-relaxed">
                {post.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-2">
                <div className="flex items-center gap-1.5">
                    <ThumbsUp size={12} className={stats.likes > 0 ? "text-blue-500 fill-blue-500" : ""} />
                    <span className="font-semibold">{stats.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={12} className={stats.comments > 0 ? "text-green-500 fill-green-500" : ""} />
                    <span className="font-semibold">{stats.comments}</span>
                </div>
            </div>
        </motion.div>
    )
}

function PostAnalyticsDetail({ post }: { post: any }) {
    const chartData = generateMockHistory();
    const stats = post.currentStats || { likes: 0, comments: 0, shares: 0, impressions: 0 };
    const engagementRate = stats.impressions > 0 
        ? ((stats.likes + stats.comments + stats.shares) / stats.impressions * 100).toFixed(1) 
        : "0.0";

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-start gap-6 bg-card">
                <div className="w-24 h-24 bg-background rounded-xl flex-shrink-0 overflow-hidden border border-border shadow-sm relative group">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xl">TxT</div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border border-green-500/20">Live</span>
                        <span className="text-border">|</span>
                        <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-md text-xs font-medium border border-border">{post.category || "General"}</span>
                    </div>
                    <h1 className="text-lg font-bold text-foreground leading-snug line-clamp-2">{post.content}</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border border-b border-border bg-background/30">
                <BigStatBox label="Likes" value={stats.likes} icon={ThumbsUp} color="text-blue-500" />
                <BigStatBox label="Comments" value={stats.comments} icon={MessageCircle} color="text-green-500" />
                <BigStatBox label="Impressions" value={stats.impressions} icon={Eye} color="text-purple-500" />
                <div className="p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Eng. Rate</span>
                    <span className="text-3xl font-black text-foreground">{engagementRate}%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="p-8 flex-1 min-h-[350px] relative">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-foreground text-lg">Growth Trajectory</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-muted-foreground shadow-sm">
                        <Clock size={12} className="text-[#304AEB]" /> Hourly
                    </div>
                </div>
                <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#304AEB" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#304AEB" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                            <XAxis dataKey="timeLabel" tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} minTickGap={40} dy={10} />
                            <YAxis tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333', color: '#fff' }} cursor={{ stroke: '#304AEB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="likes" stroke="#304AEB" strokeWidth={3} fill="url(#colorLikes)" activeDot={{ r: 6, strokeWidth: 0, fill: '#304AEB' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-default">
            <div className={cn("p-2 rounded-full mb-2 bg-opacity-10", color.replace('text-', 'bg-'))}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tight tabular-nums mb-1">
                {value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-background/50">
            <Filter className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium text-sm">{message}</p>
        </div>
    )
}