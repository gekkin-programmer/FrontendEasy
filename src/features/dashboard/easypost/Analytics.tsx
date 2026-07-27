'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

// Charting
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';

// Icons
import {
  ThumbsUp, MessageCircle, TrendingUp, TrendingDown,
  Eye, Search, AlertCircle, LayoutDashboard, List,
  Sparkles, Hash, Tag, Loader2, Heart, RefreshCw,
  Zap, Calendar, Activity, Share2, ExternalLink, type Icon as LucideIcon
} from "lucide-react";
import { PlatformIcon } from '@/features/dashboard/eazlypost/composer/PlatformIcon';
import { Skeleton } from '@/components/ui/skeleton';

function AnalyticsGridSkeleton() {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
            <div className="p-4 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800">
              <Skeleton className="h-5 w-32 rounded" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-24 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveStreamSkeleton() {
  return (
    <div className="flex flex-col h-full gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-shrink-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]">
            <Skeleton className="h-3 w-20 mx-auto mb-2 rounded" />
            <Skeleton className="h-10 w-16 mx-auto rounded" />
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-8 flex-1 pb-20 overflow-hidden">
        <div className="w-full md:w-[380px] flex flex-col border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex-shrink-0">
          <div className="p-4 border-b-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800">
            <Skeleton className="h-8 w-full rounded mb-3" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 border-b border-gray-100 dark:border-zinc-800 space-y-2">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex items-center justify-center">
          <Skeleton className="w-20 h-20 rounded" />
        </div>
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-4">
      <Skeleton className="h-6 w-48 rounded" />
      <Skeleton className="h-24 w-full rounded" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-2 border-black dark:border-white p-3">
            <Skeleton className="h-3 w-16 mb-2 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
      "flex items-center gap-2 px-4 py-2 text-sm font-black uppercase transition-all border-2 border-black dark:border-white", 
      active ? "bg-black dark:bg-white text-white shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const NeuCard = ({ title, icon: Icon, children, className, action }: any) => (
  <div className={cn("bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] flex flex-col overflow-hidden", className)}>
    <div className="flex justify-between items-center p-4 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={2.5} />}
            <h3 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">{title}</h3>
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
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] animate-in fade-in duration-500 gap-4 font-sans text-black dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div className="border-l-4 border-black dark:border-white pl-4">
           <h2 className="text-3xl font-black uppercase tracking-tighter">{t("Analytics_Hub", "Hub_Analytique")}</h2>
           <p className="text-sm font-mono font-bold text-gray-500 dark:text-zinc-400">{t("REAL_TIME_PERFORMANCE_TRACKING", "SUIVI_PERFORMANCE_EN_TEMPS_RÉEL")}</p>
        </div>
        <div className="flex gap-4">
           <NeuButton active={viewMode === 'stream'} onClick={() => setViewMode('stream')}><List size={16} strokeWidth={3} /> {t("Live_Monitor", "Moniteur_Live")}</NeuButton>
           <NeuButton active={viewMode === 'strategy'} onClick={() => setViewMode('strategy')}><LayoutDashboard size={16} strokeWidth={3} /> {t("Niche_Intel", "Intel_Niche")}</NeuButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-0 relative">
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
    const { t } = useLanguage();
    
    // 1. Account Health
    const healthQuery = useQuery({
        queryKey: ['insights-health', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/health?workspaceId=${workspaceId}`) as any).data
    });

    // 2. Growth Forecast
    const forecastQuery = useQuery({
        queryKey: ['insights-forecast', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/forecast?workspaceId=${workspaceId}`) as any).data
    });

    // 3. Best Time
    const bestTimeQuery = useQuery({
        queryKey: ['insights-best-time', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/best-time?workspaceId=${workspaceId}`) as any).data
    });

    // 4. Content Mix
    const contentMixQuery = useQuery({
        queryKey: ['insights-content-mix', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/content-mix?workspaceId=${workspaceId}`) as any).data
    });

    // 5. Smart Copy & Hashtags
    const smartCopyQuery = useQuery({
        queryKey: ['insights-smart-copy', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/smart-copy?workspaceId=${workspaceId}`) as any).data
    });
    const hashtagsQuery = useQuery({
        queryKey: ['insights-hashtags', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/hashtags?workspaceId=${workspaceId}`) as any).data
    });

    // 6. Activity Timeline
    const timelineQuery = useQuery({
        queryKey: ['insights-timeline', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics/insights/timeline?workspaceId=${workspaceId}`) as any).data
    });

    // 7. Platform Comparison (reuse accounts analytics)
    const platformQuery = useQuery({
        queryKey: ['analytics-accounts', workspaceId],
        gcTime: 0,
        queryFn: async () => (await api.get(`/analytics?workspaceId=${workspaceId}&type=ACCOUNTS`) as any).data
    });

    const isLoading = healthQuery.isLoading || forecastQuery.isLoading || timelineQuery.isLoading;

    if(isLoading) return <AnalyticsGridSkeleton />;

    const health = healthQuery.data || { healthScore: 0, consistencyStatus: 'N/A' };
    const forecast = forecastQuery.data || { trend: 'Stable', forecastNextMonth: 0 };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto pr-2 pb-20 scrollbar-hide">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                
                <NeuCard title={t("Account_Health", "Santé_Compte")} icon={Activity} className="bg-zinc-100 dark:bg-zinc-900/50">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <span className="text-5xl font-black text-black dark:text-white">{health.healthScore}</span>
                            <span className="text-xl font-bold text-gray-400 dark:text-zinc-500">/100</span>
                        </div>
                        <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-bold uppercase text-xs mb-2">{health.consistencyStatus}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-4 border-2 border-black dark:border-white">
                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${health.healthScore}%` }}></div>
                    </div>
                    <p className="mt-3 text-xs font-mono font-bold text-gray-600 dark:text-zinc-400 uppercase">{t("AVG GAP:", "ÉCART MOY:")} {health.avgPostingGap || 'N/A'}</p>
                </NeuCard>

                <NeuCard title={t("AI_Forecast", "Prévision_IA")} icon={TrendingUp}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-sm font-black uppercase px-2 py-0.5 border-2 border-black dark:border-white", (forecast.trend || '').includes('Growing') ? "bg-green-300 dark:bg-green-600" : "bg-gray-200 dark:bg-zinc-800")}>
                                    {forecast.trend}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase">{t("Next Month Projection", "Projection Mois Prochain")}</p>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-black text-black dark:text-white">~{forecast.forecastNextMonth?.toLocaleString()}</span>
                            <span className="text-sm font-bold ml-2 text-black dark:text-white uppercase">{t("Interactions", "Interactions")}</span>
                        </div>
                        <p className="mt-2 text-[10px] font-mono text-gray-400 dark:text-zinc-500 uppercase">{t("BASED ON LINEAR REGRESSION MODEL", "BASÉ SUR MODÈLE DE RÉGRESSION LINÉAIRE")}</p>
                    </div>
                </NeuCard>

                <NeuCard title={t("Content_ROI", "ROI_Contenu")} icon={LayoutDashboard}>
                    <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentMixQuery.data || []} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor'}} width={60} axisLine={false} tickLine={false} />
                                <Bar dataKey="avgEngagement" barSize={20} radius={[0,4,4,0]}>
                                    {contentMixQuery.data?.map((e:any, i:number) => (
                                        <Cell key={i} fill={['#3b82f6', '#a855f7', '#facc15'][i % 3]} stroke="currentColor" strokeWidth={2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase mt-2 text-black dark:text-white">{t("Avg. Engagement per Type", "Eng. Moy. par Type")}</p>
                </NeuCard>
            </div>

            {/* 🟢 ACTIVITY & PLATFORM CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <NeuCard title={t("Activity_Timeline", "Chronologie_Activité")} icon={Activity} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="date" hide />
                                <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor'}} />
                                <Tooltip contentStyle={{ borderRadius: '0px', border: '2px solid currentColor', backgroundColor: 'var(--tw-bg-opacity)' }} />
                                <Area type="monotone" dataKey="count" stroke="#000000" fill="#000000" fillOpacity={0.1} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 text-center text-black dark:text-white">{t("Post Frequency (Last 30 Days)", "Fréquence Publications (30 Derniers Jours)")}</p>
                </NeuCard>

                <NeuCard title={t("Platform_Battle", "Bataille_Plateformes")} icon={Zap} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="platform" tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor'}} />
                                <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor'}} />
                                <Tooltip contentStyle={{ borderRadius: '0px', border: '2px solid currentColor' }} />
                                <Bar dataKey="totalEngagement" name={t("Engagements", "Engagements")} fill="#facc15" stroke="currentColor" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 text-center text-black dark:text-white">{t("Total Engagement per Node", "Engagement Total par Nœud")}</p>
                </NeuCard>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <NeuCard title={t("Golden_Windows", "Créneaux_Or")} icon={Calendar} className="lg:col-span-1">
                    <div className="space-y-3">
                        {bestTimeQuery.data?.slice(0, 4).map((slot: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center font-bold text-xs">{i+1}</span>
                                    <div className="flex flex-col leading-none">
                                        <span className="font-black uppercase text-sm text-black dark:text-white">{slot.day}</span>
                                        <span className="font-mono text-xs text-gray-500 dark:text-zinc-400">{slot.hour}:00 - {slot.hour+1}:00</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-green-600 dark:text-green-400">{slot.avgEngagement}</span>
                                    <span className="text-[8px] font-bold uppercase text-gray-400 dark:text-zinc-500">{t("Avg. Eng.", "Eng. Moy.")}</span>
                                </div>
                            </div>
                        ))}
                        {(!bestTimeQuery.data || bestTimeQuery.data.length === 0) && <div className="text-center text-xs font-bold text-gray-400 dark:text-zinc-600 py-4 uppercase">{t("NEED MORE DATA", "PLUS DE DONNÉES NÉCESSAIRES")}</div>}
                    </div>
                </NeuCard>

                <NeuCard title={t("Power_Words", "Mots_Puissants")} icon={Zap} className="lg:col-span-1">
                    <div className="flex flex-wrap gap-2 content-start h-full">
                        {smartCopyQuery.data?.map((item: any, i: number) => (
                            <span
                                key={i}
                                className="px-2 py-1 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white font-bold text-xs uppercase hover:bg-blue-300 dark:hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-default"
                                style={{ fontSize: Math.max(10, 10 + (item.impactScore / 2)) + 'px' }}
                            >
                                {item.word}
                            </span>
                        ))}
                        {(!smartCopyQuery.data || smartCopyQuery.data.length === 0) && <div className="w-full text-center text-xs font-bold text-gray-400 dark:text-zinc-600 py-4 uppercase">{t("ANALYZING TEXT...", "ANALYSE DU TEXTE...")}</div>}
                    </div>
                </NeuCard>

                <NeuCard title={t("Top_Hashtags", "Meilleurs_Hashtags")} icon={Hash} className="lg:col-span-1">
                    <div className="space-y-2">
                        {hashtagsQuery.data?.slice(0, 5).map((tag: any, i: number) => (
                            <div key={i} className="flex justify-between items-center border-b border-dashed border-gray-300 dark:border-zinc-700 pb-1">
                                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">#{tag.tag}</span>
                                <span className="font-mono text-xs font-bold text-black dark:text-white uppercase">{tag.avgEngagement} {t("Eng.", "Eng.")}</span>
                            </div>
                        ))}
                        {(!hashtagsQuery.data || hashtagsQuery.data.length === 0) && <div className="text-center text-xs font-bold text-gray-400 dark:text-zinc-600 py-4 uppercase">{t("NO HASHTAGS FOUND", "AUCUN HASHTAG TROUVÉ")}</div>}
                    </div>
                </NeuCard>

            </div>
        </motion.div>
    )
}

// ... Rest of the file (LiveStreamView, PostAnalyticsDetailWrapper, etc.) ...

function LiveStreamView({ workspaceId }: { workspaceId: string }) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    
    // 🟢 1. FETCH OVERVIEW STATS
    const { data: overview = { totalPosts: 0, published: 0, scheduled: 0, drafts: 0 } } = useQuery({
        queryKey: ['analytics-overview', workspaceId],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/analytics?workspaceId=${workspaceId}&type=OVERVIEW`);
            return res.overview || res.data?.overview || { totalPosts: 0, published: 0, scheduled: 0, drafts: 0 };
        }
    });

    const { data: posts = [], isLoading, refetch } = useQuery({
        queryKey: ['analytics-posts', workspaceId],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/posts?workspaceId=${workspaceId}&limit=50&status=PUBLISHED`);
            const payload = res.data || res;
            const rawPosts = payload.items || payload || [];
            return rawPosts.map((p: any) => ({
                ...p,
                mediaUrls: p.media?.map((pm: any) => pm.media?.url).filter(Boolean) ?? [],
                metrics: (p.socialAccounts ?? []).reduce((acc: any, psa: any) => ({
                    likes: acc.likes + (psa.likes || 0),
                    comments: acc.comments + (psa.comments || 0),
                    shares: acc.shares + (psa.shares || 0),
                    views: acc.views + (psa.views || 0),
                }), { likes: 0, comments: 0, shares: 0, views: 0 }),
            }));
        },
    });

    const syncMutation = useMutation({
        mutationFn: async () => {
            const accountsRes: any = await api.get(`/workspaces/${workspaceId}/social-accounts`);
            const accounts = Array.isArray(accountsRes) ? accountsRes : accountsRes.data;
            // Queue sync jobs for every connected account (not just the first one)
            await Promise.all(accounts.map((acc: any) => api.post(`/social-accounts/${acc.id}/sync`, {})));
            // Also trigger direct comment sync so the inbox is updated immediately
            await api.post(`/engagement/sync?workspaceId=${workspaceId}`, {});
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['analytics-posts'] });
                queryClient.invalidateQueries({ queryKey: ['post-analytics'] });
                refetch();
            }, 3000);
        }
    });

    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const getEngagement = (p: AnalyticsPost) => (p.metrics?.likes || 0) + (p.metrics?.comments || 0);
    const filteredPosts = posts.filter((p: AnalyticsPost) => (p.content || "").toLowerCase().includes(searchTerm.toLowerCase()));

    if(isLoading) return <LiveStreamSkeleton />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full gap-4 transition-colors">
            
            {/* 🟢 OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-shrink-0">
                <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">{t("Total_Posts", "Total_Publications")}</span>
                    <span className="text-4xl font-black tabular-nums text-black dark:text-white">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">{t("Published", "Publiées")}</span>
                    <span className="text-4xl font-black tabular-nums text-black dark:text-white">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">{t("Scheduled", "Planifiées")}</span>
                    <span className="text-4xl font-black tabular-nums text-black dark:text-white">{overview.scheduled || 0}</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">{t("Drafts", "Brouillons")}</span>
                    <span className="text-4xl font-black tabular-nums text-black dark:text-white">{overview.drafts || 0}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
                {/* Left Panel */}
            <div className="w-full md:w-[380px] flex flex-col bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] flex-shrink-0 h-full transition-colors rounded-tl-2xl rounded-tr-2xl overflow-hidden">
                <div className="p-4 border-b-2 border-black dark:border-white bg-black dark:bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg uppercase text-white">{t("Live_STREAM", "FLUX_EN_DIRECT")}</h3>
                        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="bg-white text-black border-2 border-black px-2 py-1 text-[10px] font-bold uppercase hover:bg-zinc-100 disabled:opacity-50 flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                            {syncMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
                            {syncMutation.isPending ? t("SYNCING...", "SYNC EN COURS...") : t("SYNC_NOW", "SYNC_MAINTENANT")}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-zinc-400 w-4 h-4" strokeWidth={3} />
                        <input type="text" placeholder={t("SEARCH_POSTS...", "CHERCHER_PUBLICATIONS...")} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-50 dark:focus:bg-zinc-700 focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all uppercase text-black dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-zinc-900 transition-colors">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-zinc-600 space-y-2 border-b-2 border-dashed border-gray-300 dark:border-zinc-700 mx-4 mt-4 uppercase">
                            <AlertCircle size={32} strokeWidth={1} /><p className="text-sm font-bold">{t("No_Active_Posts", "Aucune_Publication_Active")}</p>
                        </div>
                    ) : (
                        filteredPosts.map((post: AnalyticsPost) => (
                            <PostListCard key={post.id} post={post} engagement={getEngagement(post)} isSelected={selectedPostId === post.id} onClick={() => setSelectedPostId(post.id)} />
                        ))
                    )}
                </div>
            </div>
            {/* Right Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] h-full overflow-hidden transition-colors rounded-tl-2xl rounded-tr-2xl">
                {selectedPostId ? <PostAnalyticsDetailWrapper postId={selectedPostId} workspaceId={workspaceId} /> : (
                    <div className="flex-1 flex flex-col items-center justify-center text-black dark:text-white bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] dark:opacity-80 transition-all">
                        <div className="w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all"><TrendingUp size={40} strokeWidth={1.5} /></div>
                        <p className="font-black text-xl uppercase tracking-tight">{t("Select_A_Post", "Sélectionner_Une_Publication")}</p>
                        <p className="font-mono text-xs text-gray-500 dark:text-zinc-400 mt-2 uppercase">{t("VIEW_REAL_TIME_DATA", "VOIR_DONNÉES_EN_TEMPS_RÉEL")}</p>
                    </div>
                )}
            </div>
            </div>
        </motion.div>
    );
}

function PostAnalyticsDetailWrapper({ postId, workspaceId }: { postId: string; workspaceId: string }) {
    const { t } = useLanguage();
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post-analytics', postId],
        gcTime: 0,
        queryFn: async () => {
            try {
                const res: any = await api.get(`/posts/${postId}?workspaceId=${workspaceId}`);
                const raw = res.data || res;
                const metrics = (raw.socialAccounts ?? []).reduce((acc: any, psa: any) => ({
                    likes: acc.likes + (psa.likes || 0),
                    comments: acc.comments + (psa.comments || 0),
                    shares: acc.shares + (psa.shares || 0),
                    views: acc.views + (psa.views || 0),
                }), { likes: 0, comments: 0, shares: 0, views: 0 });
                return {
                    ...raw,
                    mediaUrls: raw.media?.map((pm: any) => pm.media?.url).filter(Boolean) ?? [],
                    metrics,
                    platformAccounts: raw.socialAccounts ?? [],
                    syncedComments: raw.comments ?? [],
                };
            }
            catch (err) { console.error("Fetch Detail Error:", err); return null; }
        },
    });

    if (isLoading) return <PostDetailSkeleton />;
    if (error || !post) return <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-black dark:text-white"><AlertCircle className="w-10 h-10 text-red-500 mb-2" /><div className="font-bold text-lg uppercase">{t("POST DATA UNAVAILABLE", "DONNÉES DE PUBLICATION INDISPONIBLES")}</div><p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mt-2 uppercase">{t("This post might have been deleted or the connection to the platform was lost.", "Cette publication a peut-être été supprimée ou la connexion à la plateforme a été perdue.")}</p></div>;
    return <PostAnalyticsDetail post={post} />;
}

function PostListCard({ post, engagement, isSelected, onClick }: { post: AnalyticsPost, engagement: number, isSelected: boolean, onClick: () => void }) {
    const { t } = useLanguage();
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    return (
        <div onClick={onClick} className="p-4 cursor-pointer transition-all duration-150 relative border-b-2 border-black dark:border-white group bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800">
            <p className="text-sm font-bold line-clamp-2 mb-3 leading-snug uppercase text-black dark:text-white">{post.content || t("No text content", "Aucun contenu textuel")}</p>
            <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t-2 border-dashed border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 transition-colors">
                <div className="flex items-center gap-1.5"><Heart size={12} className="text-black dark:text-white" /><span className="font-bold">{post.metrics?.likes || 0}</span></div>
                <div className="flex items-center gap-1.5"><MessageCircle size={12} className="text-black dark:text-white" /><span className="font-bold">{post.metrics?.comments || 0}</span></div>
            </div>
        </div>
    );
}

const PLATFORM_COLORS: Record<string, string> = {
    FACEBOOK: '#1877F2', INSTAGRAM: '#E1306C', TIKTOK: '#000000',
    LINKEDIN: '#0A66C2', YOUTUBE: '#FF0000', TWITTER: '#1DA1F2',
    THREADS: '#000000', WHATSAPP: '#25D366',
};

function PostAnalyticsDetail({ post }: { post: any }) {
    const { t } = useLanguage();
    const metrics = post.metrics || { likes: 0, comments: 0, shares: 0, views: 0 };
    const totalInteractions = metrics.likes + metrics.comments + metrics.shares;
    const engagementRate = metrics.views > 0
        ? ((totalInteractions / metrics.views) * 100).toFixed(1) + '%'
        : (metrics.likes > 0 ? '—' : 'N/A');

    const chartData = [
        { name: t('LIKES', "J'AIME"), value: metrics.likes, fill: '#3b82f6' },
        { name: t('COMMENTS', 'COMMENTAIRES'), value: metrics.comments, fill: '#22c55e' },
        { name: t('SHARES', 'PARTAGES'), value: metrics.shares, fill: '#a855f7' },
    ];

    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    const platformAccounts: any[] = post.platformAccounts ?? [];
    const syncedComments: any[] = (post.syncedComments ?? []).slice(0, 5);
    const needsSync = totalInteractions === 0;

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-white dark:bg-zinc-900 transition-colors">

            {/* ── Header ── */}
            <div className="p-5 border-b-2 border-black dark:border-white flex items-start gap-4 bg-gray-50 dark:bg-zinc-800 transition-colors">
                <div className="w-20 h-20 bg-white dark:bg-zinc-700 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {hasMedia ? (
                        <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="Post media" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#f59e0b_10px,#f59e0b_20px)] flex items-center justify-center">
                            <span className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-white px-2 py-1 font-black text-xs uppercase text-black dark:text-white">TEXT</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-black text-white px-2 py-0.5 text-xs font-black uppercase border-2 border-black dark:border-white">PUBLISHED</span>
                        <span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase">
                            {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt)) + t(' ago', ' il y a') : ''}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-black dark:text-white line-clamp-2 uppercase break-words">{post.content || t("Untitled Post", "Publication Sans Titre")}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {platformAccounts.filter((psa: any) => psa.platformPostUrl).map((psa: any) => (
                            <a key={psa.id} href={psa.platformPostUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-1 px-2 py-0.5 border-2 border-black dark:border-white text-[10px] font-black uppercase bg-white dark:bg-zinc-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-black dark:text-white">
                                <ExternalLink size={10} />{psa.socialAccount?.platform ?? psa.platform}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sync notice ── */}
            {needsSync && (
                <div className="mx-4 mt-3 px-3 py-2 border-2 border-dashed border-black dark:border-yellow-500 bg-gray-50 dark:bg-yellow-900/20 text-xs font-bold uppercase text-black dark:text-yellow-400 flex items-center gap-2">
                    <RefreshCw size={12} />
                    {t("Hit SYNC NOW to load real metrics from the platform.", "Cliquez SYNC MAINTENANT pour charger les vraies métriques.")}
                </div>
            )}

            {/* ── Stats Grid (5 boxes) ── */}
            <div className="grid grid-cols-5 gap-0 divide-x-2 divide-black dark:divide-white border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900 transition-colors">
                <BigStatBox label={t("Likes", "J'aime")} value={metrics.likes} icon={ThumbsUp} />
                <BigStatBox label={t("Comments", "Commentaires")} value={metrics.comments} icon={MessageCircle} />
                <BigStatBox label={t("Shares", "Partages")} value={metrics.shares} icon={Share2} />
                <BigStatBox label={t("Reach", "Portée")} value={metrics.views} icon={Eye} />
                <div className="p-4 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
                    <Sparkles className="w-4 h-4 mb-1 text-black dark:text-white" />
                    <span className="text-2xl font-black text-black dark:text-white tabular-nums">{engagementRate}</span>
                    <span className="text-[9px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase mt-0.5">{t("Eng. Rate", "Taux Eng.")}</span>
                </div>
            </div>

            {/* ── Per-platform breakdown ── */}
            {platformAccounts.length > 0 && (
                <div className="border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900 transition-colors">
                    <div className="px-5 py-3 border-b border-dashed border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                        <Activity size={13} className="text-black dark:text-white" />
                        <span className="text-xs font-black uppercase text-black dark:text-white">{t("By Platform", "Par Plateforme")}</span>
                    </div>
                    <div className="divide-y divide-dashed divide-gray-100 dark:divide-zinc-800">
                        {platformAccounts.map((psa: any) => {
                            const platform = psa.socialAccount?.platform ?? psa.platform ?? '?';
                            const total = (psa.likes || 0) + (psa.comments || 0) + (psa.shares || 0);
                            const er = psa.views > 0 ? ((total / psa.views) * 100).toFixed(1) + '%' : '—';
                            return (
                                <div key={psa.id} className="px-5 py-3 flex items-center gap-4 text-xs font-mono text-black dark:text-white">
                                    <PlatformIcon platform={platform.toLowerCase()} size={14} />
                                    <span className="font-black uppercase w-24 truncate">{platform}</span>
                                    <div className="flex gap-4 flex-1 flex-wrap">
                                        <span><Heart size={10} className="inline mr-1" />{psa.likes || 0}</span>
                                        <span><MessageCircle size={10} className="inline mr-1" />{psa.comments || 0}</span>
                                        <span><Share2 size={10} className="inline mr-1" />{psa.shares || 0}</span>
                                        <span><Eye size={10} className="inline mr-1" />{psa.views || 0}</span>
                                    </div>
                                    <span className="font-black text-[10px] px-1.5 py-0.5 border border-black dark:border-white">{er}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Engagement chart ── */}
            <div className="p-5 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900">
                <h3 className="font-black text-sm uppercase tracking-tighter text-black dark:text-white mb-3">{t("Engagement_Split", "Répartition_Engagement")}</h3>
                <div className="w-full h-[160px] bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    {totalInteractions === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 uppercase">
                            <Hash className="w-6 h-6 mb-1 opacity-50"/>
                            <span className="font-bold text-xs">{t("No Interactions Yet", "Aucune Interaction Encore")}</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: 'currentColor', fontWeight: 'bold'}} width={90} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#000000', opacity: 0.05}} contentStyle={{ border: '2px solid currentColor', borderRadius: '0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }} />
                                <Bar dataKey="value" barSize={22} radius={[0, 3, 3, 0]}>
                                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="currentColor" strokeWidth={1} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Synced comments ── */}
            {syncedComments.length > 0 && (
                <div className="p-5">
                    <h3 className="font-black text-sm uppercase tracking-tighter text-black dark:text-white mb-3 flex items-center gap-2">
                        <MessageCircle size={13} />
                        {t("Recent Comments", "Commentaires Récents")}
                        <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">({syncedComments.length})</span>
                    </h3>
                    <div className="space-y-2">
                        {syncedComments.map((c: any) => (
                            <div key={c.id} className="border-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-black dark:text-white">{c.authorName || 'User'}</span>
                                    <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">{c.publishedAt ? formatDistanceToNow(new Date(c.publishedAt)) + ' ago' : ''}</span>
                                </div>
                                <p className="text-xs text-black dark:text-white font-medium">{c.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (<div className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-default group"><div className={cn("p-2 border-2 border-black dark:border-white mb-2 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all", color)}><Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={2.5} /></div><span className="text-3xl font-black text-black dark:text-white tracking-tight tabular-nums mb-1 transition-colors">{value?.toLocaleString() || 0}</span><span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase transition-colors">{label}</span></div>)
}