'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle, FiSend, FiPaperclip, FiSmile, FiMoreHorizontal,
  FiChevronLeft, FiExternalLink, FiClock, FiCheck, FiCheckCircle,
  FiUser, FiStar, FiAlertCircle, FiEdit3, FiTrash2, FiCopy
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
      content: "Adding to Alex's message - here's the link to our bulk upload guide: docs.easypost.com/bulk-upload. Let us know if you have any questions!",
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
      content: "You guys are the best! Just tried it and it worked perfectly. Definitely recommending EasyPost to my network! 💙",
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
    
    // Add message to conversation (in real app, this would update state)
    console.log('Sending:', { text: replyText, isInternal: isInternalNote });
    
    setReplyText('');
    setIsSending(false);
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
            )}
            
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {conversation.customer.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${platform.bg} flex items-center justify-center border-2 border-white`}>
                <platform.icon className={platform.color} size={12} />
              </div>
              {conversation.customer.isVIP && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FiStar size={10} className="text-white" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">{conversation.customer.name}</h3>
                {conversation.customer.isVIP && (
                  <span className="text-[10px] bg-yellow-400 text-white px-1.5 py-0.5 rounded font-bold">VIP</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{conversation.customer.handle}</span>
                <span>•</span>
                <span>{conversation.customer.followers.toLocaleString()} followers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <select 
              value={conversation.status}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                conversation.status === 'open' ? 'bg-green-100 text-green-700' :
                conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
              <FiExternalLink size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
              <FiMoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 ml-16">
            {conversation.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            <button className="text-xs text-blue-600 hover:underline">+ Add tag</button>
          </div>
        )}

        {/* Assigned To */}
        {conversation.assignedTo && (
          <div className="flex items-center gap-2 mt-2 ml-16 text-xs text-gray-500">
            <FiUser size={12} />
            <span>Assigned to <strong>{conversation.assignedTo}</strong></span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Original Post Context */}
        {conversation.originalPost && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <platform.icon className={platform.color} size={12} />
              <span>Original post on {platform.name}</span>
              <span>•</span>
              <span>{conversation.originalPost.timestamp}</span>
            </div>
            <p className="text-gray-700">{conversation.originalPost.content}</p>
          </div>
        )}

        {/* Message Thread */}
        <AnimatePresence>
          {conversation.messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${message.sender === 'team' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] ${message.sender === 'team' ? 'order-2' : ''}`}
                onMouseEnter={() => setShowActions(message.id)}
                onMouseLeave={() => setShowActions(null)}
              >
                {/* Internal Note Badge */}
                {message.isInternal && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600 mb-1">
                    <FiAlertCircle size={12} />
                    <span className="font-bold">Internal Note</span>
                  </div>
                )}
                
                <div className={`relative group rounded-2xl p-4 ${
                  message.isInternal 
                    ? 'bg-yellow-50 border border-yellow-200 border-dashed' 
                    : message.sender === 'team' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                }`}>
                  {/* Team Author Info */}
                  {message.sender === 'team' && message.author && !message.isInternal && (
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                      <span className="text-sm">{message.author.avatar}</span>
                      <span className="text-xs font-medium">{message.author.name}</span>
                    </div>
                  )}
                  
                  {message.isInternal && message.author && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{message.author.avatar}</span>
                      <span className="text-xs font-medium text-yellow-700">{message.author.name}</span>
                    </div>
                  )}
                  
                  <p className={`text-sm ${message.isInternal ? 'text-yellow-800' : ''}`}>
                    {message.content}
                  </p>
                  
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.isInternal ? 'text-yellow-600' : message.sender === 'team' ? 'text-blue-200' : 'text-gray-400'
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
                        className={`absolute ${message.sender === 'team' ? '-left-20' : '-right-20'} top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 border border-gray-200`}
                      >
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                          <FiCopy size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                          <FiEdit3 size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded text-red-500">
                          <FiTrash2 size={14} />
                        </button>
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
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Toggle: Public Reply vs Internal Note */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setIsInternalNote(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              !isInternalNote 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiSend size={12} className="inline mr-1" />
            Reply
          </button>
          <button
            onClick={() => setIsInternalNote(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isInternalNote 
                ? 'bg-yellow-400 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiEdit3 size={12} className="inline mr-1" />
            Internal Note
          </button>
        </div>

        <div className={`rounded-xl border-2 transition-colors ${
          isInternalNote ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
        }`}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isInternalNote ? "Add an internal note (only visible to your team)..." : "Write a reply..."}
            rows={3}
            className={`w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm ${
              isInternalNote ? 'placeholder:text-yellow-600' : ''
            }`}
          />
          
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <FiPaperclip size={18} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <FiSmile size={18} />
              </button>
              <span className="text-xs text-gray-400">{replyText.length}/280</span>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || isSending}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                isInternalNote 
                  ? 'bg-yellow-400 text-white hover:bg-yellow-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSending ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  ⏳
                </motion.div>
              ) : (
                <>
                  {isInternalNote ? <FiEdit3 size={16} /> : <FiSend size={16} />}
                  {isInternalNote ? 'Add Note' : 'Send Reply'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
          <span className="text-xs text-gray-400 flex-shrink-0">Quick:</span>
          {[
            "Thanks for reaching out! 🙏",
            "Great question! Let me help.",
            "I'll look into this for you!",
            "Is there anything else I can help with?",
          ].map((quick, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(quick)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* AI Suggestions */}
        <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 text-xs text-purple-600 font-bold mb-2">
            <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px]">AI</span>
            Suggested Response
          </div>
          <button
            onClick={() => handleQuickReply("That's wonderful to hear, Sarah! We're so glad the bulk upload feature worked perfectly for you. If you'd like, we'd love to feature your experience in a case study - it could help other creators discover these time-saving features! 💙")}
            className="text-sm text-left text-gray-700 hover:text-purple-700 transition-colors"
          >
            "That's wonderful to hear, Sarah! We're so glad the bulk upload feature worked perfectly for you. If you'd like, we'd love to feature your experience in a case study..."
            <span className="text-purple-600 font-bold ml-1">Use this →</span>
          </button>
        </div>
      </div>
    </div>
  );
}