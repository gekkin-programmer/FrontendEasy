'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
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
  MessageCircle, TrendingUp, TrendingDown,
  Search, Send,
  FileText, Filter, Check, X as XIcon, ChevronDown
} from "lucide-react";
import { PlatformIcon } from '@/features/dashboard/easypost/composer/PlatformIcon';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DateRangeInput, type DateRange } from '@astryxdesign/core/DateRangeInput';
import { Typeahead } from '@astryxdesign/core/Typeahead';

// Mirrors StrategyView's real layout (date tabs + 5 NeuCard sections) so the
// page doesn't jump around once data arrives — only the data-shaped bits pulse.
function AnalyticsGridSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Date range tabs (static — these never depend on the query) */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['7d', '30d', 'mtd'] as const).map((key) => (
          <div key={key} className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#8E8E8E]">
            {key === '7d' ? t('7 days', '7 jours') : key === '30d' ? t('30 days', '30 jours') : t('Month to date', 'Mois en cours')}
          </div>
        ))}
        <div className="px-2 py-1 text-xs font-semibold text-[#8E8E8E]">{t('Custom', 'Personnalisé')}</div>
        <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold ml-auto text-[#8E8E8E]">
          <Filter size={14} />
          {t('Filter by channel', 'Filtrer par canal')}
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Summary */}
      <NeuCard title={t('Summary', 'Résumé')} action={<Skeleton width={90} height={12} radius={1} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="py-3 pl-3 pr-1.5 rounded-[10px] bg-white dark:bg-white/5 space-y-2">
              <Skeleton width={64} height={11} radius={1} index={i} />
              <Skeleton width={72} height={24} radius={1} index={i} />
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Top 5 Posts */}
      <NeuCard title={t('Top 5 Posts', 'Top 5 publications')}>
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton width={40} height={40} radius={2} index={i} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton width={`${70 - i * 8}%`} height={14} radius={1} index={i} />
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Skeleton width={28} height={14} radius={1} index={i} />
                <Skeleton width={28} height={14} radius={1} index={i} />
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Performance table */}
      <NeuCard title={t('Performance', 'Performance')} action={<Skeleton width={90} height={12} radius={1} />}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-2 border-b border-black/5 dark:border-white/5">
            <Skeleton width={90} height={11} radius={1} />
            <div className="flex-1" />
            <Skeleton width={40} height={11} radius={1} />
            <Skeleton width={60} height={11} radius={1} />
            <Skeleton width={60} height={11} radius={1} />
            <Skeleton width={50} height={11} radius={1} />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton width={24} height={24} radius="rounded" index={i} className="flex-shrink-0" />
              <Skeleton width={120} height={14} radius={1} index={i} />
              <div className="flex-1" />
              <Skeleton width={30} height={14} radius={1} index={i} />
              <Skeleton width={40} height={14} radius={1} index={i} />
              <Skeleton width={40} height={14} radius={1} index={i} />
              <Skeleton width={36} height={14} radius={1} index={i} />
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Followers */}
      <NeuCard
        title={t('Followers', 'Abonnés')}
        action={<Skeleton width={140} height={28} radius={2} />}
      >
        <Skeleton width={260} height={12} radius={1} className="-mt-2 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width={`${90 - i * 15}%`} height={22} radius={2} index={i} />
          ))}
        </div>
      </NeuCard>

      {/* Posts per channel */}
      <NeuCard title={t('Posts', 'Publications')} action={<Skeleton width={90} height={12} radius={1} />}>
        <Skeleton width={260} height={12} radius={1} className="-mt-2 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} width={`${80 - i * 20}%`} height={22} radius={2} index={i} />
          ))}
        </div>
      </NeuCard>
    </div>
  );
}

// Utils
import { cn } from "@/lib/utils";

const NeuCard = ({ title, icon: Icon, children, className, action }: any) => (
  <div className={cn("bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] flex flex-col overflow-hidden", className)}>
    <div className="flex justify-between items-center p-4 bg-[#F7F6F3] dark:bg-[#0A0A2E]">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#174CD2]" strokeWidth={2.5} />}
            <h3 className="text-base font-bold text-[#040028] dark:text-white">{title}</h3>
        </div>
        {action}
    </div>
    <div className="flex-1 p-4 relative bg-[#F7F6F3] dark:bg-[#0A0A2E]">
        {children}
    </div>
  </div>
);

function TopPostCard({ post, rank, metricMode, t }: { post: any; rank: number; metricMode: 'reactions' | 'comments'; t: (en: string, fr: string) => string }) {
    const metricValue = metricMode === 'reactions' ? (post.metrics?.likes || 0) : (post.metrics?.comments || 0);
    const metricLabel = metricMode === 'reactions' ? t('Reactions', 'Réactions') : t('Comments', 'Commentaires');
    const platform = (post.socialAccounts?.[0]?.socialAccount?.platform || post.platform || '').toLowerCase();
    const dateLabel = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
    const hasMedia = !!post.mediaUrls?.[0];

    return (
        <div className="rounded-[12px] border border-black/5 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-white/5">
                <span className="text-sm font-bold text-[#040028] dark:text-white">#{rank}</span>
                <span className="text-xs font-semibold text-[#040028] dark:text-white">{metricValue} {metricLabel}</span>
            </div>
            <div className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#8E8E8E] mb-1.5">
                        {platform && <PlatformIcon platform={platform} size={12} />}
                        <span>{dateLabel}</span>
                    </div>
                    <p className="text-sm font-medium text-[#040028] dark:text-white truncate">
                        {post.content || (hasMedia ? t('Media only', 'Média uniquement') : t('No text content', 'Aucun contenu textuel'))}
                    </p>
                </div>
                <div className="w-20 h-20 rounded-[8px] bg-[#F7F6F3] dark:bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {hasMedia ? <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="" /> : <FileText size={20} className="text-[#8E8E8E]" />}
                </div>
            </div>
            <div className="flex items-center gap-2 px-3 pb-3">
                <span className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold text-[#040028] dark:text-white"><MessageCircle size={12} /> {post.metrics?.comments || 0}</span>
                <span className="flex items-center justify-center w-6 h-6 rounded-[6px] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#040028] dark:text-white"><Send size={12} /></span>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function Analytics() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { t } = useLanguage();

  return (
    <div className="flex flex-col animate-in fade-in duration-500 gap-4 font-sans text-[#040028] dark:text-white transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{t("Analytics hub", "Hub analytique")}</h2>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
         <StrategyView key="strategy" workspaceId={workspaceId} />
      </AnimatePresence>
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

// ---------------------------------------------------------------------------
// TEMP PREVIEW DATA — remove once the API returns real analytics.
// Only kicks in when a query comes back empty, so real data always wins.
// ---------------------------------------------------------------------------
const MOCK_CHANNELS = [
    { id: 'mock-ig', platform: 'instagram', name: 'Eazlypost Official', picture: 'https://i.pravatar.cc/64?img=12' },
    { id: 'mock-fb', platform: 'facebook', name: 'Eazlypost', picture: 'https://i.pravatar.cc/64?img=32' },
    { id: 'mock-tt', platform: 'tiktok', name: '@eazlypost', picture: 'https://i.pravatar.cc/64?img=47' },
    { id: 'mock-li', platform: 'linkedin', name: 'Eazlypost Inc.', picture: 'https://i.pravatar.cc/64?img=5' },
];
const MOCK_ACCOUNTS = [
    { id: 'mock-ig', platform: 'instagram', name: 'Eazlypost Official', posts: 18, reactions: 4820, comments: 312, engagementRate: 6.4, followersAtStart: 12400, followersGained: 860 },
    { id: 'mock-fb', platform: 'facebook', name: 'Eazlypost', posts: 9, reactions: 1210, comments: 96, engagementRate: 2.1, followersAtStart: 8200, followersGained: 140 },
    { id: 'mock-tt', platform: 'tiktok', name: '@eazlypost', posts: 22, reactions: 15300, comments: 980, engagementRate: 11.8, followersAtStart: 24700, followersGained: 3120 },
    { id: 'mock-li', platform: 'linkedin', name: 'Eazlypost Inc.', posts: 6, reactions: 340, comments: 28, engagementRate: 1.4, followersAtStart: 3100, followersGained: 210 },
];
const MOCK_POSTS = [
    { id: 'mock-p1', content: 'Ravis de partager notre dernière mise à jour produit ! Swipez pour découvrir les nouveautés. 🚀', mediaUrls: ['https://picsum.photos/seed/mock-p1/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 842, comments: 56, shares: 34, views: 12500 }, socialAccounts: [{ socialAccountId: 'mock-ig' }] },
    { id: 'mock-p2', content: '5 astuces pour développer votre audience ce mois-ci — voir le fil.', mediaUrls: ['https://picsum.photos/seed/mock-p2/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 610, comments: 41, shares: 22, views: 9800 }, socialAccounts: [{ socialAccountId: 'mock-tt' }] },
    { id: 'mock-p3', content: 'Les coulisses de notre dernier shooting photo 📸', mediaUrls: ['https://picsum.photos/seed/mock-p3/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 455, comments: 30, shares: 12, views: 7200 }, socialAccounts: [{ socialAccountId: 'mock-fb' }] },
    { id: 'mock-p4', content: 'Merci à tous ceux qui ont rejoint notre session en direct aujourd\'hui !', mediaUrls: ['https://picsum.photos/seed/mock-p4/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 398, comments: 27, shares: 9, views: 6100 }, socialAccounts: [{ socialAccountId: 'mock-li' }] },
    { id: 'mock-p5', content: 'La nouvelle collection est en ligne — venez voir ! ✨', mediaUrls: ['https://picsum.photos/seed/mock-p5/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 301, comments: 19, shares: 14, views: 5400 }, socialAccounts: [{ socialAccountId: 'mock-ig' }] },
    { id: 'mock-p6', content: 'Petit sondage : quelle fonctionnalité devrait-on développer ensuite ?', mediaUrls: ['https://picsum.photos/seed/mock-p6/200/200'], publishedAt: new Date().toISOString(), metrics: { likes: 212, comments: 64, shares: 5, views: 3900 }, socialAccounts: [{ socialAccountId: 'mock-tt' }] },
];
const MOCK_OVERVIEW = { posts: 55, totalFollowers: 48400, followerDelta: 12, reactions: 21970, comments: 1416, engagementRate: 6.8, shares: 96, reach: 184000, views: 312000 };

function StrategyView({ workspaceId }: { workspaceId: string }) {
    const { t } = useLanguage();
    const [range, setRange] = useState<RangeKey>('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
    const [channelFilterOpen, setChannelFilterOpen] = useState(false);
    const [followersChartMode, setFollowersChartMode] = useState<'bar' | 'line' | 'growth'>('bar');
    const [topPostsMetric, setTopPostsMetric] = useState<'reactions' | 'comments'>('reactions');

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

    const overview: any = (overviewQuery.data && Object.keys(overviewQuery.data).length > 0) ? overviewQuery.data : MOCK_OVERVIEW;
    const accounts: any[] = (accountsQuery.data && accountsQuery.data.length > 0) ? accountsQuery.data : MOCK_ACCOUNTS;
    const posts: any[] = (postsQuery.data && postsQuery.data.length > 0) ? postsQuery.data : MOCK_POSTS;
    const allChannels: any[] = (channelsQuery.data && channelsQuery.data.length > 0) ? channelsQuery.data : MOCK_CHANNELS;
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

    const channelToItem = (c: any) => ({ id: c.id, label: c.name || c.username || c.displayName || c.platform, auxiliaryData: c });
    const channelSearchSource = {
        search: (query: string) => allChannels
            .filter((c: any) => (c.name || c.username || c.displayName || c.platform || '').toLowerCase().includes(query.toLowerCase()))
            .map(channelToItem),
        bootstrap: () => allChannels.map(channelToItem),
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

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
                <DateRangeInput
                    label={t('Custom date range', 'Période personnalisée')}
                    isLabelHidden
                    hasClear={false}
                    size="sm"
                    placeholder={t('Custom', 'Personnalisé')}
                    value={customFrom && customTo ? ({ start: customFrom, end: customTo } as DateRange) : null}
                    onChange={(v) => {
                        setCustomFrom(v?.start ?? '');
                        setCustomTo(v?.end ?? '');
                        setRange('custom');
                    }}
                    className={cn(
                        "!px-2 !py-1 !rounded-[8px] !text-xs !font-semibold !border-0 !shadow-none [&>button:first-child]:hidden",
                        range === 'custom' ? "!bg-[#174CD2]/10 !text-[#040028] dark:!text-white" : "!bg-transparent !text-[#8E8E8E]"
                    )}
                />

                <Popover open={channelFilterOpen} onOpenChange={setChannelFilterOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-semibold transition-colors ml-auto text-[#040028] dark:text-white caret-transparent select-none",
                                selectedChannelIds.length > 0 ? "bg-[#174CD2]/10" : "hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <Filter size={14} />
                            {selectedChannelIds.length > 0
                                ? t(`${selectedChannelIds.length} channel${selectedChannelIds.length > 1 ? 's' : ''}`, `${selectedChannelIds.length} canal${selectedChannelIds.length > 1 ? 'aux' : ''}`)
                                : t('Filter by channel', 'Filtrer par canal')}
                            <ChevronDown size={14} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 px-2 py-2 font-sans bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[10px] shadow-lg z-50 overflow-hidden" align="end">
                        {allChannels.length === 0 ? (
                            <p className="px-2 py-3 text-xs text-[#8E8E8E]">{t('No connected channels yet.', 'Aucun canal connecté pour le moment.')}</p>
                        ) : (
                            <>
                                <Typeahead
                                    label={t('Search channels', 'Rechercher des canaux')}
                                    isLabelHidden
                                    size="sm"
                                    placeholder={t('Search channels...', 'Rechercher des canaux...')}
                                    searchSource={channelSearchSource}
                                    value={null}
                                    hasClear={false}
                                    startIcon={<Search size={14} className="text-[#8E8E8E]" />}
                                    onChange={(item) => {
                                        if (!item) return;
                                        setSelectedChannelIds(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
                                    }}
                                    className="mb-1"
                                />
                                <div className="max-h-80 overflow-y-auto py-1 px-2">
                                    {allChannels.map((c: any) => {
                                        const checked = selectedChannelIds.includes(c.id);
                                        const picture = c.avatar || c.picture || c.profileImageUrl || c.avatarUrl;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedChannelIds(prev => checked ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                                                className="w-full h-14 px-3 rounded-[8px] flex items-center gap-3 text-left text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <div className="relative w-8 h-8 flex-shrink-0">
                                                    {picture ? (
                                                        <img src={picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center">
                                                            <PlatformIcon platform={(c.platform || '').toLowerCase()} size={14} />
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0A0A2E] border border-white dark:border-[#0A0A2E] flex items-center justify-center shadow-sm">
                                                        <PlatformIcon platform={(c.platform || '').toLowerCase()} size={9} />
                                                    </div>
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
                                        className="w-full h-11 px-3 rounded-[8px] flex items-center gap-2 text-left text-sm font-medium text-red-500 border-t border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                        <div key={i} className="py-3 pl-3 pr-1.5 rounded-[10px] bg-white dark:bg-white/5">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8E8E8E] mb-1">{c.label}</div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold tabular-nums text-[#040028] dark:text-white">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</span>
                                {!!c.delta && (
                                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[#8E8E8E]">
                                        <span className={c.delta > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                                            {c.delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                        </span>
                                        {c.delta > 0 ? '+' : ''}{c.delta}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </NeuCard>

            {/* Top 5 Posts */}
            <NeuCard
                title={t('Top 5 Posts', 'Top 5 publications')}
                action={
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>
                        <div className="flex bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[8px] p-1 gap-0.5">
                            {(['reactions', 'comments'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setTopPostsMetric(mode)}
                                    className={cn("px-3 py-1 text-xs font-semibold rounded-[6px] transition-colors", topPostsMetric === mode ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-[#8E8E8E]")}
                                >
                                    {mode === 'reactions' ? t('Reactions', 'Réactions') : t('Comments', 'Commentaires')}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            >
                {topPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F7F6F3] dark:bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-[#040028] dark:text-white" />
                        </div>
                        <p className="text-sm font-medium text-[#040028] dark:text-white">{t('No posts found in this date range.', 'Aucune publication trouvée sur cette période.')}</p>
                        <p className="text-xs text-[#8E8E8E] mt-1">{t('Try another date range.', 'Essayez une autre période.')}</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {topPosts.map((p: any, i: number) => (
                            <TopPostCard key={p.id} post={p} rank={i + 1} metricMode={topPostsMetric} t={t} />
                        ))}
                    </div>
                )}
            </NeuCard>

            {/* Performance table */}
            <NeuCard title={t('Performance', 'Performance')} action={<span className="text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>}>
                <div className="rounded-[12px] bg-white dark:bg-white/5 p-4 md:p-5 overflow-x-auto">
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
                    <div className="flex bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[8px] p-1 gap-0.5">
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
                <div className="rounded-[12px] bg-white dark:bg-white/5 p-4 md:p-5">
                    <p className="text-xs font-medium text-[#8E8E8E] -mt-2 mb-4">
                        {rangeLabel} · {t('Showing', 'Affichage de')} {followerRows.length} {t('of', 'sur')} {allChannels.length} {t('channels.', 'canaux.')}{' '}
                        <button onClick={() => setChannelFilterOpen(true)} className="underline hover:text-[#040028] dark:hover:text-white transition-colors">{t('Filter by channel to see a different set.', 'Filtrez par canal pour voir un autre ensemble.')}</button>
                    </p>
                    {followerRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#F7F6F3] dark:bg-white/5 flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-[#040028] dark:text-white" />
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
                        <div style={{ height: Math.max(200, followerRows.length * 84) }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={followerRows} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }} width={100} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="atStart" stackId="followers" name={t('At range start', 'Au début de la période')} fill="#040028" radius={[0, 0, 0, 0]} barSize={56} />
                                    <Bar dataKey="gained" stackId="followers" name={t('Gained in range', 'Gagnés sur la période')} fill="#174CD2" radius={[0, 6, 6, 0]} barSize={56} />
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
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} formatter={(v: any) => `${v}%`} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="growthPct" name={t('Growth', 'Croissance')} radius={[0, 6, 6, 0]} barSize={22}>
                                        {followerRows.map((r: any, i: number) => <Cell key={i} fill={r.growthPct >= 0 ? '#22c55e' : '#ef4444'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </NeuCard>

            {/* Posts per channel */}
            <NeuCard title={t('Posts', 'Publications')} action={<span className="text-xs font-medium text-[#8E8E8E]">{rangeLabel}</span>}>
                <div className="rounded-[12px] bg-white dark:bg-white/5 p-4 md:p-5">
                    <p className="text-xs font-medium text-[#8E8E8E] -mt-2 mb-4">
                        {rangeLabel} · {t('Showing', 'Affichage de')} {postRows.length} {t('of', 'sur')} {allChannels.length} {t('channels.', 'canaux.')}{' '}
                        <button onClick={() => setChannelFilterOpen(true)} className="underline hover:text-[#040028] dark:hover:text-white transition-colors">{t('Filter by channel to see a different set.', 'Filtrez par canal pour voir un autre ensemble.')}</button>
                    </p>
                    {postRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#F7F6F3] dark:bg-white/5 flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-[#040028] dark:text-white" />
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
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px' }} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="posts" name={t('Posts', 'Publications')} fill="#174CD2" radius={[0, 6, 6, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </NeuCard>
        </motion.div>
    )
}
