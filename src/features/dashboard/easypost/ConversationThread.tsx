'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
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
  const { t } = useLanguage();
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
    <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-[#040028] font-sans text-[#040028] dark:text-white transition-colors">

      {/* Header */}
      <div className="bg-white dark:bg-[#0A0A2E] border-b border-black/5 dark:border-white/5 p-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white transition-all"
              >
                <FiChevronLeft size={18} />
              </button>
            )}

            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center text-xl">
                {conversation.customer.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#0A0A2E] ${platform.bg} flex items-center justify-center z-10`}>
                <platform.icon className={platform.color} size={12} />
              </div>
              {conversation.customer.isVIP && (
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0A0A2E]">
                  <FiStar size={10} className="text-[#040028]" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#040028] dark:text-white">{conversation.customer.name}</h3>
                {conversation.customer.isVIP && (
                  <span className="text-[10px] bg-yellow-400 text-[#040028] px-2 py-0.5 rounded-full font-semibold">VIP</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#8E8E8E]">
                <span>{conversation.customer.handle}</span>
                <span>•</span>
                <span>{conversation.customer.followers.toLocaleString()} {t("followers", "abonnés")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <select
              value={conversation.status}
              className={`text-xs font-semibold rounded-full px-3 py-1.5 cursor-pointer appearance-none ${
                conversation.status === 'open' ? 'bg-green-100 text-green-700' :
                conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E]'
              }`}
            >
              <option value="open">{t("Open", "Ouvert")}</option>
              <option value="pending">{t("Pending", "En attente")}</option>
              <option value="resolved">{t("Resolved", "Résolu")}</option>
            </select>

            <button className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              <FiExternalLink size={16} />
            </button>
            <button className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              <FiMoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 ml-16">
            {conversation.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold rounded-full bg-[#F5F7FA] dark:bg-white/5 text-[#8E8E8E] px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
            <button className="text-xs font-semibold text-[#174CD2] hover:underline">+ {t("Add tag", "Ajouter un tag")}</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Original Post Context */}
        {conversation.originalPost && (
          <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[14px] p-4 mb-6 transition-colors">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8E8E8E] mb-2">
              <platform.icon className={platform.color} size={12} />
              <span>{t('Original post', 'Publication originale')}: {platform.name}</span>
              <span>•</span>
              <span>{conversation.originalPost.timestamp}</span>
            </div>
            <p className="text-sm font-medium text-[#040028] dark:text-white leading-relaxed">{conversation.originalPost.content}</p>
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
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-700 mb-1">
                    <FiAlertCircle size={12} />
                    <span>{t("Internal note", "Note interne")}</span>
                  </div>
                )}

                <div className={`relative group rounded-[16px] p-4 ${
                  message.isInternal
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-dashed border-yellow-300 dark:border-yellow-800'
                    : message.sender === 'team'
                      ? 'bg-[#174CD2] text-white rounded-br-[4px]'
                      : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/5 dark:border-white/5 rounded-bl-[4px]'
                }`}>
                  {/* Team Author Info */}
                  {message.sender === 'team' && message.author && !message.isInternal && (
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                      <span className="text-sm rounded-full bg-white/15 p-1">{message.author.avatar}</span>
                      <span className="text-xs font-semibold">{message.author.name}</span>
                    </div>
                  )}

                  {message.isInternal && message.author && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm rounded-full bg-white dark:bg-white/10 p-1">{message.author.avatar}</span>
                      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500">{message.author.name}</span>
                    </div>
                  )}

                  <p className={`text-sm font-medium leading-relaxed ${message.isInternal ? 'text-yellow-900 dark:text-yellow-200' : ''}`}>
                    {message.content}
                  </p>

                  <div className={`flex items-center justify-between mt-3 text-xs font-medium ${
                    message.isInternal ? 'text-yellow-600 dark:text-yellow-500' : message.sender === 'team' ? 'text-white/70' : 'text-[#8E8E8E]'
                  }`}>
                    <span className="flex items-center gap-1">
                      <FiClock size={10} />
                      {message.timestamp}
                    </span>

                    {message.sender === 'team' && message.status && !message.isInternal && (
                      <span className="flex items-center gap-1">
                        {message.status === 'read' ? (
                          <><FiCheckCircle size={10} /> {t("Read", "Lu")}</>
                        ) : message.status === 'delivered' ? (
                          <><FiCheck size={10} /> {t("Delivered", "Livré")}</>
                        ) : (
                          <><FiCheck size={10} /> {t("Sent", "Envoyé")}</>
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
                        className={`absolute ${message.sender === 'team' ? '-left-24' : '-right-24'} top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-[#0A0A2E] rounded-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-1 z-20`}
                      >
                        <button className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white"><FiCopy size={14} /></button>
                        <button className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white"><FiEdit3 size={14} /></button>
                        <button className="p-1.5 rounded-[6px] hover:bg-red-500 hover:text-white text-red-500"><FiTrash2 size={14} /></button>
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
      <div className="bg-white dark:bg-[#0A0A2E] border-t border-black/5 dark:border-white/5 p-6 transition-colors">
        {/* Toggle: Public Reply vs Internal Note */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsInternalNote(false)}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all ${
              !isInternalNote
                ? 'bg-[#174CD2] text-white'
                : 'bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <FiSend size={12} className="inline mr-2" />
            {t("Channel reply", "Répondre sur le canal")}
          </button>
          <button
            onClick={() => setIsInternalNote(true)}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all ${
              isInternalNote
                ? 'bg-yellow-400 text-[#040028]'
                : 'bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <FiEdit3 size={12} className="inline mr-2" />
            {t("Internal note", "Note interne")}
          </button>
        </div>

        <div className={`rounded-[14px] border transition-all overflow-hidden ${
          isInternalNote ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/40' : 'bg-white dark:bg-white/5 border-[#D9D9D9] dark:border-white/10 focus-within:border-[#174CD2] focus-within:ring-2 focus-within:ring-[#174CD2]/15'
        }`}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isInternalNote ? t("Add internal note (team only)...", "Ajouter une note interne (équipe uniquement)...") : t("Type your response...", "Tapez votre réponse...")}
            rows={3}
            className="w-full px-4 py-4 bg-transparent resize-none focus:outline-none text-sm font-medium placeholder:text-[#8E8E8E] text-[#040028] dark:text-white"
          />

          <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10 transition-all text-[#8E8E8E]">
                <FiPaperclip size={18} />
              </button>
              <button className="p-2 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10 transition-all text-[#8E8E8E]">
                <FiSmile size={18} />
              </button>
              <span className="text-xs font-medium text-[#8E8E8E] ml-2">{replyText.length}/280</span>
            </div>

            <button
              onClick={handleSend}
              disabled={!replyText.trim() || isSending}
              className={`px-6 py-2 rounded-[10px] font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 ${
                isInternalNote
                  ? 'bg-yellow-400 text-[#040028]'
                  : 'bg-[#174CD2] text-white hover:bg-[#123a9e]'
              }`}
            >
              {isSending ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <>
                  {isInternalNote ? <FiEdit3 size={16} /> : <FiSend size={16} />}
                  {isInternalNote ? t("Log note", "Enregistrer") : t("Send", "Envoyer")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-semibold text-[#8E8E8E] mr-2">{t("Quick:", "Rapide :")}</span>
          {[
            "Copy that! 🙏",
            "On it right now!",
            "Roger that! 🚀",
            "Any other signals?",
          ].map((quick, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(quick)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#F5F7FA] dark:bg-white/5 text-xs font-semibold text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* AI Suggestions */}
        <div className="mt-4 p-4 rounded-[14px] bg-purple-50 dark:bg-purple-900/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">AI</span>
            {t("Suggested response", "Réponse suggérée")}
          </div>
          <button
            onClick={() => handleQuickReply("That's wonderful to hear, Sarah! We're so glad the bulk upload feature worked perfectly for you. If you'd like, we'd love to feature your experience in a case study!")}
            className="text-xs font-medium text-left text-[#040028] dark:text-white hover:text-[#174CD2] transition-colors leading-relaxed"
          >
            &ldquo;That&apos;s wonderful to hear, Sarah! We&apos;re so glad the bulk upload feature worked perfectly for you...&rdquo;
            <span className="text-[#174CD2] font-semibold ml-2">{t('Apply', 'Appliquer')} →</span>
          </button>
        </div>
      </div>
    </div>
  );
}