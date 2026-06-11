'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BarChart3, TrendingUp, Zap, 
  MessageSquare, ArrowUpRight, Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import SpinningLoader from '@/components/SpinningLoader';

interface Stats {
  totalUsers: number;
  activeUsers7d: number;
  totalPosts: number;
  totalAiRequests: number;
  newUsersMonth: number;
  growthRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<Stats>('/admin/stats');
        setStats(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Systems_Overview</h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">Real-time operational intelligence</p>
      </header>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard 
          icon={<Users size={24} />} 
          label="Total_Users" 
          value={stats?.totalUsers || 0} 
          subValue={`+${stats?.newUsersMonth} this month`}
        />
        <MetricCard 
          icon={<Activity size={24} />} 
          label="Active_7D" 
          value={stats?.activeUsers7d || 0} 
          subValue={`${((stats?.activeUsers7d || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% reach`}
          color="bg-[#3C48F5]"
        />
        <MetricCard 
          icon={<Zap size={24} />} 
          label="AI_Generations" 
          value={stats?.totalAiRequests || 0} 
          subValue="API Load Normal"
        />
        <MetricCard 
          icon={<TrendingUp size={24} />} 
          label="Growth_Rate" 
          value={`${stats?.growthRate.toFixed(1)}%`} 
          subValue="MoM Conversion"
          color="bg-green-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          {/* RECENT ACTIVITY PLACEHOLDER */}
          <div className="bg-zinc-900 border-4 border-white p-8 shadow-[12px_12px_0px_0px_#3C48F5]">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <Activity size={20} /> Latest_Actions
              </h2>
              <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center justify-between py-3 border-b-2 border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">User login detected</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">2m ago</span>
                    </div>
                  ))}
              </div>
          </div>

          {/* QUICK LINKS */}
          <div className="grid grid-cols-2 gap-4">
              <QuickLinkCard title="User Management" desc="Approve creators and manage roles" href="/admin/users" />
              <QuickLinkCard title="Plan Grants" desc="Assign premium access manually" href="/admin/grants" />
              <QuickLinkCard title="Feedback Hub" desc="Review user requests and bugs" href="/admin/feedback" />
              <QuickLinkCard title="System Settings" desc="Configure platform defaults" href="/admin/settings" />
          </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subValue, color = "bg-white text-black" }: any) {
  return (
    <div className={`border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] ${color}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <ArrowUpRight size={16} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-4xl font-black my-1">{value}</p>
      <p className="text-[10px] font-bold opacity-60 uppercase">{subValue}</p>
    </div>
  );
}

function QuickLinkCard({ title, desc, href }: any) {
    return (
        <a href={href} className="block group">
            <div className="bg-zinc-900 border-4 border-white p-6 h-full transition-all group-hover:bg-white group-hover:text-black group-hover:shadow-[8px_8px_0px_0px_#3C48F5]">
                <h3 className="text-lg font-black uppercase mb-2">{title}</h3>
                <p className="text-xs font-bold opacity-60">{desc}</p>
            </div>
        </a>
    )
}
