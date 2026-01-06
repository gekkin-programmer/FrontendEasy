'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Icons
import { 
  Users, Mail, Trash2, Send, MessageSquare, 
  Clock, X, PlusCircle
} from 'lucide-react';

// UI
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- COLORS ---
const COLORS = {
  primary: '#314BEC',
  dark: '#111827',
  bg: '#F9FAFB', 
  white: '#FFFFFF'
};

interface TeamProps {
  workspaceId: string;
}

export default function Team({ workspaceId }: TeamProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // --- STATE ---
  const [members, setMembers] = useState<any[]>([]);
  // We mock "Invites" for now as the API returns all in one list
  const [invites, setInvites] = useState<any[]>([]); 
  
  // Chat State
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH TEAM DATA ---
  const fetchTeam = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        // Split into Active vs Invited
        setMembers(data.filter((m: any) => m.status === 'ACTIVE'));
        setInvites(data.filter((m: any) => m.status === 'INVITED'));
    } catch (e) {
        console.error("Failed to load team", e);
    }
  };

  // --- 2. FETCH CHAT CHANNELS ---
  const fetchChannels = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}/channels`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setChannels(data);
        if (data.length > 0 && !activeChannelId) {
            setActiveChannelId(data[0].id);
        } else if (data.length === 0) {
            // Auto-create 'general' channel if none exist
            createChannel('general');
        }
    } catch (e) { console.error(e); }
  };

  const createChannel = async (name: string) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_URL}/workspaces/${workspaceId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
    });
    fetchChannels();
  };

  // --- 3. FETCH MESSAGES ---
  useEffect(() => {
    if (!activeChannelId) return;
    
    const fetchMessages = async () => {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/channels/${activeChannelId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) setMessages(await res.json());
    };

    fetchMessages();
    // Poll every 5s for new messages (Simple real-time)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChannelId]);

  // Initial Load
  useEffect(() => {
    if(workspaceId) {
        fetchTeam();
        fetchChannels();
    }
  }, [workspaceId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- HANDLERS ---

  const handleInvite = async () => {
    if (!email.includes('@')) return toast.error("Invalid email address");
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

        if (!res.ok) throw new Error('Failed');
        
        toast.success("Invitation sent!");
        setEmail("");
        fetchTeam();
    } catch {
        toast.error("Failed to send invite");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if(!confirm("Remove this user?")) return;
    const token = localStorage.getItem('accessToken');
    
    try {
        await fetch(`${API_URL}/workspaces/${workspaceId}/members/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Member removed");
        fetchTeam();
    } catch (e) { toast.error("Failed"); }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_URL}/workspaces/${workspaceId}/members/${memberId}`, {
          method: 'PATCH',
          headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ role: newRole })
      });
      toast.success("Role updated");
      fetchTeam();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !activeChannelId) return;
    
    const tempContent = chatMsg;
    setChatMsg(""); 
    
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_URL}/channels/${activeChannelId}/messages`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: tempContent })
    });
    
    // Optimistic UI update could go here, but polling handles it soon enough
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 font-sans text-[#111827]">
      
      {/* =======================
          LEFT PANEL: MANAGEMENT
      ======================== */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 min-h-0">
        
        {/* 1. Invite Box */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.dark }}>Team Management</h2>
                    <p className="text-sm text-gray-500">Invite colleagues to collaborate on content.</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <Users size={20} style={{ color: COLORS.primary }} />
                </div>
            </div>
            
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#314BEC]/20 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    />
                </div>
                <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm font-medium text-gray-700 outline-none cursor-pointer"
                >
                    {["ADMIN", "MEMBER", "VIEWER"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button 
                    onClick={handleInvite} 
                    disabled={isSubmitting}
                    className="text-white font-medium px-6"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    {isSubmitting ? 'Sending...' : 'Invite'}
                </Button>
            </div>
        </div>

        {/* 2. Lists (Members / Invites) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
             {/* Tabs */}
             <div className="flex border-b border-gray-100 flex-shrink-0">
                 <button 
                    onClick={() => setActiveTab('members')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'members' ? 'border-[#314BEC] text-[#314BEC]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                 >
                    Active Members <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">{members.length}</span>
                 </button>
                 <button 
                    onClick={() => setActiveTab('invites')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invites' ? 'border-[#314BEC] text-[#314BEC]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                 >
                    Pending Invites <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">{invites.length}</span>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto bg-gray-50/30">
                 {/* LIST: MEMBERS */}
                 {activeTab === 'members' && (
                     <div className="divide-y divide-gray-100">
                         {members.map((m) => (
                             <div key={m.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors group">
                                 <div className="flex items-center gap-3">
                                     <Avatar className="h-10 w-10 border border-gray-200">
                                         <AvatarFallback style={{ backgroundColor: COLORS.primary, color: 'white' }} className="font-bold text-xs">
                                             {m.user.firstName?.charAt(0)}
                                         </AvatarFallback>
                                     </Avatar>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{m.user.firstName} {m.user.lastName}</p>
                                         <p className="text-xs text-gray-500">{m.user.email}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     {m.role === 'OWNER' ? (
                                         <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Owner</Badge>
                                     ) : (
                                         <select 
                                            value={m.role}
                                            onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                            className="text-xs font-medium text-gray-600 bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                                         >
                                            {["ADMIN", "MEMBER", "VIEWER"].map(r => <option key={r} value={r}>{r}</option>)}
                                         </select>
                                     )}
                                     
                                     {m.role !== 'OWNER' && (
                                         <button onClick={() => handleRemove(m.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Trash2 size={16} />
                                         </button>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* LIST: INVITES */}
                 {activeTab === 'invites' && (
                     <div className="divide-y divide-gray-100">
                         {invites.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No pending invites.</div>}
                         {invites.map((inv) => (
                             <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 border-dashed">
                                         <Clock size={16} className="text-gray-400" />
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{inv.user.email}</p>
                                         <p className="text-xs text-gray-500">Role: {inv.role}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => handleRemove(inv.id)} className="text-gray-400 hover:text-red-600 p-2">
                                     <X size={16} />
                                 </button>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
      </div>

      {/* =======================
          RIGHT PANEL: TEAM CHAT
      ======================== */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
         
         {/* Chat Header */}
         <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 flex-shrink-0">
             <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-lg bg-[#314BEC]/10">
                    <MessageSquare size={16} style={{ color: COLORS.primary }} />
                 </div>
                 <select 
                    value={activeChannelId || ''} 
                    onChange={(e) => setActiveChannelId(e.target.value)}
                    className="font-bold text-sm text-gray-900 bg-transparent outline-none cursor-pointer hover:bg-gray-50 rounded px-1"
                 >
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                 </select>
                 <PlusCircle size={14} className="text-gray-400 cursor-pointer hover:text-blue-600" onClick={() => createChannel(prompt("Channel Name:") || 'new-channel')} />
             </div>
             
             {/* Online Avatars (Mocked visual) */}
             <div className="flex -space-x-2">
                 {members.slice(0, 3).map(m => (
                     <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-[8px] flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                         {m.user.firstName?.charAt(0)}
                     </div>
                 ))}
             </div>
         </div>

         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB] flex flex-col-reverse">
             <div ref={chatEndRef} /> 
             {/* Note: Flex-col-reverse means last element is bottom. So map reversed or natural order? 
                 Usually chat APIs return oldest first. 
                 We want newest at bottom. So standard map is fine if we scroll to bottom. 
             */}
             {[...messages].map((msg) => (
                 <div key={msg.id} className={`flex gap-2.5 items-end ${false ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mb-1 border border-gray-200 bg-white text-gray-700`}>
                         {msg.sender.firstName.charAt(0)}
                     </div>
                     <div className="flex flex-col gap-1 max-w-[85%]">
                         <div className="flex items-baseline gap-2 ml-1">
                             <span className="text-[10px] font-bold text-gray-700">{msg.sender.firstName}</span>
                             <span className="text-[9px] text-gray-400">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                         </div>
                         <div className="px-3 py-2 rounded-2xl rounded-bl-none text-sm shadow-sm bg-white border border-gray-200 text-gray-800">
                             {msg.content}
                         </div>
                     </div>
                 </div>
             ))}
             
             {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <MessageSquare size={32} className="opacity-20 mb-2" />
                     <p className="text-xs font-medium">No messages yet.</p>
                     <p className="text-[10px]">Start the conversation!</p>
                 </div>
             )}
         </div>

         {/* Chat Input */}
         <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
             <div className="relative w-full">
                 <input 
                     value={chatMsg}
                     onChange={(e) => setChatMsg(e.target.value)}
                     placeholder={`Message #${channels.find(c => c.id === activeChannelId)?.name || 'chat'}...`}
                     className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#314BEC] focus:ring-1 focus:ring-[#314BEC] transition-all placeholder:text-gray-400"
                 />
                 <button 
                    type="submit"
                    disabled={!chatMsg.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    style={{ backgroundColor: !chatMsg.trim() ? '#9CA3AF' : COLORS.primary }}
                 >
                     <Send size={16} className="ml-0.5" />
                 </button>
             </div>
         </form>
      </div>
    </div>
  );
}