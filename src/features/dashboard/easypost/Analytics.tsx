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
  BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area,
  LineChart, Line
} from 'recharts';

// Icons
import {
  ThumbsUp, MessageCircle, TrendingUp, TrendingDown,
  Eye, Search, AlertCircle, LayoutDashboard, List,
  Sparkles, Hash, Tag, Loader2, Heart, RefreshCw,
  Activity, Share2, ExternalLink, type Icon as LucideIcon,
  FileText, Filter, Check, X as XIcon
} from "lucide-react";
import { PlatformIcon } from '@/features/dashboard/easypost/composer/PlatformIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

function AnalyticsGridSkeleton() {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-20 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0A0A2E] rounded-[14px] border border-black/5 dark:border-white/5 p-4 space-y-3">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4">
        <Skeleton className="h-5 w-28 rounded mb-4" />
        <Skeleton className="h-40 w-full rounded" />
      </div>
      <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 p-4 space-y-3">
        <Skeleton className="h-5 w-28 rounded mb-2" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
      </div>
    </div>
  );
}

function LiveStreamSkeleton() {
  return (
    <div className="flex flex-col h-full gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-shrink-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[16px] border border-black/5 dark:border-white/5 p-4">
            <Skeleton className="h-3 w-20 mx-auto mb-2 rounded" />
            <Skeleton className="h-10 w-16 mx-auto rounded" />
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-8 flex-1 pb-20 overflow-hidden">
        <div className="w-full md:w-[380px] flex flex-col rounded-[16px] border border-black/5 dark:border-white/5 flex-shrink-0">
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
        <div className="flex-1 rounded-[16px] border border-black/5 dark:border-white/5 flex items-center justify-center">
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
      active ? "bg-[#174CD2] text-white" : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const NeuCard = ({ title, icon: Icon, children, className, action }: any) => (
  <div className={cn("bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] flex flex-col overflow-hidden", className)}>
    <div className="flex justify-between items-center p-4">
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
  const [viewMode, setViewMode] = useState<'stream' | 'strategy'>('strategy');
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] animate-in fade-in duration-500 gap-4 font-sans text-[#040028] dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{t("Analytics hub", "Hub analytique")}</h2>
        </div>
        <div className="flex gap-3">
           <NeuButton active={viewMode === 'strategy'} onClick={() => setViewMode('strategy')} className={cn(viewMode === 'strategy' ? 'bg-[#040028] dark:bg-white dark:text-[#040028]' : 'hover:border-[#D9D9D9] dark:hover:border-white/20')}><LayoutDashboard size={16} /> {t("Insights", "Aperçus")}</NeuButton>
           <NeuButton active={viewMode === 'stream'} onClick={() => setViewMode('stream')} className={cn(viewMode === 'stream' ? 'bg-[#040028] dark:bg-white dark:text-[#040028]' : 'hover:border-[#D9D9D9] dark:hover:border-white/20')}><List size={16} /> {t("Posts", "Publications")}</NeuButton>
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
// VIEW 1: STRATEGY (Summary + Top Posts + Performance)
// ============================================================================
type RangeKey = '7d' | '30d' | 'mtd' | 'custom';

function getRangeDates(key: RangeKey, customFrom?: string, customTo?: string) {
    const today = new Date();
    let fromDate: Date;
    if (key === '7d') fromDate = new Date(today.getTime() - 6 * 86400000);
    else if (key === '30d') fromDate = new Date(today.getTime() - 29 * 86400000);
    else if (key === 'mtd') fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    else fromDate = customFrom ? new Date(customFrom) : new Date(today.getTime() - 29 * 86400000);
    const toDate = key === 'custom' && customTo ? new Date(customTo) : today;
    return { from: fromDate.toISOString().slice(0, 10), to: toDate.toISOString().slice(0, 10) };
}

function formatRangeLabel(from: string, to: string) {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${new Date(from).toLocaleDateString('en-US', opts)} - ${new Date(to).toLocaleDateString('en-US', opts)}`;
}

const CHANNEL_COLORS = ['#7c3aed', '#174CD2', '#f59e0b', '#22c55e', '#ef4444', '#0891b2'];

function StrategyView({ workspaceId }: { workspaceId: string }) {
    const { t } = useLanguage();
    const [range, setRange] = useState<RangeKey>('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [customOpen, setCustomOpen] = useState(false);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
    const [channelFilterOpen, setChannelFilterOpen] = useState(false);
    const [followersChartMode, setFollowersChartMode] = useState<'bar' | 'line' | 'growth'>('bar');

    const { from, to } = getRangeDates(range, customFrom, customTo);

    // Connected accounts, for the channel filter + Followers/Posts breakdowns
    const channelsQuery = useQuery({
        queryKey: ['analytics-channels', workspaceId],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/social-accounts?workspaceId=${workspaceId}`);
            const payload = res.data || res;
            return Array.isArray(payload) ? payload : [];
        }
    });

    // Summary counts + follower totals for the selected range
    const overviewQuery = useQuery({
        queryKey: ['analytics-overview', workspaceId, from, to],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/analytics?workspaceId=${workspaceId}&type=OVERVIEW&from=${from}&to=${to}`);
            return res.overview || res.data?.overview || res.data || res || {};
        }
    });

    // Per-account performance rows for the selected range
    const accountsQuery = useQuery({
        queryKey: ['analytics-accounts', workspaceId, from, to],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/analytics?workspaceId=${workspaceId}&type=ACCOUNTS&from=${from}&to=${to}`);
            const payload = res.data || res;
            return Array.isArray(payload) ? payload : (payload.accounts || []);
        }
    });

    // Published posts in range, for the Top 5 Posts section
    const postsQuery = useQuery({
        queryKey: ['analytics-top-posts', workspaceId, from, to],
        gcTime: 0,
        queryFn: async () => {
            const res: any = await api.get(`/posts?workspaceId=${workspaceId}&limit=100&status=PUBLISHED`);
            const payload = res.data || res;
            const rawPosts = payload.items || payload || [];
            return rawPosts
                .map((p: any) => ({
                    ...p,
                    mediaUrls: p.media?.map((pm: any) => pm.media?.url).filter(Boolean) ?? [],
                    metrics: (p.socialAccounts ?? []).reduce((acc: any, psa: any) => ({
                        likes: acc.likes + (psa.likes || 0),
                        comments: acc.comments + (psa.comments || 0),
                        shares: acc.shares + (psa.shares || 0),
                        views: acc.views + (psa.views || 0),
                    }), { likes: 0, comments: 0, shares: 0, views: 0 }),
                }))
                .filter((p: any) => p.publishedAt && p.publishedAt.slice(0, 10) >= from && p.publishedAt.slice(0, 10) <= to);
        }
    });

    const isLoading = overviewQuery.isLoading || accountsQuery.isLoading || postsQuery.isLoading || channelsQuery.isLoading;
    if (isLoading) return <AnalyticsGridSkeleton />;

    const overview: any = overviewQuery.data || {};
    const accounts: any[] = accountsQuery.data || [];
    const posts: any[] = postsQuery.data || [];
    const allChannels: any[] = channelsQuery.data || [];
    const rangeLabel = formatRangeLabel(from, to);

    const effectiveChannels = selectedChannelIds.length > 0
        ? allChannels.filter((c: any) => selectedChannelIds.includes(c.id))
        : allChannels;

    // Followers: pair each channel with whatever range-scoped account stats we have (from the ACCOUNTS query)
    const followerRows = effectiveChannels.map((c: any) => {
        const stats = accounts.find((a: any) => a.id === c.id || a.socialAccountId === c.id);
        const atStart = stats?.followersAtStart ?? 0;
        const gained = stats?.followersGained ?? 0;
        return {
            id: c.id,
            name: c.name || c.username || c.displayName || c.platform,
            platform: c.platform,
            atStart,
            gained,
            total: atStart + gained,
            growthPct: atStart > 0 ? Math.round((gained / atStart) * 1000) / 10 : (gained > 0 ? 100 : 0),
        };
    }).filter((r: any) => r.total > 0);

    // Posts: tally published posts in range per channel from the posts already fetched
    const postCountByChannel: Record<string, number> = {};
    posts.forEach((p: any) => {
        (p.socialAccounts ?? []).forEach((psa: any) => {
            const accId = psa.socialAccount?.id ?? psa.socialAccountId;
            if (accId) postCountByChannel[accId] = (postCountByChannel[accId] || 0) + 1;
        });
    });
    const postRows = effectiveChannels
        .map((c: any) => ({
            id: c.id,
            name: c.name || c.username || c.displayName || c.platform,
            platform: c.platform,
            posts: postCountByChannel[c.id] || 0,
        }))
        .filter((r: any) => r.posts > 0);

    const topPosts = [...posts]
        .sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0))
        .slice(0, 5);

    const summaryCards: { label: string; value: number | string; delta?: number }[] = [
        { label: t('Posts', 'Publications'), value: overview.posts ?? posts.length },
        { label: t('Total Followers', 'Abonnés totaux'), value: overview.totalFollowers ?? 0, delta: overview.followerDelta },
        { label: t('Reactions', 'Réactions'), value: overview.reactions ?? 0 },
        { label: t('Comments', 'Commentaires'), value: overview.comments ?? 0 },
        { label: t('Eng. Rate', "Taux d'eng."), value: `${overview.engagementRate ?? 0}%` },
        { label: t('Shares', 'Partages'), value: overview.shares ?? 0 },
        { label: t('Reach', 'Portée'), value: overview.reach ?? 0 },
        { label: t('Views', 'Vues'), value: overview.views ?? 0 },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto pr-2 pb-20 scrollbar-hide space-y-6">

            {/* Date range tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {(['7d', '30d', 'mtd'] as RangeKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setRange(key)}
                        className={cn(
                            "px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors",
                            range === key ? "bg-[#174CD2]/10 text-[#040028] dark:text-white" : "text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10"
                        )}
                    >
                        {key === '7d' ? t('7 days', '7 jours') : key === '30d' ? t('30 days', '30 jours') : t('Month to date', 'Mois en cours')}
                    </button>
                ))}
                <Popover open={customOpen} onOpenChange={setCustomOpen}>
                    <PopoverTrigger asChild>
                        <button
                            onClick={() => setRange('custom')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors",
                                range === 'custom' ? "bg-[#174CD2]/10 text-[#040028] dark:text-white" : "text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            {t('Custom', 'Personnalisé')}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[10px] shadow-lg z-50" align="start">
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-semibold uppercase text-[#8E8E8E]">{t('From', 'Du')}</label>
                                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-xs rounded-[8px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white focus:outline-none focus:border-[#174CD2]" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase text-[#8E8E8E]">{t('To', 'Au')}</label>
                                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-xs rounded-[8px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white focus:outline-none focus:border-[#174CD2]" />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover open={channelFilterOpen} onOpenChange={setChannelFilterOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors ml-auto",
                                selectedChannelIds.length > 0 ? "bg-[#174CD2]/10 text-[#040028] dark:text-white" : "text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <Filter size={12} />
                            {selectedChannelIds.length > 0
                                ? t(`${selectedChannelIds.length} channel${selectedChannelIds.length > 1 ? 's' : ''}`, `${selectedChannelIds.length} canal${selectedChannelIds.length > 1 ? 'aux' : ''}`)
                                : t('Filter by channel', 'Filtrer par canal')}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[10px] shadow-lg z-50 overflow-hidden" align="end">
                        {allChannels.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-[#8E8E8E]">{t('No connected channels yet.', 'Aucun canal connecté pour le moment.')}</p>
                        ) : (
                            <>
                                <div className="max-h-64 overflow-y-auto py-1">
                                    {allChannels.map((c: any) => {
                                        const checked = selectedChannelIds.includes(c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedChannelIds(prev => checked ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                                                className="w-full h-9 px-4 flex items-center gap-2 text-left text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <PlatformIcon platform={(c.platform || '').toLowerCase()} size={11} />
                                                </div>
                                                <span className="flex-1 truncate">{c.name || c.username || c.displayName || c.platform}</span>
                                                {checked && <Check size={14} className="text-[#174CD2] flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedChannelIds.length > 0 && (
                                    <button
                                        onClick={() => setSelectedChannelIds([])}
                                        className="w-full h-9 px-4 flex items-center gap-2 text-left text-sm font-medium text-red-500 border-t border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <XIcon size={14} /> {t('Clear filter', 'Effacer le filtre')}
                                    </button>
                                )}
                            </>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Summary */}
            <NeuCard title={t('Summary', 'Résumé')} action={<span className="text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summaryCards.map((c, i) => (
                        <div key={i} className="p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{c.label}</div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold tabular-nums text-[#040028] dark:text-white">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</span>
                                {!!c.delta && (
                                    <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold", c.delta > 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                                        {c.delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {c.delta > 0 ? '+' : ''}{c.delta}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </NeuCard>

            {/* Top 5 Posts */}
            <NeuCard title={t('Top 5 Posts', 'Top 5 publications')}>
                {topPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-[#8E8E8E]" />
                        </div>
                        <p className="text-sm font-medium text-[#040028] dark:text-white">{t('No posts found in this date range.', 'Aucune publication trouvée sur cette période.')}</p>
                        <p className="text-xs text-[#8E8E8E] mt-1">{t('Try another date range.', 'Essayez une autre période.')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {topPosts.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 py-3">
                                <div className="w-10 h-10 rounded-[8px] bg-[#F5F7FA] dark:bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {p.mediaUrls?.[0] ? <img src={p.mediaUrls[0]} className="w-full h-full object-cover" alt="" /> : <FileText size={16} className="text-[#8E8E8E]" />}
                                </div>
                                <p className="flex-1 min-w-0 text-sm font-medium text-[#040028] dark:text-white truncate">{p.content || t('No text content', 'Aucun contenu textuel')}</p>
                                <div className="flex items-center gap-4 text-xs font-semibold text-[#8E8E8E] flex-shrink-0">
                                    <span className="flex items-center gap-1"><Heart size={12} /> {p.metrics?.likes || 0}</span>
                                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {p.metrics?.comments || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </NeuCard>

            {/* Performance table */}
            <NeuCard title={t('Performance', 'Performance')} action={<span className="text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#8E8E8E] border-b border-black/5 dark:border-white/5">
                                <th className="pb-2 font-semibold">{t('Channel', 'Canal')}</th>
                                <th className="pb-2 font-semibold text-right">{t('Posts', 'Publications')}</th>
                                <th className="pb-2 font-semibold text-right">{t('Reactions', 'Réactions')}</th>
                                <th className="pb-2 font-semibold text-right">{t('Comments', 'Commentaires')}</th>
                                <th className="pb-2 font-semibold text-right">{t('Eng. Rate', "Taux d'eng.")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-xs font-medium text-[#8E8E8E]">{t('No connected accounts with data in this range.', 'Aucun compte connecté avec des données sur cette période.')}</td></tr>
                            ) : accounts.map((a: any, i: number) => (
                                <tr key={a.id || i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <PlatformIcon platform={(a.platform || '').toLowerCase()} size={12} />
                                            </div>
                                            <span className="font-medium text-[#040028] dark:text-white truncate max-w-[220px]">{a.name || a.accountName || a.username || a.platform}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right tabular-nums text-[#040028] dark:text-white">{a.posts ?? 0}</td>
                                    <td className="py-3 text-right tabular-nums text-[#040028] dark:text-white">{a.reactions ?? a.totalEngagement ?? 0}</td>
                                    <td className="py-3 text-right tabular-nums text-[#040028] dark:text-white">{a.comments ?? 0}</td>
                                    <td className="py-3 text-right tabular-nums text-[#040028] dark:text-white">{a.engagementRate ?? 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NeuCard>

            {/* Followers */}
            <NeuCard
                title={t('Followers', 'Abonnés')}
                action={
                    <div className="flex bg-[#F5F7FA] dark:bg-white/5 rounded-[8px] p-0.5">
                        {(['bar', 'line', 'growth'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setFollowersChartMode(mode)}
                                className={cn("px-3 py-1 text-xs font-semibold rounded-[6px] transition-colors", followersChartMode === mode ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-[#8E8E8E]")}
                            >
                                {mode === 'bar' ? t('Bar', 'Barres') : mode === 'line' ? t('Line', 'Ligne') : t('Growth', 'Croissance')}
                            </button>
                        ))}
                    </div>
                }
            >
                <p className="text-xs font-medium text-[#8E8E8E] -mt-2 mb-4">
                    {rangeLabel} · {t('Showing', 'Affichage de')} {followerRows.length} {t('of', 'sur')} {allChannels.length} {t('channels.', 'canaux.')}{' '}
                    <button onClick={() => setChannelFilterOpen(true)} className="underline hover:text-[#174CD2] transition-colors">{t('Filter by channel to see a different set.', 'Filtrez par canal pour voir un autre ensemble.')}</button>
                </p>
                {followerRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-[#8E8E8E]" />
                        </div>
                        <p className="text-sm font-medium text-[#040028] dark:text-white">{t('No data found for these channels in this date range.', 'Aucune donnée trouvée pour ces canaux sur cette période.')}</p>
                        <p className="text-xs text-[#8E8E8E] mt-1">
                            {t('Try another date range', 'Essayez une autre période')}
                            {selectedChannelIds.length > 0 && (
                                <> {t('or', 'ou')} <button onClick={() => setSelectedChannelIds([])} className="underline hover:text-[#174CD2]">{t('clear the channel filter', 'effacez le filtre de canal')}</button>.</>
                            )}
                        </p>
                    </div>
                ) : followersChartMode === 'bar' ? (
                    <div style={{ height: Math.max(120, followerRows.length * 48) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={followerRows} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }} width={100} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                <Bar dataKey="atStart" stackId="followers" name={t('At range start', 'Au début de la période')} fill="#040028" radius={[0, 0, 0, 0]} barSize={22} />
                                <Bar dataKey="gained" stackId="followers" name={t('Gained in range', 'Gagnés sur la période')} fill="#174CD2" radius={[0, 6, 6, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : followersChartMode === 'line' ? (
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={[
                                    { point: t('Start', 'Début'), ...Object.fromEntries(followerRows.map((r: any) => [r.id, r.atStart])) },
                                    { point: t('End', 'Fin'), ...Object.fromEntries(followerRows.map((r: any) => [r.id, r.total])) },
                                ]}
                                margin={{ left: 0, right: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="point" tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                {followerRows.map((r: any, i: number) => (
                                    <Line key={r.id} type="monotone" dataKey={r.id} name={r.name} stroke={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: Math.max(120, followerRows.length * 48) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={followerRows} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} unit="%" />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }} width={100} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} formatter={(v: any) => `${v}%`} />
                                <Bar dataKey="growthPct" name={t('Growth', 'Croissance')} radius={[0, 6, 6, 0]} barSize={22}>
                                    {followerRows.map((r: any, i: number) => <Cell key={i} fill={r.growthPct >= 0 ? '#22c55e' : '#ef4444'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </NeuCard>

            {/* Posts per channel */}
            <NeuCard title={t('Posts', 'Publications')} action={<span className="text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>}>
                <p className="text-xs font-medium text-[#8E8E8E] -mt-2 mb-4">
                    {rangeLabel} · {t('Showing', 'Affichage de')} {postRows.length} {t('of', 'sur')} {allChannels.length} {t('channels.', 'canaux.')}{' '}
                    <button onClick={() => setChannelFilterOpen(true)} className="underline hover:text-[#174CD2] transition-colors">{t('Filter by channel to see a different set.', 'Filtrez par canal pour voir un autre ensemble.')}</button>
                </p>
                {postRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-[#8E8E8E]" />
                        </div>
                        <p className="text-sm font-medium text-[#040028] dark:text-white">{t('No data found for these channels in this date range.', 'Aucune donnée trouvée pour ces canaux sur cette période.')}</p>
                        <p className="text-xs text-[#8E8E8E] mt-1">
                            {t('Try another date range', 'Essayez une autre période')}
                            {selectedChannelIds.length > 0 && (
                                <> {t('or', 'ou')} <button onClick={() => setSelectedChannelIds([])} className="underline hover:text-[#174CD2]">{t('clear the channel filter', 'effacez le filtre de canal')}</button>.</>
                            )}
                        </p>
                    </div>
                ) : (
                    <div style={{ height: Math.max(120, postRows.length * 48) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={postRows} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }} width={100} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                <Bar dataKey="posts" name={t('Posts', 'Publications')} fill="#174CD2" radius={[0, 6, 6, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </NeuCard>
        </motion.div>
    )
}

// ... Rest of the file (LiveStreamView, PostAnalyticsDetailWrapper, etc.) ...

function LiveStreamView({ workspaceId }: { workspaceId: string }) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    
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
            
            <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
                {/* Left Panel */}
            <div className="w-full md:w-[380px] flex flex-col bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 flex-shrink-0 h-full transition-colors rounded-[16px] overflow-hidden">
                <div className="p-4 border-b border-black/5 dark:border-white/5 bg-[#040028]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-white">{t("Live stream", "Flux en direct")}</h3>
                        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="bg-white text-[#040028] rounded-[8px] px-2.5 py-1.5 text-xs font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-1.5 transition-all">
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
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 h-full overflow-hidden transition-colors rounded-[16px]">
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