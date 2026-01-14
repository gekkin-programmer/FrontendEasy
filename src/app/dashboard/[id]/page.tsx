'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';

// UI Components
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, BarChart2, MessageCircle, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Loader2, 
  Menu, X, Radio, Mic 
} from 'lucide-react'; 

import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Engagement from "@/src/components/easypost/Engagement";
import Settings from '@/src/components/easypost/Settings';
import EngagementAnalytics from '@/src/components/easypost/EngagementAnalytics';
import Team from '@/src/components/easypost/Team';
import VoiceAiButton from '@/src/components/easypost/VoiceAiButton';

type TabType = 'queue' | 'analytics' | 'engagement' | 'settings' | 'team';

// --- NEUBRUTALIST UI HELPERS ---

const NeuButton = ({ children, onClick, active, className = "" }: any) => (
  <button 
    onClick={onClick}
    className={`
      relative px-4 py-2 font-bold text-sm transition-all duration-150 border-2 border-black
      ${active 
        ? 'bg-[#3C48F6] text-white translate-x-[2px] translate-y-[2px] shadow-none' 
        : 'bg-white text-black hover:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
      }
      ${className}
    `}
  >
    {children}
  </button>
);

const NeuCard = ({ children, className = "" }: any) => (
  <div className={`bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>
    {children}
  </div>
);

const NeuInput = (props: any) => (
  <input 
    {...props}
    className="bg-white border-2 border-black p-2 font-bold text-sm placeholder:text-gray-500 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all w-full"
  />
);

export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // State
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Data
    const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
    const [myWorkspaces, setMyWorkspaces] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    const [notifications] = useState<any[]>([
        { id: 1, type: 'general', message: 'Welcome to EasyPost!', time: '2m ago', read: false }
    ]);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Default to light mode for Neubrutalism, but allow dark overrides
    useEffect(() => {
        document.documentElement.classList.remove('dark'); 
    }, []);

    // ✨ HELPER: Generate Unique Workspace Avatar
    const getAvatarUrl = (seed: string) => 
        `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`;

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { router.push('/login'); return; }

        try {
            // 1. Fetch Workspaces
            const wsRes = await fetch(`${API_URL}/workspaces`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (!wsRes.ok) throw new Error("Failed to fetch workspaces");
            
            const workspacesData = await wsRes.json();
            const workspaces = Array.isArray(workspacesData) ? workspacesData : [];
            setMyWorkspaces(workspaces);

            if (workspaces.length === 0) { router.push('/onboarding'); return; }

            // 2. Set Current Workspace
            const current = workspaces.find((w: any) => w.id === workspaceId);
            if (!current) { router.replace(`/dashboard/${workspaces[0].id}`); return; }

            setCurrentWorkspace(current);
            setAccounts(current.socialAccounts || []);

            // 3. Fetch Posts
            const postsRes = await fetch(`${API_URL}/posts?workspaceId=${workspaceId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(Array.isArray(postsData) ? postsData : []);
            }

        } catch (error) { 
            console.error(error);
            toast.error("Connection Error. Check Backend."); 
        } finally { 
            setLoading(false); 
        }
    }, [API_URL, router, workspaceId]);

    useEffect(() => { if (workspaceId) fetchData(); }, [fetchData, workspaceId]);

    const handleVoiceCommand = (transcription: string, intent: any) => {
        const text = transcription.toLowerCase();
        if (text.includes("analytics")) setActiveTab("analytics");
        else if (text.includes("team")) setActiveTab("team");
        else if (text.includes("queue")) setActiveTab("queue");
        else {
            toast.success("AI Command Processed");
            fetchData();
        }
    };

    const handleAddPost = async (content: string, date?: Date, mediaUrl?: string, mediaType?: "image"|"video", category?: string, tags?: string[]) => {
        const token = localStorage.getItem('accessToken');
        if (!accounts || accounts.length === 0) { toast.error("No accounts connected!"); return; }

        try {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    workspaceId, content,
                    scheduledFor: date ? date.toISOString() : undefined,
                    status: date ? 'SCHEDULED' : 'DRAFT',
                    socialAccountIds: [accounts[0].id], 
                    mediaUrls: mediaUrl ? [mediaUrl] : [],
                    mediaType: mediaType ? mediaType.toUpperCase() : 'IMAGE'
                })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success(date ? 'Post scheduled!' : 'Draft saved');
            fetchData();
        } catch (err) { toast.error("Failed to save post"); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-yellow-50 text-black">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-xl uppercase tracking-widest">Loading...</p>
        </div>
    );
    
    if (!currentWorkspace) return null;

    const filteredPosts = posts.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

    const navItems = [
        { id: 'queue', label: 'Queue', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'engagement', label: 'Inbox', icon: MessageCircle },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex h-screen bg-[#FDFBF7] font-sans text-black overflow-hidden relative">
            <Toaster position="bottom-right" toastOptions={{
                className: 'border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none font-bold'
            }} />

            {/* 🏗️ INDUSTRIAL BACKGROUND PATTERN */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 border-2 border-transparent active:bg-yellow-100">
                        <Menu size={24} className="text-black" />
                    </button>
                    <div className="font-black text-xl tracking-tighter">EASYPOST.</div>
                </div>
                <div className="flex items-center gap-3">
                    <VoiceAiButton onCommand={handleVoiceCommand} />
                    <div className="w-8 h-8 rounded-none border-2 border-black overflow-hidden bg-white">
                        <img src={getAvatarUrl(currentWorkspace.name)} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* --- SIDEBAR (Mobile Drawer) --- */}
            <AnimatePresence>
                {(isSidebarOpen) && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.aside 
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white border-r-4 border-black flex flex-col z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                            <div className="p-6 border-b-2 border-black flex justify-between items-center bg-yellow-400">
                                <span className="font-black text-xl uppercase">Menu</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors p-1"><X/></button>
                            </div>
                            <nav className="p-4 space-y-3">
                                {navItems.map(item => (
                                    <SidebarItem 
                                        key={item.id} 
                                        icon={item.icon} 
                                        label={item.label} 
                                        active={activeTab === item.id} 
                                        onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} 
                                    />
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                
                {/* 💻 DESKTOP HEADER */}
                <header className="hidden md:flex h-20 bg-white border-b-4 border-black items-center justify-between px-8 z-20 shadow-sm">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                             {/* Optional: Replace with your actual Logo Component if available */}
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-2xl border-2 border-transparent">
                                
                            </div>
                            <span className="font-black text-2xl tracking-tighter italic">EASYPOST.</span>
                        </div>

                        {/* Workspace Switcher (Retro Dropdown Style) */}
                        <div className="relative group">
                            <button 
                                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all"
                            >
                                <div className="w-6 h-6 border-2 border-black rounded-none overflow-hidden bg-gray-100">
                                    <img src={getAvatarUrl(currentWorkspace.name)} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-bold uppercase truncate max-w-[120px]">{currentWorkspace.name}</span>
                                <ChevronDown size={16} className="text-black" />
                            </button>
                            
                            <AnimatePresence>
                                {isAccountMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10, scaleY: 0.9 }} 
                                        animate={{ opacity: 1, y: 0, scaleY: 1 }} 
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] z-50 p-2 origin-top"
                                    >
                                        <div className="space-y-1">
                                            {myWorkspaces.map(ws => (
                                                <button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-yellow-200 border-2 border-transparent hover:border-black transition-all">
                                                    <div className="w-5 h-5 border border-black overflow-hidden bg-gray-50">
                                                        <img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="flex-1 font-bold truncate">{ws.name}</span>
                                                    {currentWorkspace.id === ws.id && <Check size={16} className="text-blue-600 border-2 border-transparent"/>}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="h-0.5 bg-black my-2"/>
                                        <button onClick={() => router.push('/onboarding')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-600 transition-all">
                                            <Plus size={16}/> New Workspace
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <NeuInput 
                                placeholder="SEARCH_DATABASE..." 
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                                style={{ width: '250px' }}
                            />
                            <div className="bg-black text-white p-2.5 border-2 border-black">
                                <Search size={18} />
                            </div>
                        </div>

                        <VoiceAiButton onCommand={handleVoiceCommand} />
                        
                        <button className="relative p-2.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-black" />}
                        </button>
                    </div>
                </header>

                {/* 🕹️ CONTROL PANEL (Navigation) */}
                <div className="hidden md:flex justify-center py-8 sticky top-0 z-30 pointer-events-none">
                    <nav className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto">
                        {navItems.map((item) => (
                            <NeuButton 
                                key={item.id}
                                active={activeTab === item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                className="flex items-center gap-2 px-6"
                            >
                                <item.icon size={18} strokeWidth={2.5} />
                                <span className="uppercase tracking-wide">{item.label}</span>
                            </NeuButton>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 relative z-10 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto pb-20 md:pb-0">
                        
                        {/* Tab Content Wrappers */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'queue' && (
                                    <div className="grid gap-8">
                                        <NeuCard className="bg-white">
                                            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                                                <div className="w-4 h-4 bg-yellow-400 border-2 border-black"></div>
                                                Create New Content
                                            </h2>
                                            <Composer onSchedule={handleAddPost} />
                                        </NeuCard>
                                        <div className="mt-4">
                                            <PostFeed posts={filteredPosts} accounts={accounts} />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'analytics' && (
                                    <NeuCard><Analytics /></NeuCard>
                                )}
                                {activeTab === 'engagement' && (
                                    <NeuCard><EngagementWithTabs /></NeuCard>
                                )}
                                {activeTab === 'team' && (
                                    <NeuCard><Team workspaceId={workspaceId} /></NeuCard>
                                )}
                                {activeTab === 'settings' && (
                                    <NeuCard><Settings workspaceId={workspaceId} workspaceName={currentWorkspace.name} /></NeuCard>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button 
        onClick={onClick} 
        className={`
            w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-wider border-2 border-black transition-all
            ${active 
                ? 'bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000]' 
                : 'bg-white text-black hover:bg-yellow-100 hover:translate-x-1'
            }
        `}
    >
        <Icon size={18} strokeWidth={2.5} /> {label}
    </button>
);

const EngagementWithTabs = () => {
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');
  return (
    <div>
      <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4">
        <button 
            onClick={() => setSubTab('inbox')} 
            className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all
                ${subTab === 'inbox' 
                    ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' 
                    : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'
                }
            `}
        >
          <MessageCircle size={16} /> Inbox
        </button>
        <button 
            onClick={() => setSubTab('analytics')} 
            className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all
                ${subTab === 'analytics' 
                    ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' 
                    : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'
                }
            `}
        >
          <BarChart2 size={16} /> Performance
        </button>
      </div>
      {subTab === 'inbox' && <Engagement />}
      {subTab === 'analytics' && <EngagementAnalytics />}
    </div>
  );
};