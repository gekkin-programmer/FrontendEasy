// src/components/easypost/Analytics.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp, FiTrendingDown, FiCalendar, FiClock, FiRefreshCw,
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiEye, FiUsers,
  FiChevronDown, FiCheck, FiZap, FiArrowRight, FiX, FiSearch,
  FiFilter, FiLayers, FiTarget, FiBarChart2, FiPieChart
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

// --- MOCK DATA ---
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
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={16} /> },
    { id: 'compare', label: 'Compare Posts', icon: <FiLayers size={16} /> },
    { id: 'insights', label: 'AI Insights', icon: <FiZap size={16} /> },
    { id: 'history', label: '24h Analysis', icon: <FiRefreshCw size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Compare posts, discover patterns, and get AI-powered suggestions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
            <FiCalendar size={16} />
            Last 30 days
            <FiChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-blue-600/20">
            <FiRefreshCw size={16} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AnalyticsTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <OverviewTab key="overview" posts={MOCK_POSTS} />
        )}
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
        {activeTab === 'insights' && (
          <InsightsTab key="insights" postA={postA} postB={postB} />
        )}
        {activeTab === 'history' && (
          <HistoryTab key="history" />
        )}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Impressions"
          value={formatNumber(totalImpressions)}
          change={12.5}
          icon={<FiEye />}
        />
        <StatCard
          label="Total Engagement"
          value={formatNumber(totalEngagement)}
          change={8.2}
          icon={<FiHeart />}
        />
        <StatCard
          label="Avg. Engagement Rate"
          value={`${avgEngagementRate.toFixed(1)}%`}
          change={-2.1}
          icon={<FiTarget />}
        />
        <StatCard
          label="Posts Analyzed"
          value={posts.length.toString()}
          change={0}
          icon={<FiLayers />}
        />
      </div>

      {/* Recent Posts Performance */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts Performance</h3>
        <div className="space-y-4">
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
}: {
  postA: PostData | null;
  postB: PostData | null;
  setPostA: (p: PostData | null) => void;
  setPostB: (p: PostData | null) => void;
  showSelectorA: boolean;
  showSelectorB: boolean;
  setShowSelectorA: (v: boolean) => void;
  setShowSelectorB: (v: boolean) => void;
  allPosts: PostData[];
}) {
  const comparisonMetrics = postA && postB ? generateComparison(postA, postB) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Post Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post A Selector */}
        <PostSelector
          label="Post A"
          selectedPost={postA}
          isOpen={showSelectorA}
          onToggle={() => setShowSelectorA(!showSelectorA)}
          onSelect={(post) => {
            setPostA(post);
            setShowSelectorA(false);
          }}
          allPosts={allPosts.filter((p) => p.id !== postB?.id)}
          color="blue"
        />

        {/* Post B Selector */}
        <PostSelector
          label="Post B"
          selectedPost={postB}
          isOpen={showSelectorB}
          onToggle={() => setShowSelectorB(!showSelectorB)}
          onSelect={(post) => {
            setPostB(post);
            setShowSelectorB(false);
          }}
          allPosts={allPosts.filter((p) => p.id !== postA?.id)}
          color="purple"
        />
      </div>

      {/* Comparison Results */}
      {postA && postB && comparisonMetrics && (
        <>
          {/* Metrics Comparison Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Metrics Comparison</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Post A
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  Post B
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {comparisonMetrics.map((metric) => (
                <MetricComparisonCard key={metric.name} metric={metric} />
              ))}
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Engagement Breakdown</h4>
              <div className="space-y-4">
                <EngagementBar
                  label="Likes"
                  valueA={postA.metrics.likes}
                  valueB={postB.metrics.likes}
                  icon={<FiHeart size={14} />}
                />
                <EngagementBar
                  label="Comments"
                  valueA={postA.metrics.comments}
                  valueB={postB.metrics.comments}
                  icon={<FiMessageCircle size={14} />}
                />
                <EngagementBar
                  label="Shares"
                  valueA={postA.metrics.shares}
                  valueB={postB.metrics.shares}
                  icon={<FiShare2 size={14} />}
                />
                <EngagementBar
                  label="Saves"
                  valueA={postA.metrics.saves}
                  valueB={postB.metrics.saves}
                  icon={<FiBookmark size={14} />}
                />
              </div>
            </div>

            {/* Audience Comparison */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Audience Insights</h4>
              <div className="space-y-4">
                <AudienceComparisonRow
                  label="Top Age Group"
                  valueA={postA.audience.topAge}
                  valueB={postB.audience.topAge}
                />
                <AudienceComparisonRow
                  label="Top Location"
                  valueA={postA.audience.topLocation}
                  valueB={postB.audience.topLocation}
                />
                <AudienceComparisonRow
                  label="Peak Hour"
                  valueA={postA.audience.peakHour}
                  valueB={postB.audience.peakHour}
                />
              </div>
            </div>
          </div>

          {/* AI Suggestions Based on Comparison */}
          <ComparisonInsights postA={postA} postB={postB} />
        </>
      )}

      {/* Empty State */}
      {(!postA || !postB) && (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <FiLayers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select two posts to compare</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Choose any two posts from any time period to see detailed metrics comparison and AI-powered insights.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ============================================
   INSIGHTS TAB
============================================ */
function InsightsTab({ postA, postB }: { postA: PostData | null; postB: PostData | null }) {
  const insights: Insight[] = [
    {
      id: 1,
      type: 'success',
      title: 'Thread format outperforms single posts',
      description: 'Your thread posts generate 84% more engagement on average. Consider breaking down long-form content into threads.',
      metric: 'Engagement',
      change: 84,
    },
    {
      id: 2,
      type: 'improvement',
      title: 'Optimal posting time detected',
      description: 'Posts published between 9-11 AM get 2.3x more reach. Your recent posts at 6 PM are underperforming.',
      metric: 'Reach',
      change: 130,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Engagement rate declining on weekends',
      description: 'Weekend posts show 34% lower engagement. Consider reducing weekend posting or changing content type.',
      metric: 'Engagement Rate',
      change: -34,
    },
    {
      id: 4,
      type: 'tip',
      title: 'Carousel posts drive more saves',
      description: 'Carousels are generating 2.4x more saves than single images. Schedule more educational carousels.',
      metric: 'Saves',
      change: 140,
    },
    {
      id: 5,
      type: 'success',
      title: 'Hashtag strategy is working',
      description: 'Posts with 3-5 hashtags perform 45% better than those with 10+. Keep using focused hashtags.',
      metric: 'Discovery',
      change: 45,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* AI Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiZap size={20} />
            </div>
            <div>
              <h3 className="font-semibold">AI Analysis Summary</h3>
              <p className="text-sm text-white/70">Based on your last 30 days of content</p>
            </div>
          </div>
          <p className="text-lg leading-relaxed mb-4">
            Your content strategy is <span className="font-bold">performing 23% above average</span> compared to similar accounts. 
            Thread-style posts and morning publishing are your strongest performers.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium">
              📈 +23% above benchmark
            </span>
            <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium">
              🧵 Threads = Top format
            </span>
            <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium">
              ⏰ Best time: 9-11 AM
            </span>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
        <div className="space-y-3">
          <ActionItem
            priority="high"
            title="Schedule 2 more thread posts this week"
            description="Based on your high engagement with thread format"
          />
          <ActionItem
            priority="medium"
            title="Shift weekend posts to Monday morning"
            description="Weekend engagement is 34% lower"
          />
          <ActionItem
            priority="low"
            title="Recycle your top-performing post from Oct 15"
            description="It's been 60 days - perfect for recycling"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   24H HISTORY TAB
============================================ */
function HistoryTab() {
  const analysisHistory = [
    {
      id: 1,
      date: 'Today, 6:00 AM',
      status: 'completed',
      postsAnalyzed: 3,
      newInsights: 2,
      summary: 'Morning posts from yesterday outperformed evening posts by 45%',
    },
    {
      id: 2,
      date: 'Yesterday, 6:00 AM',
      status: 'completed',
      postsAnalyzed: 5,
      newInsights: 4,
      summary: 'Detected optimal posting window shift from 2 PM to 10 AM',
    },
    {
      id: 3,
      date: 'Dec 17, 6:00 AM',
      status: 'completed',
      postsAnalyzed: 2,
      newInsights: 1,
      summary: 'Carousel content continues to drive highest saves',
    },
    {
      id: 4,
      date: 'Dec 16, 6:00 AM',
      status: 'completed',
      postsAnalyzed: 4,
      newInsights: 3,
      summary: 'LinkedIn engagement spiked - professional content trending',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Next Analysis Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FiRefreshCw className="animate-spin-slow" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Next Automatic Analysis</h3>
              <p className="text-gray-400 text-sm">Runs every 24 hours at 6:00 AM</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">14:32:08</p>
            <p className="text-gray-400 text-sm">hours remaining</p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
          <span className="text-sm text-gray-400">40% complete</span>
        </div>
      </div>

      {/* What Gets Analyzed */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What We Analyze Every 24 Hours</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalysisFeature
            icon={<FiBarChart2 />}
            title="Performance Trends"
            description="Compare recent vs historical data"
          />
          <AnalysisFeature
            icon={<FiUsers />}
            title="Audience Shifts"
            description="Detect changes in demographics"
          />
          <AnalysisFeature
            icon={<FiClock />}
            title="Timing Patterns"
            description="Find new optimal posting times"
          />
          <AnalysisFeature
            icon={<FiTarget />}
            title="Content Gaps"
            description="Identify underperforming formats"
          />
        </div>
      </div>

      {/* Analysis History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Analysis History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {analysisHistory.map((analysis) => (
            <div key={analysis.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mt-0.5">
                    <FiCheck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-gray-900">{analysis.date}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{analysis.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{analysis.postsAnalyzed} posts analyzed</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-blue-600 font-medium">{analysis.newInsights} new insights</span>
                    </div>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   SUB-COMPONENTS
============================================ */
function PostSelector({
  label,
  selectedPost,
  isOpen,
  onToggle,
  onSelect,
  allPosts,
  color,
}: {
  label: string;
  selectedPost: PostData | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (post: PostData) => void;
  allPosts: PostData[];
  color: 'blue' | 'purple';
}) {
  const colorClasses = color === 'blue' 
    ? 'border-blue-200 bg-blue-50/50' 
    : 'border-purple-200 bg-purple-50/50';
  const dotColor = color === 'blue' ? 'bg-blue-500' : 'bg-purple-500';

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      
      <button
        onClick={onToggle}
        className={`w-full p-4 rounded-xl border-2 ${colorClasses} hover:border-${color}-300 transition-colors text-left`}
      >
        {selectedPost ? (
          <div className="flex items-center gap-4">
            {selectedPost.thumbnail && (
              <img
                src={selectedPost.thumbnail}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`${PLATFORM_COLORS[selectedPost.platform]}`}>
                  {PLATFORM_ICONS[selectedPost.platform]}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(selectedPost.publishedAt)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedPost.content}
              </p>
            </div>
            <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <FiSearch size={18} />
            <span className="font-medium">Select a post</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {allPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => onSelect(post)}
                  className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                >
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm ${PLATFORM_COLORS[post.platform]}`}>
                        {PLATFORM_ICONS[post.platform]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{post.content}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricComparisonCard({ metric }: { metric: { name: string; valueA: number; valueB: number; winner: 'A' | 'B' | 'tie'; percentDiff: number } }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{metric.name}</p>
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <div className={`text-lg font-bold ${metric.winner === 'A' ? 'text-blue-600' : 'text-gray-700'}`}>
            {formatNumber(metric.valueA)}
          </div>
          <div className="h-2 bg-blue-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((metric.valueA / Math.max(metric.valueA, metric.valueB)) * 100, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-lg font-bold text-right ${metric.winner === 'B' ? 'text-purple-600' : 'text-gray-700'}`}>
            {formatNumber(metric.valueB)}
          </div>
          <div className="h-2 bg-purple-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((metric.valueB / Math.max(metric.valueA, metric.valueB)) * 100, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-purple-500 rounded-full"
            />
          </div>
        </div>
      </div>
      {metric.winner !== 'tie' && (
        <p className={`text-xs mt-2 font-medium ${metric.winner === 'A' ? 'text-blue-600' : 'text-purple-600'}`}>
          Post {metric.winner} wins by {Math.abs(metric.percentDiff).toFixed(0)}%
        </p>
      )}
    </div>
  );
}

function EngagementBar({
  label,
  valueA,
  valueB,
  icon,
}: {
  label: string;
  valueA: number;
  valueB: number;
  icon: React.ReactNode;
}) {
  const total = valueA + valueB;
  const percentA = total > 0 ? (valueA / total) * 100 : 50;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2 text-gray-600">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-blue-600">{formatNumber(valueA)}</span>
          <span className="text-gray-300">vs</span>
          <span className="text-purple-600">{formatNumber(valueB)}</span>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentA}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-blue-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${100 - percentA}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-purple-500"
        />
      </div>
    </div>
  );
}

function AudienceComparisonRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  const isSame = valueA === valueB;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
          {valueA}
        </span>
        {isSame ? (
          <span className="text-gray-400">=</span>
        ) : (
          <span className="text-gray-400">vs</span>
        )}
        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
          {valueB}
        </span>
      </div>
    </div>
  );
}

function ComparisonInsights({ postA, postB }: { postA: PostData; postB: PostData }) {
  const suggestions = generateSuggestions(postA, postB);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          <FiZap size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI-Powered Suggestions</h3>
          <p className="text-sm text-gray-600">Based on this comparison</p>
        </div>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/60 rounded-xl p-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              suggestion.type === 'do' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {suggestion.type === 'do' ? <FiCheck size={14} /> : <FiX size={14} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{suggestion.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400">{icon}</span>
        {change !== 0 && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function PostPerformanceRow({ post }: { post: PostData }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      {post.thumbnail && (
        <img src={post.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={PLATFORM_COLORS[post.platform]}>{PLATFORM_ICONS[post.platform]}</span>
          <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
        </div>
        <p className="text-sm text-gray-700 truncate">{post.content}</p>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold text-gray-900">{formatNumber(post.metrics.reach)}</p>
          <p className="text-xs text-gray-500">Reach</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{post.metrics.engagementRate}%</p>
          <p className="text-xs text-gray-500">Eng. Rate</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const typeStyles = {
    improvement: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡', iconBg: 'bg-blue-100 text-blue-600' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✅', iconBg: 'bg-green-100 text-green-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', iconBg: 'bg-amber-100 text-amber-600' },
    tip: { bg: 'bg-purple-50', border: 'border-purple-200', icon: '🎯', iconBg: 'bg-purple-100 text-purple-600' },
  };

  const style = typeStyles[insight.type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-2xl p-5`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
          {insight.metric && insight.change !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-medium text-gray-500">{insight.metric}</span>
              <span className={`text-xs font-bold ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionItem({
  priority,
  title,
  description,
}: {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}) {
  const priorityStyles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg ${priorityStyles[priority]}`}>
        {priority}
      </span>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-1">
        Do it <FiArrowRight size={14} />
      </button>
    </div>
  );
}

function AnalysisFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-4">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mx-auto mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

/* ============================================
   UTILITY FUNCTIONS
============================================ */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateComparison(postA: PostData, postB: PostData) {
  const metrics = [
    { name: 'Impressions', key: 'impressions' },
    { name: 'Reach', key: 'reach' },
    { name: 'Engagement', key: 'engagement' },
    { name: 'Eng. Rate', key: 'engagementRate' },
    { name: 'Likes', key: 'likes' },
    { name: 'Comments', key: 'comments' },
    { name: 'Shares', key: 'shares' },
    { name: 'Saves', key: 'saves' },
  ];

  return metrics.map((m) => {
    const valueA = postA.metrics[m.key as keyof typeof postA.metrics] as number;
    const valueB = postB.metrics[m.key as keyof typeof postB.metrics] as number;
    const diff = valueA - valueB;
    const percentDiff = valueB > 0 ? ((valueA - valueB) / valueB) * 100 : 0;

    return {
      name: m.name,
      valueA,
      valueB,
      winner: diff > 0 ? 'A' : diff < 0 ? 'B' : 'tie' as 'A' | 'B' | 'tie',
      percentDiff,
    };
  });
}

function generateSuggestions(postA: PostData, postB: PostData) {
  const suggestions: { type: 'do' | 'avoid'; title: string; description: string }[] = [];

  // Compare engagement rates
  if (postA.metrics.engagementRate > postB.metrics.engagementRate) {
    suggestions.push({
      type: 'do',
      title: `Use similar format to Post A`,
      description: `Post A's ${postA.platform} format achieved ${postA.metrics.engagementRate}% engagement - replicate this approach.`,
    });
  }

  // Compare posting times
  if (postA.audience.peakHour !== postB.audience.peakHour) {
    const betterPost = postA.metrics.reach > postB.metrics.reach ? postA : postB;
    suggestions.push({
      type: 'do',
      title: `Post around ${betterPost.audience.peakHour}`,
      description: `This timing drove ${formatNumber(betterPost.metrics.reach)} reach - significantly higher than the other time slot.`,
    });
  }

  // Compare saves (content value indicator)
  if (postA.metrics.saves > postB.metrics.saves * 1.5) {
    suggestions.push({
      type: 'do',
      title: 'Create more educational/valuable content',
      description: 'Post A had 50%+ more saves, indicating higher perceived value. Focus on actionable tips.',
    });
  }

  // Warning about lower performer
  const lowerEngagement = postA.metrics.engagement < postB.metrics.engagement ? postA : postB;
  suggestions.push({
    type: 'avoid',
    title: `Posting at ${lowerEngagement.audience.peakHour} on ${lowerEngagement.platform}`,
    description: 'This combination underperformed. Test different times or content formats.',
  });

  return suggestions;
}
