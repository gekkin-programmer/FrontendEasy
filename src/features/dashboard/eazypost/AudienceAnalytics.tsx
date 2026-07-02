'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  Users, UserCheck, Star, Zap, TrendingUp, Download, 
  RefreshCw, Info, Filter, ArrowRight, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import SpinningLoader from '@/components/common/SpinningLoader';
import { NeuButton, NeuCard } from './DashboardUI';

const COLORS = {
  FAN: '#3C48F5',
  REGULAR: '#FACC15',
  OCCASIONAL: '#A855F7',
  INACTIVE: '#94A3B8'
};

export default function AudienceAnalytics({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();

  const { data: fans = [], isLoading: fansLoading } = useQuery({
    queryKey: ['audience-fans', workspaceId],
    queryFn: () => api.get<any[]>(`/audience/top-fans?workspaceId=${workspaceId}`),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['audience-stats', workspaceId],
    queryFn: () => api.get<any>(`/audience/segmentation?workspaceId=${workspaceId}`),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post(`/audience/sync?workspaceId=${workspaceId}`, {}),
    onSuccess: () => {
      toast.success('AUDIENCE_DATA_SYNCED');
      queryClient.invalidateQueries({ queryKey: ['audience-fans'] });
      queryClient.invalidateQueries({ queryKey: ['audience-stats'] });
    }
  });

  const chartData = stats ? [
    { name: 'Fans', value: stats.FAN, color: COLORS.FAN },
    { name: 'Regulars', value: stats.REGULAR, color: COLORS.REGULAR },
    { name: 'Occasionals', value: stats.OCCASIONAL, color: COLORS.OCCASIONAL },
    { name: 'Inactive', value: stats.INACTIVE, color: COLORS.INACTIVE },
  ].filter(d => d.value > 0) : [];

  if (fansLoading || statsLoading) return <SpinningLoader />;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Audience_Insights</h2>
          <p className="text-xs font-bold text-gray-500 uppercase">Identify super-fans and loyalty trends</p>
        </div>
        <div className="flex gap-2">
          <NeuButton onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            <RefreshCw size={16} className={cn(syncMutation.isPending && "animate-spin")} /> 
            {syncMutation.isPending ? 'SYNCING...' : 'SYNC_PLATFORMS'}
          </NeuButton>
          <NeuButton className="bg-black text-white">
            <Download size={16} /> EXPORT_LIST
          </NeuButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Top 10 Fans */}
        <div className="lg:col-span-2 space-y-6">
          <NeuCard className="bg-white dark:bg-zinc-900 border-4 border-black">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-black uppercase flex items-center gap-2">
                 <Award className="text-yellow-400" /> Super_Fans_Leaderboard
               </h3>
               <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-1 uppercase">Top 10 Reach</span>
            </div>

            {fans.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-200">
                 <Users size={48} className="mx-auto text-gray-200 mb-4" />
                 <p className="font-bold text-gray-400 uppercase">No audience data detected yet.</p>
                 <button onClick={() => syncMutation.mutate()} className="mt-2 text-[#3C48F5] underline uppercase text-xs font-black">Trigger Initial Sync</button>
              </div>
            ) : (
              <div className="space-y-2">
                {fans.map((fan, idx) => (
                  <div key={fan.id} className="group flex items-center justify-between p-3 border-2 border-black dark:border-white hover:bg-yellow-50 dark:hover:bg-zinc-800 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 font-black flex items-center justify-center border-2 border-black bg-white dark:bg-black">
                          {idx + 1}
                       </div>
                       <div className="w-10 h-10 border-2 border-black overflow-hidden">
                          <img src={fan.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${fan.username}`} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="font-black text-sm uppercase leading-none">{fan.displayName || fan.username}</p>
                          <p className="text-[10px] text-gray-400 font-mono italic">@{fan.username} • {fan.platform}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="text-[8px] font-black uppercase text-gray-400">Loyalty</p>
                          <p className="font-black text-[#3C48F5]">{Math.round(fan.loyaltyScore)}%</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black uppercase text-gray-400">Segment</p>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 border border-black",
                            fan.segment === 'FAN' ? "bg-blue-100 text-blue-700" : "bg-gray-100"
                          )}>
                            {fan.segment}
                          </span>
                       </div>
                       <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeuCard>

          {/* Action Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-blue-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex gap-4">
                <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                   <Zap className="text-blue-600" />
                </div>
                <div>
                   <h4 className="font-black uppercase text-xs mb-1">Fan_Engagement</h4>
                   <p className="text-[10px] font-medium leading-tight">Your top 3 fans commented on 80% of posts. Sending them a personal DM could turn them into brand ambassadors.</p>
                </div>
             </div>
             <div className="p-4 bg-purple-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex gap-4">
                <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                   <TrendingUp className="text-purple-600" />
                </div>
                <div>
                   <h4 className="font-black uppercase text-xs mb-1">Growth_Opportunity</h4>
                   <p className="text-[10px] font-medium leading-tight">&ldquo;Regulars&rdquo; segment grew by 12% this week. Target them with a &ldquo;Tag a friend&rdquo; challenge to maximize reach.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Segmentation Chart & Stats */}
        <div className="space-y-6">
          <NeuCard className="bg-white dark:bg-zinc-900 border-4 border-black">
             <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
               <Filter /> Audience_Segments
             </h3>
             
             <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '0' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 font-black uppercase text-xs">No Data</div>
                )}
             </div>

             <div className="space-y-3 mt-4">
                {chartData.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-xs font-bold uppercase">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-black" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                     </div>
                     <span>{item.value}</span>
                  </div>
                ))}
             </div>
          </NeuCard>

          <div className="bg-yellow-100 border-2 border-black p-4 space-y-3">
             <div className="flex items-center gap-2">
                <Info size={16} className="text-yellow-600" />
                <h4 className="font-black uppercase text-xs">Insight_Brief</h4>
             </div>
             <p className="text-[10px] font-bold uppercase leading-relaxed">
                Most of your audience is in the <span className="text-purple-600">Occasional</span> segment. 
                Focus on consistent scheduling (use AI Scheduler) to move them into the <span className="text-blue-600">Regular</span> tier.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
