'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { cn } from '@/lib/utils';

// ICONS
import { 
  Layers, BarChart2, MessageCircle, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Menu, X, Link as LinkIcon, 
  ExternalLink, Trash2, ArrowRight, Loader2, Calendar as CalendarIcon
} from 'lucide-react'; 
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaPinterestP, FaWhatsapp, FaRedditAlien } from 'react-icons/fa6';

// COMPONENTS
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Engagement from "@/src/components/easypost/Engagement";
import Settings from '@/src/components/easypost/Settings';
import EngagementAnalytics from '@/src/components/easypost/EngagementAnalytics';
import Team from '@/src/components/easypost/Team';
import VoiceAiButton from '@/src/components/easypost/VoiceAiButton';
import CalendarView from '@/src/components/easypost/CalendarView';

type TabType = 'queue' |'calendar' | 'analytics' | 'engagement' | 'settings' | 'team';

// --- HELPERS ---
const NeuButton = ({ children, onClick, active, className = "", disabled = false }: any) => (<button onClick={onClick} disabled={disabled} className={`relative px-4 py-2 font-black text-xs uppercase tracking-wider transition-all duration-150 border-2 border-black ${active ? 'bg-[#3C48F6] text-white translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-white text-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}>{children}</button>);
const NeuCard = ({ children, className = "" }: any) => (<div className={`bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>{children}</div>);
const NeuInput = (props: any) => (<input {...props} className="bg-white border-2 border-black p-2 font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all w-full font-mono" />);
const NeuModal = ({ title, isOpen, onClose, children }: any) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-md overflow-hidden z-10">
                        <div className="bg-yellow-400 p-4 border-b-4 border-black flex justify-between items-center"><span className="font-black uppercase tracking-wider">{title}</span><button onClick={onClose}><X size={24} strokeWidth={3}/></button></div>
                        <div className="p-6">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center font-bold">LOADING_INTERFACE...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';
    const queryClient = useQueryClient();

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
        queryFn: () => api.get<any[]>('/social-accounts').then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
    });

    const { data: posts = [] } = useQuery({
        queryKey: ['posts', workspaceId, searchTerm],
        queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&search=${encodeURIComponent(searchTerm)}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
        refetchInterval: 15000, 
    });

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
        const success = searchParams.get('success'); // General success flag
        const token = searchParams.get('exchange_token');

        // 1. Facebook Page Selection Mode
        if (selectionMode === 'facebook') {
            if (token) setTempExchangeToken(token);
            setIsFbPageSelectorOpen(true);
        }

        // 2. Generic Success (e.g. from WhatsApp/LinkedIn/Google)
        if (connected === 'true' || success === 'true') {
            toast.success("CONNECTION_ESTABLISHED");
            
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('social_connected');
            url.searchParams.delete('social_selection');
            url.searchParams.delete('exchange_token');
            url.searchParams.delete('platform');
            url.searchParams.delete('success');
            window.history.replaceState(null, '', url.pathname);
            
            // Force refresh accounts
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
            if (payload.id) {
                return api.patch(`/posts/${payload.id}`, payload);
            }
            return api.post('/posts', payload);
        },
        onSuccess: () => {
            toast.success("TRANSACTION_COMMITTED");
            queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] }); 
            setEditingPost(null); // Clear edit state
        },
        onError: () => toast.error("TRANSACTION_FAILED")
    });

    const handleCreateWorkspace = () => {
        if (!newWorkspaceName.trim()) return toast.error("INPUT_NAME_REQUIRED");
        createWorkspaceMutation.mutate(newWorkspaceName);
    };

    const handleAddPost = async (content: string, date?: Date, mediaIds?: string[], status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT', selectedAccountIds?: string[], postId?: string) => {
        const targets = selectedAccountIds && selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
        if (targets.length === 0) { toast.error("ERR_NO_NODES_SELECTED"); return; }
        upsertPostMutation.mutate({ 
            id: postId, // Pass ID for update
            workspaceId, 
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
    const filteredPosts = posts;

    if (currentWsLoading) return (<div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-black"><Loader2 className="w-16 h-16 animate-spin mb-6" /><p className="font-black text-xl uppercase tracking-widest font-mono">SYSTEM_INIT...</p></div>);
    
    const navItems = [{ id: 'queue', label: 'Queue', icon: Layers }, { id: 'calendar', label: 'Calendar', icon: CalendarIcon }, { id: 'analytics', label: 'Analytics', icon: BarChart2 }, { id: 'engagement', label: 'Inbox', icon: MessageCircle }, { id: 'team', label: 'Team', icon: Users }, { id: 'settings', label: 'Config', icon: SettingsIcon }];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-black relative selection:bg-yellow-300">
            <Toaster position="bottom-right" toastOptions={{ className: 'border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none font-bold' }} />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 border-2 border-transparent active:bg-yellow-100"><Menu size={24} className="text-black" /></button><div className="font-black text-xl tracking-tighter italic">EASYPOST.</div></div>
                <div className="flex items-center gap-3"><VoiceAiButton onCommand={handleVoiceCommand} /><div className="w-8 h-8 rounded-none border-2 border-black overflow-hidden bg-white"><img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div></div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-72 bg-white border-r-4 border-black flex flex-col z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.2)]"><div className="p-6 border-b-2 border-black flex justify-between items-center bg-yellow-400"><span className="font-black text-xl uppercase">Menu</span><button onClick={() => setIsSidebarOpen(false)} className="border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors p-1"><X/></button></div><nav className="p-4 space-y-3">{navItems.map(item => (<SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} />))}</nav></motion.aside></>
                )}
            </AnimatePresence>

            {/* Main Layout */}
            <main className="relative z-10 flex flex-col min-h-screen">
                <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-sm border-b-4 border-black items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2"><div className="w-10 h-10 border-2 border-black bg-white overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
  <Image 
    src="/applogo.png" 
    alt="EasyPost Logo" 
    width={40} 
    height={40} 
    className="object-contain p-1" 
  />
</div><span className="font-black text-2xl tracking-tighter italic">ASYPOST.</span></div>
                        <div className="relative group"><button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all"><div className="w-6 h-6 border-2 border-black rounded-none overflow-hidden bg-gray-100"><img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div><span className="text-sm font-bold uppercase truncate max-w-[120px]">{currentWorkspace?.name || 'Select'}</span><ChevronDown size={16} className="text-black" /></button>
                            <AnimatePresence>{isAccountMenuOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] z-50 p-2 origin-top"><div className="space-y-1">{myWorkspaces.map((ws: any) => (<button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-yellow-200 border-2 border-transparent hover:border-black transition-all"><div className="w-5 h-5 border border-black overflow-hidden bg-gray-50"><img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" /></div><span className="flex-1 font-bold truncate">{ws.name}</span>{currentWorkspace?.id === ws.id && <Check size={16} className="text-blue-600 border-2 border-transparent"/>}</button>))}</div><div className="h-0.5 bg-black my-2"/><button onClick={() => { setIsCreateModalOpen(true); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-600 transition-all"><Plus size={16}/> New Workspace</button></motion.div>)}</AnimatePresence>
                        </div>
                    </div>
                    <div className="flex items-center gap-4"><div className="flex items-center gap-2"><NeuInput placeholder="SEARCH_DATABASE..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} style={{ width: '250px' }} /><div className="bg-black text-white p-2.5 border-2 border-black"><Search size={18} /></div></div><VoiceAiButton onCommand={handleVoiceCommand} /><button className="relative p-2.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all"><Bell size={20} /></button></div>
                </header>

                <div className="flex-1 px-4 md:px-8 pb-32 pt-8">
                    <div className="max-w-[1600px] mx-auto flex gap-8 items-start">
                        {/* 🟢 SIDEBAR: Re-renders when 'accounts' changes */}
                        <div className="hidden lg:block sticky top-32 z-10 self-start">
                            <QuickConnectSidebar 
                                accounts={accounts} 
                                workspaceId={workspaceId} 
                                refreshData={() => {
                                    refetchAccounts();
                                    queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
                                }} 
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                    {activeTab === 'queue' && (
                                        <div className="grid gap-8">
                                            <NeuCard className="bg-white">
                                                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 border-2 border-black"></div>{editingPost ? 'Edit Content' : 'Create New Content'}</h2>
                                                <Composer onSchedule={handleAddPost} accounts={accounts} postToEdit={editingPost} />
                                            </NeuCard>
                                            <div className="mt-4"><PostFeed posts={filteredPosts} accounts={accounts} onEdit={setEditingPost} /></div>
                                        </div>
                                    )}
                                    {activeTab === 'calendar' && (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase">Content Timeline</h2>
            <NeuButton onClick={() => setActiveTab('queue')}>+ Quick Post</NeuButton>
        </div>
        <CalendarView workspaceId={workspaceId} />
    </div>
)}
                                    {activeTab === 'analytics' && <NeuCard><Analytics /></NeuCard>}
                                    {activeTab === 'engagement' && <NeuCard><EngagementWithTabs /></NeuCard>}
                                    {activeTab === 'team' && <NeuCard><Team workspaceId={workspaceId} /></NeuCard>}
                                    {activeTab === 'settings' && <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-8"><Settings workspaceId={workspaceId} workspaceName={currentWorkspace.name} /></div>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="hidden lg:block w-64 sticky top-32 self-start space-y-4"><div className="p-4 bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_#000]"><h3 className="font-black text-lg uppercase tracking-tight">MENU</h3></div><nav className="space-y-3">{navItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center justify-between p-4 border-2 border-black transition-all duration-200 group ${activeTab === item.id ? 'bg-black text-white shadow-[4px_4px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'}`}><div className="flex items-center gap-3"><item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="font-bold uppercase tracking-wider">{item.label}</span></div>{activeTab === item.id && <ArrowRight size={16} />}</button>))}</nav><div className="mt-8 p-4 bg-white border-2 border-black border-dashed"><p className="text-xs font-mono text-gray-500 mb-2">SUBSCRIPTION</p><div className="flex justify-between items-end"><span className="text-xl font-black">PRO</span><button onClick={() => setActiveTab('settings')} className="text-xs font-bold underline hover:text-blue-600">MANAGE</button></div></div></div>
                    </div>
                </div>
            </main>

            <NeuModal title="CREATE_WORKSPACE" isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}><div className="space-y-4"><div><label className="text-xs font-bold uppercase mb-1 block">Workspace Name</label><NeuInput value={newWorkspaceName} onChange={(e: any) => setNewWorkspaceName(e.target.value)} placeholder="E.G. DIGITAL_AGENCY_KENYA" autoFocus /></div><div className="flex justify-end gap-2"><NeuButton onClick={() => setIsCreateModalOpen(false)} className="bg-white hover:bg-gray-100">Cancel</NeuButton><NeuButton onClick={handleCreateWorkspace} className="bg-[#3C48F6] text-white hover:bg-blue-700">Create</NeuButton></div></div></NeuModal>
            
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

// --- SUB COMPONENTS ---
const FacebookPageSelector = ({ isOpen, onClose, onAccountConnected, exchangeToken }: any) => {
    const [pages, setPages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            let endpoint = '/social-accounts/facebook/pages';
            if (exchangeToken) endpoint += `?exchange_token=${encodeURIComponent(exchangeToken)}`;
            
            api.get<any>(endpoint)
                .then(res => {
                    const list = Array.isArray(res.data) ? res.data : [];
                    setPages(list);
                })
                .catch(() => toast.error("FB_FETCH_FAILED"))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, exchangeToken]);

    const selectMutation = useMutation({
        mutationFn: (page: any) => api.post<any>('/social-accounts/facebook/pages/select', {
            pageId: page.id, pageName: page.name, pageAccessToken: page.access_token, exchangeToken
        }),
        onSuccess: (res, variables) => {
            toast.success(`CONNECTED: ${variables.name}`);
            if (onAccountConnected) {
                const optimisticAccount = {
                    id: res.data?.id || `temp-${Date.now()}`,
                    username: variables.name, 
                    platform: 'FACEBOOK',
                    avatar: `https://graph.facebook.com/${variables.id}/picture` 
                };
                onAccountConnected(optimisticAccount);
            }
            onClose();
        },
        onError: () => toast.error("CONNECTION_FAILED")
    });

    return (
        <NeuModal title="SELECT_ENTITY" isOpen={isOpen} onClose={onClose}>
            {isLoading ? <div className="p-8 flex justify-center flex-col items-center gap-2"><Loader2 className="animate-spin" /><span className="text-xs font-bold animate-pulse">CONNECTING_TO_GRAPH_API...</span></div> : (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {pages.length === 0 && <div className="p-4 border-2 border-black bg-gray-100 text-center text-xs font-mono">NO_ENTITIES_FOUND.<br/>Did you uncheck pages in the popup?</div>}
                    {pages.map((page) => (
                        <button key={page.id} onClick={() => selectMutation.mutate(page)} className="w-full flex items-center gap-3 p-3 border-2 border-black hover:bg-yellow-100 transition-all text-left group">
                            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform"><FaFacebookF /></div>
                            <div className="flex-1"><p className="font-bold text-sm uppercase">{page.name}</p><p className="text-[10px] font-mono text-gray-500">UID: {page.id}</p></div>
                            <Plus size={16} />
                        </button>
                    ))}
                </div>
            )}
        </NeuModal>
    );
};

const QuickConnectSidebar = ({ accounts, workspaceId, refreshData }: any) => {
    
    const platforms = [
        { id: 'facebook', Icon: FaFacebookF, color: 'text-[#1877F2]' },
        { id: 'instagram', Icon: FaInstagram, color: 'text-[#E4405F]' },
        { id: 'twitter', Icon: FaTwitter, color: 'text-black' },
        { id: 'linkedin', Icon: FaLinkedinIn, color: 'text-[#0A66C2]' },
        { id: 'tiktok', Icon: FaTiktok, color: 'text-black' },
        { id: 'youtube', Icon: FaYoutube, color: 'text-[#FF0000]' },
        { id: 'pinterest', Icon: FaPinterestP, color: 'text-[#BD081C]' },
        { id: 'whatsapp', Icon: FaWhatsapp, color: 'text-[#25D366]' },
        { id: 'reddit', Icon: FaRedditAlien, color: 'text-[#FF4500]' },
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api';

    const handleConnect = (platform: string) => { 
        const token = localStorage.getItem('accessToken'); 
        window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`; 
    };

    const disconnectMutation = useMutation({ 
        mutationFn: (id: string) => api.delete(`/social-accounts/${id}`), 
        onSuccess: () => { 
            toast.success("NODE_DISCONNECTED"); 
            refreshData(); 
        }, 
        onError: () => toast.error("ERR_DISCONNECT_FAIL") 
    });

    return (
        <div className="w-16 flex flex-col items-center gap-4 py-6 bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] h-full overflow-y-auto scrollbar-hide">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-black bg-[#3C48F5] mb-2">
                <LinkIcon size={16} className="text-white" />
            </div>

            {platforms.map((p) => { 
                const connected = accounts.find((a:any) => a.platform?.toLowerCase() === p.id.toLowerCase()); 
                
                return (
                    <div key={p.id} className="relative group flex-shrink-0">
                        {connected ? (
                            <>
                                <button className="w-10 h-10 flex items-center justify-center border-2 border-black bg-gray-50 opacity-100 cursor-default">
                                    <p.Icon size={18} className="text-gray-400" />
                                </button>
                                <button 
                                    onClick={() => { if(confirm("CONFIRM_TERMINATION?")) disconnectMutation.mutate(connected.id) }} 
                                    className="absolute inset-0 w-10 h-10 flex items-center justify-center border-2 border-black bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                    title="Disconnect"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="absolute -top-1 -right-1 pointer-events-none z-20">
                                    <div className="w-4 h-4 bg-green-500 border-2 border-black flex items-center justify-center text-white">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={() => handleConnect(p.id)} 
                                className="group w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-black cursor-pointer shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                title={`Connect ${p.id}`}
                            >
                                <p.Icon 
                                    size={18} 
                                    className={cn(p.color, "transition-colors group-hover:text-white")} 
                                />
                            </button>
                        )}
                    </div>
                ); 
            })}
            <div className="h-0.5 w-8 bg-black my-2 flex-shrink-0"></div>
            <button className="text-gray-400 hover:text-black transition-colors flex-shrink-0"><ExternalLink size={16} /></button>
        </div>
    );
};

// ... SidebarItem & EngagementWithTabs (Same as before) ...
const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-wider border-2 border-black transition-all ${active ? 'bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:bg-yellow-100 hover:translate-x-1'}`}><Icon size={18} strokeWidth={2.5} /> {label}</button>);
const EngagementWithTabs = () => { const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox'); return (<div><div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4"><button onClick={() => setSubTab('inbox')} className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all ${subTab === 'inbox' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'}`}><MessageCircle size={16} /> Inbox</button><button onClick={() => setSubTab('analytics')} className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all ${subTab === 'analytics' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'}`}><BarChart2 size={16} /> Performance</button></div>{subTab === 'inbox' && <Engagement />}{subTab === 'analytics' && <EngagementAnalytics />}</div>); };