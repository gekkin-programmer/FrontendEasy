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

    // Notifications
    const [notifications] = useState<any[]>([
        { id: 1, type: 'general', message: 'Welcome to EasyPost!', time: '2m ago', read: false }
    ]);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Force Dark Mode
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { router.push('/login'); return; }

        try {
            const wsRes = await fetch(`${API_URL}/workspaces`, { headers: { Authorization: `Bearer ${token}` } });
            const workspaces = await wsRes.json();
            setMyWorkspaces(workspaces);

            if (workspaces.length === 0) { router.push('/onboarding'); return; }

            const current = workspaces.find((w: any) => w.id === workspaceId);
            if (!current) { router.replace(`/dashboard/${workspaces[0].id}`); return; }

            setCurrentWorkspace(current);
            setAccounts(current.socialAccounts || []);

            const postsRes = await fetch(`${API_URL}/posts?workspaceId=${workspaceId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (postsRes.ok) setPosts(await postsRes.json());

        } catch (error) { toast.error("Failed to load dashboard"); } 
        finally { setLoading(false); }
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

    // Helper for DiceBear URL
    const getAvatarUrl = (seed: string) => 
        `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`;

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
            <Toaster position="bottom-right" theme="system" />

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
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm">
                        <img 
                            src={getAvatarUrl(currentWorkspace.name)} 
                            alt={currentWorkspace.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <AnimatePresence>
                {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        
                        <motion.aside 
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed md:static inset-y-0 left-0 w-72 md:w-64 bg-background border-r border-border flex flex-col z-50 md:z-auto"
                        >
                            {/* Workspace Switcher */}
                            <div className="relative border-b border-border p-4 pt-6 md:pt-4">
                                <button 
                                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                    // ✨ UPDATED HOVER: Matching the premium dark hover
                                    className="w-full flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent hover:bg-[#1a1a1a] group"
                                >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shadow-sm flex-shrink-0 bg-white">
                                        <img 
                                            src={getAvatarUrl(currentWorkspace.name)} 
                                            alt={currentWorkspace.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className="font-bold text-sm truncate text-foreground group-hover:text-white transition-colors">{currentWorkspace.name}</h3>
                                        <p className="text-xs text-muted-foreground">Pro Plan</p>
                                    </div>
                                    <ChevronDown className="text-muted-foreground w-4 h-4 group-hover:text-white transition-colors" />
                                </button>

                                <AnimatePresence>
                                    {isAccountMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-4 right-4 bg-popover border border-border rounded-xl shadow-2xl z-50 mt-2 overflow-hidden"
                                        >
                                            <div className="max-h-60 overflow-y-auto">
                                                {myWorkspaces.map(ws => (
                                                    <button 
                                                        key={ws.id} 
                                                        onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); setIsSidebarOpen(false); }} 
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left text-sm border-b border-border last:border-0 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-border bg-white">
                                                            <img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className={`font-medium truncate flex-1 ${currentWorkspace.id === ws.id ? 'text-primary' : ''}`}>{ws.name}</span>
                                                        {currentWorkspace.id === ws.id && <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={() => router.push('/onboarding')} className="w-full flex items-center gap-2 bg-muted/20 px-4 py-3 text-xs font-bold text-primary hover:bg-muted/40 transition-colors border-t border-border">
                                                <Plus className="w-3 h-3" /> New Workspace
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Nav Links */}
                            <nav className="p-4 space-y-1 flex-1">
                                <SidebarItem icon={Layers} label="Queue" active={activeTab === 'queue'} onClick={() => { setActiveTab('queue'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={BarChart2} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={MessageCircle} label="Engagement" active={activeTab === 'engagement'} onClick={() => { setActiveTab('engagement'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={Users} label="Team" active={activeTab === 'team'} onClick={() => { setActiveTab('team'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={SettingsIcon} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
                            </nav>

                            {/* Bottom Actions */}
                            <div className="p-4 border-t border-border space-y-4 bg-background">
                                {/* ✨ UPDATED HOVER: Matching SidebarItem */}
                                <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-muted-foreground rounded-lg transition-colors hover:bg-[#1a1a1a] hover:text-white">
                                    <Home size={18} /> Back to Home
                                </button>
                                
                                {/* Usage Bar */}
                                <div className="rounded-xl p-4 text-primary-foreground shadow-lg relative overflow-hidden bg-gradient-to-br from-primary to-blue-900 border border-white/10">
                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                        <p className="text-xs font-medium opacity-90">Usage</p>
                                        <button className="text-[10px] bg-black/20 hover:bg-black/40 px-2 py-1 rounded backdrop-blur-md transition-colors">Upgrade</button>
                                    </div>
                                    <div className="w-full bg-black/30 h-1.5 rounded-full mb-2 overflow-hidden relative z-10">
                                        <div className="bg-white h-full rounded-full shadow-sm" style={{ width: `${Math.min((postCount / 10) * 100, 100)}%` }} />
                                    </div>
                                    <p className="text-[10px] font-bold relative z-10 text-blue-100">{postCount} / 10 Posts</p>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative pt-16 md:pt-0 bg-background">
                {/* Desktop Header */}
                <header className="hidden md:flex h-16 bg-background/80 backdrop-blur-md border-b border-border items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Image src="/assets/WiggleLogo.png" alt="Logo" width={28} height={28} className="object-contain" />
                            <h2 className="font-bold text-xl capitalize text-foreground tracking-tight">{activeTab}</h2>
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

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-[1200px] mx-auto pb-20 md:pb-0">
                        {activeTab === 'queue' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
        active 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(48,74,235,0.15)]' 
        : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-white border border-transparent'
    }`}>
        <Icon size={18} className={`transition-colors ${active ? 'text-primary' : 'group-hover:text-white text-muted-foreground'}`} /> 
        {label}
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