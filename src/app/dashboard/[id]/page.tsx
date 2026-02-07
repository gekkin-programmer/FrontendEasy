'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next';

// ICONS
import { 
  Layers, BarChart2, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Menu, X, 
  ExternalLink, ArrowRight, Calendar as CalendarIcon, Home,
  AlertTriangle, Crown, MessageCircle
} from 'lucide-react'; 

// COMPONENTS
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Settings from '@/src/components/easypost/Settings';
import Team from '@/src/components/easypost/Team';
import VoiceAiButton from '@/src/components/easypost/VoiceAiButton';
import CalendarView from '@/src/components/easypost/CalendarView';
import SpinningLoader from '@/src/components/SpinningLoader';

// EXTRACTED COMPONENTS
import { NeuButton, NeuCard, NeuInput, NeuModal } from '@/src/components/easypost/DashboardUI';
import { QuickConnectSidebar } from '@/src/components/easypost/QuickConnectSidebar';
import { FacebookPageSelector } from '@/src/components/easypost/FacebookPageSelector';
import { SidebarItem } from '@/src/components/easypost/SidebarItem';
import { EngagementWithTabs } from '@/src/components/easypost/EngagementWithTabs';

// SOCKET
import { SocketProvider, useSocket } from '@/src/context/SocketContext';

import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TabType = 'queue' |'calendar' | 'analytics' | 'engagement' | 'settings' | 'team';

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';

    return (
        <Suspense fallback={<SpinningLoader fullScreen={true} />}>
            <SocketProvider workspaceId={workspaceId}>
                <DashboardContent />
            </SocketProvider>
        </Suspense>
    );
}

function DashboardContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    // UI States
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    
    // OAUTH STATES
    const [isFbPageSelectorOpen, setIsFbPageSelectorOpen] = useState(false);
    const [tempExchangeToken, setTempExchangeToken] = useState("");
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // --- QUERIES ---
    const { data: myWorkspaces = [] } = useQuery({ 
        queryKey: ['workspaces'], 
        queryFn: () => api.get<any[]>('/workspaces').then(res => Array.isArray(res) ? res : (res as any)?.data || []) 
    });

    const { data: currentWorkspace, isLoading: currentWsLoading } = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => api.get<any>(`/workspaces/${workspaceId}`).then(res => res?.data || res),
        enabled: !!workspaceId,
    });

    const { data: accounts = [], refetch: refetchAccounts } = useQuery({
        queryKey: ['social-accounts', workspaceId],
        queryFn: () => api.get<any[]>(`/social-accounts?workspaceId=${workspaceId}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
    });

    const { data: posts = [], refetch: refetchPosts } = useQuery({
        queryKey: ['posts', workspaceId, searchTerm],
        queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&search=${encodeURIComponent(searchTerm)}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
        refetchInterval: 60000, 
    });

    // 🟢 REAL-TIME LISTENERS
    useEffect(() => {
        if (!socket) return;

        socket.on('post_created', (newPost) => {
            toast.success(`NEW_NODE_CREATED: ${newPost.content.substring(0, 20)}...`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_updated', (updatedPost) => {
            toast.info(`NODE_UPDATED: ${updatedPost.content.substring(0, 20)}...`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_deleted', ({ id }) => {
            toast.warning(`NODE_REMOVED`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        return () => {
            socket.off('post_created');
            socket.off('post_updated');
            socket.off('post_deleted');
        };
    }, [socket, workspaceId, queryClient, refetchPosts]);

    // 🟢 MANUAL UPDATE HELPER (Optimistic UI)
    const manuallyAddAccount = (newAccount: any) => {
        queryClient.setQueryData(['social-accounts', workspaceId], (oldData: any[]) => {
            if (!oldData) return [newAccount];
            const exists = oldData.some(a => a.id === newAccount.id);
            return exists ? oldData : [...oldData, newAccount];
        });
    };

    // --- OAUTH LOGIC ---
    useEffect(() => {
        const selectionMode = searchParams.get('social_selection');
        const connected = searchParams.get('social_connected');
        const success = searchParams.get('success'); 
        const token = searchParams.get('exchange_token');

        if (selectionMode === 'facebook') {
            if (token) setTempExchangeToken(token);
            setIsFbPageSelectorOpen(true);
        }

        if (connected === 'true' || success === 'true') {
            toast.success("CONNECTION_ESTABLISHED");
            const url = new URL(window.location.href);
            url.searchParams.delete('social_connected');
            url.searchParams.delete('social_selection');
            url.searchParams.delete('exchange_token');
            url.searchParams.delete('platform');
            url.searchParams.delete('success');
            window.history.replaceState(null, '', url.pathname);
            refetchAccounts();
            queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
        }
    }, [searchParams, queryClient, workspaceId, refetchAccounts]);


    // --- MUTATIONS ---
    const createWorkspaceMutation = useMutation({
        mutationFn: (name: string) => api.post<any>('/workspaces', { name }),
        onSuccess: (res) => {
            toast.success("WORKSPACE_INITIALIZED");
            setIsCreateModalOpen(false);
            setNewWorkspaceName("");
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            router.push(`/dashboard/${res.data.id}`);
        },
        onError: () => toast.error("INIT_FAILED")
    });

    const upsertPostMutation = useMutation({
        mutationFn: (payload: any) => {
            if (payload.id) return api.patch(`/posts/${payload.id}`, payload);
            return api.post('/posts', payload);
        },
        onSuccess: () => {
            toast.success("TRANSACTION_COMMITTED");
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] }); 
            setEditingPost(null);
        },
        onError: () => toast.error("TRANSACTION_FAILED")
    });

    const handleCreateWorkspace = () => {
        if (!newWorkspaceName.trim()) return toast.error("INPUT_NAME_REQUIRED");
        createWorkspaceMutation.mutate(newWorkspaceName);
    };

    const handleAddPost = async (content: string, date?: Date, mediaIds?: string[], status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT', selectedAccountIds?: string[], postId?: string, targetWorkspaceId?: string) => {
        const targets = selectedAccountIds && selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
        if (targets.length === 0) { toast.error("ERR_NO_NODES_SELECTED"); return; }
        upsertPostMutation.mutate({ 
            id: postId,
            workspaceId: targetWorkspaceId || workspaceId, 
            content, 
            scheduledFor: date ? date.toISOString() : undefined, 
            status, 
            socialAccountIds: targets, 
            mediaIds: mediaIds || [] 
        });
    };

    const handleVoiceCommand = (transcription: string) => {
        const text = transcription.toLowerCase();
        if (text.includes("analytics")) setActiveTab("analytics");
        else if (text.includes("team")) setActiveTab("team");
        else if (text.includes("queue")) setActiveTab("queue");
        else toast.info(`AI_CMD: ${text.substring(0, 20)}...`);
    };

    const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

    if (currentWsLoading) return <SpinningLoader fullScreen={true} />;
    
    const navItems = [{ id: 'queue', label: 'Queue', icon: Layers }, { id: 'calendar', label: 'Calendar', icon: CalendarIcon }, { id: 'analytics', label: 'Analytics', icon: BarChart2 }, { id: 'engagement', label: 'Inbox', icon: MessageCircle }, { id: 'team', label: 'Team', icon: Users }, { id: 'settings', label: 'Config', icon: SettingsIcon }];

    return (
        <div className="min-h-screen bg-[#F4F4F0] dark:bg-black font-sans text-black dark:text-white relative selection:bg-yellow-300 transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 border-2 border-transparent active:bg-yellow-100 dark:active:bg-zinc-800"><Menu size={24} className="text-black dark:text-white" /></button><div className="font-black text-xl tracking-tighter italic text-black dark:text-white">EASYPOST.</div></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-none border-2 border-black dark:border-white overflow-hidden bg-white dark:bg-black"><img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div></div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-black border-r-4 border-black dark:border-white flex flex-col z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.2)]"><div className="p-6 border-b-2 border-black dark:border-white flex justify-between items-center bg-[#3C48F5] text-white"><span className="font-black text-xl uppercase">Menu</span><button onClick={() => setIsSidebarOpen(false)} className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-red-500 hover:text-white transition-colors p-1"><X/></button></div><nav className="p-4 space-y-3">{navItems.map(item => (<SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} />))}</nav></motion.aside></>
                )}
            </AnimatePresence>

            {/* Main Layout */}
            <main className="relative z-10 flex flex-col min-h-screen">
                <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white/95 dark:bg-black/90 backdrop-blur-sm border-b-4 border-black dark:border-white items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/')}
                                className="p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-blue-50 dark:hover:bg-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                title="Back to Home"
                            >
                                <Home size={20} strokeWidth={3} className="text-black dark:text-white" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                                    <Image 
                                        src="/applogo.png" 
                                        alt="EasyPost Logo" 
                                        width={40} 
                                        height={40} 
                                        className="object-contain p-1" 
                                    />
                                </div>
                                <span className="font-black text-2xl tracking-tighter italic text-black dark:text-white">ASYPOST.</span>
                            </div>
                        </div>
                        <div className="relative group"><button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all"><div className="w-6 h-6 border-2 border-black dark:border-white rounded-none overflow-hidden bg-gray-100 dark:bg-zinc-800"><img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div><span className="text-sm font-bold uppercase truncate max-w-[120px] text-black dark:text-white">{currentWorkspace?.name || 'Select'}</span><ChevronDown size={16} className="text-black dark:text-white" /></button>
                            <AnimatePresence>{isAccountMenuOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] z-50 p-2 origin-top"><div className="space-y-1">{myWorkspaces.map((ws: any) => (<button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-yellow-200 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-black dark:hover:border-white transition-all"><div className="w-5 h-5 border border-black dark:border-white overflow-hidden bg-gray-50 dark:bg-zinc-800"><img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" /></div><span className="flex-1 font-bold truncate text-black dark:text-white">{ws.name}</span>{currentWorkspace?.id === ws.id && <Check size={16} className="text-blue-600 border-2 border-transparent"/>}</button>))}</div><div className="h-0.5 bg-black dark:bg-white my-2"/><button onClick={() => { setIsCreateModalOpen(true); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-blue-600 transition-all"><Plus size={16}/> New Workspace</button></motion.div>)}</AnimatePresence>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <NeuInput placeholder="SEARCH_DATABASE..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} style={{ width: '250px' }} />
                            <div className="bg-black dark:bg-white text-white dark:text-black p-2.5 border-2 border-black dark:border-white">
                                <Search size={18} />
                            </div>
                        </div>
                        
                        {/* 🔔 FUNCTIONAL NOTIFICATION BELL */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="relative p-2.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all group">
                                    <Bell size={20} className="text-black dark:text-white group-hover:rotate-12 transition-transform" />
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#3C48F5] border-2 border-black dark:border-white rounded-none -translate-y-1/3 translate-x-1/3" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-0 rounded-none shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] mt-2" align="end">
                                <div className="bg-black dark:bg-white text-white dark:text-black p-3 font-black uppercase text-xs tracking-widest border-b-2 border-black dark:border-white">
                                    System_Feed
                                </div>
                                <div className="p-8 text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-400 flex items-center justify-center">
                                            <Bell size={24} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-xs uppercase tracking-tight text-gray-500 dark:text-zinc-400">
                                        No new system updates detected.
                                    </p>
                                </div>
                                <div className="p-2 border-t-2 border-zinc-100 dark:border-zinc-800">
                                    <button className="w-full py-2 font-black text-[10px] uppercase hover:bg-[#3C48F5] hover:text-white transition-colors">
                                        Clear_Logs
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                <div className="flex-1 px-4 md:px-8 pb-32 pt-8">
                    <div className="max-w-[1600px] mx-auto flex gap-8 items-start">
                        <div className="hidden lg:block sticky top-32 z-10 self-start">
                            <QuickConnectSidebar 
                                accounts={accounts} 
                                workspaceId={workspaceId} 
                                currentWorkspace={currentWorkspace}
                                refreshData={() => {
                                    refetchAccounts();
                                    queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
                                }} 
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                    {currentWorkspace?.owner?.planType === 'FREE' && currentWorkspace.currentPostCount >= 8 && currentWorkspace.currentPostCount < 10 && (
                                        <div className="mb-6 bg-yellow-400 border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle size={20} className="text-black" />
                                                <span className="font-black uppercase text-sm italic text-black">Attention : {10 - currentWorkspace.currentPostCount} posts restants ce mois.</span>
                                            </div>
                                            <button onClick={() => router.push('/pricing')} className="bg-black text-white px-4 py-1 font-black text-xs uppercase border-2 border-black hover:bg-white hover:text-black transition-all">Upgrade Now</button>
                                        </div>
                                    )}

                                    {activeTab === 'queue' && (
                                        <div className="grid gap-8">
                                            <NeuCard className="bg-white dark:bg-zinc-900 relative overflow-hidden">
                                                {currentWorkspace?.owner?.planType === 'FREE' && currentWorkspace.currentPostCount >= 10 && (
                                                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
                                                        <Crown size={64} className="text-yellow-400 mb-6 animate-bounce" />
                                                        <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Limite de Posts Atteinte !</h2>
                                                        <p className="max-w-md font-bold mb-8 opacity-80">
                                                            🎉 Passez à STARTER pour seulement <span className="text-yellow-400">4,900 FCFA/mois</span><br/>
                                                            → 100 posts, 5 comptes, 100 AI requests
                                                        </p>
                                                        <button 
                                                            onClick={() => router.push('/pricing')}
                                                            className="bg-[#3C48F5] text-white px-10 py-4 font-black uppercase text-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                        >
                                                            Upgrade Maintenant - 7 gratuits
                                                        </button>
                                                    </div>
                                                )}
                                                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white"><div className="w-4 h-4 bg-[#3C48F5] border-2 border-black dark:border-white"></div>{editingPost ? 'Edit Content' : 'Create New Content'}</h2>
                                                <Composer workspaceId={workspaceId} onSchedule={handleAddPost} accounts={accounts} postToEdit={editingPost} />
                                            </NeuCard>
                                            <div className="mt-4"><PostFeed posts={posts} accounts={accounts} onEdit={setEditingPost} /></div>
                                        </div>
                                    )}
                                    {activeTab === 'calendar' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-black uppercase text-black dark:text-white">Content Timeline</h2>
                                                <NeuButton onClick={() => setActiveTab('queue')}>+ Quick Post</NeuButton>
                                            </div>
                                            <CalendarView 
                                                workspaceId={workspaceId} 
                                                onPostClick={(post) => {
                                                    setEditingPost(post);
                                                    setActiveTab('queue');
                                                }}
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'analytics' && <NeuCard className="bg-white dark:bg-zinc-900"><Analytics /></NeuCard>}
                                    {activeTab === 'engagement' && <NeuCard className="bg-white dark:bg-zinc-900"><EngagementWithTabs /></NeuCard>}
                                    {activeTab === 'team' && <NeuCard className="bg-white dark:bg-zinc-900"><Team workspaceId={workspaceId} /></NeuCard>}
                                    {activeTab === 'settings' && <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] p-6 md:p-8"><Settings workspaceId={workspaceId} workspaceName={currentWorkspace?.name} /></div>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="hidden lg:block w-64 sticky top-32 self-start space-y-4"><div className="p-4 bg-[#3C48F5] text-white border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]"><h3 className="font-black text-lg uppercase tracking-tight">MENU</h3></div><nav className="space-y-3">{navItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center justify-between p-4 border-2 border-black dark:border-white transition-all duration-200 group ${activeTab === item.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'}`}><div className="flex items-center gap-3"><item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="font-bold uppercase tracking-wider">{item.label}</span></div>{activeTab === item.id && <ArrowRight size={16} />}</button>))}</nav><div className="mt-8 p-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white border-dashed transition-colors"><p className="text-xs font-mono text-gray-500 mb-2 uppercase">SUBSCRIPTION</p><div className="flex justify-between items-end text-black dark:text-white"><span className="text-xl font-black">PRO</span><button onClick={() => setActiveTab('settings')} className="text-xs font-bold underline hover:text-[#3C48F5] uppercase">MANAGE</button></div></div></div>
                    </div>
                </div>
            </main>

            <NeuModal title="CREATE_WORKSPACE" isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}><div className="space-y-4"><div><label className="text-xs font-bold uppercase mb-1 block text-black">Workspace Name</label><NeuInput value={newWorkspaceName} onChange={(e: any) => setNewWorkspaceName(e.target.value)} placeholder="E.G. DIGITAL_AGENCY_KENYA" autoFocus /></div><div className="flex justify-end gap-2"><NeuButton onClick={() => setIsCreateModalOpen(false)} className="bg-white hover:bg-gray-100">Cancel</NeuButton><NeuButton onClick={handleCreateWorkspace} className="bg-[#3C48F6] text-white hover:bg-blue-700">Create</NeuButton></div></div></NeuModal>
            
            <FacebookPageSelector 
                isOpen={isFbPageSelectorOpen} 
                onClose={() => { 
                    setIsFbPageSelectorOpen(false); 
                    const url = new URL(window.location.href);
                    url.searchParams.delete('social_selection');
                    url.searchParams.delete('exchange_token');
                    window.history.replaceState(null, '', url.pathname);
                }} 
                onAccountConnected={manuallyAddAccount} 
                exchangeToken={tempExchangeToken} 
            />
        </div>
    );
}