'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, BarChart2, MessageCircle, Settings as SettingsIcon, 
  Search, Bell, Check, ChevronDown, Plus, Users, Menu, X, Link as LinkIcon, ExternalLink, Trash2
} from 'lucide-react'; 
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa';

import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Engagement from "@/src/components/easypost/Engagement";
import Settings from '@/src/components/easypost/Settings';
import EngagementAnalytics from '@/src/components/easypost/EngagementAnalytics';
import Team from '@/src/components/easypost/Team';
import VoiceAiButton from '@/src/components/easypost/VoiceAiButton';

// --- CONFIG ---
const API_URL = 'https://easypostv2.onrender.com/api'; 

type TabType = 'queue' | 'analytics' | 'engagement' | 'settings' | 'team';

// --- NEU COMPONENTS ---
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

const NeuModal = ({ title, isOpen, onClose, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-sm overflow-hidden"
            >
                <div className="bg-yellow-400 p-3 border-b-4 border-black flex justify-between items-center">
                    <span className="font-black uppercase tracking-wider">{title}</span>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
};

export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';

    // State
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    
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

    useEffect(() => { document.documentElement.classList.remove('dark'); }, []);

    const getAvatarUrl = (seed: string) => 
        `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`;

    // --- 1. FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { router.push('/login'); return; }

        try {
            const wsRes = await fetch(`${API_URL}/workspaces`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (!wsRes.ok) {
                if (wsRes.status === 401) { router.push('/login'); return; }
                throw new Error(`Failed to fetch workspaces: ${wsRes.statusText}`);
            }
            
            const workspacesData = await wsRes.json();
            const workspaces = Array.isArray(workspacesData) ? workspacesData : [];
            setMyWorkspaces(workspaces);

            if (workspaces.length === 0) { 
                setIsCreateModalOpen(true);
                setLoading(false);
                return; 
            }

            const current = workspaces.find((w: any) => w.id === workspaceId);
            if (!current && workspaceId) { router.replace(`/dashboard/${workspaces[0].id}`); return; }
            if (!current && !workspaceId) { router.replace(`/dashboard/${workspaces[0].id}`); return; }

            setCurrentWorkspace(current);
            setAccounts(current?.socialAccounts || []);

            if (current) {
                const postsRes = await fetch(`${API_URL}/posts?workspaceId=${current.id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                if (postsRes.ok) setPosts(await postsRes.json());
            }

        } catch (error: any) { 
            console.error("Fetch Error:", error);
            if (!error.message.includes('404')) toast.error("Connection Error"); 
        } finally { 
            setLoading(false); 
        }
    }, [router, workspaceId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- 2. CREATE WORKSPACE ---
    const handleCreateWorkspace = async () => {
        if (!newWorkspaceName.trim()) {
            toast.error("Please enter a workspace name");
            return;
        }
        const token = localStorage.getItem('accessToken');
        
        try {
            const res = await fetch(`${API_URL}/workspaces`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newWorkspaceName })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Backend Error:", data);
                const msg = Array.isArray(data.message) ? data.message[0] : data.message;
                throw new Error(msg || "Server rejected request");
            }
            
            toast.success("WORKSPACE_CREATED");
            setNewWorkspaceName("");
            setIsCreateModalOpen(false);
            
            fetchData();
            router.push(`/dashboard/${data.id}`);
        } catch (e: any) {
            toast.error(typeof e.message === 'string' ? e.message.toUpperCase() : "CREATION_FAILED");
        }
    };

    // --- 3. POST CREATION LOGIC (Restored) ---
    const handleAddPost = async (content: string, date?: Date, mediaUrl?: string, mediaType?: "image"|"video", category?: string, tags?: string[], status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT') => {
        const token = localStorage.getItem('accessToken');
        if (!accounts || accounts.length === 0) { 
            toast.error("NO_ACCOUNTS_CONNECTED"); 
            return; 
        }

        try {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    workspaceId, 
                    content,
                    scheduledFor: date ? date.toISOString() : undefined,
                    status,
                    socialAccountIds: [accounts[0].id], 
                    mediaUrls: mediaUrl ? [mediaUrl] : [],
                    mediaType: mediaType ? mediaType.toUpperCase() : 'IMAGE'
                })
            });
            if (!res.ok) throw new Error('Failed');
            fetchData(); // Refresh posts
        } catch (err) { toast.error("FAILED_TO_SAVE_POST"); }
    };

    // --- 4. VOICE LOGIC (Restored) ---
    const handleVoiceCommand = (transcription: string, intent: any) => {
        const text = transcription.toLowerCase();
        if (text.includes("analytics")) setActiveTab("analytics");
        else if (text.includes("team")) setActiveTab("team");
        else if (text.includes("queue")) setActiveTab("queue");
        else if (text.includes("settings")) setActiveTab("settings");
        else {
            toast.success("AI_COMMAND: " + text.substring(0, 20) + "...");
            fetchData();
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-black">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-xl uppercase tracking-widest">CONNECTING...</p>
        </div>
    );

    const filteredPosts = posts.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

    const navItems = [
        { id: 'queue', label: 'Queue', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'engagement', label: 'Inbox', icon: MessageCircle },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-black relative">
            <Toaster position="bottom-right" toastOptions={{ className: 'border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none font-bold' }} />

            <div className="fixed inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 border-2 border-transparent active:bg-yellow-100">
                        <Menu size={24} className="text-black" />
                    </button>
                    <div className="font-black text-xl tracking-tighter">EASYPOST.</div>
                </div>
                <div className="flex items-center gap-3">
                    <VoiceAiButton onCommand={handleVoiceCommand} />
                    <div className="w-8 h-8 rounded-none border-2 border-black overflow-hidden bg-white">
                        <img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {(isSidebarOpen) && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
                        <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-72 bg-white border-r-4 border-black flex flex-col z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.2)]">
                            <div className="p-6 border-b-2 border-black flex justify-between items-center bg-yellow-400">
                                <span className="font-black text-xl uppercase">Menu</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors p-1"><X/></button>
                            </div>
                            <nav className="p-4 space-y-3">
                                {navItems.map(item => (
                                    <SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} />
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="relative z-10 flex flex-col min-h-screen">
                
                {/* Desktop Header */}
                <header className="hidden md:flex sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-sm border-b-4 border-black items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-2xl border-2 border-transparent">E</div>
                            <span className="font-black text-2xl tracking-tighter italic">EASYPOST.</span>
                        </div>
                        <div className="relative group">
                            <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all">
                                <div className="w-6 h-6 border-2 border-black rounded-none overflow-hidden bg-gray-100">
                                    <img src={getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-bold uppercase truncate max-w-[120px]">{currentWorkspace?.name || 'Select'}</span>
                                <ChevronDown size={16} className="text-black" />
                            </button>
                            <AnimatePresence>
                                {isAccountMenuOpen && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] z-50 p-2 origin-top">
                                        <div className="space-y-1">
                                            {myWorkspaces.map(ws => (
                                                <button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-yellow-200 border-2 border-transparent hover:border-black transition-all">
                                                    <div className="w-5 h-5 border border-black overflow-hidden bg-gray-50">
                                                        <img src={getAvatarUrl(ws.name)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="flex-1 font-bold truncate">{ws.name}</span>
                                                    {currentWorkspace?.id === ws.id && <Check size={16} className="text-blue-600 border-2 border-transparent"/>}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="h-0.5 bg-black my-2"/>
                                        <button onClick={() => { setIsCreateModalOpen(true); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-600 transition-all">
                                            <Plus size={16}/> New Workspace
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <NeuInput placeholder="SEARCH_DATABASE..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} style={{ width: '250px' }} />
                            <div className="bg-black text-white p-2.5 border-2 border-black"><Search size={18} /></div>
                        </div>
                        <VoiceAiButton onCommand={handleVoiceCommand} />
                        <button className="relative p-2.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all"><Bell size={20} /></button>
                    </div>
                </header>

                {/* Navbar */}
                <div className="hidden md:flex justify-center py-6 sticky top-20 z-20 pointer-events-none">
                    <nav className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto">
                        {navItems.map((item) => (
                            <NeuButton key={item.id} active={activeTab === item.id} onClick={() => setActiveTab(item.id as TabType)} className="flex items-center gap-2 px-6">
                                <item.icon size={18} strokeWidth={2.5} /> <span className="uppercase tracking-wide">{item.label}</span>
                            </NeuButton>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 md:px-8 pb-32">
                    <div className="max-w-[1280px] mx-auto flex gap-8 items-start">
                        
                        {/* Sticky Sidebar (Passed refreshData to update UI after changes) */}
                        <div className="hidden lg:block sticky top-44 z-10 self-start">
                            <QuickConnectSidebar accounts={accounts} workspaceId={workspaceId} refreshData={fetchData} />
                        </div>

                        {/* Tabs */}
                        <div className="flex-1 min-w-0">
                            {currentWorkspace ? (
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                                        {activeTab === 'queue' && (
                                            <div className="grid gap-8">
                                                <NeuCard className="bg-white">
                                                    <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 border-2 border-black"></div>Create New Content</h2>
                                                    <Composer onSchedule={handleAddPost} />
                                                </NeuCard>
                                                <div className="mt-4"><PostFeed posts={filteredPosts} accounts={accounts} /></div>
                                            </div>
                                        )}
                                        {activeTab === 'analytics' && <NeuCard><Analytics /></NeuCard>}
                                        {activeTab === 'engagement' && <NeuCard><EngagementWithTabs /></NeuCard>}
                                        {activeTab === 'team' && <NeuCard><Team workspaceId={workspaceId} /></NeuCard>}
                                        {activeTab === 'settings' && (
                                            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-8">
                                                <Settings workspaceId={workspaceId} workspaceName={currentWorkspace.name} />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <h2 className="text-2xl font-black uppercase mb-4">No Workspace Selected</h2>
                                    <NeuButton onClick={() => setIsCreateModalOpen(true)}>Create First Workspace</NeuButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Workspace Modal */}
            <NeuModal title="CREATE_WORKSPACE" isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Workspace Name</label>
                        <NeuInput value={newWorkspaceName} onChange={(e: any) => setNewWorkspaceName(e.target.value)} placeholder="E.G. DIGITAL_AGENCY_KENYA" autoFocus />
                    </div>
                    <div className="flex justify-end gap-2">
                        <NeuButton onClick={() => setIsCreateModalOpen(false)} className="bg-white hover:bg-gray-100">Cancel</NeuButton>
                        <NeuButton onClick={handleCreateWorkspace} className="bg-[#3C48F6] text-white hover:bg-blue-700">Create</NeuButton>
                    </div>
                </div>
            </NeuModal>
        </div>
    );
}

// --- QUICK CONNECT SIDEBAR (UPDATED) ---
const QuickConnectSidebar = ({ accounts, workspaceId, refreshData }: { accounts: any[], workspaceId: string, refreshData: () => void }) => {
    // Icons Component References
    const platforms = [
        { id: 'facebook', Icon: FaFacebookF },
        { id: 'instagram', Icon: FaInstagram },
        { id: 'twitter', Icon: FaTwitter },
        { id: 'linkedin', Icon: FaLinkedinIn },
        { id: 'tiktok', Icon: FaTiktok },
    ];

    const handleConnect = (platform: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error("PLEASE_LOGIN_FIRST");
            return;
        }
        window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`;
    };

    const handleDisconnect = async (accountId: string) => {
        if(!confirm("DISCONNECT ACCOUNT?")) return;
        const token = localStorage.getItem('accessToken');
        try {
            await fetch(`${API_URL}/social-accounts/${accountId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("ACCOUNT_DISCONNECTED");
            refreshData(); // Refresh UI
        } catch (e) {
            toast.error("DISCONNECT_FAILED");
        }
    };

    return (
        <div className="w-16 flex flex-col items-center gap-4 py-6 bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="w-8 h-8 flex items-center justify-center border-2 border-black bg-yellow-400 mb-2">
                <LinkIcon size={16} className="text-black" />
            </div>
            
            {platforms.map((p) => {
                const connectedAccount = accounts.find(a => a.platform === p.id);
                const isConnected = !!connectedAccount;

                return (
                    <div key={p.id} className="relative group">
                        {isConnected ? (
                            // Connected State (Hover to Disconnect)
                            <>
                                <button className="w-10 h-10 flex items-center justify-center border-2 border-black bg-gray-100 text-black opacity-50 cursor-default group-hover:opacity-0 transition-opacity">
                                    <p.Icon size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDisconnect(connectedAccount.id)}
                                    className="absolute inset-0 w-10 h-10 flex items-center justify-center border-2 border-black bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                    title="Disconnect"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        ) : (
                            // Not Connected State
                            <button
                                onClick={() => handleConnect(p.id)}
                                className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white cursor-pointer shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                title={`Connect ${p.id}`}
                            >
                                <p.Icon size={18} />
                            </button>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute -top-1 -right-1 pointer-events-none z-20">
                            {isConnected ? (
                                <div className="w-4 h-4 bg-green-500 border-2 border-black flex items-center justify-center text-white">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            ) : (
                                <div className="w-4 h-4 bg-yellow-400 border-2 border-black flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={10} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="h-0.5 w-8 bg-black my-2"></div>

            <button className="text-gray-400 hover:text-black transition-colors" title="Manage Connections">
                <ExternalLink size={16} />
            </button>
        </div>
    );
};

const SidebarItem = ({icon: Icon, label, active, onClick}: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-wider border-2 border-black transition-all ${active ? 'bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:bg-yellow-100 hover:translate-x-1'}`}>
        <Icon size={18} strokeWidth={2.5} /> {label}
    </button>
);

const EngagementWithTabs = () => {
  const [subTab, setSubTab] = useState<'inbox' | 'analytics'>('inbox');
  return (
    <div>
      <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4">
        <button onClick={() => setSubTab('inbox')} className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all ${subTab === 'inbox' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'}`}>
          <MessageCircle size={16} /> Inbox
        </button>
        <button onClick={() => setSubTab('analytics')} className={`flex items-center gap-2 font-black uppercase text-sm px-4 py-2 border-2 border-black transition-all ${subTab === 'analytics' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-100 text-gray-500 border-transparent hover:border-black'}`}>
          <BarChart2 size={16} /> Performance
        </button>
      </div>
      {subTab === 'inbox' && <Engagement />}
      {subTab === 'analytics' && <EngagementAnalytics />}
    </div>
  );
};