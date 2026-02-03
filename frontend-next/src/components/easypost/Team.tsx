'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Icons
import { 
  Users, Mail, Trash2, Send, MessageSquare, 
  Clock, X, PlusCircle, UserPlus, Hash, Shield, Crown, RefreshCw
} from 'lucide-react';
import SpinningLoader from '../SpinningLoader';

// UI
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 🚀 LIVE BACKEND URL
const API_URL = 'https://easypostv2.onrender.com/api'; 

// Available Roles based on Prisma defaults
const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'];

// --- NEU COMPONENTS ---

const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black dark:border-white disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    default: "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    primary: "bg-[#3C48F6] text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    ghost: "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none hover:shadow-none translate-0"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>
      {children}
    </button>
  );
};

interface TeamProps {
  workspaceId: string;
}

export default function Team({ workspaceId }: TeamProps) {
  // --- STATE ---
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Chat State (Mocked mostly, but structure ready)
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH MEMBERS (GET /workspaces/:id/members) ---
  const fetchTeam = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to load members");

        const data = await res.json();
        
        // Filter based on status if your backend returns mixed list
        // Assuming backend returns array of Member objects with { status: 'ACTIVE' | 'INVITED' }
        setMembers(data.filter((m: any) => m.status === 'ACTIVE' || m.status === 'JOINED'));
        setInvites(data.filter((m: any) => m.status === 'INVITED' || m.status === 'PENDING'));
        
    } catch (e) {
        console.error(e);
        toast.error("COULD_NOT_LOAD_TEAM");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(workspaceId) fetchTeam();
  }, [workspaceId]);


  // --- 2. INVITE MEMBER (POST /workspaces/:id/members/invite) ---
  const handleInvite = async () => {
    if (!email.includes('@')) return toast.error("INVALID_EMAIL");
    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/invite`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ email, role })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed');
        
        toast.success("INVITATION_SENT");
        setEmail("");
        fetchTeam(); // Refresh list
    } catch (e: any) {
        toast.error(typeof e.message === 'string' ? e.message : "INVITE_FAILED");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- 3. REMOVE MEMBER (DELETE /workspaces/:id/members/:memberId) ---
  const handleRemove = async (id: string) => {
    if(!confirm("REMOVE_USER? They will lose access immediately.")) return;
    const token = localStorage.getItem('accessToken');
    
    try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to remove");

        toast.success("MEMBER_REMOVED");
        fetchTeam();
    } catch (e) { toast.error("ACTION_FAILED"); }
  };

  // --- 4. UPDATE ROLE (PATCH /workspaces/:id/members/:memberId) ---
  const handleRoleChange = async (memberId: string, newRole: string) => {
      const token = localStorage.getItem('accessToken');
      
      // Optimistic update
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

      try {
          const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/${memberId}`, {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ role: newRole })
          });

          if (!res.ok) throw new Error("Update failed");
          
          toast.success("ROLE_UPDATED");
      } catch (e) { 
          toast.error("FAILED_TO_UPDATE_ROLE");
          fetchTeam(); // Revert on fail
      }
  };

  // --- MOCK CHAT LOGIC (Placeholder for next module) ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), content: chatMsg, sender: { firstName: 'Me' }, createdAt: new Date() }]);
    setChatMsg("");
  };

  if (loading && members.length === 0) return <SpinningLoader fullScreen={false} />;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 font-sans text-black dark:text-white transition-colors">
      
      {/* LEFT: MANAGEMENT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 min-h-0">
        
        {/* Invite Box */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] flex-shrink-0 transition-colors">
            <div className="flex justify-between items-start mb-6 border-b-2 border-dashed border-gray-300 dark:border-zinc-700 pb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Team_Management</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 font-mono mt-1 uppercase"> ACCESS_LEVEL: ADMIN</p>
                </div>
                <div className="p-3 bg-yellow-400 dark:bg-yellow-600 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all">
                    <UserPlus size={24} className="text-black dark:text-white" />
                </div>
            </div>
            
            <div className="flex gap-4 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-zinc-400" size={18} />
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="EMAIL@COMPANY.COM"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-bold placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all uppercase text-black dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    />
                </div>
                <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white z-10 pointer-events-none" size={16} />
                    <select 
                        value={role} 
                        onChange={e => setRole(e.target.value)}
                        className="h-full bg-white dark:bg-zinc-800 border-2 border-black dark:border-white pl-10 pr-8 py-3 font-bold text-sm outline-none cursor-pointer appearance-none uppercase w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-zinc-700 text-black dark:text-white"
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <NeuButton onClick={handleInvite} disabled={isSubmitting} variant="primary" className="px-8 py-3">
                    {isSubmitting ? 'SENDING...' : 'INVITE'}
                </NeuButton>
            </div>
        </div>

        {/* Member Lists */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden flex-1 flex flex-col min-h-0 transition-colors">
             <div className="flex border-b-2 border-black dark:border-white flex-shrink-0 bg-gray-50 dark:bg-zinc-800 transition-colors">
                 <button onClick={() => setActiveTab('members')} className={`px-6 py-4 text-sm font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'members' ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                    ACTIVE_CREW <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-xs font-mono">{members.length}</span>
                 </button>
                 <button onClick={() => setActiveTab('invites')} className={`px-6 py-4 text-sm font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'invites' ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                    PENDING <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-xs font-mono">{invites.length}</span>
                 </button>
                 <button onClick={fetchTeam} className="ml-auto px-4 hover:bg-gray-200 dark:hover:bg-zinc-700 border-l-2 border-black dark:border-white text-black dark:text-white"><RefreshCw size={16} /></button>
             </div>

             <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 p-4 transition-colors">
                 {/* LIST: MEMBERS */}
                 {activeTab === 'members' && (
                     <div className="grid grid-cols-1 gap-3">
                         {members.map((m) => (
                             <div key={m.id} className="p-4 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all bg-white dark:bg-zinc-800">
                                 <div className="flex items-center gap-4">
                                     <Avatar className="h-10 w-10 border-2 border-black dark:border-white rounded-none">
                                         <AvatarFallback className="font-black bg-blue-100 dark:bg-blue-900 text-black dark:text-white text-sm rounded-none uppercase transition-colors">
                                             {m.user?.firstName?.charAt(0) || m.user?.email?.charAt(0) || 'U'}
                                         </AvatarFallback>
                                     </Avatar>
                                     <div>
                                         <p className="text-sm font-black uppercase text-black dark:text-white">{m.user?.firstName || 'User'} {m.user?.lastName}</p>
                                         <p className="text-xs font-mono text-gray-500 dark:text-zinc-400">{m.user?.email}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     {m.role === 'OWNER' ? (
                                         <div className="flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black px-2 py-1 text-xs font-bold border-2 border-black dark:border-white uppercase"><Crown size={12} className="text-yellow-400 dark:text-yellow-600" /> OWNER</div>
                                     ) : (
                                         <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)} className="text-xs font-bold uppercase bg-gray-100 dark:bg-zinc-700 border-2 border-black dark:border-white px-2 py-1 outline-none cursor-pointer hover:bg-white dark:hover:bg-zinc-600 text-black dark:text-white">
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                         </select>
                                     )}
                                     {m.role !== 'OWNER' && (
                                         <button onClick={() => handleRemove(m.id)} className="text-black dark:text-white hover:text-red-600 dark:hover:text-red-500 border-2 border-transparent hover:border-black dark:hover:border-white p-1 transition-all"><Trash2 size={18} strokeWidth={2.5} /></button>
                                     )}
                                 </div>
                             </div>
                         ))}
                         {members.length === 0 && <div className="p-8 text-center text-gray-400 dark:text-zinc-500 font-mono uppercase">NO_ACTIVE_MEMBERS</div>}
                     </div>
                 )}

                 {/* LIST: INVITES */}
                 {activeTab === 'invites' && (
                     <div className="grid grid-cols-1 gap-3">
                         {invites.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 transition-colors">
                                <p className="font-bold text-gray-400 dark:text-zinc-500 uppercase">No pending invites</p>
                            </div>
                         )}
                         {invites.map((inv) => (
                             <div key={inv.id} className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 transition-colors flex items-center justify-between">
                                 <div className="flex items-center gap-3 text-black dark:text-white">
                                     <div className="h-10 w-10 bg-white dark:bg-zinc-700 flex items-center justify-center border-2 border-black dark:border-white"><Clock size={20} /></div>
                                     <div>
                                         <p className="text-sm font-bold uppercase">{inv.user?.email || 'Unknown Email'}</p>
                                         <p className="text-xs font-mono bg-yellow-200 dark:bg-yellow-600 inline-block px-1 border border-black dark:border-white mt-1">{inv.role}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => handleRemove(inv.id)} className="text-black dark:text-white hover:bg-red-500 hover:text-white border-2 border-black dark:border-white p-1 transition-all"><X size={16} /></button>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
      </div>

      {/* RIGHT: CHAT (Visual Only for now) */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden h-full transition-colors">
         <div className="p-4 border-b-2 border-black dark:border-white flex items-center justify-between bg-yellow-400 dark:bg-yellow-600 z-10 flex-shrink-0 transition-colors">
             <div className="flex items-center gap-2">
                 <div className="p-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white transition-colors"><Hash size={16} /></div>
                 <span className="font-black text-sm uppercase text-black dark:text-white">TEAM_CHAT</span>
             </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-900 flex flex-col-reverse bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] dark:opacity-90 transition-colors">
             <div ref={chatEndRef} /> 
             {messages.map((msg) => (
                 <div key={msg.id} className="flex gap-2 items-end">
                     <div className="w-8 h-8 border-2 border-black dark:border-white bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-black flex-shrink-0 mb-1 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all text-black dark:text-white">{msg.sender.firstName.charAt(0)}</div>
                     <div className="flex flex-col gap-1 max-w-[85%]">
                         <div className="px-3 py-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-sm font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] text-black dark:text-white transition-colors">{msg.content}</div>
                     </div>
                 </div>
             ))}
             {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 opacity-50"><MessageSquare size={48} strokeWidth={1} className="mb-2" /><p className="text-xs font-bold uppercase tracking-widest">START_CONVERSATION</p></div>}
         </div>
         <form onSubmit={handleSendMessage} className="p-3 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex-shrink-0 transition-colors">
             <div className="relative w-full flex gap-2">
                 <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="TYPE_MESSAGE..." className="w-full pl-4 pr-4 py-3 bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white font-bold text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 uppercase text-black dark:text-white" />
                 <button type="submit" disabled={!chatMsg.trim()} className="px-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-zinc-800 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff]"><Send size={18} strokeWidth={3} /></button>
             </div>
         </form>
      </div>
    </div>
  );
}