'use client';
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { 
  FiArrowUp, FiArrowDown, FiDownload, FiFilter, 
  FiDollarSign, FiTarget, FiUsers, FiActivity, FiSmartphone, FiMonitor 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

// --- MOCK DATA ---
const DATA_OVERVIEW = [
  { name: 'Mon', reach: 4000, engagement: 2400 },
  { name: 'Tue', reach: 3000, engagement: 1398 },
  { name: 'Wed', reach: 2000, engagement: 9800 },
  { name: 'Thu', reach: 2780, engagement: 3908 },
  { name: 'Fri', reach: 1890, engagement: 4800 },
  { name: 'Sat', reach: 2390, engagement: 3800 },
  { name: 'Sun', reach: 3490, engagement: 4300 },
];

const DATA_PLATFORMS_PIE = [
  { name: 'Twitter', value: 400, color: '#1DA1F2' },
  { name: 'LinkedIn', value: 300, color: '#0A66C2' },
  { name: 'Instagram', value: 300, color: '#E1306C' },
  { name: 'Facebook', value: 200, color: '#4267B2' },
];

// --- NEW: PLATFORM COMPARISON DATA ---
// Normalized scores (0-100) for Radar Chart
const DATA_RADAR = [
  { subject: 'Reach', A: 120, B: 110, fullMark: 150 },
  { subject: 'Engagement', A: 98, B: 130, fullMark: 150 },
  { subject: 'Clicks', A: 86, B: 130, fullMark: 150 },
  { subject: 'Shares', A: 99, B: 100, fullMark: 150 },
  { subject: 'Comments', A: 85, B: 90, fullMark: 150 },
  { subject: 'Saves', A: 65, B: 85, fullMark: 150 },
];

const DATA_STACKED_BAR = [
  { name: 'Week 1', twitter: 4000, linkedin: 2400, instagram: 2400 },
  { name: 'Week 2', twitter: 3000, linkedin: 1398, instagram: 2210 },
  { name: 'Week 3', twitter: 2000, linkedin: 9800, instagram: 2290 },
  { name: 'Week 4', twitter: 2780, linkedin: 3908, instagram: 2000 },
];

const TOP_POSTS = [
  { id: 1, content: "Why SaaS is eating the world 🚀", platform: "twitter", reach: "12.5K", engagement: "4.2%", date: "2 days ago" },
  { id: 2, content: "Behind the scenes at our office...", platform: "instagram", reach: "8.2K", engagement: "6.8%", date: "5 days ago" },
  { id: 3, content: "Q3 Financial Report Breakdown", platform: "linkedin", reach: "22K", engagement: "2.1%", date: "1 week ago" },
];

const DATA_BEST_TIME = [
    { hour: '9AM', engagement: 40 },
    { hour: '12PM', engagement: 85 },
    { hour: '3PM', engagement: 60 },
    { hour: '6PM', engagement: 95 },
    { hour: '9PM', engagement: 50 },
];

type TimeRange = '7d' | '30d' | '90d';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isExporting, setIsExporting] = useState(false);
  const isBusinessPlan = true; 

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Overview</h2>
          <p className="text-sm text-gray-500">Track your growth across all channels.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#3C48F6] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
             {isExporting ? 'Exporting...' : <><FiDownload /> Export Report</>}
           </button>
        </div>
      </div>

      {/* KPI GRID (Same as before) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Reach" value="142.5K" change="+12.5%" isPositive={true} icon={FiUsers} color="bg-blue-50 text-blue-600" />
        <KPICard title="Avg. Engagement" value="4.8%" change="+2.1%" isPositive={true} icon={FiActivity} color="bg-purple-50 text-purple-600" />
        <KPICard title="Link Clicks" value="3,240" change="-5.4%" isPositive={false} icon={FiTarget} color="bg-orange-50 text-orange-600" />
        <KPICard title="Est. Revenue" value="$12,450" change="+18.2%" isPositive={true} icon={FiDollarSign} color="bg-green-50 text-green-600" />
      </div>

      {/* --- MAIN GROWTH SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-800">Growth Trends</h3>
             <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Reach</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Engagement</span>
             </div>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA_OVERVIEW}>
                    <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                    <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
           <h3 className="font-bold text-gray-800 mb-4">Audience Split</h3>
           <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={DATA_PLATFORMS_PIE} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {DATA_PLATFORMS_PIE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">12.4K</span>
                  <span className="text-xs text-gray-500">Total Fans</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- 🚀 NEW: PLATFORM COMPARISON SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. RADAR CHART: Strengths Comparison */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-bold text-gray-800">Platform Strengths</h3>
                    <p className="text-xs text-gray-500">Comparing your top 2 channels.</p>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#1DA1F2]"></div> Twitter</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0A66C2]"></div> LinkedIn</div>
                </div>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DATA_RADAR}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Twitter" dataKey="A" stroke="#1DA1F2" strokeWidth={2} fill="#1DA1F2" fillOpacity={0.3} />
                        <Radar name="LinkedIn" dataKey="B" stroke="#0A66C2" strokeWidth={2} fill="#0A66C2" fillOpacity={0.3} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 text-center">
                <strong>Insight:</strong> LinkedIn is driving 40% more engagement, but Twitter has higher raw reach.
            </div>
        </div>

        {/* 2. STACKED BAR: Contribution by Platform */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">Total Engagement by Platform</h3>
            <p className="text-xs text-gray-500 mb-6">Weekly breakdown of interactions.</p>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA_STACKED_BAR}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: '#F9FAFB'}} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                        <Bar dataKey="twitter" stackId="a" fill="#1DA1F2" barSize={40} />
                        <Bar dataKey="linkedin" stackId="a" fill="#0A66C2" barSize={40} />
                        <Bar dataKey="instagram" stackId="a" fill="#E1306C" barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION (Best Time & Top Posts) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Posting Time */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-1">Best Time to Post</h3>
               <p className="text-xs text-gray-500 mb-6">Heatmap of activity.</p>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={DATA_BEST_TIME}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip cursor={{fill: '#F3F4F6'}} />
                        <Bar dataKey="engagement" fill="#3C48F6" radius={[4, 4, 0, 0]} barSize={30} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
          </div>

          {/* Top Posts */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Top Performing Posts</h3>
                  <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                  {TOP_POSTS.map((post, index) => (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                          <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                          <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 line-clamp-1">{post.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase 
                                    ${post.platform === 'twitter' ? 'bg-sky-100 text-sky-600' : 
                                      post.platform === 'linkedin' ? 'bg-blue-100 text-blue-700' : 
                                      'bg-pink-100 text-pink-600'}`}>
                                      {post.platform}
                                  </span>
                              </div>
                          </div>
                          <div className="text-right"><p className="text-sm font-bold text-gray-900">{post.reach}</p></div>
                          <div className="text-right pl-4 border-l border-gray-200"><p className="text-sm font-bold text-green-600">{post.engagement}</p></div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}

// KPI Card Component
const KPICard = ({ title, value, change, isPositive, icon: Icon, color }: any) => (
    <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <FiArrowUp /> : <FiArrowDown />} {change}
            </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}><Icon size={20} /></div>
    </motion.div>
);