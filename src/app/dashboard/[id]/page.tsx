'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { 
  FiLayers, FiBarChart2, FiMessageCircle, FiSettings, 
  FiSearch, FiBell, FiCheck, FiChevronDown, FiPlus, FiUsers, FiLoader,
  FiCpu, FiActivity, FiUser, FiInfo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Engagement from "@/src/components/easypost/Engagement";
import Settings from '@/src/components/easypost/Settings';
import EngagementAnalytics from '@/src/components/easypost/EngagementAnalytics';
import { INITIAL_POSTS, Post } from '@/src/components/easypost/types';

// Services
import { getWorkspaces, Workspace } from '@/services/workspaceApi';
import { createPost } from '@/services/postApi';

// --- NOTIFICATION TYPES ---
type NotifType = 'team' | 'system' | 'ai' | 'general';

interface Notification {
  id: number;
  type: NotifType;
  message: string;
  time: string;
  read: boolean;
}

// --- MOCK GENERATORS ---
const MOCK_MESSAGES = {
  team: ["Sarah commented on 'Launch Post'", "Mike approved the draft", "New member joined workspace", "Design team uploaded assets"],
  system: ["Twitter API reconnected", "Instagram token expiring soon", "Scheduled maintenance in 10m", "Database sync complete"],
  ai: [" Trend Alert: #SaaS is peaking", "Tip: Post at 3pm for +20% reach", "AI generated 3 caption variations", "Content analysis complete"],
  general: ["Weekly report is ready", "Your plan renews in 3 days", "Welcome to your dashboard", "Dark mode is now available"]
};

const getRandomMsg = () => {
  const types: NotifType[] = ['team', 'system', 'ai', 'general'];
  const type = types[Math.floor(Math.random() * types.length)];
  const msgs = MOCK_MESSAGES[type];
  return {
    id: Date.now(),
    type,
    message: msgs[Math.floor(Math.random() * msgs.length)],
    time: 'Just now',
    read: false
  };
};

type TabType = 'queue' | 'analytics' | 'engagement' | 'settings' | 'team';

export default function BufferDashboard() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = Number(params.id); 

    // --- REAL STATE ---
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- UI STATE ---
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    // --- NOTIFICATION STATE ---
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'general', message: 'Welcome to EasyPost!', time: '2m ago', read: true }
    ]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifFilter, setNotifFilter] = useState<'all' | NotifType>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    // 1. LOAD REAL DATA
    useEffect(() => {
        const load = async () => {
            const all = await getWorkspaces();
            setWorkspaces(all);
            const found = all.find(w => w.id === workspaceId);
            if (found) setCurrentWorkspace(found);
            else if (all.length > 0) router.push(`/dashboard/${all[0].id}`);
            else router.push('/workspaces');
            setIsLoading(false);
        };
        load();
    }, [workspaceId, router]);

    // 2. LIVE NOTIFICATION SIMULATION
    useEffect(() => {
        // Add a new notification every 3-8 seconds
        const interval = setInterval(() => {
            const newNotif = getRandomMsg();
            setNotifications(prev => [newNotif, ...prev.slice(0, 19)]); // Keep last 20
            setUnreadCount(prev => prev + 1);
            
            // Optional: Play a tiny sound here
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);

    // 3. HANDLERS
    const switchWorkspace = (id: number) => {
        setIsAccountMenuOpen(false);
        router.push(`/dashboard/${id}`);
    };

            // A. ADD POST
    const handleAddPost = async (postData: any, file?: File | null) => {
        try {
            const tempPost = { ...postData, id: Date.now(), media: file ? URL.createObjectURL(file) : undefined };
            setPosts([tempPost, ...posts]);
            
            await createPost(postData, file);

            // CUSTOM NOTIFICATION BASED ON STATUS
            if (postData.status === 'queued') {
                toast.success("Post added to Queue", { description: "It will be published automatically." });
            } else {
                toast.info("Draft Saved", { description: "You can drag it to the queue later." });
            }

        } catch (err) {
            toast.error("Failed to save post");
        }
    };

        // B. DELETE POST (Context Aware)
    const handleDeletePost = async (id: number, status: string) => {
        // Optimistic Delete
        setPosts(prev => prev.filter(p => p.id !== id));

        // Custom Toast Messages
        if (status === 'draft') {
            toast.info("Draft Discarded", { description: "The draft has been removed." });
        } else if (status === 'queued') {
            toast.warning("Removed from Queue", { description: "This post will not be published." });
        } else {
            toast.error("Post Deleted", { description: "Removed from history." });
        }
        
        // await deletePost(id); // Call real API here
    };

        // C. UPDATE STATUS (Drag & Drop Logic)
    const handleStatusChange = async (id: number, newStatus: 'queued' | 'draft') => {
        // Update Local State
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, status: newStatus, scheduledTime: new Date().toISOString() };
            }
            return p;
        }));

        // Show "Published" Notification
        if (newStatus === 'queued') {
            toast.success("Moved to Queue!", { 
                description: "Post is now scheduled for publishing.",
                icon: <FiCheck className="text-green-500 text-lg" />
            });
            // await updatePost(id, { status: 'queued' });
        }
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
        setUnreadCount(0);
    };

    if (isLoading || !currentWorkspace) return <div className="h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-600 w-8 h-8"/></div>;

    // --- PLAN LIMIT LOGIC ---
    const PLAN_LIMITS: any = {
        'free': { posts: 10, color: 'bg-gray-500' },
        'starter': { posts: 100, color: 'bg-blue-500' },
        'pro': { posts: 500, color: 'bg-purple-500' },
        'agency': { posts: 9999, color: 'bg-indigo-600' }
    };
    const currentLimit = PLAN_LIMITS[currentWorkspace.plan || 'free'];

    // --- NOTIFICATION FILTER LOGIC ---
    const filteredNotifs = notifFilter === 'all' 
        ? notifications 
        : notifications.filter(n => n.type === notifFilter);

    return (
        <div className="flex h-screen bg-[#F5F5F5] font-sans text-gray-800">
            <Toaster position="bottom-right" richColors />

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 flex-shrink-0 transition-all">
                {/* Account Switcher */}
                <div className="relative border-b border-gray-100">
                    <button 
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="w-full h-16 flex items-center px-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold mr-3 shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: currentWorkspace.color || '#3C48F6' }}>
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate text-gray-800">{currentWorkspace.name}</h3>
                            <p className="text-xs text-gray-400 capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                        </div>
                        <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
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
                                    {workspaces.map(ws => (
                                        <button key={ws.id} onClick={() => switchWorkspace(ws.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left">
                                            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ws.color }}>{ws.name.charAt(0)}</div>
                                            <span className={`text-sm font-medium flex-1 truncate ${currentWorkspace.id === ws.id ? 'text-blue-600' : 'text-gray-700'}`}>{ws.name}</span>
                                            {currentWorkspace.id === ws.id && <FiCheck className="text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => router.push('/workspaces')} className="w-full flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"><FiPlus /> Manage / Add New</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1 flex-1">
                    <SidebarItem icon={FiLayers} label="Queue" active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
                    <SidebarItem icon={FiBarChart2} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem icon={FiMessageCircle} label="Engagement" active={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')} />
                    {['agency', 'enterprise'].includes(currentWorkspace.plan || '') && (
                        <SidebarItem icon={FiUsers} label="Team Members" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                    )}
                    <SidebarItem icon={FiSettings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                
                {/* Plan Indicator */}
                <div className="p-6 border-t border-gray-100">
                    <div className={`rounded-xl p-4 text-white shadow-lg relative overflow-hidden ${currentLimit.color}`}>
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <p className="text-xs font-medium opacity-90 capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                            <button className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">Upgrade</button>
                        </div>
                        <div className="w-full bg-black/20 h-1.5 rounded-full mb-2 overflow-hidden relative z-10">
                            <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="bg-white h-full rounded-full" />
                        </div>
                        <p className="text-[10px] font-bold relative z-10">45 / {currentLimit.posts} Posts</p>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg capitalize text-gray-800 tracking-tight">{activeTab === 'queue' ? 'Content Queue' : activeTab}</h2>
                        <span className="hidden md:block text-sm text-gray-400 border-l border-gray-200 pl-4">{currentWorkspace.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <FiSearch size={14} />
                            <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-32 md:w-48" />
                        </div>
                        
                        {/* NOTIFICATION BELL & DROPDOWN */}
                        <div className="relative">
                            <button 
                                onClick={() => { setShowNotifs(!showNotifs); if(unreadCount > 0 && !showNotifs) markAllRead(); }}
                                className="relative text-gray-400 hover:text-gray-600 transition-colors p-2"
                            >
                                <FiBell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifs && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right"
                                    >
                                        {/* Notif Header */}
                                        <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="font-bold text-sm text-gray-700">Notifications</h3>
                                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                                        </div>
                                        
                                        {/* Filter Tabs */}
                                        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                                            {[
                                                { id: 'all', icon: null, label: 'All' },
                                                { id: 'team', icon: FiUsers, label: 'Team' },
                                                { id: 'system', icon: FiActivity, label: 'System' },
                                                { id: 'ai', icon: FiCpu, label: 'AI' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setNotifFilter(tab.id as any)}
                                                    className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors ${notifFilter === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    {tab.icon && <tab.icon size={10} />} {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Notif List */}
                                        <div className="max-h-80 overflow-y-auto">
                                            <AnimatePresence initial={false}>
                                                {filteredNotifs.map((notif) => (
                                                    <motion.div 
                                                        key={notif.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`p-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                                                            ${notif.type === 'team' ? 'bg-blue-100 text-blue-600' : 
                                                              notif.type === 'ai' ? 'bg-purple-100 text-purple-600' : 
                                                              notif.type === 'system' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                                                        >
                                                            {notif.type === 'team' && <FiUser size={14} />}
                                                            {notif.type === 'ai' && <FiCpu size={14} />}
                                                            {notif.type === 'system' && <FiActivity size={14} />}
                                                            {notif.type === 'general' && <FiInfo size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
                                                        </div>
                                                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {filteredNotifs.length === 0 && (
                                                <div className="p-8 text-center text-gray-400 text-xs">No notifications</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white">
                                <MagicIcon className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:opacity-80">EasyAI</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto">
                            {activeTab === 'queue' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Composer onAdd={handleAddPost} />
            
            {/* PASS THE NEW HANDLERS */}
            <PostFeed 
                posts={posts} 
                onDelete={handleDeletePost} 
                onStatusChange={handleStatusChange} 
            />
        </motion.div>
    )}
                        {activeTab === 'analytics' && <Analytics />}
                        {activeTab === 'engagement' && (
  <EngagementWithTabs />
)}
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

// Sub-components (SidebarItem, MagicIcon remain same as previous file)
const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
        <Icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} /> {label}
    </button>
);

const MagicIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 4L14.4 9.6L20 12L14.4 14.4L12 20L9.6 14.4L4 12L9.6 9.6L12 4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const EngagementWithTabs = () => {
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');
  
  return (
    <div>
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setSubTab('inbox')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            subTab === 'inbox' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiMessageCircle className="inline mr-2" size={16} />
          Inbox
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            subTab === 'analytics' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiBarChart2 className="inline mr-2" size={16} />
          Analytics
        </button>
      </div>
      
      {/* Content */}
      {subTab === 'inbox' && <Engagement />}
      {subTab === 'analytics' && <EngagementAnalytics />}
    </div>
  );
};