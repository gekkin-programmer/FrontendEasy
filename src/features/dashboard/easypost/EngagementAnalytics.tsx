'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiDownload, FiLoader,
  FiActivity, FiUsers, FiBarChart2, FiLayers
} from 'react-icons/fi';
import {
  FaTwitter, FaInstagram, FaFacebookF, FaLinkedinIn, FaTiktok, FaYoutube
} from 'react-icons/fa';
import { useParams } from 'next/navigation';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { useLanguage } from '@/context/LanguageContext';

// --- CONFIG ---
const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, LINKEDIN: FaLinkedinIn, TWITTER: FaTwitter, 
  INSTAGRAM: FaInstagram, TIKTOK: FaTiktok, YOUTUBE: FaYoutube
};

type TimeRange = '7d' | '30d' | '90d';

export default function EngagementAnalytics() {
  const params = useParams();
  const { t } = useLanguage();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // 🟢 FETCH & TRANSFORM DATA
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', workspaceId, timeRange],
    gcTime: 0,
    queryFn: async () => {
      // mapping '7d' -> 'WEEK', '30d' -> 'MONTH' for your DTO
      const periodMap: Record<string, string> = { '7d': 'WEEK', '30d': 'MONTH', '90d': 'YEAR' };
      const period = periodMap[timeRange] || 'MONTH';

      // Fetch Overview and Accounts in parallel
      const [overview, accounts] = await Promise.all([
        api.get<any>(`/analytics?workspaceId=${workspaceId}&type=OVERVIEW&period=${period}`),
        api.get<any[]>(`/analytics?workspaceId=${workspaceId}&type=ACCOUNTS&period=${period}`)
      ]);

      // TRANSFORM: Backend Data -> UI Structure
      return {
        kpi: [
          { label: t('Total Posts', 'Total Publications'), value: overview.overview.totalPosts, trend: 'neutral' },
          { label: t('Total Reach', 'Portée Totale'), value: overview.overview.totalReach, trend: 'up' },
          { label: t('Engagement', 'Engagement'), value: overview.overview.totalLikes, trend: 'up' },
          { label: t('Engagement Rate', "Taux d'Engagement"), value: overview.overview.engagementRate, trend: 'up' },
        ],
        platforms: accounts.map((acc: any) => ({
          platform: acc.platform,
          username: acc.username,
          volume: acc.postsCount,
          engagement: acc.totalEngagement,
          efficiency: acc.efficiency
        })),
        // Mocking hourly volume as backend doesn't provide it yet
        volume: [
            { hour: '00', value: 12 }, { hour: '06', value: 45 }, 
            { hour: '12', value: 120 }, { hour: '18', value: 80 }
        ] 
      };
    },
    enabled: !!workspaceId
  });

  const handleDownload = () => {};

  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Skeleton width={208} height={28} radius={2} />
        <div className="flex gap-2">
          {['7D', '30D', '90D'].map((_, i) => (
            <Skeleton key={i} width={48} height={32} radius={3} index={i} />
          ))}
          <Skeleton width={112} height={32} radius={3} />
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[16px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] p-4 space-y-3">
            <Skeleton width={80} height={12} radius={1} index={i} />
            <Skeleton width={64} height={40} radius={2} index={i} />
            <Skeleton width={56} height={20} radius="rounded" index={i} />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-[16px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] p-4">
          <Skeleton width={128} height={20} radius={2} className="mb-4" />
          <div className="flex items-end gap-2 h-32">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} width="100%" height={`${40 + (i * 13) % 60}%`} radius="none" className="flex-1 !rounded-t-[6px]" index={i} />
            ))}
          </div>
        </div>
        <div className="rounded-[16px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] p-4 space-y-4">
          <Skeleton width={112} height={20} radius={2} className="mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton width={24} height={24} radius="rounded" index={i} />
                <Skeleton width={80} height={16} radius={1} index={i} />
              </div>
              <Skeleton width={40} height={20} radius={1} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const stats = data || { kpi: [], platforms: [], volume: [] };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-[#040028] dark:text-white transition-colors">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{t("Engagement hub", "Hub d'engagement")}</h2>
          <p className="text-sm font-medium text-[#8E8E8E] mt-1">{t("Live data across connected accounts", "Données en direct sur les comptes connectés")}</p>
        </div>

        <div className="flex gap-3">
            <div className="flex bg-[#F5F7FA] dark:bg-white/5 p-1 rounded-[10px]">
            {['7d', '30d', '90d'].map((range) => (
                <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                    timeRange === range ? 'bg-white dark:bg-[#0A0A2E] text-[#174CD2]' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'
                }`}
                >
                {range.toUpperCase()}
                </button>
            ))}
            </div>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#174CD2] text-white font-semibold text-sm hover:bg-[#123a9e] transition-all"
            >
                <FiDownload size={16} /> {t("Report", "Rapport")}
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.kpi.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-5 hover:-translate-y-1 transition-all">
            <p className="text-xs font-semibold text-[#8E8E8E]">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-[#040028] dark:text-white tabular-nums">{kpi.value}</span>
              <span className={`flex items-center text-xs font-semibold rounded-full px-2 py-0.5 ${
                kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E]'
              }`}>
                {kpi.trend === 'up' ? <FiTrendingUp size={10} className="mr-1" /> : <FiLayers size={10} className="mr-1" />}
                {t('Data', 'Données')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Volume Chart (Mock Visual) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-6 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#040028] dark:text-white">{t("Traffic volume", "Volume de trafic")}</h3>
            <span className="text-xs font-semibold rounded-full bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E] px-2.5 py-1">{t("24h cycle", "Cycle 24h")}</span>
          </div>
          <div className="h-48 flex items-end gap-2 border-b border-black/5 dark:border-white/5 pb-1 transition-colors">
            {stats.volume.map((point: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer h-full">
                 <div className="relative w-full rounded-t-[6px] bg-[#174CD2] group-hover:bg-[#123a9e] transition-colors" style={{ height: `${(point.value / 150) * 100}%` }}></div>
                 <span className="text-xs font-medium text-[#8E8E8E] text-center">{point.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-6 transition-colors">
           <h3 className="text-lg font-bold mb-6 text-[#040028] dark:text-white">{t("Channel efficiency", "Efficacité des canaux")}</h3>
           <div className="space-y-4">
              {stats.platforms.length === 0 && <p className="text-xs font-medium text-[#8E8E8E]">{t("No connected channels", "Aucun canal connecté")}</p>}
              {stats.platforms.map((p: any) => {
                const Icon = ICONS[p.platform] || ICONS.FACEBOOK;
                return (
                    <div key={p.platform + p.username} className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 last:border-0 last:pb-0 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white transition-colors">
                                <Icon size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#040028] dark:text-white capitalize">{p.platform.toLowerCase()}</p>
                                <p className="text-xs font-medium text-[#8E8E8E] truncate max-w-[100px]">{p.username}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[#040028] dark:text-white">{p.volume} {t("posts", "publications")}</p>
                            <p className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5 mt-1 inline-block transition-colors">{t("Ratio", "Ratio")}: {p.efficiency}</p>
                        </div>
                    </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}