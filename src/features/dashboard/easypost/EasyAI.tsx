'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowUp, MessageCircle, ChevronDown, Loader2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  role: 'user' | 'ai';
  content: string;
  messageId?: string;
  feedbackGiven?: boolean;
}

interface AiChatResponse {
  messageId: string;
  response: string;
}

// --- SUB-COMPONENTS ---
const Typewriter = ({ text, speed = 20, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIdx] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIdx(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

export default function EasyAI() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFeedback = async (msgIdx: number, rating: number) => {
    const msg = messages[msgIdx];
    if (!msg.messageId) return;

    try {
      await api.post('/ai/feedback', {
        messageId: msg.messageId,
        rating: rating,
      });
      
      setMessages(prev => prev.map((m, i) => i === msgIdx ? { ...m, feedbackGiven: true } : m));
    } catch (e) {
      // Silent fail for UX
    }
  };

  // 1. Load User Avatar
  useEffect(() => {
    // Determine avatar based on auth status (simplified)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const seed = token ? 'Felix' : 'Guest';
    setUserAvatar(`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=e5e7eb`);
  }, []);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // 3. Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    try {
      // ➤ CALL BACKEND
      const res = await api.post<AiChatResponse>('/ai/chat', { message: text });
      
      // ➤ FIX: Match backend response structure ({ messageId, response })
      // @ts-expect-error backend shape differs from typed wrapper
      const aiResponse = res.response || res.data?.response || "I didn't catch that.";
      // @ts-expect-error backend shape differs from typed wrapper
      const messageId = res.messageId || res.data?.messageId;
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse, messageId }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: t("AI temporarily unavailable. Please check your connection or try again later.", "IA temporairement indisponible. Vérifiez votre connexion ou réessayez plus tard.") }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-full group"
                aria-label={t('Open AI Chat', 'Ouvrir le chat IA')}
            >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                    <Image
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=174CD2`}
                        alt="AI Avatar"
                        fill
                        className="rounded-full bg-white dark:bg-white/10 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 ring-2 ring-white dark:ring-[#0A0A2E] rounded-full"></div>
                </div>

                <div className="text-left hidden sm:block">
                    <p className="text-xs text-[#8E8E8E] font-medium">{t('Online', 'En ligne')}</p>
                    <p className="text-sm font-semibold text-[#040028] dark:text-white transition-colors">
                        {isDashboard ? t("Ask Steve", "Demander à Steve") : t("Need help?", "Besoin d'aide ?")}
                    </p>
                </div>
            </motion.button>
        )}
      </AnimatePresence>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-[#040028]/30 backdrop-blur-[2px] z-[9998] sm:bg-transparent sm:backdrop-blur-none transition-colors"
            />

            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                    "fixed z-[9999] flex flex-col bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden transition-colors",
                    "w-full h-[80dvh] bottom-0 left-0 rounded-t-3xl", // Mobile
                    "sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:bottom-6 sm:right-6 sm:rounded-3xl" // Desktop
                )}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 bg-[#174CD2]">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image
                                src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=174CD2`}
                                alt="Bot"
                                fill
                                className="rounded-full bg-white object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 ring-2 ring-[#174CD2] rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-none">
                                Steve AI
                            </h3>
                            <p className="text-xs font-medium text-white/80 mt-1">
                                {isDashboard ? t("Digital marketer", "Marketeur digital") : t("Support agent", "Agent de support")}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-2 rounded-[10px] bg-white/15 hover:bg-white/25 transition-colors text-white"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>

                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-[#F5F7FA]/40 dark:bg-transparent transition-colors">

                    {/* Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-100">
                            <div className="w-16 h-16 bg-[#174CD2] rounded-full flex items-center justify-center text-white">
                                {isDashboard ? <Sparkles size={28} /> : <MessageCircle size={28} />}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-[#040028] dark:text-white transition-colors">
                                    {isDashboard ? t("Let's create magic", "Créons la magie") : t("How can I help?", "Comment puis-je aider ?")}
                                </p>
                                <p className="text-sm font-medium text-[#8E8E8E] mt-1 max-w-[220px] mx-auto">
                                    {t("I can write captions, analyze data, or help you navigate.", "Je peux rédiger des légendes, analyser des données ou vous aider à naviguer.")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            key={idx}
                            className={cn("flex gap-3 items-end", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                        >
                            <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                    src={msg.role === 'ai'
                                        ? `https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=174CD2`
                                        : userAvatar
                                    }
                                    alt="Avatar"
                                    fill
                                    className="rounded-full bg-white dark:bg-white/10 object-cover"
                                />
                            </div>

                            <div className={cn(
                                "max-w-[85%] p-3 sm:p-4 text-sm font-medium transition-all",
                                msg.role === 'user'
                                    ? "bg-[#174CD2] text-white rounded-[16px] rounded-br-[4px]"
                                    : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white rounded-[16px] rounded-bl-[4px] border border-black/5 dark:border-white/5"
                            )}>
                                {msg.role === 'ai' ? (
                                    <Typewriter text={msg.content} />
                                ) : (
                                    msg.content
                                )}

                                {msg.role === 'ai' && msg.messageId && !msg.feedbackGiven && (
                                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex gap-2 justify-end">
                                        <button onClick={() => handleFeedback(idx, 1)} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-full text-[#8E8E8E] hover:text-green-600"><ThumbsUp size={12} /></button>
                                        <button onClick={() => handleFeedback(idx, -1)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-full text-[#8E8E8E] hover:text-red-600"><ThumbsDown size={12} /></button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-3 items-end">
                             <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=174CD2`}
                                    alt="Bot"
                                    fill
                                    className="rounded-full bg-white dark:bg-white/10 object-cover"
                                />
                             </div>
                             <div className="bg-white dark:bg-[#0A0A2E] p-4 rounded-[16px] rounded-bl-[4px] border border-black/5 dark:border-white/5 flex gap-1 items-center h-12 transition-all">
                                 <span className="w-2 h-2 bg-[#8E8E8E] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                 <span className="w-2 h-2 bg-[#8E8E8E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                 <span className="w-2 h-2 bg-[#8E8E8E] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-white dark:bg-[#0A0A2E] border-t border-black/5 dark:border-white/5 pb-safe transition-colors">
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t("Type a message...", "Tapez un message...")}
                            className="w-full pl-4 pr-14 py-3 sm:py-4 bg-[#F5F7FA] dark:bg-white/5 border border-[#D9D9D9] dark:border-white/10 rounded-[14px] text-[#040028] dark:text-white font-medium placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all text-sm sm:text-base disabled:opacity-50"
                            disabled={isTyping}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!query.trim() || isTyping}
                            className="absolute right-2 p-2 bg-[#174CD2] text-white rounded-[10px] hover:bg-[#123a9e] disabled:opacity-50 transition-all"
                        >
                            {isTyping ? <Loader2 className="animate-spin" size={20} /> : <ArrowUp size={20} />}
                        </button>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}