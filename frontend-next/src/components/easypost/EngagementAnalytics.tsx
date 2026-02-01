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
import SpinningLoader from '../SpinningLoader';

// --- CONFIG ---
const ICONS: Record<string, any> = {
  FACEBOOK: FaFacebookF, LINKEDIN: FaLinkedinIn, TWITTER: FaTwitter, 
  INSTAGRAM: FaInstagram, TIKTOK: FaTiktok, YOUTUBE: FaYoutube
};

type TimeRange = '7d' | '30d' | '90d';

export default function EngagementAnalytics() {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // 🟢 FETCH & TRANSFORM DATA
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', workspaceId, timeRange],
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
          { label: 'Total Posts', value: overview.overview.totalPosts, trend: 'neutral' },
          { label: 'Total Reach', value: overview.overview.totalReach, trend: 'up' },
          { label: 'Engagement', value: overview.overview.totalLikes, trend: 'up' }, // Using Likes as proxy for engagement
          { label: 'Engagement Rate', value: overview.overview.engagementRate, trend: 'up' },
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

  const handleDownload = () => toast.success("REPORT_GENERATION_QUEUED");

  if (isLoading) return <SpinningLoader fullScreen={false} />;

  const stats = data || { kpi: [], platforms: [], volume: [] };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-black">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-black pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight uppercase">Engagement Hub</h2>
          <p className="text-sm font-mono text-gray-600 mt-1">LIVE DATA ACROSS CONNECTED NODES</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex bg-white border-2 border-black p-1 shadow-[4px_4px_0px_0px_#000]">
            {['7d', '30d', '90d'].map((range) => (
                <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-4 py-1 text-xs font-black transition-all ${
                    timeRange === range ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
                >
                {range.toUpperCase()}
                </button>
            ))}
            </div>
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all"
            >
                <FiDownload /> Report
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.kpi.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-black p-5 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-transform">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-black text-black tabular-nums">{kpi.value}</span>
              <span className={`flex items-center text-xs font-bold border-2 border-black px-1.5 py-0.5 ${
                kpi.trend === 'up' ? 'bg-green-300 text-black' : 'bg-gray-200'
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
        <div className="lg:col-span-2 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase">Traffic Volume</h3>
            <span className="text-xs font-mono bg-black text-white px-2 py-1">24H CYCLE</span>
          </div>
          <div className="h-48 flex items-end gap-2 border-b-2 border-black pb-1">
            {stats.volume.map((point: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer h-full">
                 <div className="relative w-full bg-blue-600 border border-black hover:bg-yellow-400 transition-colors" style={{ height: `${(point.value / 150) * 100}%` }}></div>
                 <span className="text-[10px] font-bold text-gray-500 text-center">{point.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
           <h3 className="text-lg font-black uppercase mb-6">Channel Efficiency</h3>
           <div className="space-y-4">
              {stats.platforms.length === 0 && <p className="text-xs font-mono text-gray-400">NO_CONNECTED_CHANNELS</p>}
              {stats.platforms.map((p: any) => {
                const Icon = ICONS[p.platform] || ICONS.FACEBOOK;
                return (
                    <div key={p.platform + p.username} className="flex items-center justify-between border-b-2 border-gray-100 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border-2 border-black">
                                <Icon size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase">{p.platform}</p>
                                <p className="text-[10px] font-mono text-gray-500 truncate max-w-[100px]">{p.username}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black">{p.volume} Posts</p>
                            <p className="text-[10px] font-bold text-green-600 bg-green-100 px-1">Ratio: {p.efficiency}</p>
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