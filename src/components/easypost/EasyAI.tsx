'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, ArrowUp, Zap, Hash, AlignLeft, 
  Smile, RefreshCw, Copy, Check, MessageCircle, Headset
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- COLORS ---
const BRAND_COLOR = "#3C48F6";

// --- TYPES ---
interface Message {
  role: 'user' | 'ai' | 'support';
  content: string;
}

// --- SUGGESTIONS (Dashboard Only) ---
const AI_SUGGESTIONS = [
  { icon: Hash, label: "Generate Hashtags", prompt: "Generate 10 viral hashtags for a post about SaaS growth." },
  { icon: AlignLeft, label: "Improve Writing", prompt: "Rewrite the following text to be more professional:" },
  { icon: Smile, label: "Make it Funny", prompt: "Add a humorous tone to this social media update:" },
  { icon: Zap, label: "Brainstorm Ideas", prompt: "Give me 5 tweet ideas about productivity." },
];

export default function EasyAI() {
  const pathname = usePathname();
  // Check if we are inside the app
  const isDashboard = pathname?.startsWith('/dashboard');

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Keyboard Shortcut (Only works in Dashboard mode)
  useEffect(() => {
    if (!isDashboard) return; // Disable shortcut on landing page
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDashboard]);

  // Auto-focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 2. Handle Send Logic (Differs by Mode)
  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    // User Message
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    // Simulate Response
    setTimeout(() => {
        let responseText = "";
        // Select response logic based on page
        const fullResponse = isDashboard ? generateAiResponse(text) : generateSupportResponse(text);
        let i = 0;

        // Streaming Animation
        const interval = setInterval(() => {
            responseText += fullResponse.charAt(i);
            setMessages(prev => {
                const newHistory = [...prev];
                const role = isDashboard ? 'ai' : 'support';
                
                if (i === 0) newHistory.push({ role, content: "" });
                newHistory[newHistory.length - 1].content = responseText;
                return newHistory;
            });
            
            i++;
            if (i === fullResponse.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 15); 
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-full group"
        style={{ borderColor: isDashboard ? `${BRAND_COLOR}40` : '' }} // Subtle blue border only on dashboard
      >
        <div className="relative">
            {isDashboard ? (
                <Sparkles className="w-5 h-5 animate-pulse" style={{ color: BRAND_COLOR }} />
            ) : (
                <Headset className="w-5 h-5" style={{ color: BRAND_COLOR }} />
            )}
            
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: BRAND_COLOR }} />
        </div>
        
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            {isDashboard ? "EasyAI" : "Support"}
        </span>
        
        {isDashboard && (
            <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded ml-1 font-mono">⌘J</span>
        )}
      </motion.button>

      {/* Backdrop & Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-all"
            />
            
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed inset-0 m-auto w-full max-w-2xl h-[600px] bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[10000] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND_COLOR }}>
                            {isDashboard ? <Sparkles size={16} fill="currentColor" /> : <Headset size={16} />}
                        </span>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            {isDashboard ? "EasyAI Assistant" : "Customer Support"}
                        </h2>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div 
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                                style={{ backgroundColor: `${BRAND_COLOR}15` }} // 15 = 10% opacity hex
                            >
                                {isDashboard ? (
                                    <Sparkles className="w-8 h-8" style={{ color: BRAND_COLOR }} />
                                ) : (
                                    <Headset className="w-8 h-8" style={{ color: BRAND_COLOR }} />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {isDashboard ? "How can I help you create?" : "How can we help you?"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                {isDashboard 
                                    ? "I can help you draft posts, generate hashtags, reply to comments, or brainstorm ideas." 
                                    : "Ask us about pricing, features, or report a bug. We usually reply instantly."
                                }
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                {(msg.role === 'ai' || msg.role === 'support') && (
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
                                        style={{ backgroundColor: `${BRAND_COLOR}10`, borderColor: `${BRAND_COLOR}20` }}
                                    >
                                        {msg.role === 'ai' ? (
                                            <Sparkles size={14} style={{ color: BRAND_COLOR }} />
                                        ) : (
                                            <Headset size={14} style={{ color: BRAND_COLOR }} />
                                        )}
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed relative group",
                                    msg.role === 'user' 
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-br-none" 
                                        : "bg-white dark:bg-black border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                                )}>
                                    {msg.content}
                                    
                                    {/* Copy Button (Only for AI in Dashboard) */}
                                    {isDashboard && msg.role === 'ai' && !isTyping && idx === messages.length - 1 && (
                                        <button 
                                            onClick={() => copyToClipboard(msg.content)}
                                            className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {hasCopied ? <Check size={12} /> : <Copy size={12} />}
                                            {hasCopied ? "Copied" : "Copy"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Suggestions (Dashboard Only) */}
                {isDashboard && !isTyping && messages.length === 0 && (
                    <div className="px-6 pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {AI_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(s.prompt)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all whitespace-nowrap shadow-sm"
                                    style={{ borderColor: 'transparent' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${BRAND_COLOR}50`; e.currentTarget.style.color = BRAND_COLOR; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = ''; }}
                                >
                                    <s.icon size={12} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827]">
                    <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all shadow-inner focus-within:ring-2 focus-within:ring-offset-0"
                         style={{ 
                             // We use custom style for focus ring color to match brand
                             ['--tw-ring-color' as any]: `${BRAND_COLOR}40`,
                             ['--tw-ring-offset-width' as any]: '0px'
                         }}
                    >
                        <div className="pl-4" style={{ color: BRAND_COLOR }}>
                            {isTyping ? <RefreshCw size={18} className="animate-spin" /> : (
                                isDashboard ? <Sparkles size={18} /> : <MessageCircle size={18} />
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isDashboard ? "Ask EasyAI to write, edit, or brainstorm..." : "Type your question here..."}
                            className="w-full bg-transparent px-4 py-4 text-sm focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                            disabled={isTyping}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!query.trim() || isTyping}
                            className="mr-2 p-2 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <ArrowUp size={16} strokeWidth={3} />
                        </button>
                    </div>
                    {isDashboard && (
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] text-gray-400 font-medium">Powered by GPT-4o</span>
                            <span className="text-[10px] text-gray-400">Use <kbd className="font-sans bg-gray-100 dark:bg-gray-800 px-1 rounded">↑</kbd> <kbd className="font-sans bg-gray-100 dark:bg-gray-800 px-1 rounded">↓</kbd> to navigate</span>
                        </div>
                    )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- MOCK RESPONSES ---

function generateAiResponse(prompt: string) {
    if (prompt.includes("hashtag")) return "Here are some trending hashtags for your niche:\n\n#SaaS #GrowthHacking #StartupLife #Tech #Innovation #BusinessGrowth #Entrepreneurship\n\nPro Tip: Mix high-volume tags with niche specific ones!";
    if (prompt.includes("funny")) return "Here's a funnier version:\n\n'Just spent 4 hours automating a task that takes 5 minutes manually. Call me a productivity genius. 🤡 #DevLife'";
    if (prompt.includes("rewrite")) return "Here is a more professional version:\n\n'We are excited to announce a significant update to our workflow efficiency. Our latest feature streamlines operations, saving valuable time for your team.'";
    return "That's a great request! Based on your recent analytics, I'd suggest focusing on visual content. Would you like me to draft a script for a short video instead?";
}

function generateSupportResponse(prompt: string) {
    if (prompt.toLowerCase().includes("pricing")) return "Our Pro plan starts at $29/mo and includes unlimited posts. You can view all details on our Pricing page.";
    if (prompt.toLowerCase().includes("bug")) return "I'm sorry to hear that! Please email support@easypost.com with a screenshot, and our engineering team will look into it immediately.";
    return "Thanks for reaching out! A member of our support team will join this chat shortly. In the meantime, have you checked our documentation?";
}