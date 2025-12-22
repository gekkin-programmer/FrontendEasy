// src/components/easypost/EngagementAnalytics.tsx
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock, FiUsers, FiTrendingUp, FiTrendingDown, 
  FiCalendar, FiArrowUpRight, FiMessageCircle, FiCheckCircle,
  FiActivity, FiZap, FiBarChart2
} from 'react-icons/fi';
import {
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok
} from 'react-icons/fa';

// --- TYPES ---
type TimeRange = '7d' | '30d' | '90d';

// --- MOCK DATA ---
const KPI_DATA = [
  { label: 'Total Messages', value: '2,847', change: 23.5, trend: 'up' },
  { label: 'Avg Response Time', value: '8m 42s', change: 12.0, trend: 'down' }, // down is good for time
  { label: 'Resolution Rate', value: '94.2%', change: 1.2, trend: 'up' },
  { label: 'CSAT Score', value: '4.8/5.0', change: 0.5, trend: 'up' },
];

const HOURLY_VOLUME = [
  { hour: '00', value: 12 }, { hour: '02', value: 8 }, { hour: '04', value: 5 }, 
  { hour: '06', value: 25 }, { hour: '08', value: 85 }, { hour: '10', value: 120 }, 
  { hour: '12', value: 95 }, { hour: '14', value: 110 }, { hour: '16', value: 145 }, 
  { hour: '18', value: 130 }, { hour: '20', value: 65 }, { hour: '22', value: 30 }
];

const PLATFORM_PERFORMANCE = [
  { platform: 'Twitter', icon: FaTwitter, color: 'text-gray-900', volume: 892, time: '5m', sat: 96 },
  { platform: 'Instagram', icon: FaInstagram, color: 'text-gray-900', volume: 756, time: '12m', sat: 91 },
  { platform: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700', volume: 423, time: '24m', sat: 98 },
  { platform: 'Facebook', icon: FaFacebook, color: 'text-blue-600', volume: 534, time: '45m', sat: 88 },
];

const TEAM_PERFORMANCE = [
  { name: 'Alex M.', avatar: 'AM', solved: 456, time: '4m 12s', sat: 4.9 },
  { name: 'Jordan K.', avatar: 'JK', solved: 389, time: '5m 45s', sat: 4.8 },
  { name: 'Sam R.', avatar: 'SR', solved: 312, time: '6m 10s', sat: 4.7 },
  { name: 'Casey L.', avatar: 'CL', solved: 278, time: '3m 50s', sat: 4.9 },
];

export default function EngagementAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Engagement Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Metrics across all connected channels</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[
            { value: '7d', label: '7D' },
            { value: '30d', label: '30D' },
            { value: '90d', label: '90D' },
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as TimeRange)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                timeRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-gray-900 tabular-nums">{kpi.value}</span>
              <span className={`flex items-center text-xs font-medium ${
                (kpi.trend === 'up' && kpi.label !== 'Avg Response Time') || (kpi.trend === 'down' && kpi.label === 'Avg Response Time')
                  ? 'text-green-600 bg-green-50 px-1.5 py-0.5 rounded' 
                  : 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded'
              }`}>
                {kpi.trend === 'up' ? <FiTrendingUp size={10} className="mr-1" /> : <FiTrendingDown size={10} className="mr-1" />}
                {kpi.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Volume Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Incoming Volume (24h)</h3>
            <span className="text-xs text-gray-500">Avg: 54 msgs/hr</span>
          </div>
          
          <div className="h-48 flex items-end gap-2">
            {HOURLY_VOLUME.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer">
                 <div className="relative w-full bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors" style={{ height: `${(point.value / 150) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                        {point.value} msgs
                    </div>
                 </div>
                 <span className="text-[10px] text-gray-400 text-center">{point.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
           <h3 className="text-sm font-semibold text-gray-900 mb-6">Channel Performance</h3>
           <div className="space-y-5">
              {PLATFORM_PERFORMANCE.map((p) => (
                <div key={p.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md bg-gray-50 border border-gray-100 ${p.color}`}>
                           <p.icon size={14} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{p.platform}</p>
                            <p className="text-xs text-gray-500">{p.volume} msgs</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 tabular-nums">{p.time}</p>
                        <p className="text-xs text-green-600">{p.sat}% CSAT</p>
                    </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* TEAM TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Team Leaderboard</h3>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
                View Full Report <FiArrowUpRight />
            </button>
        </div>
        <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Resolved</th>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Avg Time</th>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">CSAT</th>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Activity</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {TEAM_PERFORMANCE.map((member) => (
                    <tr key={member.name} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                {member.avatar}
                            </div>
                            {member.name}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-600 tabular-nums">{member.solved}</td>
                        <td className="px-6 py-3 text-right text-gray-600 tabular-nums">{member.time}</td>
                        <td className="px-6 py-3 text-right font-medium text-green-600 tabular-nums">{member.sat}</td>
                        <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}