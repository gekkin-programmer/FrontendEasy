'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle, FiSend, FiPaperclip, FiSmile, FiMoreHorizontal,
  FiChevronLeft, FiExternalLink, FiClock, FiCheck, FiCheckCircle,
  FiUser, FiStar, FiAlertCircle, FiEdit3, FiTrash2, FiCopy, FiLoader
} from 'react-icons/fi';
import { FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

// --- TYPES ---
interface Message {
  id: number;
  sender: 'customer' | 'team';
  author?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isInternal?: boolean;
}

interface Conversation {
  id: number;
  platform: 'twitter' | 'instagram' | 'facebook';
  customer: {
    name: string;
    handle: string;
    avatar: string;
    followers: number;
    isVIP: boolean;
  };
  originalPost?: {
    content: string;
    media?: string;
    timestamp: string;
  };
  messages: Message[];
  status: 'open' | 'pending' | 'resolved';
  assignedTo?: string;
  tags?: string[];
}

// --- MOCK DATA ---
const MOCK_CONVERSATION: Conversation = {
  id: 1,
  platform: 'twitter',
  customer: {
    name: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: '👩‍💻',
    followers: 12400,
    isVIP: true,
  },
  originalPost: {
    content: "Just launched our new AI-powered scheduling feature! 🚀 What do you think?",
    timestamp: '2 hours ago',
  },
  messages: [
    {
      id: 1,
      sender: 'customer',
      content: "This is amazing! I've been waiting for an AI scheduling feature. Quick question - does it work with TikTok as well?",
      timestamp: '1h 45m ago',
    },
    {
      id: 2,
      sender: 'team',
      author: { name: 'Alex Rivera', avatar: '👨‍💼' },
      content: "Hi Sarah! 👋 Thanks so much for the kind words! Yes, our AI scheduling works seamlessly with TikTok - you can auto-schedule based on your audience's peak engagement times.",
      timestamp: '1h 30m ago',
      status: 'read',
    },
    {
      id: 3,
      sender: 'customer',
      content: "That's exactly what I needed! One more thing - is there a way to bulk schedule posts? I have about 50 posts ready to go.",
      timestamp: '1h 15m ago',
    },
    {
      id: 4,
      sender: 'team',
      author: { name: 'Alex Rivera', avatar: '👨‍💼' },
      content: "Absolutely! You can use our CSV upload feature for bulk scheduling. I'll send you a quick guide. Also, Pro tip: our AI can analyze your content and suggest optimal times for each post! 📊",
      timestamp: '1h ago',
      status: 'read',
    },
    {
      id: 5,
      sender: 'team',
      author: { name: 'Jordan Lee', avatar: '👩‍💻' },
      content: "Adding to Alex's message - here's the link to our bulk upload guide: docs.eazlypost.com/bulk-upload. Let us know if you have any questions!",
      timestamp: '55m ago',
      status: 'delivered',
      isInternal: false,
    },
    {
      id: 6,
      sender: 'team',
      author: { name: 'Jordan Lee', avatar: '👩‍💻' },
      content: "📝 Internal note: Sarah is a VIP customer with high engagement. Flagging for potential case study opportunity.",
      timestamp: '50m ago',
      isInternal: true,
    },
    {
      id: 7,
      sender: 'customer',
      content: "You guys are the best! Just tried it and it worked perfectly. Definitely recommending Eazlypost to my network! 💙",
      timestamp: '30m ago',
    },
  ],
  status: 'open',
  assignedTo: 'Alex Rivera',
  tags: ['VIP', 'Feature Question', 'Positive'],
};

const PLATFORM_CONFIG = {
  twitter: { icon: FaTwitter, color: 'text-sky-500', bg: 'bg-sky-50', name: 'Twitter' },
  instagram: { icon: FaInstagram, color: 'text-pink-500', bg: 'bg-pink-50', name: 'Instagram' },
  facebook: { icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-50', name: 'Facebook' },
};

interface ConversationThreadProps {
  conversationId?: number;
  onBack?: () => void;
}

export default function ConversationThread({ conversationId, onBack }: ConversationThreadProps) {
  const [conversation] = useState<Conversation>(MOCK_CONVERSATION);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showActions, setShowActions] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const platform = PLATFORM_CONFIG[conversation.platform];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: wire up real send API call here
    
    setReplyText('');
    setIsSending(false);
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black font-sans text-black dark:text-white transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white p-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              >
                <FiChevronLeft size={20} strokeWidth={3} />
              </button>
            )}
            
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white flex items-center justify-center text-xl shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                {conversation.customer.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-2 border-black dark:border-white ${platform.bg} flex items-center justify-center z-10`}>
                <platform.icon className={platform.color} size={12} />
              </div>
              {conversation.customer.isVIP && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 border border-black flex items-center justify-center z-10">
                  <FiStar size={10} className="text-black" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black uppercase tracking-tight text-black dark:text-white">{conversation.customer.name}</h3>
                {conversation.customer.isVIP && (
                  <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 border border-black font-black uppercase">VIP</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-zinc-400 uppercase">
                <span>{conversation.customer.handle}</span>
                <span>•</span>
                <span>{conversation.customer.followers.toLocaleString()} nodes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <select 
              value={conversation.status}
              className={`text-xs font-black uppercase px-3 py-1.5 border-2 border-black cursor-pointer appearance-none ${
                conversation.status === 'open' ? 'bg-green-400 text-black' :
                conversation.status === 'pending' ? 'bg-yellow-400 text-black' :
                'bg-gray-200 text-black'
              }`}
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <button className="p-2 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all">
              <FiExternalLink size={18} strokeWidth={2.5} />
            </button>
            <button className="p-2 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all">
              <FiMoreHorizontal size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 ml-16">
            {conversation.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-black uppercase bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-1 border-2 border-black dark:border-white"
              >
                {tag}
              </span>
            ))}
            <button className="text-[10px] font-black uppercase text-[#174CD2] dark:text-blue-400 hover:underline">+ ADD_TAG</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] dark:opacity-90">
        
        {/* Original Post Context */}
        {conversation.originalPost && (
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 mb-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 mb-2 uppercase">
              <platform.icon className={platform.color} size={12} />
              <span>Stream context: {platform.name}</span>
              <span>•</span>
              <span>{conversation.originalPost.timestamp}</span>
            </div>
            <p className="text-sm font-bold text-black dark:text-white leading-relaxed">{conversation.originalPost.content}</p>
          </div>
        )}

        {/* Message Thread */}
        <AnimatePresence>
          {conversation.messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.sender === 'team' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${message.sender === 'team' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] ${message.sender === 'team' ? 'order-2' : ''}`}
                onMouseEnter={() => setShowActions(message.id)}
                onMouseLeave={() => setShowActions(null)}
              >
                {/* Internal Note Badge */}
                {message.isInternal && (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-600 mb-1">
                    <FiAlertCircle size={12} />
                    <span>Internal Note</span>
                  </div>
                )}
                
                <div className={`relative group border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] ${
                  message.isInternal 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-dashed' 
                    : message.sender === 'team' 
                      ? 'bg-[#174CD2] text-white' 
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}>
                  {/* Team Author Info */}
                  {message.sender === 'team' && message.author && !message.isInternal && (
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                      <span className="text-sm border border-white p-0.5">{message.author.avatar}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider">{message.author.name}</span>
                    </div>
                  )}
                  
                  {message.isInternal && message.author && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm border border-black dark:border-white p-0.5">{message.author.avatar}</span>
                      <span className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-500">{message.author.name}</span>
                    </div>
                  )}
                  
                  <p className={`text-sm font-medium leading-relaxed ${message.isInternal ? 'text-yellow-900 dark:text-yellow-200' : ''}`}>
                    {message.content}
                  </p>
                  
                  <div className={`flex items-center justify-between mt-3 text-[9px] font-mono font-bold uppercase ${
                    message.isInternal ? 'text-yellow-600 dark:text-yellow-500' : message.sender === 'team' ? 'text-blue-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}>
                    <span className="flex items-center gap-1">
                      <FiClock size={10} />
                      {message.timestamp}
                    </span>
                    
                    {message.sender === 'team' && message.status && !message.isInternal && (
                      <span className="flex items-center gap-1">
                        {message.status === 'read' ? (
                          <><FiCheckCircle size={10} /> Read</>
                        ) : message.status === 'delivered' ? (
                          <><FiCheck size={10} /> Delivered</>
                        ) : (
                          <><FiCheck size={10} /> Sent</>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Message Actions */}
                  <AnimatePresence>
                    {showActions === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute ${message.sender === 'team' ? '-left-24' : '-right-24'} top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-zinc-900 shadow-xl p-1 border-2 border-black dark:border-white z-20`}
                      >
                        <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-zinc-800 text-black dark:text-white"><FiCopy size={14} /></button>
                        <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-zinc-800 text-black dark:text-white"><FiEdit3 size={14} /></button>
                        <button className="p-1.5 hover:bg-red-500 hover:text-white text-red-500"><FiTrash2 size={14} /></button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      <div className="bg-white dark:bg-zinc-900 border-t-2 border-black dark:border-white p-6 transition-colors shadow-[0px_-4px_10px_rgba(0,0,0,0.05)]">
        {/* Toggle: Public Reply vs Internal Note */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsInternalNote(false)}
            className={`px-4 py-2 border-2 border-black dark:border-white text-xs font-black uppercase transition-all ${
              !isInternalNote 
                ? 'bg-[#174CD2] text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] -translate-y-0.5' 
                : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-blue-50'
            }`}
          >
            <FiSend size={12} className="inline mr-2" strokeWidth={3} />
            Channel Reply
          </button>
          <button
            onClick={() => setIsInternalNote(true)}
            className={`px-4 py-2 border-2 border-black dark:border-white text-xs font-black uppercase transition-all ${
              isInternalNote 
                ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] -translate-y-0.5' 
                : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-50'
            }`}
          >
            <FiEdit3 size={12} className="inline mr-2" strokeWidth={3} />
            Internal Note
          </button>
        </div>

        <div className={`border-2 border-black dark:border-white transition-all shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden ${
          isInternalNote ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-white dark:bg-zinc-800'
        }`}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isInternalNote ? "ADD_INTERNAL_LOG (TEAM_ONLY)..." : "TYPE_RESPONSE_STREAM..."}
            rows={3}
            className={`w-full px-4 py-4 bg-transparent resize-none focus:outline-none text-sm font-bold uppercase placeholder:text-gray-300 dark:placeholder:text-zinc-600 text-black dark:text-white`}
          />
          
          <div className="flex items-center justify-between px-4 py-3 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <button className="p-2 border-2 border-transparent hover:border-black dark:hover:border-white transition-all text-black dark:text-white">
                <FiPaperclip size={18} strokeWidth={2.5} />
              </button>
              <button className="p-2 border-2 border-transparent hover:border-black dark:hover:border-white transition-all text-black dark:text-white">
                <FiSmile size={18} strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-mono font-black text-gray-400 dark:text-zinc-500">{replyText.length}/280_BYTES</span>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || isSending}
              className={`px-8 py-2 border-2 border-black dark:border-white font-black text-xs uppercase transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                isInternalNote 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-black dark:bg-white text-white dark:text-black'
              }`}
            >
              {isSending ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <>
                  {isInternalNote ? <FiEdit3 size={16} /> : <FiSend size={16} />}
                  {isInternalNote ? 'LOG_NOTE' : 'TRANSMIT'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 mr-2">Quick:</span>
          {[
            "Copy that! 🙏",
            "On it right now!",
            "Roger that! 🚀",
            "Any other signals?",
          ].map((quick, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(quick)}
              className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-[10px] font-black uppercase text-black dark:text-white hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* AI Suggestions */}
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(168,85,247,0.4)]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-2">
            <span className="w-5 h-5 bg-purple-600 text-white flex items-center justify-center text-[10px] border border-black shadow-[1px_1px_0px_0px_#000]">AI</span>
            SUGGESTED_RESPONSE
          </div>
          <button
            onClick={() => handleQuickReply("That's wonderful to hear, Sarah! We're so glad the bulk upload feature worked perfectly for you. If you'd like, we'd love to feature your experience in a case study!")}
            className="text-xs font-bold text-left text-black dark:text-white hover:text-[#174CD2] dark:hover:text-blue-400 transition-colors leading-relaxed"
          >
            &ldquo;That&apos;s wonderful to hear, Sarah! We&apos;re so glad the bulk upload feature worked perfectly for you...&rdquo;
            <span className="text-[#174CD2] dark:text-blue-400 font-black ml-2 uppercase">Apply →</span>
          </button>
        </div>
      </div>
    </div>
  );
}