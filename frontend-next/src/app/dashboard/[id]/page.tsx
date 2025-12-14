'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// UI Components
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, BarChart2, MessageCircle, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Loader2, 
  Cpu, Activity, User, Info, Sparkles 
} from 'lucide-react'; 

// Custom Components
import Composer from '@/src/component/easypost/Composer';
import PostFeed from '@/src/component/easypost/PostFeed';
import Analytics from '@/src/component/easypost/Analytics';
import Engagement from "@/src/component/easypost/Engagement";
import Settings from '@/src/component/easypost/Settings';
import EngagementAnalytics from '@/src/component/easypost/EngagementAnalytics';

// --- TYPES ---
type TabType = 'queue' | 'analytics' | 'engagement' | 'settings' | 'team';
type NotifType = 'team' | 'system' | 'ai' | 'general';

interface Notification {
  id: number;
  type: NotifType;
  message: string;
  time: string;
  read: boolean;
}

export default function BufferDashboard() {
    const params = useParams();
    const router = useRouter();
    
    // CONVEX: IDs are strings. 
    // We cast it to the specific ID type, but validate existence first.
    const workspaceId = params.id as Id<"workspaces">;

    // --- 1. DATA FETCHING (Real-time) ---
    const workspaces = useQuery(api.workspaces.getAll) || [];
    const currentWorkspace = workspaces.find(w => w._id === workspaceId);
    
    // Fetch Posts & Accounts for the current workspace
    // passing "skip: true" logic implicitly by checking workspaceId inside the query or here
    const posts = useQuery(api.posts.getWorkspacePosts, { workspaceId }); 
    const accounts = useQuery(api.accounts.getByWorkspace, { workspaceId });

    // Mutations
    const createPostMutation = useMutation(api.posts.createPost);

    // --- 2. UI STATE ---
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- 3. NOTIFICATION STATE (Mocked for now) ---
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'general', message: 'Welcome to EasyPost!', time: '2m ago', read: true }
    ]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifFilter, setNotifFilter] = useState<'all' | NotifType>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    // Redirect if workspace doesn't exist (after loading)
    useEffect(() => {
        if (workspaces.length > 0 && !currentWorkspace) {
            router.push(`/dashboard/${workspaces[0]._id}`);
        }
    }, [workspaces, currentWorkspace, router]);

    // --- HANDLERS ---

    const handleAddPost = async (content: string, date?: Date) => {
        // In a real app, you'd select the account in the composer. 
        // For now, we grab the first available account.
        if (!accounts || accounts.length === 0) {
            toast.error("Please connect a social account first.");
            return;
        }

        const promise = createPostMutation({
            workspaceId,
            accountId: accounts[0]._id, 
            content: content,
            scheduledTime: date ? date.getTime() : Date.now(),
        });

        toast.promise(promise, {
            loading: 'Scheduling post...',
            success: 'Post scheduled!',
            error: 'Failed to schedule post'
        });
    };

    // --- RENDER HELPERS ---
    
    // Loading State
    if (!currentWorkspace || posts === undefined || accounts === undefined) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary w-10 h-10"/>
                    <p className="text-muted-foreground text-sm">Loading workspace...</p>
                </div>
            </div>
        );
    }

    // Filter posts for search
    const filteredPosts = posts.filter(p => 
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock Plan Logic
    const PLAN_LIMITS: any = { 'free': 10, 'pro': 500, 'agency': 9999 };
    const currentLimit = PLAN_LIMITS[currentWorkspace.plan || 'free'] || 10;
    const postCount = posts.filter(p => p.status === 'scheduled').length;

    // Filter Notifications
    const filteredNotifs = notifFilter === 'all' 
        ? notifications 
        : notifications.filter(n => n.type === notifFilter);

    return (
        <div className="flex h-screen bg-[#F5F5F5] font-sans text-foreground">
            <Toaster position="bottom-right" richColors />

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-border flex flex-col z-20 flex-shrink-0 transition-all">
                {/* Account Switcher */}
                <div className="relative border-b border-border">
                    <button 
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="w-full h-16 flex items-center px-4 hover:bg-gray-50 transition-colors text-left group outline-none"
                    >
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold mr-3 shadow-sm" 
                             style={{ backgroundColor: '#3C48F6' }}>
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate text-gray-800">{currentWorkspace.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                        </div>
                        <ChevronDown className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isAccountMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full left-2 right-2 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden mt-1"
                            >
                                <div className="max-h-60 overflow-y-auto">
                                    {workspaces.map(ws => (
                                        <button 
                                            key={ws._id} 
                                            onClick={() => { setIsAccountMenuOpen(false); router.push(`/dashboard/${ws._id}`); }} 
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold bg-gray-400">
                                                {ws.name.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-medium flex-1 truncate ${currentWorkspace._id === ws._id ? 'text-primary' : 'text-gray-700'}`}>
                                                {ws.name}
                                            </span>
                                            {currentWorkspace._id === ws._id && <Check className="text-primary w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => router.push('/workspaces')} className="w-full flex items-center gap-2 border-t border-border bg-gray-50 px-4 py-3 text-xs font-bold text-primary hover:bg-blue-50 transition-colors">
                                    <Plus className="w-3 h-3" /> Manage / Add New
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1 flex-1">
                    <SidebarItem icon={Layers} label="Queue" active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
                    <SidebarItem icon={BarChart2} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem icon={MessageCircle} label="Engagement" active={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')} />
                    <SidebarItem icon={Users} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                    <SidebarItem icon={SettingsIcon} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                
                {/* Plan Indicator */}
                <div className="p-6 border-t border-border">
                    <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-primary to-blue-700">
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <p className="text-xs font-medium opacity-90 capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                            <button className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">Upgrade</button>
                        </div>
                        <div className="w-full bg-black/20 h-1.5 rounded-full mb-2 overflow-hidden relative z-10">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min((postCount / currentLimit) * 100, 100)}%` }} 
                                className="bg-white h-full rounded-full" 
                            />
                        </div>
                        <p className="text-[10px] font-bold relative z-10">{postCount} / {currentLimit} Posts</p>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg capitalize text-foreground tracking-tight">
                            {activeTab === 'queue' ? 'Content Queue' : activeTab}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-full border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent text-sm outline-none w-32 md:w-48 placeholder:text-muted-foreground"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* NOTIFICATION BELL */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifs(!showNotifs)}
                                className="relative text-muted-foreground hover:text-foreground transition-colors p-2"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {/* ... Notification Dropdown logic (omitted for brevity, keep your existing logic) ... */}
                        </div>
                        
                        <button className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:opacity-80">EasyAI</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto">
                        
                        {activeTab === 'queue' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                {/* Composer now takes a simple handler */}
                                <Composer onSchedule={handleAddPost} />
                                
                                <div className="mt-8">
                                    <PostFeed 
                                        posts={filteredPosts} 
                                        accounts={accounts}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && <Analytics />}
                        
                        {activeTab === 'engagement' && <EngagementWithTabs />}
                        
                        {activeTab === 'settings' && (
                            <Settings 
                                workspaceName={currentWorkspace.name}
                                workspacePlan={currentWorkspace.plan}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Sub-components 

const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${active ? 'bg-blue-50 text-primary shadow-sm' : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'}`}>
        <Icon size={18} className={active ? 'text-primary' : 'text-gray-400'} /> {label}
    </button>
);

const EngagementWithTabs = () => {
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setSubTab('inbox')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            subTab === 'inbox' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-border hover:bg-gray-50'
          }`}
        >
          <MessageCircle size={16} /> Inbox
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            subTab === 'analytics' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-border hover:bg-gray-50'
          }`}
        >
          <BarChart2 size={16} /> Analytics
        </button>
      </div>
      {subTab === 'inbox' && <Engagement />}
      {subTab === 'analytics' && <EngagementAnalytics />}
    </div>
  );
};