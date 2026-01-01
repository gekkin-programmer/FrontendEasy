'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Icons
import { 
  Users, Mail, Shield, Trash2, Send, MessageSquare, 
  Clock, X
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
  workspaceId: Id<"workspaces">;
}

export default function Team({ workspaceId }: TeamProps) {
  // --- STATE & DATA ---
  const teamData = useQuery(api.teams.getTeamData, { workspaceId });
  const messages = useQuery(api.teams.getMessages, { workspaceId });
  
  const inviteMutation = useMutation(api.teams.inviteMember);
  const removeMutation = useMutation(api.teams.removeMember);
  const revokeMutation = useMutation(api.teams.revokeInvite);
  const sendMsgMutation = useMutation(api.teams.sendMessage);
  const updateRoleMutation = useMutation(api.teams.updateRole);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  const [chatMsg, setChatMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  
  // Auto-scroll chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLERS ---

  const handleInvite = async () => {
    if (!email.includes('@')) return toast.error("Invalid email address");
    setIsSubmitting(true);
    try {
        const result = await inviteMutation({ workspaceId, email, role });
        if (result.status === 'error') toast.error(result.message);
        else toast.success(result.message);
        setEmail("");
    } catch {
        toast.error("Failed to send invite");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if(confirm("Remove this user?")) {
        await removeMutation({ workspaceId, memberId: id });
        toast.success("Member removed");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
      await updateRoleMutation({ workspaceId, memberId, role: newRole });
      toast.success("Role updated");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const temp = chatMsg;
    setChatMsg(""); 
    await sendMsgMutation({ workspaceId, content: temp });
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
                    {["Admin", "Editor", "Reviewer"].map(r => <option key={r} value={r}>{r}</option>)}
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
                    Active Members <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">{teamData?.members.length || 0}</span>
                 </button>
                 <button 
                    onClick={() => setActiveTab('invites')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invites' ? 'border-[#314BEC] text-[#314BEC]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                 >
                    Pending Invites <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">{teamData?.invites.length || 0}</span>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto bg-gray-50/30">
                 {/* LIST: MEMBERS */}
                 {activeTab === 'members' && (
                     <div className="divide-y divide-gray-100">
                         {teamData?.members.map((m) => (
                             <div key={m.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors group">
                                 <div className="flex items-center gap-3">
                                     <Avatar className="h-10 w-10 border border-gray-200">
                                         <AvatarFallback style={{ backgroundColor: COLORS.primary, color: 'white' }} className="font-bold text-xs">
                                             {m.avatar}
                                         </AvatarFallback>
                                     </Avatar>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{m.name}</p>
                                         <p className="text-xs text-gray-500">{m.email}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     {m.role === 'Owner' ? (
                                         <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Owner</Badge>
                                     ) : (
                                         <select 
                                            value={m.role}
                                            onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                            className="text-xs font-medium text-gray-600 bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                                         >
                                            {["Admin", "Editor", "Reviewer"].map(r => <option key={r} value={r}>{r}</option>)}
                                         </select>
                                     )}
                                     
                                     {m.role !== 'Owner' && (
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
                         {teamData?.invites.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No pending invites.</div>}
                         {teamData?.invites.map((inv) => (
                             <div key={inv._id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 border-dashed">
                                         <Clock size={16} className="text-gray-400" />
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{inv.email}</p>
                                         <p className="text-xs text-gray-500">Role: {inv.role}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => revokeMutation({ inviteId: inv._id })} className="text-gray-400 hover:text-red-600 p-2">
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
                 <h3 className="font-bold text-sm text-gray-900">Work Chat</h3>
             </div>
             <div className="flex -space-x-2">
                 {teamData?.members.slice(0, 3).map(m => (
                     <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-[8px] flex items-center justify-center font-bold text-gray-600">
                         {m.avatar}
                     </div>
                 ))}
             </div>
         </div>

         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB] flex flex-col-reverse">
             <div ref={chatEndRef} /> 
             {messages?.map((msg) => (
                 <div key={msg._id} className="flex gap-2.5 items-end">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mb-1 border border-gray-200 bg-white text-gray-700`}>
                         {msg.senderName.charAt(0)}
                     </div>
                     <div className="flex flex-col gap-1 max-w-[85%]">
                         <div className="flex items-baseline gap-2 ml-1">
                             <span className="text-[10px] font-bold text-gray-700">{msg.senderName}</span>
                             <span className="text-[9px] text-gray-400">{formatDistanceToNow(msg.timestamp, { addSuffix: true })}</span>
                         </div>
                         <div className="px-3 py-2 rounded-2xl rounded-bl-none text-sm shadow-sm bg-white border border-gray-200 text-gray-800">
                             {msg.content}
                         </div>
                     </div>
                 </div>
             ))}
             
             {messages?.length === 0 && (
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
                     placeholder="Type a message..."
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