'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, ArrowUp, MessageCircle, ChevronDown
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
  const [userAvatar, setUserAvatar] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Load User Avatar
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        setUserAvatar(`https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb`);
    } else {
        setUserAvatar(`https://api.dicebear.com/9.x/notionists/svg?seed=Guest&backgroundColor=ffdfbf`);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Focus
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
      const res = await api.post<{reply: string}>('/ai/chat', { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: res.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please try again." }]);
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
                className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3 px-5 py-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-full group transition-all"
            >
                <div className="relative">
                    <img 
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                        alt="AI" 
                        className="w-10 h-10 rounded-full border-2 border-black bg-yellow-300"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                
                <div className="text-left hidden sm:block">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Online</p>
                    <p className="text-sm font-black text-black">
                        {isDashboard ? "ASK EASY AI" : "NEED HELP?"}
                    </p>
                </div>
            </motion.button>
        )}
      </AnimatePresence>

      {/* 🚀 NEUBRUTALIST CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998] sm:bg-transparent sm:backdrop-blur-none"
            />
            
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                    "fixed z-[9999] flex flex-col bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden",
                    "w-full h-[85dvh] bottom-0 left-0 rounded-t-3xl border-b-0", // Mobile
                    "sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:bottom-6 sm:right-6 sm:rounded-3xl sm:border-b-4" // Desktop
                )}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b-4 border-black bg-yellow-300">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img 
                                src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} 
                                className="w-10 h-10 rounded-full border-2 border-black bg-white"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-black text-black text-lg uppercase tracking-tight">
                                {isDashboard ? "COPILOT" : "SUPPORT"}
                            </h3>
                            <p className="text-xs font-bold text-black/70">ALWAYS ONLINE</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-2 bg-white border-2 border-black hover:bg-red-500 hover:text-white transition-colors rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white bg-[radial-gradient(#00000015_1px,transparent_1px)] [background-size:16px_16px]">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-100">
                            <div className="w-20 h-20 bg-blue-100 border-4 border-black rounded-full flex items-center justify-center text-[#3C48F6] shadow-[4px_4px_0px_0px_#000]">
                                {isDashboard ? <Sparkles size={32} /> : <MessageCircle size={32} />}
                            </div>
                            <div>
                                <p className="font-black text-xl text-black uppercase">
                                    {isDashboard ? "Let's Create" : "Howdy!"}
                                </p>
                                <p className="text-sm font-bold text-gray-500 mt-1 max-w-[200px] mx-auto">
                                    I am EasyBot. I know everything about this app.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={idx} 
                            className={cn("flex gap-3 items-end", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                        >
                            <img 
                                src={msg.role === 'ai' 
                                    ? `https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`
                                    : userAvatar
                                }
                                className="w-8 h-8 rounded-full border-2 border-black bg-white mb-1"
                            />
                            
                            <div className={cn(
                                "max-w-[85%] p-4 text-sm font-bold border-2 border-black shadow-[4px_4px_0px_0px_#000]",
                                msg.role === 'user' 
                                    ? "bg-[#3C48F6] text-white rounded-2xl rounded-br-none" 
                                    : "bg-white text-black rounded-2xl rounded-bl-none"
                            )}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 items-end">
                             <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`} className="w-8 h-8 rounded-full border-2 border-black bg-white mb-1" />
                             <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-black shadow-[4px_4px_0px_0px_#000] flex gap-1 items-center h-12">
                                 <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                 <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                 <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT */}
                <div className="p-4 bg-white border-t-4 border-black">
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-14 py-4 bg-gray-50 border-2 border-black rounded-xl text-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                            disabled={isTyping}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!query.trim() || isTyping}
                            className="absolute right-2 p-2 bg-[#3C48F6] text-white rounded-lg border-2 border-black hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#3C48F6] transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            <ArrowUp size={20} strokeWidth={3} />
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