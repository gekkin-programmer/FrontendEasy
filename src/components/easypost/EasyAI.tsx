'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, ArrowUp, Zap, Hash, AlignLeft, 
  Smile, RefreshCw, Copy, Check, MessageCircle, Headset, ChevronDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { api } from "@/src/lib/api";

const BRAND_COLOR = "#3C48F6";

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function EasyAI() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // User Profile State
  const [userAvatar, setUserAvatar] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load User Avatar (Client Side Only)
  useEffect(() => {
    // Check if we have user info in local storage (mock logic for now)
    // In real app, you might decode the JWT or fetch profile
    const token = localStorage.getItem('accessToken');
    if (token) {
        // Logged In: Use "Felix" seed (looks like a cool person) or their name
        setUserAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb`);
    } else {
        // Guest: Use "Guest" seed
        setUserAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=Guest&backgroundColor=transparent`);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await api.post<{reply: string}>('/ai/chat', { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: res.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having connection issues. Please try again." }]);
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
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[50] flex items-center gap-3 px-5 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-full group transition-all hover:shadow-blue-500/20"
            >
                <div className="relative">
                    {/* 🎬 ANIMATED AVATAR */}
                    <motion.img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                        alt="AI" 
                        className="w-10 h-10 rounded-full bg-white p-0.5 border border-gray-100"
                        
                        // 👇 THE MAGIC ANIMATION
                        animate={{ 
                            y: [0, -6, 0], // Jump up 6px and back down
                            rotate: [0, -5, 5, 0] // Slight wiggle
                        }}
                        transition={{
                            duration: 0.6,      // Animation speed
                            repeat: Infinity,   // Loop forever
                            repeatDelay: 3,     // Wait 3 seconds between loops
                            ease: "easeInOut"
                        }}
                    />
                    
                </div>
            </motion.button>
        )}
      </AnimatePresence>

      {/* CHAT WINDOW (Expanded) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-[100] w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                            className="w-10 h-10 rounded-full border border-gray-100 bg-blue-50"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                            {isDashboard ? "EasyAI Copilot" : "Steve Dorian Support"}
                        </h3>
                        <p className="text-xs text-gray-500">Marketing Expert</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 dark:bg-zinc-950/50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                            {isDashboard ? <Sparkles size={32} /> : <MessageCircle size={32} />}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {isDashboard ? "I can write posts for you." : "How can we help?"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                                Powered by Llama 3.3. I know everything about EasyPost.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                    >
                        <img 
                            src={msg.role === 'ai' 
                                ? `https://api.dicebear.com/7.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`
                                : userAvatar
                            }
                            className="w-8 h-8 rounded-full border border-gray-200 bg-white"
                        />
                        <div className={cn(
                            "max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm",
                            msg.role === 'user' 
                                ? "bg-[#3C48F6] text-white rounded-2xl rounded-tr-sm" 
                                : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} className="w-8 h-8 rounded-full bg-white" />
                         <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm flex gap-1 items-center h-10">
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                         </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3.5 bg-gray-100 dark:bg-zinc-950 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all outline-none text-sm"
                        disabled={isTyping}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!query.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#3C48F6] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-[#3C48F6] transition-colors shadow-sm"
                    >
                        <ArrowUp size={16} strokeWidth={3} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400">AI can make mistakes. Check important info.</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}