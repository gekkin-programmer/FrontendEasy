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

// --- NEU COMPONENTS ---

const NeuButton = ({ children, onClick, active, className = "" }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 text-sm font-black uppercase transition-all border-2 border-black",
      active 
        ? "bg-[#3C48F6] text-white shadow-none translate-x-[2px] translate-y-[2px]" 
        : "bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-yellow-100",
      className
    )}
  >
    {children}
  </button>
);

const NeuCard = ({ children, className = "" }: any) => (
  <div className={cn("bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]", className)}>
    {children}
  </div>
);

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
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 gap-8 font-sans text-black">
      
      {/* 1. Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div className="border-l-4 border-yellow-400 pl-4">
           <h2 className="text-3xl font-black uppercase tracking-tighter">Analytics_Hub</h2>
           <p className="text-sm font-mono font-bold text-gray-500">REAL_TIME_PERFORMANCE_TRACKING</p>
        </div>

        <div className="flex gap-4">
           <NeuButton 
             active={viewMode === 'stream'}
             onClick={() => setViewMode('stream')}
           >
             <List size={16} strokeWidth={3} /> Live_Monitor
           </NeuButton>
           <NeuButton 
             active={viewMode === 'strategy'}
             onClick={() => setViewMode('strategy')}
           >
             <LayoutDashboard size={16} strokeWidth={3} /> Niche_Intel
           </NeuButton>
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
// VIEW 1: STRATEGY (NEUBRUTALIST REDESIGN)
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* --- CARD 1: CATEGORY PERFORMANCE --- */}
                <div className="md:col-span-8 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-0 overflow-hidden relative group">
                    <div className="flex justify-between items-start p-6 border-b-2 border-black bg-yellow-400">
                        <div>
                            <h3 className="text-lg font-black uppercase flex items-center gap-2">
                                <Tag size={20} className="text-black" strokeWidth={3} /> Category_Efficiency
                            </h3>
                            <p className="text-xs font-mono font-bold text-black mt-1">ENGAGEMENT_RATIO_PER_NICHE</p>
                        </div>
                        <div className="px-2 py-1 bg-black text-white text-[10px] font-mono font-bold border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            LAST_30_DAYS
                        </div>
                    </div>

                    <div className="h-[300px] w-full p-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nicheData.categories} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid horizontal={false} stroke="#000" strokeDasharray="3 3" opacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    // FIX: Removed 'textTransform' and used tickFormatter instead
                                    tick={{fontSize: 12, fill: '#000', fontWeight: 900}} 
                                    tickFormatter={(value) => value.toUpperCase()}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: '#fef08a', opacity: 0.5}} 
                                    contentStyle={{
                                        backgroundColor: '#fff', 
                                        borderRadius: '0px', 
                                        border: '2px solid #000', 
                                        boxShadow: '4px 4px 0px 0px #000',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Bar dataKey="avgLikes" barSize={40}>
                                    {nicheData.categories.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === 3 ? '#3C48F6' : '#000'} 
                                            className="stroke-2 stroke-black"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- CARD 2: HASHTAG INTELLIGENCE --- */}
                <div className="md:col-span-4 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col">
                    <div className="p-6 border-b-2 border-black bg-gray-100">
                        <h3 className="text-lg font-black uppercase flex items-center gap-2">
                            <Hash size={20} className="text-black" strokeWidth={3} /> Hashtag_ROI
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {nicheData.topTags.map((tag, i) => (
                            <div key={tag.tag} className="flex items-center justify-between p-4 border-b-2 border-black last:border-0 hover:bg-yellow-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-xs bg-black text-white px-1.5 py-0.5">0{i + 1}</span>
                                    <span className="text-sm font-black uppercase group-hover:underline decoration-2 underline-offset-2">
                                        #{tag.tag}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-mono font-bold tabular-nums">
                                        {(tag.totalLikes / 1000).toFixed(1)}k
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-black border-t-2 border-black text-center">
                        <button className="text-xs font-black text-white uppercase flex items-center justify-center gap-2 w-full hover:text-yellow-400 transition-colors">
                            VIEW_ALL_TAGS <Filter size={12} />
                        </button>
                    </div>
                </div>

                {/* --- CARD 3: AI TACTICAL ADVICE --- */}
                <div className="md:col-span-12">
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-1 overflow-hidden relative">
                        {/* Decorative Strip */}
                        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fbbf24_10px,#fbbf24_20px)] border-r-2 border-black"></div>
                        
                        <div className="flex flex-col md:flex-row gap-6 p-6 pl-8 items-start md:items-center relative z-10">
                            
                            <div className="flex-shrink-0 p-3 bg-black text-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_#fbbf24]">
                                <Sparkles size={32} strokeWidth={2} />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-black uppercase tracking-tight">
                                        Strategy_Signal
                                    </h4>
                                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-green-400 text-black border-2 border-black">
                                        HIGH_CONFIDENCE
                                    </span>
                                </div>
                                <p className="text-black font-medium text-sm leading-relaxed max-w-3xl border-l-4 border-gray-200 pl-3">
                                    Your <span className="bg-yellow-300 px-1 border border-black font-bold">Technology</span> content is outperforming other niches by <span className="font-black text-green-600">240%</span>. 
                                    The algorithm currently favors long-form text in this category.
                                </p>
                            </div>

                            <NeuButton className="bg-white text-black whitespace-nowrap">
                                Apply_Strategy
                            </NeuButton>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    )
}


// ============================================================================
// VIEW 2: LIVE MONITOR (NEUBRUTALIST REDESIGN)
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
            className="flex flex-col md:flex-row gap-8 h-full pb-20"
        >
            {/* LEFT: Stream List */}
            <div className="w-full md:w-[380px] flex flex-col bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] flex-shrink-0 h-full">
                <div className="p-4 border-b-2 border-black bg-yellow-400">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg uppercase flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-black" strokeWidth={3} /> Live_Stream
                        </h3>
                        <span className="text-xs bg-black text-white px-2 py-0.5 font-bold border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            {publishedPosts.length} ACTIVE
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" strokeWidth={3} />
                        <input 
                            type="text" 
                            placeholder="SEARCH_POSTS..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-black text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[2px_2px_0px_0px_#000] transition-all uppercase"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0 bg-white">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2 border-b-2 border-dashed border-gray-300 mx-4 mt-4">
                            <AlertCircle size={32} strokeWidth={1} />
                            <p className="text-sm font-bold uppercase">No_Active_Posts</p>
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
            <div className="flex-1 flex flex-col min-w-0 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] h-full overflow-hidden">
                {selectedPost ? (
                    <PostAnalyticsDetail post={selectedPost} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-black bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
                        <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000]">
                            <TrendingUp size={40} strokeWidth={1.5} />
                        </div>
                        <p className="font-black text-xl uppercase tracking-tight">Select_A_Post</p>
                        <p className="font-mono text-xs text-gray-500 mt-2">VIEW_REAL_TIME_DATA</p>
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
        <div 
            onClick={onClick}
            className={cn(
                "p-4 cursor-pointer transition-all duration-150 relative border-b-2 border-black group",
                isSelected 
                  ? "bg-black text-white" 
                  : "bg-white hover:bg-yellow-50 text-black"
            )}
        >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400 border-r-2 border-white" />}
            <div className={cn("flex justify-between items-start mb-2", isSelected && "pl-3")}>
                <span className={cn(
                    "text-[10px] font-bold uppercase px-1.5 py-0.5 border-2",
                    isSelected ? "bg-white text-black border-white" : "bg-gray-100 text-gray-600 border-black"
                )}>
                     Just_Now
                </span>
                <div className="flex gap-1">
                    {post.category && post.category !== 'General' && (
                        <span className={cn(
                            "text-[10px] font-bold uppercase px-1.5 py-0.5 border-2 truncate max-w-[80px]",
                            isSelected ? "bg-blue-600 text-white border-white" : "bg-blue-100 text-blue-800 border-black"
                        )}>
                            {post.category}
                        </span>
                    )}
                </div>
            </div>
            <p className={cn(
                "text-sm font-bold line-clamp-2 mb-3 leading-snug", 
                isSelected ? "text-gray-200 pl-3" : "text-black"
            )}>
                {post.content}
            </p>
            <div className={cn(
                "flex items-center gap-4 text-xs font-mono pt-2 border-t-2 border-dashed",
                isSelected ? "border-gray-700 text-gray-400 pl-3" : "border-gray-200 text-gray-500"
            )}>
                <div className="flex items-center gap-1.5">
                    <ThumbsUp size={12} className={isSelected ? "text-white" : "text-black"} />
                    <span className="font-bold">{stats.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={12} className={isSelected ? "text-white" : "text-black"} />
                    <span className="font-bold">{stats.comments}</span>
                </div>
            </div>
        </div>
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
            <div className="p-6 border-b-2 border-black flex items-start gap-6 bg-gray-50">
                <div className="w-24 h-24 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex-shrink-0 overflow-hidden relative group">
                    <div className="w-full h-full flex items-center justify-center font-black text-xl bg-yellow-300">TxT</div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500 text-white px-2 py-0.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">Live</span>
                        <div className="w-px h-4 bg-black mx-1"></div>
                        <span className="bg-white text-black px-2 py-0.5 text-xs font-bold uppercase border-2 border-black">{post.category || "General"}</span>
                    </div>
                    <h1 className="text-xl font-black text-black leading-tight line-clamp-2 uppercase">{post.content}</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x-2 divide-black border-b-2 border-black bg-white">
                <BigStatBox label="Likes" value={stats.likes} icon={ThumbsUp} color="bg-blue-100" />
                <BigStatBox label="Comments" value={stats.comments} icon={MessageCircle} color="bg-green-100" />
                <BigStatBox label="Impressions" value={stats.impressions} icon={Eye} color="bg-purple-100" />
                <div className="p-6 flex flex-col justify-center items-center text-center bg-yellow-50">
                    <span className="text-xs font-black uppercase tracking-wider mb-1">Eng._Rate</span>
                    <span className="text-3xl font-black text-black">{engagementRate}%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="p-8 flex-1 min-h-[350px] relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Growth_Trajectory</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                        <Clock size={12} className="text-black" /> Hourly_View
                    </div>
                </div>
                <div className="w-full h-[280px] bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.1} />
                            <XAxis dataKey="timeLabel" tick={{fontSize: 10, fill: '#000', fontWeight: 'bold'}} axisLine={false} tickLine={false} minTickGap={40} dy={10} />
                            <YAxis tick={{fontSize: 10, fill: '#000', fontWeight: 'bold'}} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '0px', 
                                    border: '2px solid #000', 
                                    boxShadow: '4px 4px 0px 0px #000', 
                                    color: '#000',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }} 
                                cursor={{ stroke: '#000', strokeWidth: 2 }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="likes" 
                                stroke="#000" 
                                strokeWidth={3} 
                                fill="#3C48F6" 
                                fillOpacity={0.2}
                                activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#fff' }} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-default group">
            <div className={cn("p-2 border-2 border-black mb-2 shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all", color)}>
                <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black text-black tracking-tight tabular-nums mb-1">
                {value.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">{label}</span>
        </div>
    )
}