'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, FiHeart, FiRepeat, FiAtSign, FiMail,
  FiFilter, FiCheck, FiCheckCircle, FiSearch, FiMoreHorizontal,
  FiSend, FiSmile, FiThumbsUp, FiThumbsDown, FiMinus,
  FiChevronDown, FiX, FiArchive, FiTrash2, FiUser,
  FiCpu, FiClock, FiExternalLink, FiRefreshCw
} from 'react-icons/fi';
import { 
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok 
} from 'react-icons/fa';

// --- TYPES ---
type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
type EngagementType = 'comment' | 'mention' | 'dm' | 'reply' | 'like' | 'repost';
type Sentiment = 'positive' | 'negative' | 'neutral' | 'question';
type Status = 'unread' | 'read' | 'replied' | 'archived';

interface Engagement {
  id: number;
  platform: Platform;
  type: EngagementType;
  sentiment: Sentiment;
  status: Status;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    followers?: number;
  };
  content: string;
  originalPost?: string;
  timestamp: string;
  assignedTo?: string;
  aiSuggestions?: string[];
}

// --- MOCK DATA ---
const MOCK_ENGAGEMENTS: Engagement[] = [
  {
    id: 1,
    platform: 'twitter',
    type: 'mention',
    sentiment: 'positive',
    status: 'unread',
    author: { name: 'Sarah Chen', handle: '@sarahchen', avatar: '👩‍💻', verified: true, followers: 12400 },
    content: "Just discovered @easypost and it's a game changer for our social media workflow! 🚀 Highly recommend checking it out.",
    timestamp: '2 min ago',
    aiSuggestions: [
      "Thanks so much Sarah! We're thrilled you're loving EasyPost! 💙",
      "Welcome aboard! Let us know if you need any help getting started! 🎉",
      "That means a lot! Enjoy scheduling your posts effortlessly! ✨"
    ]
  },
  {
    id: 2,
    platform: 'instagram',
    type: 'comment',
    sentiment: 'question',
    status: 'unread',
    author: { name: 'Mike Johnson', handle: '@mikej_photo', avatar: '📸', followers: 8200 },
    content: "Love this! What camera settings did you use for this shot? Would love to recreate something similar 🙏",
    originalPost: "Behind the scenes of our latest product shoot...",
    timestamp: '15 min ago',
    aiSuggestions: [
      "Shot on Sony A7IV, f/2.8, 1/200s, ISO 400! Happy to share more tips 📷",
      "Thanks Mike! It was natural lighting with a 50mm lens. DM for details!",
    ]
  },
  {
    id: 3,
    platform: 'facebook',
    type: 'dm',
    sentiment: 'neutral',
    status: 'unread',
    author: { name: 'Emily Rose', handle: 'emily.rose', avatar: '🌹', followers: 540 },
    content: "Hi! I'm interested in your enterprise plan. Can someone from your team reach out to discuss pricing for 50+ users?",
    timestamp: '32 min ago',
    aiSuggestions: [
      "Hi Emily! I'd love to help. Let me connect you with our enterprise team. What's the best email to reach you?",
      "Thanks for reaching out! Our enterprise plans start at $X/month. Want to schedule a quick call?",
    ]
  },
  {
    id: 4,
    platform: 'twitter',
    type: 'reply',
    sentiment: 'negative',
    status: 'unread',
    author: { name: 'Alex Turner', handle: '@alexturner99', avatar: '😤', followers: 320 },
    content: "The app keeps crashing when I try to schedule posts. Been happening for 3 days now. Very frustrating!",
    originalPost: "Excited to announce our new scheduling features!",
    timestamp: '1 hour ago',
    aiSuggestions: [
      "So sorry about this Alex! Can you DM us your device info? We'll fix this ASAP 🔧",
      "We apologize for the trouble. Our team is looking into this. Try clearing cache in the meantime!",
    ]
  },
  {
    id: 5,
    platform: 'linkedin',
    type: 'comment',
    sentiment: 'positive',
    status: 'read',
    author: { name: 'David Kim', handle: 'david-kim-cto', avatar: '💼', verified: true, followers: 45000 },
    content: "Great insights on social media automation. We've been using similar strategies at our company with excellent results. Would love to connect!",
    originalPost: "5 Ways AI is Revolutionizing Social Media Management",
    timestamp: '2 hours ago',
    assignedTo: 'Marketing Team',
  },
  {
    id: 6,
    platform: 'instagram',
    type: 'mention',
    sentiment: 'positive',
    status: 'replied',
    author: { name: 'Jessica Alba', handle: '@jessicaalba', avatar: '⭐', verified: true, followers: 1200000 },
    content: "Been using @easypost for my brand and absolutely loving the analytics dashboard! 📊✨",
    timestamp: '3 hours ago',
  },
  {
    id: 7,
    platform: 'tiktok',
    type: 'comment',
    sentiment: 'question',
    status: 'unread',
    author: { name: 'GenZ Creator', handle: '@genz_vibes', avatar: '🎬', followers: 89000 },
    content: "Wait this app works with TikTok too?? Need this in my life rn 😭 How do I sign up??",
    originalPost: "How we manage 10 social accounts in 10 minutes",
    timestamp: '4 hours ago',
    aiSuggestions: [
      "Yes we do! 🎉 Head to easypost.com and start your free trial today!",
      "Absolutely! Full TikTok integration is live. Link in bio to get started! 🚀",
    ]
  },
  {
    id: 8,
    platform: 'twitter',
    type: 'repost',
    sentiment: 'positive',
    status: 'read',
    author: { name: 'TechCrunch', handle: '@TechCrunch', avatar: '📰', verified: true, followers: 12500000 },
    content: "Retweeted your post about AI content generation",
    originalPost: "Introducing EasyAI: Your AI-powered content assistant",
    timestamp: '5 hours ago',
  },
];

// --- PLATFORM CONFIG ---
const PLATFORM_CONFIG: Record<Platform, { icon: any; color: string; bg: string }> = {
  twitter: { icon: FaTwitter, color: 'text-sky-500', bg: 'bg-sky-50' },
  instagram: { icon: FaInstagram, color: 'text-pink-500', bg: 'bg-pink-50' },
  facebook: { icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  linkedin: { icon: FaLinkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
  tiktok: { icon: FaTiktok, color: 'text-gray-900', bg: 'bg-gray-100' },
};

const TYPE_CONFIG: Record<EngagementType, { icon: any; label: string }> = {
  comment: { icon: FiMessageCircle, label: 'Comment' },
  mention: { icon: FiAtSign, label: 'Mention' },
  dm: { icon: FiMail, label: 'Direct Message' },
  reply: { icon: FiMessageCircle, label: 'Reply' },
  like: { icon: FiHeart, label: 'Like' },
  repost: { icon: FiRepeat, label: 'Repost' },
};

const SENTIMENT_CONFIG: Record<Sentiment, { icon: any; color: string; bg: string; label: string }> = {
  positive: { icon: FiThumbsUp, color: 'text-green-600', bg: 'bg-green-100', label: 'Positive' },
  negative: { icon: FiThumbsDown, color: 'text-red-600', bg: 'bg-red-100', label: 'Negative' },
  neutral: { icon: FiMinus, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Neutral' },
  question: { icon: FiMessageCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Question' },
};

// --- MAIN COMPONENT ---
export default function Engagement() {
  const [engagements, setEngagements] = useState<Engagement[]>(MOCK_ENGAGEMENTS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeEngagement, setActiveEngagement] = useState<Engagement | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EngagementType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const unreadCount = engagements.filter(e => e.status === 'unread').length;
  const needsAttention = engagements.filter(e => e.sentiment === 'negative' && e.status === 'unread').length;

  // Filter Logic
  const filteredEngagements = engagements.filter(e => {
    if (platformFilter !== 'all' && e.platform !== platformFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (sentimentFilter !== 'all' && e.sentiment !== sentimentFilter) return false;
    if (searchQuery && !e.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !e.author.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEngagements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEngagements.map(e => e.id));
    }
  };

  const handleMarkAsRead = (ids: number[]) => {
    setEngagements(prev => prev.map(e => 
      ids.includes(e.id) ? { ...e, status: 'read' as Status } : e
    ));
    setSelectedIds([]);
  };

  const handleArchive = (ids: number[]) => {
    setEngagements(prev => prev.map(e => 
      ids.includes(e.id) ? { ...e, status: 'archived' as Status } : e
    ));
    setSelectedIds([]);
  };

  const handleReply = async () => {
    if (!activeEngagement || !replyText.trim()) return;
    setIsReplying(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEngagements(prev => prev.map(e => 
      e.id === activeEngagement.id ? { ...e, status: 'replied' as Status } : e
    ));
    
    setReplyText('');
    setIsReplying(false);
    setActiveEngagement(null);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  // Simulate new incoming engagement
  useEffect(() => {
    const interval = setInterval(() => {
      const platforms: Platform[] = ['twitter', 'instagram', 'facebook'];
      const types: EngagementType[] = ['comment', 'mention', 'reply'];
      const sentiments: Sentiment[] = ['positive', 'neutral', 'question'];
      
      const newEngagement: Engagement = {
        id: Date.now(),
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        type: types[Math.floor(Math.random() * types.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        status: 'unread',
        author: {
          name: `User ${Math.floor(Math.random() * 1000)}`,
          handle: `@user${Math.floor(Math.random() * 1000)}`,
          avatar: ['😀', '🎨', '🚀', '💡', '🎯'][Math.floor(Math.random() * 5)],
          followers: Math.floor(Math.random() * 10000),
        },
        content: [
          "This is exactly what I needed! Thanks for sharing!",
          "How does this compare to other tools in the market?",
          "Amazing content as always! Keep it up! 🔥",
          "Can you do a tutorial on this?",
          "Just signed up, excited to try this out!"
        ][Math.floor(Math.random() * 5)],
        timestamp: 'Just now',
        aiSuggestions: ["Thanks for your feedback! 💙", "We appreciate your support! 🙌"],
      };
      
      setEngagements(prev => [newEngagement, ...prev.slice(0, 49)]);
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* --- LEFT PANEL: INBOX LIST --- */}
      <div className="w-full lg:w-[400px] border-r border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-gray-800">Inbox</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
              {needsAttention > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {needsAttention} urgent
                </span>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <FiFilter size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {/* Platform Filter */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Platform</label>
                    <div className="flex flex-wrap gap-1">
                      <FilterChip 
                        active={platformFilter === 'all'} 
                        onClick={() => setPlatformFilter('all')}
                      >
                        All
                      </FilterChip>
                      {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                        <FilterChip
                          key={key}
                          active={platformFilter === key}
                          onClick={() => setPlatformFilter(key as Platform)}
                        >
                          <config.icon size={12} className={config.color} />
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Type</label>
                    <div className="flex flex-wrap gap-1">
                      <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All</FilterChip>
                      <FilterChip active={typeFilter === 'comment'} onClick={() => setTypeFilter('comment')}>Comments</FilterChip>
                      <FilterChip active={typeFilter === 'mention'} onClick={() => setTypeFilter('mention')}>Mentions</FilterChip>
                      <FilterChip active={typeFilter === 'dm'} onClick={() => setTypeFilter('dm')}>DMs</FilterChip>
                    </div>
                  </div>

                  {/* Sentiment Filter */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Sentiment</label>
                    <div className="flex flex-wrap gap-1">
                      <FilterChip active={sentimentFilter === 'all'} onClick={() => setSentimentFilter('all')}>All</FilterChip>
                      {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => (
                        <FilterChip
                          key={key}
                          active={sentimentFilter === key}
                          onClick={() => setSentimentFilter(key as Sentiment)}
                        >
                          <config.icon size={12} className={config.color} /> {config.label}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Status</label>
                    <div className="flex flex-wrap gap-1">
                      <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</FilterChip>
                      <FilterChip active={statusFilter === 'unread'} onClick={() => setStatusFilter('unread')}>Unread</FilterChip>
                      <FilterChip active={statusFilter === 'read'} onClick={() => setStatusFilter('read')}>Read</FilterChip>
                      <FilterChip active={statusFilter === 'replied'} onClick={() => setStatusFilter('replied')}>Replied</FilterChip>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.length} selected
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleMarkAsRead(selectedIds)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <FiCheck size={14} /> Mark Read
                </button>
                <button 
                  onClick={() => handleArchive(selectedIds)}
                  className="text-xs font-bold text-gray-600 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiArchive size={14} /> Archive
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select All */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredEngagements.length && filteredEngagements.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Select all
          </label>
          <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Engagement List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredEngagements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FiMessageCircle size={48} className="mb-4 opacity-50" />
                <p className="font-medium">No messages found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredEngagements.map((engagement, index) => (
                <EngagementCard
                  key={engagement.id}
                  engagement={engagement}
                  isSelected={selectedIds.includes(engagement.id)}
                  isActive={activeEngagement?.id === engagement.id}
                  onSelect={() => handleSelect(engagement.id)}
                  onClick={() => {
                    setActiveEngagement(engagement);
                    if (engagement.status === 'unread') {
                      handleMarkAsRead([engagement.id]);
                    }
                  }}
                  index={index}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- RIGHT PANEL: DETAIL VIEW --- */}
      <div className="hidden lg:flex flex-1 flex-col bg-gray-50">
        <AnimatePresence mode="wait">
          {activeEngagement ? (
            <motion.div
              key={activeEngagement.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Detail Header */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {activeEngagement.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {activeEngagement.author.name}
                        </h3>
                        {activeEngagement.author.verified && (
                          <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <FiCheck size={12} className="text-white" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{activeEngagement.author.handle}</p>
                      {activeEngagement.author.followers && (
                        <p className="text-xs text-gray-400 mt-1">
                          {activeEngagement.author.followers.toLocaleString()} followers
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Platform Badge */}
                    <div className={`p-2 rounded-lg ${PLATFORM_CONFIG[activeEngagement.platform].bg}`}>
                      {React.createElement(PLATFORM_CONFIG[activeEngagement.platform].icon, {
                        className: PLATFORM_CONFIG[activeEngagement.platform].color,
                        size: 20
                      })}
                    </div>
                    {/* Sentiment Badge */}
                    <div className={`px-3 py-1.5 rounded-lg ${SENTIMENT_CONFIG[activeEngagement.sentiment].bg} flex items-center gap-1.5`}>
                      {React.createElement(SENTIMENT_CONFIG[activeEngagement.sentiment].icon, {
                        className: SENTIMENT_CONFIG[activeEngagement.sentiment].color,
                        size: 14
                      })}
                      <span className={`text-xs font-bold ${SENTIMENT_CONFIG[activeEngagement.sentiment].color}`}>
                        {SENTIMENT_CONFIG[activeEngagement.sentiment].label}
                      </span>
                    </div>
                    {/* More Options */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <FiMoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Original Post Reference */}
                {activeEngagement.originalPost && (
                  <div className="mb-4 p-4 bg-gray-100 rounded-xl border-l-4 border-gray-300">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      {activeEngagement.type === 'comment' ? 'Commented on:' : 'In reply to:'}
                    </p>
                    <p className="text-sm text-gray-600">{activeEngagement.originalPost}</p>
                  </div>
                )}

                {/* Main Message */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${PLATFORM_CONFIG[activeEngagement.platform].bg} ${PLATFORM_CONFIG[activeEngagement.platform].color}`}>
                      {TYPE_CONFIG[activeEngagement.type].label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock size={12} /> {activeEngagement.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {activeEngagement.content}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <FiHeart size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">
                      <FiExternalLink size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <FiArchive size={18} />
                    </button>
                  </div>
                </div>

                {/* AI Suggestions */}
                {activeEngagement.aiSuggestions && activeEngagement.aiSuggestions.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <FiCpu size={12} className="text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">AI Suggested Replies</span>
                    </div>
                    <div className="space-y-2">
                      {activeEngagement.aiSuggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => handleUseSuggestion(suggestion)}
                          className="w-full p-4 bg-white border border-purple-100 rounded-xl text-left text-sm text-gray-700 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span>{suggestion}</span>
                            <span className="text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Use this →
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <FiSmile size={18} />
                      </button>
                      <span className="text-xs text-gray-400">
                        {replyText.length}/280
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || isReplying}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isReplying ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <FiRefreshCw size={18} />
                      </motion.div>
                    ) : (
                      <>
                        <FiSend size={18} /> Reply
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">Quick:</span>
                  {['Thanks! 🙏', 'Great question!', 'DM sent! 📩'].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setReplyText(quick)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-400"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <FiMessageCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Select a message</h3>
              <p className="text-sm text-gray-400">Choose a conversation from the inbox to view details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const FilterChip = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
    }`}
  >
    {children}
  </button>
);

const EngagementCard = ({ 
  engagement, 
  isSelected, 
  isActive,
  onSelect, 
  onClick,
  index 
}: { 
  engagement: Engagement; 
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void; 
  onClick: () => void;
  index: number;
}) => {
  const platform = PLATFORM_CONFIG[engagement.platform];
  const sentiment = SENTIMENT_CONFIG[engagement.sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative border-b border-gray-100 cursor-pointer transition-all ${
        isActive ? 'bg-blue-50' : engagement.status === 'unread' ? 'bg-white' : 'bg-gray-50/50'
      } hover:bg-blue-50/50`}
    >
      {/* Unread Indicator */}
      {engagement.status === 'unread' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}

      <div className="p-4 flex gap-3">
        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0" onClick={onClick}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
            {engagement.author.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${platform.bg} border-2 border-white`}>
            {React.createElement(platform.icon, { size: 10, className: platform.color })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-sm ${engagement.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
              {engagement.author.name}
            </span>
            {engagement.author.verified && (
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <FiCheck size={10} className="text-white" />
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded ${sentiment.bg} ${sentiment.color}`}>
              {React.createElement(sentiment.icon, { size: 10 })}
            </span>
          </div>
          <p className={`text-sm line-clamp-2 ${engagement.status === 'unread' ? 'text-gray-700' : 'text-gray-500'}`}>
            {engagement.content}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{engagement.timestamp}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className={`text-xs ${platform.color}`}>
              {TYPE_CONFIG[engagement.type].label}
            </span>
            {engagement.status === 'replied' && (
              <>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <FiCheckCircle size={10} /> Replied
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};