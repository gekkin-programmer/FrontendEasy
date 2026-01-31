'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api'; 
import { motion, AnimatePresence } from 'framer-motion';

// Charting
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';

// Icons
import { 
  ThumbsUp, MessageCircle, TrendingUp, TrendingDown,
  Eye, Search, AlertCircle, LayoutDashboard, List, // ➤ FIX: Added LayoutDashboard
  Sparkles, Hash, Tag, Loader2, Heart, RefreshCw,
  Zap, Calendar, Activity, type Icon as LucideIcon
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

// --- TYPES ---
interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface AnalyticsPost {
  id: string;
  content: string;
  mediaUrls: string[];
  status: string;
  publishedAt: string;
  createdAt: string;
  platform: string;
  metrics: PostMetrics;
}

// --- NEU COMPONENTS ---
const NeuButton = ({ children, onClick, active, disabled, className = "" }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={cn(
      "flex items-center gap-2 px-4 py-2 text-sm font-black uppercase transition-all border-2 border-black", 
      active ? "bg-[#3C48F6] text-white shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-yellow-100", 
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const NeuCard = ({ title, icon: Icon, children, className, action }: any) => (
  <div className={cn("bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col overflow-hidden", className)}>
    <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />}
            <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
        </div>
        {action}
    </div>
    <div className="flex-1 p-4 relative">
        {children}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function Analytics() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [viewMode, setViewMode] = useState<'stream' | 'strategy'>('stream');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 gap-8 font-sans text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div className="border-l-4 border-[#3C48F5] pl-4">
           <h2 className="text-3xl font-black uppercase tracking-tighter">Analytics_Hub</h2>
           <p className="text-sm font-mono font-bold text-gray-500">REAL_TIME_PERFORMANCE_TRACKING</p>
        </div>
        <div className="flex gap-4">
           <NeuButton active={viewMode === 'stream'} onClick={() => setViewMode('stream')}><List size={16} strokeWidth={3} /> Live_Monitor</NeuButton>
           <NeuButton active={viewMode === 'strategy'} onClick={() => setViewMode('strategy')}><LayoutDashboard size={16} strokeWidth={3} /> Niche_Intel</NeuButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        {/* ➤ FIX: "AnPresence" typo corrected to "AnimatePresence" */}
         <AnimatePresence mode="wait">
            {viewMode === 'stream' ? <LiveStreamView key="stream" workspaceId={workspaceId} /> : <StrategyView key="strategy" workspaceId={workspaceId} />}
         </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 1: STRATEGY (Deep Intelligence)
// ============================================================================
function StrategyView({ workspaceId }: { workspaceId: string }) {
    
    // 1. Account Health
    const healthQuery = useQuery({
        queryKey: ['insights-health', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/health?workspaceId=${workspaceId}`) as any).data
    });

    // 2. Growth Forecast
    const forecastQuery = useQuery({
        queryKey: ['insights-forecast', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/forecast?workspaceId=${workspaceId}`) as any).data
    });

    // 3. Best Time
    const bestTimeQuery = useQuery({
        queryKey: ['insights-best-time', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/best-time?workspaceId=${workspaceId}`) as any).data
    });

    // 4. Content Mix
    const contentMixQuery = useQuery({
        queryKey: ['insights-content-mix', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/content-mix?workspaceId=${workspaceId}`) as any).data
    });

    // 5. Smart Copy & Hashtags
    const smartCopyQuery = useQuery({
        queryKey: ['insights-smart-copy', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/smart-copy?workspaceId=${workspaceId}`) as any).data
    });
    const hashtagsQuery = useQuery({
        queryKey: ['insights-hashtags', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/hashtags?workspaceId=${workspaceId}`) as any).data
    });

    // 6. Activity Timeline
    const timelineQuery = useQuery({
        queryKey: ['insights-timeline', workspaceId],
        queryFn: async () => (await api.get(`/analytics/insights/timeline?workspaceId=${workspaceId}`) as any).data
    });

    // 7. Platform Comparison (reuse accounts analytics)
    const platformQuery = useQuery({
        queryKey: ['analytics-accounts', workspaceId],
        queryFn: async () => (await api.get(`/analytics?workspaceId=${workspaceId}&type=ACCOUNTS`) as any).data
    });

    const isLoading = healthQuery.isLoading || forecastQuery.isLoading || timelineQuery.isLoading;

    if(isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>;

    const health = healthQuery.data || { healthScore: 0, consistencyStatus: 'N/A' };
    const forecast = forecastQuery.data || { trend: 'Stable', forecastNextMonth: 0 };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto pr-2 pb-20 scrollbar-hide">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                
                <NeuCard title="Account_Health" icon={Activity} className="bg-blue-50">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <span className="text-5xl font-black">{health.healthScore}</span>
                            <span className="text-xl font-bold text-gray-400">/100</span>
                        </div>
                        <span className="bg-[#3C48F5] text-white px-3 py-1 font-bold uppercase text-xs mb-2">{health.consistencyStatus}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-4 border-2 border-black">
                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${health.healthScore}%` }}></div>
                    </div>
                    <p className="mt-3 text-xs font-mono font-bold text-gray-600">AVG GAP: {health.avgPostingGap || 'N/A'}</p>
                </NeuCard>

                <NeuCard title="AI_Forecast" icon={TrendingUp}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-sm font-black uppercase px-2 py-0.5 border-2 border-black", (forecast.trend || '').includes('Growing') ? "bg-green-300" : "bg-gray-200")}>
                                    {forecast.trend}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Next Month Projection</p>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-black">~{forecast.forecastNextMonth?.toLocaleString()}</span>
                            <span className="text-sm font-bold ml-2">Interactions</span>
                        </div>
                        <p className="mt-2 text-[10px] font-mono text-gray-400">BASED ON LINEAR REGRESSION MODEL</p>
                    </div>
                </NeuCard>

                <NeuCard title="Content_ROI" icon={LayoutDashboard}>
                    <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentMixQuery.data || []} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" tick={{fontSize: 10, fontWeight: 'bold'}} width={60} axisLine={false} tickLine={false} />
                                <Bar dataKey="avgEngagement" barSize={20} radius={[0,4,4,0]}>
                                    {contentMixQuery.data?.map((e:any, i:number) => (
                                        <Cell key={i} fill={['#3b82f6', '#a855f7', '#facc15'][i % 3]} stroke="#000" strokeWidth={2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase mt-2">Avg. Engagement per Type</p>
                </NeuCard>
            </div>

            {/* 🟢 ACTIVITY & PLATFORM CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <NeuCard title="Activity_Timeline" icon={Activity} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="date" hide />
                                <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
                                <Tooltip contentStyle={{ borderRadius: '0px', border: '2px solid #000' }} />
                                <Area type="monotone" dataKey="count" stroke="#3C48F6" fill="#3C48F6" fillOpacity={0.1} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 text-center">Post Frequency (Last 30 Days)</p>
                </NeuCard>

                <NeuCard title="Platform_Battle" icon={Zap} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="platform" tick={{fontSize: 10, fontWeight: 'bold'}} />
                                <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
                                <Tooltip contentStyle={{ borderRadius: '0px', border: '2px solid #000' }} />
                                <Bar dataKey="totalEngagement" name="Engagements" fill="#facc15" stroke="#000" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 text-center">Total Engagement per Node</p>
                </NeuCard>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <NeuCard title="Golden_Windows" icon={Calendar} className="lg:col-span-1">
                    <div className="space-y-3">
                        {bestTimeQuery.data?.slice(0, 4).map((slot: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
                                <div className="flex items-center gap-3">
                                    <span className="bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-xs">{i+1}</span>
                                    <div className="flex flex-col leading-none">
                                        <span className="font-black uppercase text-sm">{slot.day}</span>
                                        <span className="font-mono text-xs text-gray-500">{slot.hour}:00 - {slot.hour+1}:00</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-green-600">{slot.avgEngagement}</span>
                                    <span className="text-[8px] font-bold uppercase text-gray-400">Avg. Eng.</span>
                                </div>
                            </div>
                        ))}
                        {(!bestTimeQuery.data || bestTimeQuery.data.length === 0) && <div className="text-center text-xs font-bold text-gray-400 py-4">NEED MORE DATA</div>}
                    </div>
                </NeuCard>

                <NeuCard title="Power_Words" icon={Zap} className="lg:col-span-1">
                    <div className="flex flex-wrap gap-2 content-start h-full">
                        {smartCopyQuery.data?.map((item: any, i: number) => (
                            <span 
                                key={i} 
                                className="px-2 py-1 border-2 border-black bg-white font-bold text-xs uppercase hover:bg-blue-300 transition-colors cursor-default"
                                style={{ fontSize: Math.max(10, 10 + (item.impactScore / 2)) + 'px' }}
                            >
                                {item.word}
                            </span>
                        ))}
                        {(!smartCopyQuery.data || smartCopyQuery.data.length === 0) && <div className="w-full text-center text-xs font-bold text-gray-400 py-4">ANALYZING TEXT...</div>}
                    </div>
                </NeuCard>

                <NeuCard title="Top_Hashtags" icon={Hash} className="lg:col-span-1">
                    <div className="space-y-2">
                        {hashtagsQuery.data?.slice(0, 5).map((tag: any, i: number) => (
                            <div key={i} className="flex justify-between items-center border-b border-dashed border-gray-300 pb-1">
                                <span className="font-bold text-sm text-blue-600">#{tag.tag}</span>
                                <span className="font-mono text-xs font-bold">{tag.avgEngagement} Eng.</span>
                            </div>
                        ))}
                        {(!hashtagsQuery.data || hashtagsQuery.data.length === 0) && <div className="text-center text-xs font-bold text-gray-400 py-4">NO HASHTAGS FOUND</div>}
                    </div>
                </NeuCard>

            </div>
        </motion.div>
    )
}

// ... Rest of the file (LiveStreamView, PostAnalyticsDetailWrapper, etc.) remains unchanged ...
// ... I will include them here for completeness ...

function LiveStreamView({ workspaceId }: { workspaceId: string }) {
    const queryClient = useQueryClient();
    
    // 🟢 1. FETCH OVERVIEW STATS
    const { data: overview = { totalPosts: 0, published: 0, scheduled: 0, drafts: 0 } } = useQuery({
        queryKey: ['analytics-overview', workspaceId],
        queryFn: async () => {
            const res: any = await api.get(`/analytics?workspaceId=${workspaceId}&type=OVERVIEW`);
            // Assuming backend response format based on service
            return res.overview || res.data?.overview || { totalPosts: 0, published: 0, scheduled: 0, drafts: 0 };
        }
    });

    const { data: posts = [], isLoading, refetch } = useQuery({
        queryKey: ['analytics-posts', workspaceId],
        queryFn: async () => {
            const res: any = await api.get(`/posts?workspaceId=${workspaceId}&limit=50&status=PUBLISHED`);
            const payload = res.data || res;
            return payload.items || payload || [];
        },
    });

    const syncMutation = useMutation({
        mutationFn: async () => {
            const accountsRes: any = await api.get(`/workspaces/${workspaceId}/social-accounts`);
            const accounts = Array.isArray(accountsRes) ? accountsRes : accountsRes.data;
            if (accounts.length > 0) { await api.post(`/social-accounts/${accounts[0].id}/sync`, {}); }
        },
        onSuccess: () => { setTimeout(() => { queryClient.invalidateQueries({ queryKey: ['analytics-posts'] }); refetch(); }, 3000); }
    });

    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const getEngagement = (p: AnalyticsPost) => (p.metrics?.likes || 0) + (p.metrics?.comments || 0);
    const filteredPosts = posts.filter((p: AnalyticsPost) => (p.content || "").toLowerCase().includes(searchTerm.toLowerCase()));

    if(isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full gap-8">
            
            {/* 🟢 OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-shrink-0">
                <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Total_Posts</span>
                    <span className="text-4xl font-black tabular-nums">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-blue-100 border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase text-blue-700 mb-1">Published</span>
                    <span className="text-4xl font-black tabular-nums">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-black text-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(60,72,245,0.4)] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase text-blue-400 mb-1">Scheduled</span>
                    <span className="text-4xl font-black tabular-nums">{overview.scheduled || 0}</span>
                </div>
                <div className="bg-[#3C48F5] text-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase text-white/70 mb-1">Drafts</span>
                    <span className="text-4xl font-black tabular-nums">{overview.drafts || 0}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 h-full pb-20 overflow-hidden">
                {/* Left Panel */}
            <div className="w-full md:w-[380px] flex flex-col bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] flex-shrink-0 h-full">
                <div className="p-4 border-b-2 border-black bg-[#3C48F5]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg uppercase flex items-center gap-2 text-white"><TrendingUp className="w-5 h-5 text-white" strokeWidth={3} /> Live_Stream</h3>
                        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="bg-black text-white px-2 py-1 text-[10px] font-bold uppercase hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1 transition-all">
                            {syncMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
                            {syncMutation.isPending ? "SYNCING..." : "SYNC_NOW"}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" strokeWidth={3} />
                        <input type="text" placeholder="SEARCH_POSTS..." className="w-full pl-9 pr-4 py-2 bg-white border-2 border-black text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:bg-blue-50 focus:shadow-[2px_2px_0px_0px_#000] transition-all uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-white">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2 border-b-2 border-dashed border-gray-300 mx-4 mt-4">
                            <AlertCircle size={32} strokeWidth={1} /><p className="text-sm font-bold uppercase">No_Active_Posts</p>
                        </div>
                    ) : (
                        filteredPosts.map((post: AnalyticsPost) => (
                            <PostListCard key={post.id} post={post} engagement={getEngagement(post)} isSelected={selectedPostId === post.id} onClick={() => setSelectedPostId(post.id)} />
                        ))
                    )}
                </div>
            </div>
            {/* Right Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] h-full overflow-hidden">
                {selectedPostId ? <PostAnalyticsDetailWrapper postId={selectedPostId} /> : (
                    <div className="flex-1 flex flex-col items-center justify-center text-black bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
                        <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000]"><TrendingUp size={40} strokeWidth={1.5} /></div>
                        <p className="font-black text-xl uppercase tracking-tight">Select_A_Post</p>
                        <p className="font-mono text-xs text-gray-500 mt-2">VIEW_REAL_TIME_DATA</p>
                    </div>
                )}
            </div>
            </div>
        </motion.div>
    );
}

function PostAnalyticsDetailWrapper({ postId }: { postId: string }) {
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post-analytics', postId],
        queryFn: async () => {
            try { const res: any = await api.get(`/posts/${postId}`); return res.data || res; } 
            catch (err) { console.error("Fetch Detail Error:", err); return null; }
        },
    });

    if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (error || !post) return <div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><AlertCircle className="w-10 h-10 text-red-500 mb-2" /><div className="font-bold text-lg">POST DATA UNAVAILABLE</div><p className="text-sm text-gray-500 max-w-xs mt-2">This post might have been deleted or the connection to the platform was lost.</p></div>;
    return <PostAnalyticsDetail post={post} />;
}

function PostListCard({ post, engagement, isSelected, onClick }: { post: AnalyticsPost, engagement: number, isSelected: boolean, onClick: () => void }) {
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    return (
        <div onClick={onClick} className={cn("p-4 cursor-pointer transition-all duration-150 relative border-b-2 border-black group", isSelected ? "bg-black text-white" : "bg-white hover:bg-blue-50 text-black")}>
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#3C48F5] border-r-2 border-white" />}
            <div className={cn("flex justify-between items-start mb-2", isSelected && "pl-3")}>
                <div className="flex gap-2">
                    <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 border-2", isSelected ? "bg-white text-black border-white" : "bg-gray-100 text-gray-600 border-black")}>{post.status}</span>
                    {hasMedia && <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 border-2 bg-purple-100 text-purple-800 border-black", isSelected && "border-white")}>MEDIA</span>}
                </div>
                <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 border-2", isSelected ? "bg-blue-600 text-white border-white" : "bg-blue-100 text-blue-800 border-black")}>{post.platform}</span>
            </div>
            <p className={cn("text-sm font-bold line-clamp-2 mb-3 leading-snug", isSelected ? "text-gray-200 pl-3" : "text-black")}>{post.content || "No text content"}</p>
            <div className={cn("flex items-center gap-4 text-xs font-mono pt-2 border-t-2 border-dashed", isSelected ? "border-gray-700 text-gray-400 pl-3" : "border-gray-200 text-gray-500")}>
                <div className="flex items-center gap-1.5"><Heart size={12} className={isSelected ? "text-white" : "text-black"} /><span className="font-bold">{post.metrics?.likes || 0}</span></div>
                <div className="flex items-center gap-1.5"><MessageCircle size={12} className={isSelected ? "text-white" : "text-black"} /><span className="font-bold">{post.metrics?.comments || 0}</span></div>
            </div>
        </div>
    );
}

function PostAnalyticsDetail({ post }: { post: AnalyticsPost }) {
    const metrics = post.metrics || { likes: 0, comments: 0, shares: 0, views: 0 };
    const hasReachData = metrics.views > 0;
    const totalInteractions = metrics.likes + metrics.comments + metrics.shares;
    
    let engagementRate = "N/A";
    let reachDisplay = "N/A";

    if (hasReachData) {
        const rate = (totalInteractions / metrics.views) * 100;
        engagementRate = rate.toFixed(1) + '%';
        reachDisplay = metrics.views.toLocaleString();
    } else if (metrics.likes > 0) {
        engagementRate = "-";
        reachDisplay = "No Data"; 
    }

    const chartData = [
        { name: 'LIKES', value: metrics.likes, fill: '#3b82f6' }, 
        { name: 'COMMENTS', value: metrics.comments, fill: '#22c55e' }, 
        { name: 'SHARES', value: metrics.shares, fill: '#a855f7' }, 
    ];

    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="p-6 border-b-2 border-black flex items-start gap-6 bg-gray-50">
                <div className="w-24 h-24 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex-shrink-0 overflow-hidden relative group flex items-center justify-center">
                    {hasMedia ? (
                        <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="Post media" />
                    ) : (
                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#f59e0b_10px,#f59e0b_20px)] flex items-center justify-center">
                            <span className="bg-white border-2 border-black px-2 py-1 font-black text-xs uppercase">TEXT</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500 text-white px-2 py-0.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">{post.status}</span>
                        <div className="w-px h-4 bg-black mx-1"></div>
                        <span className="bg-white text-black px-2 py-0.5 text-xs font-bold uppercase border-2 border-black">
                            {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt)) + ' ago' : 'Draft'}
                        </span>
                    </div>
                    <h1 className="text-xl font-black text-black leading-tight line-clamp-3 uppercase break-words">
                        {post.content || "Untitled Post"}
                    </h1>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x-2 divide-black border-b-2 border-black bg-white">
                <BigStatBox label="Likes" value={metrics.likes} icon={ThumbsUp} color="bg-blue-100" />
                <BigStatBox label="Comments" value={metrics.comments} icon={MessageCircle} color="bg-green-100" />
                <BigStatBox label="Actual Reach" value={reachDisplay} icon={Eye} color="bg-purple-100" />
                
                <div className="p-6 flex flex-col justify-center items-center text-center bg-blue-50">
                    <span className="text-xs font-black uppercase tracking-wider mb-1">Eng._Rate</span>
                    <span className="text-3xl font-black text-black">{engagementRate}</span>
                    {!hasReachData && metrics.likes > 0 && (
                        <span className="text-[10px] text-gray-500 mt-1 font-mono">WAITING FOR REACH</span>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="p-8 flex-1 min-h-[350px] relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Engagement_Split</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                        <Tag size={12} className="text-black" /> Distribution
                    </div>
                </div>
                
                <div className="w-full h-[280px] bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
                    {totalInteractions === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Hash className="w-8 h-8 mb-2 opacity-50"/>
                            <span className="font-bold text-sm uppercase">No Interactions Yet</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#000" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#000', fontWeight: 'bold'}} width={80} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#3C48F5', opacity: 0.1}} contentStyle={{ backgroundColor: '#fff', borderRadius: '0px', border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000', color: '#000', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (<div className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-default group"><div className={cn("p-2 border-2 border-black mb-2 shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all", color)}><Icon className="w-5 h-5 text-black" strokeWidth={2.5} /></div><span className="text-3xl font-black text-black tracking-tight tabular-nums mb-1">{value?.toLocaleString() || 0}</span><span className="text-xs font-mono font-bold text-gray-500 uppercase">{label}</span></div>)
}