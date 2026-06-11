'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowUp, MessageCircle, ChevronDown, Loader2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { api } from '@/src/lib/api';
import { toast } from 'sonner';

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
      // @ts-expect-error -- backend response shape differs from typed client
      const aiResponse = res.response || res.data?.response || "I didn't catch that.";
      // @ts-expect-error -- backend response shape differs from typed client
      const messageId = res.messageId || res.data?.messageId;
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse, messageId }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "AI_TEMPORARILY_UNAVAILABLE. Please check connection or try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🚀 NEUBRUTALIST TRIGGER BUTTON */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-full group transition-all hover:bg-blue-50 dark:hover:bg-zinc-800"
                aria-label="Open AI Chat"
            >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                    <Image 
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F5`} 
                        alt="AI Avatar" 
                        fill
                        className="rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-black dark:border-white rounded-full"></div>
                </div>
                
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Online</p>
                    <p className="text-sm font-black text-black dark:text-white uppercase transition-colors">
                        {isDashboard ? "ASK STEVE" : "NEED HELP?"}
                    </p>
                </div>
            </motion.button>
        )}
      </AnimatePresence>

      {/* 🚀 NEUBRUTALIST CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-[9998] sm:bg-transparent sm:backdrop-blur-none transition-colors"
            />
            
            <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                    "fixed z-[9999] flex flex-col bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] overflow-hidden transition-colors",
                    "w-full h-[80dvh] bottom-0 left-0 rounded-t-3xl border-b-0", // Mobile
                    "sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:bottom-6 sm:right-6 sm:rounded-3xl sm:border-b-4" // Desktop
                )}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-[#3C48F5]">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image 
                                src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F5`} 
                                alt="Bot"
                                fill
                                className="rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black dark:border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg uppercase tracking-tight leading-none">
                                STEVE AI
                            </h3>
                            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                                {isDashboard ? "DIGITAL MARKETER" : "SUPPORT AGENT"}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white hover:bg-red-500 hover:text-white transition-colors rounded-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black dark:text-white"
                    >
                        <ChevronDown size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-white dark:bg-zinc-900 bg-[radial-gradient(#00000015_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] transition-colors">
                    
                    {/* Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-100">
                            <div className="w-20 h-20 bg-[#3C48F5] border-4 border-black dark:border-white rounded-full flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                                {isDashboard ? <Sparkles size={32} /> : <MessageCircle size={32} />}
                            </div>
                            <div>
                                <p className="font-black text-xl text-black dark:text-white uppercase transition-colors">
                                    {isDashboard ? "Let's Create Magic" : "How can I help?"}
                                </p>
                                <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 mt-1 max-w-[200px] mx-auto uppercase">
                                    I can write captions, analyze data, or help you navigate.
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
                                        ? `https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`
                                        : userAvatar
                                    }
                                    alt="Avatar"
                                    fill
                                    className="rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 object-cover"
                                />
                            </div>
                            
                            <div className={cn(
                                "max-w-[85%] p-3 sm:p-4 text-sm font-bold border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all",
                                msg.role === 'user' 
                                    ? "bg-[#3C48F5] text-white rounded-2xl rounded-br-none" 
                                    : "bg-white dark:bg-zinc-800 text-black dark:text-white rounded-2xl rounded-bl-none"
                            )}>
                                {msg.role === 'ai' ? (
                                    <Typewriter text={msg.content} />
                                ) : (
                                    msg.content
                                )}

                                {msg.role === 'ai' && msg.messageId && !msg.feedbackGiven && (
                                    <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex gap-2 justify-end">
                                        <button onClick={() => handleFeedback(idx, 1)} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded text-gray-400 hover:text-green-600"><ThumbsUp size={12} /></button>
                                        <button onClick={() => handleFeedback(idx, -1)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded text-gray-400 hover:text-red-600"><ThumbsDown size={12} /></button>
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
                                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                                    alt="Bot"
                                    fill
                                    className="rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 object-cover"
                                />
                             </div>
                             <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-bl-none border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex gap-1 items-center h-12 transition-all">
                                 <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                 <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                 <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t-4 border-black dark:border-white pb-safe transition-colors">
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-14 py-3 sm:py-4 bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white rounded-xl text-black dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] focus:-translate-y-1 focus:-translate-x-1 transition-all text-sm sm:text-base disabled:opacity-50"
                            disabled={isTyping}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!query.trim() || isTyping}
                            className="absolute right-2 p-2 bg-[#3C48F5] text-white rounded-lg border-2 border-black dark:border-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#3C48F5] transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            {isTyping ? <Loader2 className="animate-spin" size={20} /> : <ArrowUp size={20} strokeWidth={3} />}
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