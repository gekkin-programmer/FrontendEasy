'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, ArrowUp, MessageCircle, Headset, ChevronDown
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
  // If user is on dashboard, it's the Creative Copilot. If on landing page, it's Support.
  const isDashboard = pathname?.startsWith('/dashboard');

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // User Profile State
  const [userAvatar, setUserAvatar] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Load User Avatar (Client Side Logic)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        // LOGGED IN: Try to get real name/avatar later. For now, use a "Cool Person" seed.
        // We use "Felix" or "Sarah" to look like a team member or pro user.
        setUserAvatar(`https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb`);
    } else {
        // GUEST: Use a generic but human "Guest" seed.
        setUserAvatar(`https://api.dicebear.com/9.x/notionists/svg?seed=Guest&backgroundColor=transparent`);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    try {
      // Call your NestJS Backend
      const res = await api.post<{reply: string}>('/ai/chat', { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: res.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to the server. Please check your internet or try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON (Hidden when open) */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-full group transition-all hover:shadow-blue-500/20"
            >
                <div className="relative">
                    {/* 🎬 ANIMATED AVATAR */}
                    <motion.img 
                        // The "Notionists" style: Clean, illustrative, non-robotic
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                        alt="AI" 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 border border-gray-100"
                        
                        // 🌊 Gentle Floating Animation
                        animate={{ 
                            y: [0, -4, 0], 
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                        }}
                    />
                    
                    {/* Online Dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Online</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {isDashboard ? "Ask EasyAI" : "Chat with us"}
                    </p>
                </div>
            </motion.button>
        )}
      </AnimatePresence>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998] sm:bg-transparent sm:backdrop-blur-none"
            />
            
            <motion.div 
                // ANIMATION: Slide Up from Bottom
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                
                // RESPONSIVE STYLING
                // Mobile: Full width, Fixed to bottom, No rounded corners at bottom
                // Desktop (sm): Floating card, Rounded, Margin from edges
                className={cn(
                    "fixed z-[9999] flex flex-col bg-white dark:bg-[#111827] shadow-2xl overflow-hidden border-t border-gray-200 dark:border-gray-800",
                    "w-full h-[85dvh] bottom-0 left-0 rounded-t-2xl", // Mobile styles
                    "sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:bottom-6 sm:right-6 sm:rounded-2xl" // Desktop styles
                )}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-10 cursor-pointer" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img 
                                src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 bg-blue-50"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                {isDashboard ? "EasyAI Copilot" : "Support Team"}
                            </h3>
                            <p className="text-xs text-gray-500">Replies instantly</p>
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        {/* Chevron Down for "Minimizing" feel */}
                        <ChevronDown size={24} />
                    </button>
                </div>

                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-gray-50/50 dark:bg-zinc-950/50">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                                {isDashboard ? <Sparkles size={28} /> : <MessageCircle size={28} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                    {isDashboard ? "I can write posts for you." : "How can we help today?"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
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
                            {/* Avatars in Chat */}
                            <img 
                                src={msg.role === 'ai' 
                                    ? `https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`
                                    : userAvatar
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white shadow-sm mt-1"
                            />
                            
                            <div className={cn(
                                "max-w-[85%] p-3 sm:p-3.5 text-sm leading-relaxed shadow-sm",
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
                             <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white mt-1" />
                             <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm flex gap-1 items-center h-10">
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-gray-800 pb-safe">
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-12 py-3 sm:py-3.5 bg-gray-100 dark:bg-zinc-950 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all outline-none text-sm"
                            disabled={isTyping}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!query.trim() || isTyping}
                            className="absolute right-2 p-1.5 sm:p-2 bg-[#3C48F6] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-[#3C48F6] transition-colors shadow-sm"
                        >
                            <ArrowUp size={16} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="text-center mt-2 hidden sm:block">
                        <p className="text-[10px] text-gray-400">AI can make mistakes. Check important info.</p>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}