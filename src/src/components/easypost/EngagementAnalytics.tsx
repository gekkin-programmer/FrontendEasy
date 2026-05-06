'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiDownload, FiLoader,
  FiActivity, FiUsers, FiBarChart2, FiLayers
} from 'react-icons/fi';
import {
  FaTwitter, FaInstagram, FaFacebookF, FaLinkedinIn, FaTiktok, FaYoutube
} from 'react-icons/fa';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/src/context/LanguageContext';

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

  const handleDownload = () => toast.success(t("Report queued for generation", "Rapport mis en file de génération"));

  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Skeleton className="h-7 w-52" />
        <div className="flex gap-2">
          {['7D', '30D', '90D'].map((_, i) => (
            <Skeleton key={i} className="h-8 w-12 border-2 border-black dark:border-white" />
          ))}
          <Skeleton className="h-8 w-28 border-2 border-black dark:border-white" />
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-4 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="flex items-end gap-2 h-32">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${40 + (i * 13) % 60}%` }} />
            ))}
          </div>
        </div>
        <div className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-4 space-y-4">
          <Skeleton className="h-5 w-28 mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const stats = data || { kpi: [], platforms: [], volume: [] };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-black dark:text-white transition-colors">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-black dark:border-white pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight uppercase text-black dark:text-white">{t("Engagement Hub", "Hub d'Engagement")}</h2>
          <p className="text-sm font-mono text-gray-600 dark:text-zinc-400 mt-1 uppercase">{t("LIVE DATA ACROSS CONNECTED NODES", "DONNÉES EN DIRECT SUR LES NŒUDS CONNECTÉS")}</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-1 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all">
            {['7d', '30d', '90d'].map((range) => (
                <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-4 py-1 text-xs font-black transition-all ${
                    timeRange === range ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                }`}
                >
                {range.toUpperCase()}
                </button>
            ))}
            </div>
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 dark:bg-yellow-600 border-2 border-black dark:border-white font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all text-black dark:text-white"
            >
                <FiDownload /> {t("Report", "Rapport")}
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.kpi.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-5 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-1 transition-all">
            <p className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-black text-black dark:text-white tabular-nums">{kpi.value}</span>
              <span className={`flex items-center text-[10px] font-bold border-2 border-black dark:border-white px-1.5 py-0.5 ${
                kpi.trend === 'up' ? 'bg-green-300 dark:bg-green-600 text-black dark:text-white' : 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white'
              }`}>
                {kpi.trend === 'up' ? <FiTrendingUp size={10} className="mr-1" /> : <FiLayers size={10} className="mr-1" />}
                DATA
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Volume Chart (Mock Visual) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase text-black dark:text-white">{t("Traffic Volume", "Volume de Trafic")}</h3>
            <span className="text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-1 uppercase">{t("24H CYCLE", "CYCLE 24H")}</span>
          </div>
          <div className="h-48 flex items-end gap-2 border-b-2 border-black dark:border-white pb-1 transition-colors">
            {stats.volume.map((point: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer h-full">
                 <div className="relative w-full bg-blue-600 border border-black dark:border-white hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-colors" style={{ height: `${(point.value / 150) * 100}%` }}></div>
                 <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 text-center">{point.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] transition-colors">
           <h3 className="text-lg font-black uppercase mb-6 text-black dark:text-white">{t("Channel Efficiency", "Efficacité des Canaux")}</h3>
           <div className="space-y-4">
              {stats.platforms.length === 0 && <p className="text-xs font-mono text-gray-400 dark:text-zinc-500 uppercase">{t("No connected channels", "Aucun canal connecté")}</p>}
              {stats.platforms.map((p: any) => {
                const Icon = ICONS[p.platform] || ICONS.FACEBOOK;
                return (
                    <div key={p.platform + p.username} className="flex items-center justify-between border-b-2 border-gray-100 dark:border-zinc-800 pb-2 last:border-0 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white transition-colors">
                                <Icon size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-black dark:text-white">{p.platform}</p>
                                <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 truncate max-w-[100px]">{p.username}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-black dark:text-white">{p.volume} {t("Posts", "Publications")}</p>
                            <p className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-1 border border-green-600 dark:border-green-400 uppercase transition-colors">{t("Ratio", "Ratio")}: {p.efficiency}</p>
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