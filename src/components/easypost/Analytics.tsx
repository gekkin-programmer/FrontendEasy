// src/components/easypost/Analytics.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp, FiTrendingDown, FiCalendar, FiClock, FiRefreshCw,
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiEye, FiUsers,
  FiChevronDown, FiCheck, FiZap, FiArrowRight, FiX, FiSearch,
  FiLayers, FiTarget, FiBarChart2
} from 'react-icons/fi';
import { FaTwitter, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';

// --- TYPES ---
interface PostData {
  id: number;
  content: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
  publishedAt: string;
  thumbnail?: string;
  metrics: {
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
  };
  audience: {
    topAge: string;
    topLocation: string;
    peakHour: string;
  };
}

interface Insight {
  id: number;
  type: 'improvement' | 'success' | 'warning' | 'tip';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

// --- MOCK DATA (Same as before) ---
const MOCK_POSTS: PostData[] = [
  {
    id: 1,
    content: "Just launched our new feature! 🚀 Check out how AI can transform your content strategy...",
    platform: 'twitter',
    publishedAt: '2024-12-18T14:30:00',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    metrics: { impressions: 24500, reach: 18200, engagement: 1840, engagementRate: 7.5, likes: 892, comments: 156, shares: 234, saves: 558, clicks: 445 },
    audience: { topAge: '25-34', topLocation: 'United States', peakHour: '2:00 PM' }
  },
  {
    id: 2,
    content: "5 tips for growing your audience in 2025. Thread 🧵",
    platform: 'twitter',
    publishedAt: '2024-12-15T09:00:00',
    thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=200&h=200&fit=crop',
    metrics: { impressions: 45200, reach: 32100, engagement: 3200, engagementRate: 9.9, likes: 1567, comments: 423, shares: 678, saves: 532, clicks: 890 },
    audience: { topAge: '18-24', topLocation: 'United Kingdom', peakHour: '9:00 AM' }
  },
  {
    id: 3,
    content: "Behind the scenes of our product photoshoot 📸",
    platform: 'instagram',
    publishedAt: '2024-12-12T18:00:00',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200&h=200&fit=crop',
    metrics: { impressions: 18900, reach: 14500, engagement: 2100, engagementRate: 14.5, likes: 1456, comments: 234, shares: 89, saves: 321, clicks: 156 },
    audience: { topAge: '25-34', topLocation: 'Canada', peakHour: '6:00 PM' }
  },
  {
    id: 4,
    content: "How we increased our conversion rate by 340% using data-driven content",
    platform: 'linkedin',
    publishedAt: '2024-12-10T11:00:00',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    metrics: { impressions: 12300, reach: 8900, engagement: 890, engagementRate: 10.0, likes: 456, comments: 178, shares: 145, saves: 111, clicks: 234 },
    audience: { topAge: '35-44', topLocation: 'Germany', peakHour: '11:00 AM' }
  },
  {
    id: 5,
    content: "POV: When your content finally goes viral 😂",
    platform: 'tiktok',
    publishedAt: '2024-12-08T20:00:00',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop',
    metrics: { impressions: 156000, reach: 98000, engagement: 12400, engagementRate: 12.7, likes: 8900, comments: 1234, shares: 1567, saves: 699, clicks: 2100 },
    audience: { topAge: '18-24', topLocation: 'United States', peakHour: '8:00 PM' }
  },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedin />,
  tiktok: <FaTiktok />,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'text-gray-900',
  instagram: 'text-pink-600',
  linkedin: 'text-blue-700',
  tiktok: 'text-gray-900',
};

type AnalyticsTab = 'overview' | 'compare' | 'insights' | 'history';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('compare');
  const [postA, setPostA] = useState<PostData | null>(MOCK_POSTS[0]);
  const [postB, setPostB] = useState<PostData | null>(MOCK_POSTS[1]);
  const [showPostSelectorA, setShowPostSelectorA] = useState(false);
  const [showPostSelectorB, setShowPostSelectorB] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={15} /> },
    { id: 'compare', label: 'Compare', icon: <FiLayers size={15} /> },
    { id: 'insights', label: 'Insights', icon: <FiZap size={15} /> },
    { id: 'history', label: 'Activity', icon: <FiRefreshCw size={15} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-[1400px] mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-md">
            Compare posts, analyze performance trends, and get AI-powered optimization suggestions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all shadow-sm">
            <FiCalendar size={14} />
            Last 30 days
            <FiChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-black rounded-lg text-sm font-medium text-white transition-all shadow-sm">
            <FiRefreshCw size={14} />
            Sync Data
          </button>
        </div>
      </div>

      {/* Vercel-style Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <div className="min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab key="overview" posts={MOCK_POSTS} />}
          {activeTab === 'compare' && (
            <CompareTab
              key="compare"
              postA={postA}
              postB={postB}
              setPostA={setPostA}
              setPostB={setPostB}
              showSelectorA={showPostSelectorA}
              showSelectorB={showPostSelectorB}
              setShowSelectorA={setShowPostSelectorA}
              setShowSelectorB={setShowPostSelectorB}
              allPosts={MOCK_POSTS}
            />
          )}
          {activeTab === 'insights' && <InsightsTab key="insights" postA={postA} postB={postB} />}
          {activeTab === 'history' && <HistoryTab key="history" />}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================
   OVERVIEW TAB
============================================ */
function OverviewTab({ posts }: { posts: PostData[] }) {
  const totalImpressions = posts.reduce((acc, p) => acc + p.metrics.impressions, 0);
  const totalEngagement = posts.reduce((acc, p) => acc + p.metrics.engagement, 0);
  const avgEngagementRate = posts.reduce((acc, p) => acc + p.metrics.engagementRate, 0) / posts.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Impressions" value={formatNumber(totalImpressions)} change={12.5} />
        <StatCard label="Total Engagement" value={formatNumber(totalEngagement)} change={8.2} />
        <StatCard label="Avg. Engagement Rate" value={`${avgEngagementRate.toFixed(1)}%`} change={-2.1} />
        <StatCard label="Posts Analyzed" value={posts.length.toString()} change={0} />
      </div>

      {/* Recent Posts Performance */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-900">Recent Performance</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {posts.slice(0, 5).map((post) => (
            <PostPerformanceRow key={post.id} post={post} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   COMPARE TAB - MAIN FEATURE
============================================ */
function CompareTab({
  postA,
  postB,
  setPostA,
  setPostB,
  showSelectorA,
  showSelectorB,
  setShowSelectorA,
  setShowSelectorB,
  allPosts,
}: any) {
  const comparisonMetrics = postA && postB ? generateComparison(postA, postB) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Post Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostSelector
          label="Post A (Baseline)"
          selectedPost={postA}
          isOpen={showSelectorA}
          onToggle={() => setShowSelectorA(!showSelectorA)}
          onSelect={(post: PostData) => { setPostA(post); setShowSelectorA(false); }}
          allPosts={allPosts.filter((p: PostData) => p.id !== postB?.id)}
          color="blue"
        />
        <PostSelector
          label="Post B (Comparison)"
          selectedPost={postB}
          isOpen={showSelectorB}
          onToggle={() => setShowSelectorB(!showSelectorB)}
          onSelect={(post: PostData) => { setPostB(post); setShowSelectorB(false); }}
          allPosts={allPosts.filter((p: PostData) => p.id !== postA?.id)}
          color="violet"
        />
      </div>

      {postA && postB && comparisonMetrics && (
        <>
          {/* Metrics Comparison Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Metrics Comparison</h3>
              <div className="flex items-center gap-6 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Post A
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-600" /> Post B
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {comparisonMetrics.slice(0, 4).map((metric: any) => (
                <MetricComparisonCard key={metric.name} metric={metric} />
              ))}
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
              {comparisonMetrics.slice(4, 8).map((metric: any) => (
                <MetricComparisonCard key={metric.name} metric={metric} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="text-sm font-semibold text-gray-900">Engagement Composition</h4>
               </div>
               <div className="space-y-6">
                  <EngagementBar label="Likes" valueA={postA.metrics.likes} valueB={postB.metrics.likes} />
                  <EngagementBar label="Comments" valueA={postA.metrics.comments} valueB={postB.metrics.comments} />
                  <EngagementBar label="Shares" valueA={postA.metrics.shares} valueB={postB.metrics.shares} />
                  <EngagementBar label="Saves" valueA={postA.metrics.saves} valueB={postB.metrics.saves} />
               </div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-6">Audience & Timing</h4>
              <div className="space-y-0 divide-y divide-gray-100">
                <AudienceComparisonRow label="Top Age" valueA={postA.audience.topAge} valueB={postB.audience.topAge} />
                <AudienceComparisonRow label="Location" valueA={postA.audience.topLocation} valueB={postB.audience.topLocation} />
                <AudienceComparisonRow label="Peak Hour" valueA={postA.audience.peakHour} valueB={postB.audience.peakHour} />
              </div>
            </div>
          </div>

          <ComparisonInsights postA={postA} postB={postB} />
        </>
      )}

      {(!postA || !postB) && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
          <FiLayers className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-gray-900">Comparison Mode</h3>
          <p className="text-gray-500 text-sm mt-1">Select two posts above to visualize the difference.</p>
        </div>
      )}
    </motion.div>
  );
}

/* ============================================
   INSIGHTS TAB
============================================ */
function InsightsTab({ postA, postB }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="p-6 bg-gray-900 rounded-lg text-white shadow-sm">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg">
                <FiZap className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-semibold text-lg">Performance Summary</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                    Your content strategy is performing <span className="text-white font-medium">23% above average</span> compared to benchmarks.
                    Thread-style posts and morning publishing (9-11 AM) are currently your strongest growth levers.
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard 
            type="success" 
            title="Threads outperform single posts" 
            desc="Your thread posts generate 84% more engagement. Prioritize this format."
            metric="+84% Eng."
        />
        <InsightCard 
            type="warning" 
            title="Weekend drop-off detected" 
            desc="Engagement rate falls by 34% on Saturdays. Reschedule evergreen content to weekdays."
            metric="-34% Rate"
        />
        <InsightCard 
            type="tip" 
            title="Optimal timing shift" 
            desc="Your audience is now most active at 10 AM (previously 2 PM). Adjust schedule."
        />
         <InsightCard 
            type="improvement" 
            title="Hashtag saturation" 
            desc="Posts with >10 hashtags are being penalized. Stick to 3-5 relevant tags."
        />
      </div>
    </motion.div>
  );
}

/* ============================================
   HISTORY TAB
============================================ */
function HistoryTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
    >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="text-sm font-semibold text-gray-900">Analysis Log</h3>
             <span className="text-xs text-gray-500 font-mono">Auto-runs every 24h</span>
        </div>
        <div className="divide-y divide-gray-100">
            {[1,2,3,4].map((i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <FiCheck size={14} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Daily Performance Scan</p>
                            <p className="text-xs text-gray-500">Completed at 06:00 AM • 5 posts analyzed</p>
                        </div>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 px-3 py-1 rounded-md bg-white hover:bg-gray-50">View Report</button>
                </div>
            ))}
        </div>
    </motion.div>
  )
}

/* ============================================
   COMPONENTS
============================================ */

function PostSelector({ label, selectedPost, isOpen, onToggle, onSelect, allPosts, color }: any) {
    const focusRing = color === 'blue' ? 'focus:ring-blue-500/20' : 'focus:ring-violet-500/20';
    const activeBorder = isOpen ? 'border-gray-400' : 'border-gray-200';
    
    return (
        <div className="relative group">
            <div className="flex items-center gap-2 mb-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${color === 'blue' ? 'bg-blue-600' : 'bg-violet-600'}`}></div>
                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
            </div>
           
            <button 
                onClick={onToggle}
                className={`w-full bg-white border ${activeBorder} rounded-lg p-3 text-left hover:border-gray-300 transition-all shadow-sm focus:outline-none focus:ring-4 ${focusRing}`}
            >
                {selectedPost ? (
                    <div className="flex items-start gap-3">
                         {selectedPost.thumbnail && <img src={selectedPost.thumbnail} className="w-10 h-10 rounded object-cover bg-gray-100 border border-gray-200" />}
                         <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-0.5">
                                 <span className={PLATFORM_COLORS[selectedPost.platform]}>{PLATFORM_ICONS[selectedPost.platform]}</span>
                                 <span className="text-xs text-gray-400 font-mono">{formatDate(selectedPost.publishedAt)}</span>
                             </div>
                             <p className="text-sm text-gray-900 font-medium truncate">{selectedPost.content}</p>
                         </div>
                         <FiChevronDown className="text-gray-400 mt-1" />
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-gray-400 py-2">
                        <span className="text-sm">Select a post to analyze...</span>
                        <FiSearch />
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden"
                    >
                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                            {allPosts.map((p: PostData) => (
                                <button key={p.id} onClick={() => onSelect(p)} className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                        {p.thumbnail && <img src={p.thumbnail} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-900 truncate">{p.content}</p>
                                        <p className="text-xs text-gray-500">{new Date(p.publishedAt).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function MetricComparisonCard({ metric }: any) {
    const percentA = (metric.valueA / Math.max(metric.valueA, metric.valueB)) * 100;
    const percentB = (metric.valueB / Math.max(metric.valueA, metric.valueB)) * 100;

    return (
        <div className="p-5 hover:bg-gray-50 transition-colors group">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{metric.name}</p>
            
            <div className="space-y-3">
                {/* Post A */}
                <div className="relative">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-900 tabular-nums">{formatNumber(metric.valueA)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percentA}%` }} transition={{ duration: 0.5 }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                </div>

                {/* Post B */}
                <div className="relative">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-900 tabular-nums">{formatNumber(metric.valueB)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percentB}%` }} transition={{ duration: 0.5 }} className="h-full bg-violet-600 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function EngagementBar({ label, valueA, valueB }: any) {
    const total = valueA + valueB;
    const perA = total ? (valueA / total) * 100 : 0;
    const perB = total ? (valueB / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600">{label}</span>
                <div className="flex gap-4 text-xs tabular-nums">
                    <span className="text-blue-600 font-semibold">{formatNumber(valueA)}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-violet-600 font-semibold">{formatNumber(valueB)}</span>
                </div>
            </div>
            <div className="h-2 w-full flex bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${perA}%` }} className="bg-blue-600" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${perB}%` }} className="bg-violet-600" />
            </div>
        </div>
    )
}

function AudienceComparisonRow({ label, valueA, valueB }: any) {
    return (
        <div className="flex items-center justify-between py-4">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-3 text-sm font-medium">
                <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{valueA}</span>
                <span className="text-gray-300 text-xs">vs</span>
                <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{valueB}</span>
            </div>
        </div>
    )
}

function ComparisonInsights({ postA, postB }: any) {
    const suggestions = generateSuggestions(postA, postB);
    return (
        <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <FiZap className="text-gray-900" />
                <h3 className="text-sm font-semibold text-gray-900">AI-Powered Conclusions</h3>
            </div>
            <div className="space-y-2">
                {suggestions.map((s: any, i: number) => (
                    <div key={i} className={`p-3 rounded border text-sm flex gap-3 ${s.type === 'do' ? 'bg-green-50/50 border-green-100 text-green-900' : 'bg-red-50/50 border-red-100 text-red-900'}`}>
                         <span className={`mt-0.5 ${s.type === 'do' ? 'text-green-600' : 'text-red-600'}`}>
                             {s.type === 'do' ? <FiCheck /> : <FiX />}
                         </span>
                         <div>
                             <span className="font-semibold">{s.title}: </span>
                             <span className="opacity-90">{s.description}</span>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatCard({ label, value, change }: any) {
    return (
        <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-900 tracking-tight tabular-nums">{value}</span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {Math.abs(change)}%
                </span>
            </div>
        </div>
    )
}

function PostPerformanceRow({ post }: any) {
    return (
        <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            {post.thumbnail && <img src={post.thumbnail} className="w-10 h-10 rounded border border-gray-200 object-cover" />}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    {PLATFORM_ICONS[post.platform]}
                    <span>{formatDate(post.publishedAt)}</span>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatNumber(post.metrics.reach)}</p>
                 <p className="text-xs text-gray-500">Reach</p>
            </div>
        </div>
    )
}

function InsightCard({ type, title, desc, metric }: any) {
    const borders = {
        success: 'border-l-4 border-l-green-500',
        warning: 'border-l-4 border-l-amber-500',
        improvement: 'border-l-4 border-l-red-500',
        tip: 'border-l-4 border-l-blue-500',
    };
    
    return (
        <div className={`p-5 bg-white border border-gray-200 rounded-r-lg shadow-sm ${borders[type as keyof typeof borders]} flex justify-between gap-4`}>
            <div>
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
            {metric && (
                <div className="text-right flex-shrink-0">
                     <span className="block text-lg font-semibold text-gray-900 tabular-nums">{metric}</span>
                </div>
            )}
        </div>
    )
}

/* ============================================
   UTILITY
============================================ */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateComparison(postA: PostData, postB: PostData) {
  const metrics = [
    { name: 'Impressions', key: 'impressions' },
    { name: 'Reach', key: 'reach' },
    { name: 'Engagement', key: 'engagement' },
    { name: 'Eng. Rate (%)', key: 'engagementRate' },
    { name: 'Likes', key: 'likes' },
    { name: 'Comments', key: 'comments' },
    { name: 'Shares', key: 'shares' },
    { name: 'Saves', key: 'saves' },
  ];

  return metrics.map((m) => {
    const valueA = postA.metrics[m.key as keyof typeof postA.metrics] as number;
    const valueB = postB.metrics[m.key as keyof typeof postB.metrics] as number;
    return { name: m.name, valueA, valueB };
  });
}

function generateSuggestions(postA: PostData, postB: PostData) {
  const suggestions = [];
  if (postA.metrics.engagementRate > postB.metrics.engagementRate) {
    suggestions.push({ type: 'do', title: `Keep the ${postA.platform} format`, description: `Post A's structure drove higher engagement.` });
  } else {
    suggestions.push({ type: 'do', title: `Adopt Post B's style`, description: `Post B resonated better with your audience.` });
  }
  if (postA.audience.peakHour !== postB.audience.peakHour) {
      const better = postA.metrics.reach > postB.metrics.reach ? postA : postB;
      suggestions.push({ type: 'do', title: `Post at ${better.audience.peakHour}`, description: `This time slot maximized reach.` });
  }
  return suggestions;
}