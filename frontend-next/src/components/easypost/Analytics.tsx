'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, FiCalendar, FiChevronDown, FiArrowUp, FiBarChart2, 
  FiActivity, FiGrid, FiList, FiEye, FiHeart, FiMessageCircle, 
  FiMousePointer, FiShare2, FiFilter
} from 'react-icons/fi';
import { FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { toast } from 'sonner';



// --- MOCK DATA ---
const METRICS_SUMMARY = [
  { label: 'Total Impressions', value: '842.5K',  icon: FiEye },
  { label: 'Total Engagement', value: '24.1K',  icon: FiActivity },
  { label: 'Post Clicks', value: '8,402',  icon: FiMousePointer },
  { label: 'New Followers', value: '1,205',  icon: FiHeart },
];

const ANALYTICS_POSTS = [
  { 
    id: 1, 
    content: "5 ways to improve your productivity today ⚡️ #Growth", 
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
    platform: 'twitter', 
    date: 'Oct 24',
    stats: { impressions: 4500, clicks: 320, likes: 120, engagementRate: 4.5 } 
  },
  { 
    id: 2, 
    content: "Our team retreat was amazing! Here is a sneak peek.", 
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
    platform: 'linkedin', 
    date: 'Oct 22',
    stats: { impressions: 8200, clicks: 850, likes: 400, engagementRate: 6.2 } 
  },
  { 
    id: 3, 
    content: "Behind the scenes: How we built the new dashboard.", 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
    platform: 'instagram', 
    date: 'Oct 20',
    stats: { impressions: 12000, clicks: 45, likes: 2100, engagementRate: 8.1 } 
  },
  { 
    id: 4, 
    content: "The future of SaaS is here. Are you ready?", 
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
    platform: 'twitter', 
    date: 'Oct 18',
    stats: { impressions: 2800, clicks: 120, likes: 85, engagementRate: 2.4 } 
  },
];

export default function Analytics() {
  const [view, setView] = useState<'overview' | 'posts'>('posts'); // Default to Posts for that Buffer feel
  const [sortMetric, setSortMetric] = useState<'impressions' | 'clicks' | 'likes' | 'engagementRate'>('impressions');
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  // Sorting Logic
  const sortedPosts = [...ANALYTICS_POSTS].sort((a, b) => b.stats[sortMetric] - a.stats[sortMetric]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <button 
             onClick={() => setView('posts')} 
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${view === 'posts' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Posts
           </button>
           <button 
             onClick={() => setView('overview')} 
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${view === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Overview
           </button>
        </div>

        <div className="flex gap-3">
           <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                <FiCalendar className="text-gray-400" /> {timeRange} <FiChevronDown className="text-gray-400" />
              </button>
              {/* Mock Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50">
                 {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map(r => (
                    <button key={r} onClick={() => setTimeRange(r)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">{r}</button>
                 ))}
              </div>
           </div>
           
           <button onClick={() => toast.success("Report generating...")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
             <FiDownload /> Export
           </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS (Always visible summary) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS_SUMMARY.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
             <div className="flex justify-between items-start mb-4">
                <m.icon className="text-gray-400" size={20} />
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full"></span>
             </div>
             <h3 className="text-3xl font-black text-gray-800 mb-1">{m.value}</h3>
             <p className="text-sm font-medium text-gray-500">{m.label}</p>
          </div>
        ))}
      </div>

      {/* 3. POSTS VIEW (The "Buffer Special") */}
      {view === 'posts' && (
        <div className="space-y-6">
           
           {/* Sorting Toolbar */}
           <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
                 <div className="flex gap-2">
                    {[
                        { id: 'impressions', label: 'Most Views' },
                        { id: 'clicks', label: 'Most Clicks' },
                        { id: 'engagementRate', label: 'Highest Engagement' }
                    ].map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => setSortMetric(opt.id as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${sortMetric === opt.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-blue-600"><FiGrid /></button>
                 <button className="p-2 text-gray-400 hover:text-blue-600"><FiList /></button>
              </div>
           </div>

           {/* The Post Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {sortedPosts.map((post) => (
                   <motion.div 
                     layout
                     key={post.id} 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                   >
                      <div className="flex h-full">
                         {/* Left: Image */}
                         <div className="w-40 h-auto relative">
                            <img src={post.image} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                               {post.platform === 'twitter' && <FaTwitter className="text-sky-500" />}
                               {post.platform === 'linkedin' && <FaLinkedinIn className="text-blue-700" />}
                               {post.platform === 'instagram' && <FaInstagram className="text-pink-600" />}
                            </div>
                         </div>

                         {/* Right: Data */}
                         <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase">{post.date}</span>
                                  {post.id === 1 && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Top Post</span>}
                               </div>
                               <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-4">{post.content}</p>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                               <MetricBox label="Impressions" value={post.stats.impressions} icon={FiEye} highlight={sortMetric === 'impressions'} />
                               <MetricBox label="Clicks" value={post.stats.clicks} icon={FiMousePointer} highlight={sortMetric === 'clicks'} />
                               <MetricBox label="Eng. Rate" value={post.stats.engagementRate + '%'} icon={FiActivity} highlight={sortMetric === 'engagementRate'} />
                            </div>
                         </div>
                      </div>
                   </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      )}

      {/* 4. OVERVIEW VIEW (Growth Charts) */}
      {view === 'overview' && (
         <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FiBarChart2 /> Audience Growth</h3>
               <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Twitter</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Instagram</span>
               </div>
            </div>
            
            {/* Visual Chart Area */}
            <div className="h-64 w-full flex items-end gap-4 px-4">
               {[30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group cursor-pointer">
                     <div className="w-full bg-blue-100 rounded-t-sm relative transition-all group-hover:bg-blue-200" style={{ height: `${h}%` }}></div>
                     <div className="w-full bg-purple-100 rounded-t-sm relative transition-all group-hover:bg-purple-200" style={{ height: `${h * 0.6}%` }}></div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
               <span>Week 1</span>
               <span>Week 2</span>
               <span>Week 3</span>
               <span>Week 4</span>
            </div>
         </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---
const MetricBox = ({ label, value, icon: Icon, highlight }: any) => (
   <div>
      <div className="flex items-center gap-1 mb-1">
         <Icon size={12} className={highlight ? 'text-blue-600' : 'text-gray-400'} />
         <span className={`text-[10px] font-bold uppercase ${highlight ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
      </div>
      <p className={`text-sm font-bold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
         {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
   </div>
);