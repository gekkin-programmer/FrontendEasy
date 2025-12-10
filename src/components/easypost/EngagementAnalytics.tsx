'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMessageCircle, FiClock, FiUsers, FiHeart,
  FiTrendingUp, FiTrendingDown, FiCalendar, FiArrowRight,
  FiChevronRight, FiZap, FiAward, FiStar, FiTarget
} from 'react-icons/fi';
import {
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok
} from 'react-icons/fa';

// --- TYPES ---
type TimeRange = '7d' | '30d' | '90d';

// --- MOCK DATA ---
const ACTIVITY_HEATMAP = [
  // Last 4 weeks of daily activity (0-4 intensity)
  [2, 3, 1, 4, 3, 2, 1],
  [1, 4, 3, 2, 4, 3, 2],
  [3, 2, 4, 3, 1, 4, 2],
  [2, 3, 2, 4, 3, 2, 3],
];

const HOURLY_ACTIVITY = [
  { hour: '6am', value: 12 },
  { hour: '9am', value: 45 },
  { hour: '12pm', value: 78 },
  { hour: '3pm', value: 92 },
  { hour: '6pm', value: 65 },
  { hour: '9pm', value: 34 },
];

const RESPONSE_TIMES = [
  { range: '< 5 min', count: 234, percentage: 45 },
  { range: '5-15 min', count: 156, percentage: 30 },
  { range: '15-30 min', count: 78, percentage: 15 },
  { range: '30+ min', count: 52, percentage: 10 },
];

const PLATFORM_STATS = [
  { 
    platform: 'twitter', 
    icon: FaTwitter, 
    color: '#1DA1F2', 
    messages: 892, 
    responseRate: 96,
    happyCustomers: 94,
    topEmoji: '🔥',
    trend: 'up'
  },
  { 
    platform: 'instagram', 
    icon: FaInstagram, 
    color: '#E4405F', 
    messages: 756, 
    responseRate: 91,
    happyCustomers: 89,
    topEmoji: '❤️',
    trend: 'up'
  },
  { 
    platform: 'facebook', 
    icon: FaFacebook, 
    color: '#1877F2', 
    messages: 534, 
    responseRate: 88,
    happyCustomers: 82,
    topEmoji: '👍',
    trend: 'down'
  },
  { 
    platform: 'linkedin', 
    icon: FaLinkedin, 
    color: '#0A66C2', 
    messages: 423, 
    responseRate: 98,
    happyCustomers: 96,
    topEmoji: '💼',
    trend: 'up'
  },
];

const TOP_CONVERSATIONS = [
  { 
    title: "Product feature request", 
    count: 127, 
    sentiment: 'positive',
    emoji: '💡'
  },
  { 
    title: "Pricing questions", 
    count: 89, 
    sentiment: 'neutral',
    emoji: '💰'
  },
  { 
    title: "How-to questions", 
    count: 76, 
    sentiment: 'positive',
    emoji: '🤔'
  },
  { 
    title: "Bug reports", 
    count: 34, 
    sentiment: 'negative',
    emoji: '🐛'
  },
  { 
    title: "Compliments!", 
    count: 156, 
    sentiment: 'positive',
    emoji: '🎉'
  },
];

const TEAM_MEMBERS = [
  { name: 'Alex', avatar: '👨‍💼', replies: 456, streak: 12, mood: '🔥' },
  { name: 'Jordan', avatar: '👩‍💻', replies: 389, streak: 8, mood: '⚡' },
  { name: 'Sam', avatar: '🧑‍🎨', replies: 312, streak: 5, mood: '✨' },
  { name: 'Casey', avatar: '👨‍🔧', replies: 278, streak: 15, mood: '🏆' },
];

// --- MAIN COMPONENT ---
export default function EngagementAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [hoveredDay, setHoveredDay] = useState<{week: number, day: number} | null>(null);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const intensityColors = ['#F3F4F6', '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8'];

  return (
    <div className="space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
              📊
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your Week in Numbers</h2>
              <p className="text-gray-500">Here's how you've been doing</p>
            </div>
          </div>
        </div>
        
        {/* Time Toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 self-start">
          {[
            { value: '7d', label: 'Week' },
            { value: '30d', label: 'Month' },
            { value: '90d', label: 'Quarter' },
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as TimeRange)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                timeRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- HIGHLIGHT CARDS (Story Style) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Messages Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <span className="text-4xl mb-3 block">💬</span>
            <p className="text-gray-500 text-sm font-medium">Messages received</p>
            <p className="text-3xl font-black text-gray-900 mt-1">2,847</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
              <FiTrendingUp size={14} />
              <span>+23% vs last week</span>
            </div>
          </div>
        </motion.div>

        {/* Response Time Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <span className="text-4xl mb-3 block">⚡</span>
            <p className="text-gray-500 text-sm font-medium">Avg response time</p>
            <p className="text-3xl font-black text-gray-900 mt-1">8 min</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
              <FiTrendingDown size={14} />
              <span>4 min faster!</span>
            </div>
          </div>
        </motion.div>

        {/* Happiness Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <span className="text-4xl mb-3 block">😊</span>
            <p className="text-gray-500 text-sm font-medium">Happy customers</p>
            <p className="text-3xl font-black text-gray-900 mt-1">94%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">🎉</span>
              <span className="text-sm text-gray-500">You're crushing it!</span>
            </div>
          </div>
        </motion.div>

        {/* Replied Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-white/80 text-sm font-medium">Reply rate</p>
            <p className="text-3xl font-black mt-1">98.2%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm text-white/80">Top 5% of teams</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- ACTIVITY HEATMAP + BEST TIMES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Activity Map</h3>
              <p className="text-sm text-gray-500">When your audience talks to you</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Less</span>
              {intensityColors.map((color, i) => (
                <div 
                  key={i} 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: color }}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-2">
            {/* Day Labels */}
            <div className="flex gap-2 pl-16">
              {days.map((day, i) => (
                <div key={i} className="flex-1 text-center text-xs font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Weeks */}
            {ACTIVITY_HEATMAP.map((week, weekIdx) => (
              <div key={weekIdx} className="flex items-center gap-2">
                <span className="w-14 text-xs text-gray-400 text-right">
                  {weekIdx === 0 ? 'This week' : weekIdx === 1 ? 'Last week' : `${weekIdx + 1}w ago`}
                </span>
                <div className="flex-1 flex gap-2">
                  {week.map((intensity, dayIdx) => (
                    <motion.div
                      key={dayIdx}
                      whileHover={{ scale: 1.2 }}
                      onHoverStart={() => setHoveredDay({ week: weekIdx, day: dayIdx })}
                      onHoverEnd={() => setHoveredDay(null)}
                      className="flex-1 aspect-square rounded-lg cursor-pointer relative"
                      style={{ backgroundColor: intensityColors[intensity] }}
                    >
                      {hoveredDay?.week === weekIdx && hoveredDay?.day === dayIdx && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {intensity * 47} messages
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Times */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🕐</span>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Peak Hours</h3>
              <p className="text-sm text-gray-500">When to be online</p>
            </div>
          </div>

          <div className="space-y-3">
            {HOURLY_ACTIVITY.map((hour, idx) => {
              const isTop = hour.value === Math.max(...HOURLY_ACTIVITY.map(h => h.value));
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-12 text-sm font-medium ${isTop ? 'text-orange-500' : 'text-gray-500'}`}>
                    {hour.hour}
                  </span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${hour.value}%` }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${isTop ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-blue-400'}`}
                    />
                    {isTop && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                        🔥 Peak!
                      </span>
                    )}
                  </div>
                  <span className="w-8 text-sm font-bold text-gray-700">{hour.value}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <p className="text-sm text-orange-800">
              <strong>💡 Tip:</strong> Schedule your team to be most active between <strong>12pm - 6pm</strong> for best coverage.
            </p>
          </div>
        </div>
      </div>

      {/* --- RESPONSE TIME BREAKDOWN + CONVERSATION TOPICS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Response Times */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">���️</span>
              <h3 className="font-bold text-lg text-gray-900">Response Speed</h3>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
              Excellent
            </span>
          </div>

          <div className="space-y-4">
            {RESPONSE_TIMES.map((time, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{time.range}</span>
                  <span className="text-sm text-gray-500">{time.count} replies</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${time.percentage}%` }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-green-500' :
                      idx === 1 ? 'bg-blue-500' :
                      idx === 2 ? 'bg-yellow-500' :
                      'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Speed Medals */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-3xl">🥇</span>
              <p className="text-xs text-gray-500 mt-1">45% under 5min</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">🥈</span>
              <p className="text-xs text-gray-500 mt-1">30% under 15min</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">🥉</span>
              <p className="text-xs text-gray-500 mt-1">15% under 30min</p>
            </div>
          </div>
        </div>

        {/* What People Talk About */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💬</span>
            <h3 className="font-bold text-lg text-gray-900">What People Talk About</h3>
          </div>

          <div className="space-y-3">
            {TOP_CONVERSATIONS.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <span className="text-2xl">{topic.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{topic.title}</p>
                  <p className="text-sm text-gray-500">{topic.count} conversations</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  topic.sentiment === 'positive' ? 'bg-green-400' :
                  topic.sentiment === 'negative' ? 'bg-red-400' :
                  'bg-gray-300'
                }`} />
                <FiChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PLATFORM BREAKDOWN --- */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <h3 className="font-bold text-lg text-gray-900">By Platform</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_STATS.map((platform, idx) => (
            <motion.div
              key={platform.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer group"
            >
              {/* Platform Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${platform.color}15` }}
              >
                <platform.icon size={24} style={{ color: platform.color }} />
              </div>

              {/* Stats */}
              <p className="text-2xl font-black text-gray-900">{platform.messages}</p>
              <p className="text-sm text-gray-500 mb-3">messages</p>

              {/* Mini Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Replied</p>
                  <p className="font-bold text-gray-700">{platform.responseRate}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Happy</p>
                  <p className="font-bold text-gray-700">{platform.happyCustomers}%</p>
                </div>
              </div>

              {/* Top Emoji */}
              <div className="absolute top-4 right-4 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                {platform.topEmoji}
              </div>

              {/* Trend Arrow */}
              <div className={`absolute bottom-4 right-4 ${platform.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {platform.trend === 'up' ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- TEAM LEADERBOARD --- */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="font-bold text-xl">Team Leaderboard</h3>
              <p className="text-gray-400 text-sm">This week's champions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-5 rounded-2xl ${
                idx === 0 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                  : 'bg-white/10 backdrop-blur-sm'
              }`}
            >
              {/* Rank */}
              <div className={`absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                idx === 0 ? 'bg-yellow-300 text-yellow-800' :
                idx === 1 ? 'bg-gray-300 text-gray-700' :
                idx === 2 ? 'bg-amber-600 text-amber-100' :
                'bg-gray-600 text-gray-300'
              }`}>
                {idx + 1}
              </div>

              {/* Avatar */}
              <div className="text-4xl mb-3">{member.avatar}</div>

              {/* Name & Mood */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold">{member.name}</span>
                <span>{member.mood}</span>
              </div>

              {/* Stats */}
              <p className="text-2xl font-black">{member.replies}</p>
              <p className={`text-sm ${idx === 0 ? 'text-yellow-100' : 'text-gray-400'}`}>replies</p>

              {/* Streak */}
              <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                idx === 0 ? 'bg-yellow-400/30 text-yellow-100' : 'bg-white/10 text-gray-300'
              }`}>
                🔥 {member.streak} day streak
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- WEEKLY HIGHLIGHTS --- */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <h3 className="font-black text-2xl mb-6">✨ This Week's Highlights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fastest Reply */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <span className="text-3xl mb-3 block"></span>
              <p className="text-white/70 text-sm">Fastest reply</p>
              <p className="text-2xl font-black">47 seconds</p>
              <p className="text-sm text-white/60 mt-1">by Alex on Twitter</p>
            </div>

            {/* Longest Streak */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <span className="text-3xl mb-3 block"></span>
              <p className="text-white/70 text-sm">Best streak</p>
              <p className="text-2xl font-black">15 days</p>
              <p className="text-sm text-white/60 mt-1">Casey is on fire!</p>
            </div>

            {/* Most Helpful */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <span className="text-3xl mb-3 block"></span>
              <p className="text-white/70 text-sm">Most thanked</p>
              <p className="text-2xl font-black">Jordan</p>
              <p className="text-sm text-white/60 mt-1">23 "thank you" messages</p>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center gap-4">
            <span className="text-4xl">🎯</span>
            <div>
              <p className="font-bold">Fun fact of the week</p>
              <p className="text-white/80">Your team typed approximately 45,000 words this week — that's half a novel! 📚</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}