'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { 
  FiLayers, FiBarChart2, FiMessageCircle, FiSettings, 
  FiSearch, FiBell, FiCheck, FiChevronDown, FiPlus, FiUsers, FiLoader
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import { INITIAL_POSTS, Post } from '@/src/components/easypost/types';

// Services
import { getWorkspaces, Workspace } from '@/services/workspaceApi';
import { createPost } from '@/services/postApi';

type TabType = 'queue' | 'analytics' | 'engagement' | 'settings' | 'team';

export default function BufferDashboard() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = Number(params.id); // Get ID from URL

    // --- REAL STATE ---
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- UI STATE ---
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    // 1. LOAD REAL DATA
    useEffect(() => {
        const load = async () => {
            const all = await getWorkspaces();
            setWorkspaces(all);
            
            const found = all.find(w => w.id === workspaceId);
            if (found) {
                setCurrentWorkspace(found);
            } else if (all.length > 0) {
                // Fallback if ID invalid: go to first workspace
                router.push(`/dashboard/${all[0].id}`);
            } else {
                // No workspaces at all? Go create one
                router.push('/workspaces');
            }
            setIsLoading(false);
        };
        load();
    }, [workspaceId, router]);

    // 2. HANDLE SWITCHING WORKSPACES
    const switchWorkspace = (id: number) => {
        setIsAccountMenuOpen(false);
        router.push(`/dashboard/${id}`); // Next.js handles the reload/transition
    };

    // 3. CONNECT TO API (Using the FastAPI logic we built)
    const handleAddPost = async (postData: any, file?: File | null) => {
        try {
            // Optimistic UI Update (Show immediately)
            const tempPost = { ...postData, id: Date.now(), media: file ? URL.createObjectURL(file) : undefined };
            setPosts([tempPost, ...posts]);
            
            // Real API Call
            await createPost(postData, file);
            toast.success("Post scheduled successfully!");
        } catch (err) {
            toast.error("Failed to schedule post");
            // Revert optimistic update if needed
        }
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

    return (
        <div className="flex h-screen bg-[#F5F5F5] font-sans text-gray-800">
            <Toaster position="bottom-right" richColors />

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 flex-shrink-0 transition-all">
                
                {/* 1. Dynamic Account Switcher */}
                <div className="relative border-b border-gray-100">
                    <button 
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="w-full h-16 flex items-center px-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold mr-3 shadow-sm transition-transform group-hover:scale-105"
                            style={{ backgroundColor: currentWorkspace.color || '#3C48F6' }}
                        >
                            {currentWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate text-gray-800">{currentWorkspace.name}</h3>
                            <p className="text-xs text-gray-400 capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                        </div>
                        <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Workspace Dropdown */}
                    <AnimatePresence>
                        {isAccountMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-2 right-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden mt-1"
                            >
                                <div className="max-h-60 overflow-y-auto">
                                    {workspaces.map(ws => (
                                        <button 
                                            key={ws.id} 
                                            onClick={() => switchWorkspace(ws.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ws.color }}>
                                                {ws.name.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-medium flex-1 truncate ${currentWorkspace.id === ws.id ? 'text-blue-600' : 'text-gray-700'}`}>
                                                {ws.name}
                                            </span>
                                            {currentWorkspace.id === ws.id && <FiCheck className="text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => router.push('/workspaces')} className="w-full flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                                    <FiPlus /> Manage / Add New
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Navigation */}
                <nav className="p-4 space-y-1 flex-1">
                    <SidebarItem icon={FiLayers} label="Queue" active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
                    <SidebarItem icon={FiBarChart2} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem icon={FiMessageCircle} label="Engagement" active={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')} />
                    
                    {/* 3. Smart Upgrade: Only show 'Team' if Agency/Enterprise */}
                    {['agency', 'enterprise'].includes(currentWorkspace.plan || '') && (
                        <SidebarItem icon={FiUsers} label="Team Members" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                    )}
                    
                    <SidebarItem icon={FiSettings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                
                {/* 4. Plan Usage Indicator */}
                <div className="p-6 border-t border-gray-100">
                    <div className={`rounded-xl p-4 text-white shadow-lg relative overflow-hidden ${currentLimit.color}`}>
                        {/* Abstract Background Shape */}
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
                        
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <p className="text-xs font-medium opacity-90 capitalize">{currentWorkspace.plan || 'Free'} Plan</p>
                            <button className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">Upgrade</button>
                        </div>
                        
                        <div className="w-full bg-black/20 h-1.5 rounded-full mb-2 overflow-hidden relative z-10">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '45%' }} // Mock usage data
                                className="bg-white h-full rounded-full"
                            />
                        </div>
                        <p className="text-[10px] font-bold relative z-10">45 / {currentLimit.posts} Posts</p>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg capitalize text-gray-800 tracking-tight">
                            {activeTab === 'queue' ? 'Content Queue' : activeTab}
                        </h2>
                        {/* Breadcrumb / Context */}
                        <span className="hidden md:block text-sm text-gray-400 border-l border-gray-200 pl-4">
                            {currentWorkspace.name}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <FiSearch size={14} />
                            <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-32 md:w-48" />
                        </div>
                        
                        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                            <FiBell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <button className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white">
                                <MagicIcon className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:opacity-80">
                                EasyAI
                            </span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto">
                        
                        {/* TAB: QUEUE */}
                        {activeTab === 'queue' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.4 }}
                            >
                                <Composer onAdd={handleAddPost} />
                                <PostFeed posts={posts} setPosts={setPosts} />
                            </motion.div>
                        )}

                        {/* TAB: ANALYTICS */}
                        {activeTab === 'analytics' && <Analytics />}

                        {/* TAB: SETTINGS/OTHER */}
                        {(activeTab === 'engagement' || activeTab === 'settings' || activeTab === 'team') && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <FiSettings size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-600 capitalize">{activeTab} Module</h3>
                                <p className="text-gray-400 max-w-xs mt-2">This module is under construction. Connect your API to see real data here.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Sub-components
const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200
        ${active 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} /> {label}
    </button>
);

const MagicIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 4L14.4 9.6L20 12L14.4 14.4L12 20L9.6 14.4L4 12L9.6 9.6L12 4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);