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
import { PlatformIcon } from '@/features/dashboard/easypost/composer/PlatformIcon';
import { Skeleton } from '@/components/ui/skeleton';

function AnalyticsGridSkeleton() {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/5">
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
          <div key={i} className="rounded-[16px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
            <Skeleton className="h-3 w-20 mx-auto mb-2 rounded" />
            <Skeleton className="h-10 w-16 mx-auto rounded" />
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-8 flex-1 pb-20 overflow-hidden">
        <div className="w-full md:w-[380px] flex flex-col rounded-[16px] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex-shrink-0">
          <div className="p-4 border-b border-black/5 dark:border-white/5">
            <Skeleton className="h-8 w-full rounded mb-3" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 border-b border-black/5 dark:border-white/5 space-y-2">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-[16px] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
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
          <div key={i} className="rounded-[10px] border border-black/5 dark:border-white/5 p-3">
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
      "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[10px] transition-all",
      active ? "bg-[#174CD2] text-white shadow-[0_4px_14px_rgba(23,76,210,0.3)]" : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 shadow-sm hover:border-[#174CD2]/40 hover:shadow-md",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const NeuCard = ({ title, icon: Icon, children, className, action }: any) => (
  <div className={cn("bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden", className)}>
    <div className="flex justify-between items-center p-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#174CD2]" strokeWidth={2.5} />}
            <h3 className="text-base font-bold text-[#040028] dark:text-white">{title}</h3>
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
    <div className="flex flex-col h-[calc(100vh-32px)] animate-in fade-in duration-500 gap-4 font-sans text-[#040028] dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div className="border-l-2 border-[#174CD2] pl-4">
           <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{t("Analytics hub", "Hub analytique")}</h2>
           <p className="text-xs font-semibold text-[#8E8E8E]">{t("Real-time performance tracking", "Suivi performance en temps réel")}</p>
        </div>
        <div className="flex gap-3">
           <NeuButton active={viewMode === 'stream'} onClick={() => setViewMode('stream')}><List size={16} /> {t("Live monitor", "Moniteur live")}</NeuButton>
           <NeuButton active={viewMode === 'strategy'} onClick={() => setViewMode('strategy')}><LayoutDashboard size={16} /> {t("Niche intel", "Intel niche")}</NeuButton>
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

                <NeuCard title={t("Account health", "Santé du compte")} icon={Activity} className="bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <span className="text-5xl font-bold text-[#040028] dark:text-white">{health.healthScore}</span>
                            <span className="text-xl font-semibold text-[#8E8E8E]">/100</span>
                        </div>
                        <span className="bg-[#174CD2] text-white px-2.5 py-1 font-semibold text-xs rounded-full mb-2">{health.consistencyStatus}</span>
                    </div>
                    <div className="w-full bg-[#F5F7FA] dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#174CD2] h-full rounded-full transition-all duration-1000" style={{ width: `${health.healthScore}%` }}></div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#8E8E8E]">{t("Avg gap:", "Écart moy:")} {health.avgPostingGap || 'N/A'}</p>
                </NeuCard>

                <NeuCard title={t("AI forecast", "Prévision IA")} icon={TrendingUp}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", (forecast.trend || '').includes('Growing') ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white")}>
                                    {forecast.trend}
                                </span>
                            </div>
                            <p className="text-xs text-[#8E8E8E] font-medium">{t("Next month projection", "Projection mois prochain")}</p>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-[#040028] dark:text-white">~{forecast.forecastNextMonth?.toLocaleString()}</span>
                            <span className="text-sm font-semibold ml-2 text-[#8E8E8E]">{t("Interactions", "Interactions")}</span>
                        </div>
                        <p className="mt-2 text-[11px] text-[#8E8E8E]">{t("Based on linear regression model", "Basé sur modèle de régression linéaire")}</p>
                    </div>
                </NeuCard>

                <NeuCard title={t("Content ROI", "ROI du contenu")} icon={LayoutDashboard}>
                    <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentMixQuery.data || []} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" tick={{fontSize: 10, fontWeight: 500, fill: 'currentColor'}} width={60} axisLine={false} tickLine={false} />
                                <Bar dataKey="avgEngagement" barSize={20} radius={[0,6,6,0]}>
                                    {contentMixQuery.data?.map((e:any, i:number) => (
                                        <Cell key={i} fill={['#174CD2', '#a855f7', '#facc15'][i % 3]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs font-medium mt-2 text-[#8E8E8E]">{t("Avg. engagement per type", "Eng. moy. par type")}</p>
                </NeuCard>
            </div>

            {/* 🟢 ACTIVITY & PLATFORM CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                <NeuCard title={t("Activity timeline", "Chronologie d'activité")} icon={Activity} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="date" hide />
                                <YAxis tick={{fontSize: 10, fontWeight: 500, fill: 'currentColor'}} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="count" stroke="#174CD2" fill="#174CD2" fillOpacity={0.1} strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs font-medium mt-2 text-center text-[#8E8E8E]">{t("Post frequency (last 30 days)", "Fréquence publications (30 derniers jours)")}</p>
                </NeuCard>

                <NeuCard title={t("Platform battle", "Bataille des plateformes")} icon={Zap} className="md:col-span-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="platform" tick={{fontSize: 10, fontWeight: 500, fill: 'currentColor'}} />
                                <YAxis tick={{fontSize: 10, fontWeight: 500, fill: 'currentColor'}} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="totalEngagement" name={t("Engagements", "Engagements")} fill="#174CD2" radius={[6,6,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs font-medium mt-2 text-center text-[#8E8E8E]">{t("Total engagement per node", "Engagement total par nœud")}</p>
                </NeuCard>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <NeuCard title={t("Golden windows", "Créneaux en or")} icon={Calendar} className="lg:col-span-1">
                    <div className="space-y-3">
                        {bestTimeQuery.data?.slice(0, 4).map((slot: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#174CD2] text-white w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs">{i+1}</span>
                                    <div className="flex flex-col leading-none gap-1">
                                        <span className="font-semibold text-sm text-[#040028] dark:text-white">{slot.day}</span>
                                        <span className="text-xs text-[#8E8E8E]">{slot.hour}:00 - {slot.hour+1}:00</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-green-600 dark:text-green-400">{slot.avgEngagement}</span>
                                    <span className="text-[10px] font-medium text-[#8E8E8E]">{t("Avg. eng.", "Eng. moy.")}</span>
                                </div>
                            </div>
                        ))}
                        {(!bestTimeQuery.data || bestTimeQuery.data.length === 0) && <div className="text-center text-xs font-medium text-[#8E8E8E] py-4">{t("Need more data", "Plus de données nécessaires")}</div>}
                    </div>
                </NeuCard>

                <NeuCard title={t("Power words", "Mots puissants")} icon={Zap} className="lg:col-span-1">
                    <div className="flex flex-wrap gap-2 content-start h-full">
                        {smartCopyQuery.data?.map((item: any, i: number) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-full bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white font-medium text-xs hover:bg-[#174CD2]/15 transition-colors cursor-default"
                                style={{ fontSize: Math.max(10, 10 + (item.impactScore / 2)) + 'px' }}
                            >
                                {item.word}
                            </span>
                        ))}
                        {(!smartCopyQuery.data || smartCopyQuery.data.length === 0) && <div className="w-full text-center text-xs font-medium text-[#8E8E8E] py-4">{t("Analyzing text...", "Analyse du texte...")}</div>}
                    </div>
                </NeuCard>

                <NeuCard title={t("Top hashtags", "Meilleurs hashtags")} icon={Hash} className="lg:col-span-1">
                    <div className="space-y-2">
                        {hashtagsQuery.data?.slice(0, 5).map((tag: any, i: number) => (
                            <div key={i} className="flex justify-between items-center border-b border-black/5 dark:border-white/5 last:border-0 pb-2">
                                <span className="font-semibold text-sm text-[#174CD2]">#{tag.tag}</span>
                                <span className="text-xs font-medium text-[#040028] dark:text-white">{tag.avgEngagement} {t("eng.", "eng.")}</span>
                            </div>
                        ))}
                        {(!hashtagsQuery.data || hashtagsQuery.data.length === 0) && <div className="text-center text-xs font-medium text-[#8E8E8E] py-4">{t("No hashtags found", "Aucun hashtag trouvé")}</div>}
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
                <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{t("Total posts", "Total publications")}</span>
                    <span className="text-4xl font-bold tabular-nums text-[#040028] dark:text-white">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{t("Published", "Publiées")}</span>
                    <span className="text-4xl font-bold tabular-nums text-[#040028] dark:text-white">{overview.totalPosts || 0}</span>
                </div>
                <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{t("Scheduled", "Planifiées")}</span>
                    <span className="text-4xl font-bold tabular-nums text-[#040028] dark:text-white">{overview.scheduled || 0}</span>
                </div>
                <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center transition-all">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{t("Drafts", "Brouillons")}</span>
                    <span className="text-4xl font-bold tabular-nums text-[#040028] dark:text-white">{overview.drafts || 0}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
                {/* Left Panel */}
            <div className="w-full md:w-[380px] flex flex-col bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] flex-shrink-0 h-full transition-colors rounded-[16px] overflow-hidden">
                <div className="p-4 border-b border-black/5 dark:border-white/5 bg-[#174CD2]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-white">{t("Live stream", "Flux en direct")}</h3>
                        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="bg-white text-[#174CD2] rounded-[8px] px-2.5 py-1.5 text-xs font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-sm">
                            {syncMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
                            {syncMutation.isPending ? t("Syncing...", "Sync en cours...") : t("Sync now", "Sync maintenant")}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" strokeWidth={2} />
                        <input type="text" placeholder={t("Search posts...", "Chercher publications...")} className="w-full pl-9 pr-4 py-2 bg-white/15 rounded-[10px] text-sm font-medium placeholder:text-white/60 focus:outline-none focus:bg-white/25 transition-all text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-[#0A0A2E] transition-colors">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-[#8E8E8E] space-y-2 mx-4 mt-4">
                            <AlertCircle size={32} strokeWidth={1} /><p className="text-sm font-semibold">{t("No active posts", "Aucune publication active")}</p>
                        </div>
                    ) : (
                        filteredPosts.map((post: AnalyticsPost) => (
                            <PostListCard key={post.id} post={post} engagement={getEngagement(post)} isSelected={selectedPostId === post.id} onClick={() => setSelectedPostId(post.id)} />
                        ))
                    )}
                </div>
            </div>
            {/* Right Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] h-full overflow-hidden transition-colors rounded-[16px]">
                {selectedPostId ? <PostAnalyticsDetailWrapper postId={selectedPostId} workspaceId={workspaceId} /> : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#040028] dark:text-white transition-all">
                        <div className="w-20 h-20 rounded-full bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center mb-4 transition-all"><TrendingUp size={36} strokeWidth={1.5} className="text-[#174CD2]" /></div>
                        <p className="font-bold text-xl">{t("Select a post", "Sélectionner une publication")}</p>
                        <p className="text-xs font-medium text-[#8E8E8E] mt-2">{t("View real-time data", "Voir données en temps réel")}</p>
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
    if (error || !post) return <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-[#040028] dark:text-white"><AlertCircle className="w-10 h-10 text-red-500 mb-2" /><div className="font-bold text-lg">{t("Post data unavailable", "Données de publication indisponibles")}</div><p className="text-sm text-[#8E8E8E] max-w-xs mt-2">{t("This post might have been deleted or the connection to the platform was lost.", "Cette publication a peut-être été supprimée ou la connexion à la plateforme a été perdue.")}</p></div>;
    return <PostAnalyticsDetail post={post} />;
}

function PostListCard({ post, engagement, isSelected, onClick }: { post: AnalyticsPost, engagement: number, isSelected: boolean, onClick: () => void }) {
    const { t } = useLanguage();
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    return (
        <div onClick={onClick} className={cn("p-4 cursor-pointer transition-all duration-150 relative border-b border-black/5 dark:border-white/5 group text-[#040028] dark:text-white", isSelected ? "bg-[#174CD2]/8" : "hover:bg-black/[0.02] dark:hover:bg-white/5")}>
            <p className="text-sm font-semibold line-clamp-2 mb-3 leading-snug text-[#040028] dark:text-white">{post.content || t("No text content", "Aucun contenu textuel")}</p>
            <div className="flex items-center gap-4 text-xs font-medium pt-2 border-t border-black/5 dark:border-white/5 text-[#8E8E8E] transition-colors">
                <div className="flex items-center gap-1.5"><Heart size={12} className="text-[#174CD2]" /><span className="font-semibold">{post.metrics?.likes || 0}</span></div>
                <div className="flex items-center gap-1.5"><MessageCircle size={12} className="text-[#174CD2]" /><span className="font-semibold">{post.metrics?.comments || 0}</span></div>
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
        { name: t('Likes', "J'aime"), value: metrics.likes, fill: '#174CD2' },
        { name: t('Comments', 'Commentaires'), value: metrics.comments, fill: '#22c55e' },
        { name: t('Shares', 'Partages'), value: metrics.shares, fill: '#a855f7' },
    ];

    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    const platformAccounts: any[] = post.platformAccounts ?? [];
    const syncedComments: any[] = (post.syncedComments ?? []).slice(0, 5);
    const needsSync = totalInteractions === 0;

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-white dark:bg-[#0A0A2E] transition-colors">

            {/* ── Header ── */}
            <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-start gap-4 transition-colors">
                <div className="w-20 h-20 rounded-[14px] bg-[#F5F7FA] dark:bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {hasMedia ? (
                        <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="Post media" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                        <div className="w-full h-full bg-yellow-50 dark:bg-yellow-900/10 flex items-center justify-center">
                            <span className="bg-white dark:bg-[#0A0A2E] rounded-full px-2.5 py-1 font-semibold text-xs text-[#040028] dark:text-white">{t('Text', 'Texte')}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full">{t('Published', 'Publié')}</span>
                        <span className="text-xs font-medium text-[#8E8E8E]">
                            {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt)) + t(' ago', ' il y a') : ''}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-[#040028] dark:text-white line-clamp-2 break-words">{post.content || t("Untitled post", "Publication sans titre")}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {platformAccounts.filter((psa: any) => psa.platformPostUrl).map((psa: any) => (
                            <a key={psa.id} href={psa.platformPostUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-[#F5F7FA] dark:bg-white/10 hover:bg-[#174CD2]/15 transition-all text-[#040028] dark:text-white">
                                <ExternalLink size={10} />{psa.socialAccount?.platform ?? psa.platform}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sync notice ── */}
            {needsSync && (
                <div className="mx-4 mt-3 px-3 py-2 rounded-[10px] bg-yellow-50 dark:bg-yellow-900/20 text-xs font-medium text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                    <RefreshCw size={12} />
                    {t("Hit sync now to load real metrics from the platform.", "Cliquez sync maintenant pour charger les vraies métriques.")}
                </div>
            )}

            {/* ── Stats Grid (5 boxes) ── */}
            <div className="grid grid-cols-5 gap-0 divide-x divide-black/5 dark:divide-white/5 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">
                <BigStatBox label={t("Likes", "J'aime")} value={metrics.likes} icon={ThumbsUp} />
                <BigStatBox label={t("Comments", "Commentaires")} value={metrics.comments} icon={MessageCircle} />
                <BigStatBox label={t("Shares", "Partages")} value={metrics.shares} icon={Share2} />
                <BigStatBox label={t("Reach", "Portée")} value={metrics.views} icon={Eye} />
                <div className="p-6 flex flex-col items-center justify-center text-center bg-blue-50/50 dark:bg-blue-900/10 transition-colors">
                    <Sparkles className="w-4 h-4 mb-1 text-[#174CD2]" />
                    <span className="text-2xl font-bold text-[#040028] dark:text-white tabular-nums">{engagementRate}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] mt-0.5">{t("Eng. rate", "Taux eng.")}</span>
                </div>
            </div>

            {/* ── Per-platform breakdown ── */}
            {platformAccounts.length > 0 && (
                <div className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">
                    <div className="px-5 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                        <Activity size={13} className="text-[#174CD2]" />
                        <span className="text-xs font-semibold text-[#040028] dark:text-white">{t("By platform", "Par plateforme")}</span>
                    </div>
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {platformAccounts.map((psa: any) => {
                            const platform = psa.socialAccount?.platform ?? psa.platform ?? '?';
                            const total = (psa.likes || 0) + (psa.comments || 0) + (psa.shares || 0);
                            const er = psa.views > 0 ? ((total / psa.views) * 100).toFixed(1) + '%' : '—';
                            return (
                                <div key={psa.id} className="px-5 py-3 flex items-center gap-4 text-xs font-medium text-[#040028] dark:text-white">
                                    <PlatformIcon platform={platform.toLowerCase()} size={14} />
                                    <span className="font-semibold w-24 truncate">{platform}</span>
                                    <div className="flex gap-4 flex-1 flex-wrap text-[#8E8E8E]">
                                        <span><Heart size={10} className="inline mr-1" />{psa.likes || 0}</span>
                                        <span><MessageCircle size={10} className="inline mr-1" />{psa.comments || 0}</span>
                                        <span><Share2 size={10} className="inline mr-1" />{psa.shares || 0}</span>
                                        <span><Eye size={10} className="inline mr-1" />{psa.views || 0}</span>
                                    </div>
                                    <span className="font-semibold text-[10px] px-2 py-1 rounded-full bg-[#F5F7FA] dark:bg-white/10">{er}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Engagement chart ── */}
            <div className="p-5 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
                <h3 className="font-bold text-sm text-[#040028] dark:text-white mb-3">{t("Engagement split", "Répartition engagement")}</h3>
                <div className="w-full h-[160px] bg-[#F5F7FA] dark:bg-white/5 rounded-[14px] p-3">
                    {totalInteractions === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#8E8E8E]">
                            <Hash className="w-6 h-6 mb-1 opacity-50"/>
                            <span className="font-medium text-xs">{t("No interactions yet", "Aucune interaction encore")}</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: 'currentColor', fontWeight: 500}} width={90} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#174CD2', opacity: 0.05}} contentStyle={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', fontWeight: 500, fontSize: '11px' }} />
                                <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]}>
                                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Synced comments ── */}
            {syncedComments.length > 0 && (
                <div className="p-5">
                    <h3 className="font-bold text-sm text-[#040028] dark:text-white mb-3 flex items-center gap-2">
                        <MessageCircle size={13} />
                        {t("Recent comments", "Commentaires récents")}
                        <span className="text-xs font-medium text-[#8E8E8E]">({syncedComments.length})</span>
                    </h3>
                    <div className="space-y-2">
                        {syncedComments.map((c: any) => (
                            <div key={c.id} className="rounded-[10px] p-3 bg-[#F5F7FA] dark:bg-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-[#040028] dark:text-white">{c.authorName || 'User'}</span>
                                    <span className="text-[10px] text-[#8E8E8E]">{c.publishedAt ? formatDistanceToNow(new Date(c.publishedAt)) + ' ago' : ''}</span>
                                </div>
                                <p className="text-xs text-[#040028] dark:text-white font-medium">{c.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BigStatBox({ label, value, icon: Icon, color }: any) {
    return (<div className="p-6 flex flex-col items-center justify-center text-center hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors cursor-default group"><div className={cn("p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/10 mb-2 transition-all", color)}><Icon className="w-5 h-5 text-[#174CD2]" strokeWidth={2.5} /></div><span className="text-2xl font-bold text-[#040028] dark:text-white tracking-tight tabular-nums mb-1 transition-colors">{value?.toLocaleString() || 0}</span><span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E] transition-colors">{label}</span></div>)
}