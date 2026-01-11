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
  Menu, X, Home 
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

    useEffect(() => {
        document.documentElement.classList.add('dark');
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
            
            // 🛑 CRASH FIX: Ensure it is an array
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

    if (loading) return <div className="h-screen flex items-center justify-center bg-background text-foreground"><Loader2 className="animate-spin text-primary w-10 h-10"/></div>;
    if (!currentWorkspace) return null;

    const filteredPosts = posts.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));
    const postCount = posts.filter(p => p.status === 'SCHEDULED').length;

    const navItems = [
        { id: 'queue', label: 'Queue', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'engagement', label: 'Inbox', icon: MessageCircle },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden relative">
            <Toaster position="bottom-right" theme="system" />

            {/* 🌌 3D GRID BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden">
                <div 
                    className="absolute inset-0 top-1/3"
                    style={{
                        backgroundImage: `linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) scale(2)',
                        transformOrigin: 'top center',
                        maskImage: 'linear-gradient(to bottom, transparent, black 40%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, transparent)'
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
            </div>

            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                        <Menu size={24} />
                    </button>
                    <div className="relative w-8 h-8">
                        <Image src="/assets/WiggleLogo.png" alt="Logo" fill className="object-contain" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <VoiceAiButton onCommand={handleVoiceCommand} />
                    {/* Mobile Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm bg-white">
                        <img src={getAvatarUrl(currentWorkspace.name)} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* --- SIDEBAR (Mobile Drawer ONLY) --- */}
            <AnimatePresence>
                {(isSidebarOpen) && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        <motion.aside 
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border flex flex-col z-50"
                        >
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <span className="font-bold text-lg">Menu</span>
                                <button onClick={() => setIsSidebarOpen(false)}><X/></button>
                            </div>
                            <nav className="p-4 space-y-1">
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
            <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
                
                {/* 💻 DESKTOP HEADER */}
                <header className="hidden md:flex h-16 bg-transparent items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Image src="/assets/WiggleLogo.png" alt="Logo" width={28} height={28} className="object-contain" />
                            <span className="font-bold text-lg tracking-tight">EasyPost</span>
                        </div>

                        {/* Workspace Switcher */}
                        <div className="relative group">
                            <button 
                                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/20 transition-colors border border-transparent hover:border-white/10"
                            >
                                {/* Workspace Avatar */}
                                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-white border border-border">
                                    <img src={getAvatarUrl(currentWorkspace.name)} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{currentWorkspace.name}</span>
                                <ChevronDown size={14} className="text-muted-foreground" />
                            </button>
                            
                            <AnimatePresence>
                                {isAccountMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden p-1"
                                    >
                                        {myWorkspaces.map(ws => (
                                            <button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-lg transition-colors">
                                                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-white border border-border">
                                                    <img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="flex-1 truncate">{ws.name}</span>
                                                {currentWorkspace.id === ws.id && <Check size={14} className="text-primary"/>}
                                            </button>
                                        ))}
                                        <div className="h-px bg-border my-1"/>
                                        <button onClick={() => router.push('/onboarding')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted rounded-lg transition-colors"><Plus size={14}/> Create Workspace</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#111] border border-border px-3 py-1.5 rounded-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
                            <Search size={14} className="text-muted-foreground"/>
                            <input 
                                placeholder="Search..." 
                                className="bg-transparent text-sm outline-none w-48 text-foreground placeholder:text-muted-foreground/60"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <VoiceAiButton onCommand={handleVoiceCommand} />
                        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background animate-pulse" />}
                        </button>
                    </div>
                </header>

                {/* 🆕 HORIZONTAL NAVIGATION PILL (TRANSPARENT GLASS) */}
                <div className="hidden md:flex justify-center py-6 sticky top-0 z-30 pointer-events-none">
                    <nav className="flex items-center p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl pointer-events-auto ring-1 ring-white/5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                className={`
                                    flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300
                                    ${activeTab === item.id 
                                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(48,74,235,0.4)] scale-105' 
                                        : 'text-muted-foreground hover:text-white hover:bg-white/10'
                                    }
                                `}
                            >
                                <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 relative z-10">
                    <div className="max-w-[1000px] mx-auto pb-20 md:pb-0">
                        {activeTab === 'queue' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Composer onSchedule={handleAddPost} />
                                <div className="mt-8">
                                    <PostFeed posts={filteredPosts} accounts={accounts} />
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'analytics' && <Analytics />}
                        {activeTab === 'engagement' && <EngagementWithTabs />}
                        {activeTab === 'team' && <Team workspaceId={workspaceId} />}
                        {activeTab === 'settings' && <Settings workspaceId={workspaceId} workspaceName={currentWorkspace.name} />}
                    </div>
                </div>
            </main>
        </div>
    );
}

const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'}`}>
        <Icon size={18} /> {label}
    </button>
);

const EngagementWithTabs = () => {
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setSubTab('inbox')} className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${subTab === 'inbox' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/20 text-muted-foreground border border-border hover:bg-muted/40'}`}>
          <MessageCircle size={16} /> Inbox
        </button>
        <button onClick={() => setSubTab('analytics')} className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${subTab === 'analytics' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/20 text-muted-foreground border border-border hover:bg-muted/40'}`}>
          <BarChart2 size={16} /> Analytics
        </button>
      </div>
      {subTab === 'inbox' && <Engagement />}
      {subTab === 'analytics' && <EngagementAnalytics />}
    </div>
  );
};