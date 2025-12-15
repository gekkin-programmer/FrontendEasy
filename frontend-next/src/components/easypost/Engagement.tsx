// src/components/easypost/Engagement.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, FiHeart, FiRepeat, FiAtSign, FiMail,
  FiFilter, FiCheck, FiCheckCircle, FiSearch, FiMoreHorizontal,
  FiSend, FiSmile, FiThumbsUp, FiThumbsDown, FiMinus,
  FiChevronDown, FiArchive, FiTrash2, FiUser,
  FiCpu, FiClock, FiExternalLink, FiRefreshCw, FiZap
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
    author: { name: 'Sarah Chen', handle: '@sarahchen', avatar: 'SC', verified: true, followers: 12400 },
    content: "Just discovered @easypost and it's a game changer for our social media workflow! 🚀 Highly recommend checking it out.",
    timestamp: '2m',
    aiSuggestions: [
      "Thanks so much Sarah! We're thrilled you're loving EasyPost! 💙",
      "Welcome aboard! Let us know if you need any help getting started! 🎉"
    ]
  },
  {
    id: 2,
    platform: 'instagram',
    type: 'comment',
    sentiment: 'question',
    status: 'unread',
    author: { name: 'Mike Johnson', handle: '@mikej_photo', avatar: 'MJ', followers: 8200 },
    content: "Love this! What camera settings did you use for this shot? Would love to recreate something similar 🙏",
    originalPost: "Behind the scenes of our latest product shoot...",
    timestamp: '15m',
    aiSuggestions: [
      "Shot on Sony A7IV, f/2.8, 1/200s, ISO 400! Happy to share more tips 📷"
    ]
  },
  {
    id: 3,
    platform: 'facebook',
    type: 'dm',
    sentiment: 'neutral',
    status: 'unread',
    author: { name: 'Emily Rose', handle: 'emily.rose', avatar: 'ER', followers: 540 },
    content: "Hi! I'm interested in your enterprise plan. Can someone from your team reach out to discuss pricing for 50+ users?",
    timestamp: '32m',
    aiSuggestions: [
      "Hi Emily! I'd love to help. Let me connect you with our enterprise team."
    ]
  },
  {
    id: 4,
    platform: 'twitter',
    type: 'reply',
    sentiment: 'negative',
    status: 'unread',
    author: { name: 'Alex Turner', handle: '@alexturner99', avatar: 'AT', followers: 320 },
    content: "The app keeps crashing when I try to schedule posts. Been happening for 3 days now. Very frustrating!",
    originalPost: "Excited to announce our new scheduling features!",
    timestamp: '1h',
    aiSuggestions: [
      "So sorry about this Alex! Can you DM us your device info? We'll fix this ASAP 🔧"
    ]
  },
  {
    id: 5,
    platform: 'linkedin',
    type: 'comment',
    sentiment: 'positive',
    status: 'read',
    author: { name: 'David Kim', handle: 'david-kim-cto', avatar: 'DK', verified: true, followers: 45000 },
    content: "Great insights on social media automation. We've been using similar strategies at our company with excellent results.",
    originalPost: "5 Ways AI is Revolutionizing Social Media Management",
    timestamp: '2h',
    assignedTo: 'Marketing Team',
  },
];

// --- CONFIGS ---
const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  linkedin: <FaLinkedin />,
  tiktok: <FaTiktok />,
};

const PLATFORM_STYLES: Record<Platform, string> = {
  twitter: 'text-gray-900',
  instagram: 'text-gray-900',
  facebook: 'text-gray-900',
  linkedin: 'text-gray-900',
  tiktok: 'text-gray-900',
};

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  positive: 'text-green-600 bg-green-50 border-green-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  question: 'text-blue-600 bg-blue-50 border-blue-200',
};

// --- MAIN COMPONENT ---
export default function Engagement() {
  const [engagements, setEngagements] = useState<Engagement[]>(MOCK_ENGAGEMENTS);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const activeEngagement = engagements.find(e => e.id === activeId);

  const handleReply = () => {
    if (!activeId) return;
    setEngagements(prev => prev.map(e => e.id === activeId ? { ...e, status: 'replied' } : e));
    setReplyText('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      
      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r border-gray-200 bg-white">
        
        {/* Header & Filters */}
        <div className="p-3 border-b border-gray-200 flex flex-col gap-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 px-1">Inbox</h2>
            <div className="flex gap-1">
                <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"><FiFilter size={14} /></button>
                <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"><FiRefreshCw size={14} /></button>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter messages..." 
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <FilterBadge label="All" active />
             <FilterBadge label="Unread" count={4} />
             <FilterBadge label="Mentions" />
             <FilterBadge label="DMs" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {engagements.map((e) => (
            <div 
              key={e.id}
              onClick={() => setActiveId(e.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group relative ${activeId === e.id ? 'bg-blue-50/50' : ''}`}
            >
              {activeId === e.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600" />}
              <div className="flex gap-3">
                 <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-100">
                        {e.author.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                        <span className={`text-[10px] ${PLATFORM_STYLES[e.platform]}`}>{PLATFORM_ICONS[e.platform]}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-sm font-medium truncate ${e.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                            {e.author.name}
                        </span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{e.timestamp}</span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${e.status === 'unread' ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {e.content}
                    </p>
                    <div className="flex gap-2 mt-2">
                         {e.status === 'replied' && (
                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                 <FiCheck size={8} /> Replied
                             </span>
                         )}
                         <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${SENTIMENT_STYLES[e.sentiment]}`}>
                             {e.sentiment}
                         </span>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: DETAIL VIEW */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeEngagement ? (
           <>
             {/* Toolbar */}
             <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px]">{activeEngagement.author.avatar}</div>
                   </div>
                   <span className="text-sm font-medium text-gray-900">{activeEngagement.author.name}</span>
                   <span className="text-xs text-gray-400">{activeEngagement.author.handle}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ActionButton icon={<FiCheckCircle />} tooltip="Mark resolved" />
                    <ActionButton icon={<FiArchive />} tooltip="Archive" />
                    <ActionButton icon={<FiTrash2 />} tooltip="Delete" />
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <ActionButton icon={<FiMoreHorizontal />} />
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                 {/* Thread View */}
                 <div className="max-w-3xl mx-auto space-y-6">
                     
                     {/* Context (Original Post) */}
                     {activeEngagement.originalPost && (
                         <div className="flex gap-4 opacity-60 hover:opacity-100 transition-opacity">
                             <div className="w-8 flex flex-col items-center pt-2">
                                 <div className="w-0.5 h-full bg-gray-200" />
                             </div>
                             <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 shadow-sm">
                                 <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Replied to post</p>
                                 <p className="text-sm text-gray-600">{activeEngagement.originalPost}</p>
                             </div>
                         </div>
                     )}

                     {/* The Message */}
                     <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-100 shadow-sm z-10">
                            {activeEngagement.author.avatar}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex justify-between mb-2">
                                     <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-sm">{activeEngagement.author.name}</span>
                                        <span className="text-xs text-gray-400">{activeEngagement.timestamp} ago</span>
                                     </div>
                                     <span className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiExternalLink size={12} /></span>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed">{activeEngagement.content}</p>
                             </div>
                             
                             {/* AI Suggestions */}
                             {activeEngagement.aiSuggestions && (
                                <div className="mt-4 space-y-2">
                                   <div className="flex items-center gap-2 text-xs font-medium text-violet-600 mb-2">
                                      <FiZap size={12} />
                                      <span>AI Suggested Replies</span>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                      {activeEngagement.aiSuggestions.map((s, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => setReplyText(s)}
                                            className="text-left text-xs bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-100 px-3 py-2 rounded-lg transition-colors max-w-xl"
                                          >
                                            {s}
                                          </button>
                                      ))}
                                   </div>
                                </div>
                             )}
                         </div>
                     </div>
                 </div>
             </div>

             {/* Composer */}
             <div className="p-4 bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border border-gray-300 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-gray-900 focus-within:border-gray-900 transition-all bg-white">
                        <textarea 
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           className="w-full p-3 text-sm focus:outline-none bg-transparent resize-none min-h-[80px]"
                           placeholder={`Reply to ${activeEngagement.author.handle}...`}
                        />
                        <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                            <div className="flex gap-1">
                                <IconButton icon={<FiSmile />} />
                                <IconButton icon={<FiUser />} />
                            </div>
                            <button 
                                onClick={handleReply}
                                disabled={!replyText}
                                className="bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <FiSend size={12} /> Reply
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <p className="text-[10px] text-gray-400">Press <span className="font-mono bg-gray-100 px-1 rounded">Cmd+Enter</span> to send</p>
                    </div>
                </div>
             </div>
           </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiMessageCircle size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No message selected</p>
                <p className="text-xs text-gray-500 mt-1">Select an item from the inbox to view details.</p>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const FilterBadge = ({ label, active, count }: { label: string, active?: boolean, count?: number }) => (
    <button className={`
        whitespace-nowrap px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5
        ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
    `}>
        {label}
        {count && <span className={`px-1 rounded-full text-[9px] ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>}
    </button>
);

const ActionButton = ({ icon, tooltip }: { icon: React.ReactNode, tooltip?: string }) => (
    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" title={tooltip}>
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </button>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors">
        {React.cloneElement(icon as React.ReactElement, { size: 14 })}
    </button>
);