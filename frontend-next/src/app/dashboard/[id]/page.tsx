'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

// UI Components
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, BarChart2, MessageCircle, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Loader2, 
  Sparkles, Home 
} from 'lucide-react'; 

// Custom Components
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Engagement from "@/src/components/easypost/Engagement";
import Settings from '@/src/components/easypost/Settings';
import EngagementAnalytics from '@/src/components/easypost/EngagementAnalytics';
import Team from '@/src/components/easypost/Team';

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

export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;

    // 🌍 Config
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Data State (Replaces Convex Cache)
    const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
    const [myWorkspaces, setMyWorkspaces] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    // Notifications (Mocked for now)
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'general', message: 'Welcome to EasyPost!', time: '2m ago', read: true }
    ]);
    const [showNotifs, setShowNotifs] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // --- 1. FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // A. Get All Workspaces
            const wsRes = await fetch(`${API_URL}/workspaces`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const workspaces = await wsRes.json();
            setMyWorkspaces(workspaces);

            // B. Find Current Workspace
            const current = workspaces.find((w: any) => w.id === workspaceId);
            if (!current) {
                // If ID matches nothing, default to first one or 404
                if (workspaces.length > 0) {
                    setCurrentWorkspace(workspaces[0]);
                    // Update URL silently without reload if user landed on wrong ID
                    // router.replace(`/dashboard/${workspaces[0].id}`);
                } else {
                    setCurrentWorkspace(null); // No workspaces
                }
            } else {
                setCurrentWorkspace(current);
            }

            // C. Get Posts (Queue)
            if (workspaceId) {
                // TODO: You need to implement GET /workspaces/:id/posts in NestJS
                // For now, let's mock empty or use a generic endpoints
                // const postsRes = await fetch(`${API_URL}/posts?workspaceId=${workspaceId}`, ...);
                setPosts([]); // Placeholder
            }

            // D. Get Accounts
            if (workspaceId) {
                // We fetch social accounts linked to this workspace
                // Assuming GET /workspaces/:id returns socialAccounts array via Prisma include
                if (current && current.socialAccounts) {
                    setAccounts(current.socialAccounts);
                }
            }

        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [API_URL, router, workspaceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // --- 2. CREATE POST HANDLER ---
    const handleAddPost = async (
        content: string, 
        date?: Date, 
        mediaUrl?: string, 
        mediaType?: "image" | "video",
        category?: string,
        tags?: string[]
    ) => {
        const token = localStorage.getItem('accessToken');
        
        // Validation
        if (!accounts || accounts.length === 0) {
            toast.error("Please connect a social account first.", {
                description: "Go to Settings to connect Facebook or LinkedIn."
            });
            return;
        }

        const promise = fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                workspaceId,
                content,
                scheduledFor: date ? date.toISOString() : new Date().toISOString(),
                socialAccountIds: [accounts[0].id], // Default to first account for now
                mediaUrls: mediaUrl ? [mediaUrl] : [],
                mediaType: mediaType ? mediaType.toUpperCase() : 'IMAGE'
            })
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed');
            // Refresh posts
            // fetchData(); 
        });

        toast.promise(promise, {
            loading: 'Scheduling post...',
            success: 'Post scheduled!',
            error: 'Failed to schedule post'
        });
    };

    // --- RENDER ---
    
    // Loading State
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#3C48F6] w-10 h-10"/>
                    <p className="text-gray-500 text-sm font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    // Not Found State
    if (!currentWorkspace) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Workspace not found</h2>
                    <p className="text-gray-500 mb-4">You don't have access to this workspace or it doesn't exist.</p>
                    <button 
                        onClick={() => router.push('/onboarding')}
                        className="bg-[#3C48F6] text-white px-4 py-2 rounded-lg font-bold"
                    >
                        Create Workspace
                    </button>
                </div>
            </div>
        );
    }

    // Filter posts for search
    const filteredPosts = posts.filter(p => 
        p.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock Plan Limits (Update logic later with real subscription data)
    const PLAN_LIMITS: any = { 'free': 10, 'pro': 500, 'agency': 9999 };
    // Assuming plan is stored in workspace.description or a separate field
    const currentLimit = 10; 
    const postCount = posts.filter(p => p.status === 'SCHEDULED').length;

    return (
        <div className="flex h-screen bg-[#F5F5F5] font-sans text-gray-900">
            <Toaster position="bottom-right" richColors />

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 flex-shrink-0 transition-all">
                {/* Account Switcher */}
                <div className="relative border-b border-gray-200">
                    <button 
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="w-full h-16 flex items-center px-4 hover:bg-gray-50 transition-colors text-left group outline-none"
                    >
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold mr-3 shadow-sm bg-[#3C48F6]">
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate text-gray-800">{currentWorkspace.name}</h3>
                            <p className="text-xs text-gray-400 capitalize">Free Plan</p>
                        </div>
                        <ChevronDown className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isAccountMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full left-2 right-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden mt-1"
                            >
                                <div className="max-h-60 overflow-y-auto">
                                    {myWorkspaces.map(ws => (
                                        <button 
                                            key={ws.id} 
                                            onClick={() => { setIsAccountMenuOpen(false); router.push(`/dashboard/${ws.id}`); }} 
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold bg-gray-400">
                                                {ws.name.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-medium flex-1 truncate ${currentWorkspace.id === ws.id ? 'text-[#3C48F6]' : 'text-gray-700'}`}>
                                                {ws.name}
                                            </span>
                                            {currentWorkspace.id === ws.id && <Check className="text-[#3C48F6] w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => router.push('/onboarding')} className="w-full flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold text-[#3C48F6] hover:bg-blue-50 transition-colors">
                                    <Plus className="w-3 h-3" /> Create New Workspace
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
                
                {/* BOTTOM SECTION */}
                <div className="p-4 border-t border-gray-200 space-y-4">
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#3C48F6] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Home size={18} />
                        Back to Home
                    </button>

                    <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#3C48F6] to-blue-700">
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <p className="text-xs font-medium opacity-90 capitalize">Free Plan</p>
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
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg capitalize text-gray-900 tracking-tight">
                            {activeTab === 'queue' ? 'Content Queue' : activeTab}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-[#3C48F6]/20 transition-all">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent text-sm outline-none w-32 md:w-48 placeholder:text-gray-400 text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifs(!showNotifs)}
                                className="relative text-gray-400 hover:text-gray-700 transition-colors p-2"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
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
                        {activeTab === 'team' && <Team workspaceId={workspaceId} />}
                        {activeTab === 'engagement' && <EngagementWithTabs />}
                        {activeTab === 'settings' && (
                            <Settings 
                                workspaceId={workspaceId}
                                workspaceName={currentWorkspace.name}
                                workspacePlan={currentWorkspace.plan || 'free'}
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${active ? 'bg-blue-50 text-[#3C48F6] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
        <Icon size={18} className={active ? 'text-[#3C48F6]' : 'text-gray-400'} /> {label}
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
            subTab === 'inbox' ? 'bg-[#3C48F6] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageCircle size={16} /> Inbox
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            subTab === 'analytics' ? 'bg-[#3C48F6] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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