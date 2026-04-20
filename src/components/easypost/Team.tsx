'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';

// Icons
import {
  Mail, Trash2, Send, MessageSquare,
  Clock, X, UserPlus, Hash, Shield, Crown, RefreshCw,
  FileCheck, Eye, CheckCircle2, ChevronDown
} from 'lucide-react';

// Available Roles
const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'];

const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black dark:border-white disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    default: "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    primary: "bg-[#3C48F6] text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    ghost: "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none hover:shadow-none translate-0",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px]"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>
      {children}
    </button>
  );
};

// Skeleton row shown while members load
const SkeletonMemberRow = () => (
  <div className="p-4 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between bg-white animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-200 border-2 border-black flex-shrink-0" />
      <div className="space-y-2">
        <div className="h-3 w-36 bg-gray-200 rounded-sm" />
        <div className="h-2 w-52 bg-gray-100 rounded-sm" />
      </div>
    </div>
    <div className="h-6 w-16 bg-gray-200" />
  </div>
);

interface TeamProps {
  workspaceId: string;
}

export default function Team({ workspaceId }: TeamProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'approvals'>('members');
  
  // --- QUERIES ---
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => api.get<any>(`/workspaces/${workspaceId}`).then(res => res?.data || res),
    enabled: !!workspaceId,
  });

  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['team-members', workspaceId],
    queryFn: () => api.get<any[]>(`/workspaces/${workspaceId}/members`).then(res => res || []),
    enabled: !!workspaceId
  });

  const { data: reviewPosts = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['review-posts', workspaceId],
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&status=REVIEW`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
    enabled: !!workspaceId && activeTab === 'approvals'
  });

  // --- MUTATIONS ---
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string, role: string }) => api.post(`/workspaces/${workspaceId}/members/invite`, data),
    onSuccess: () => {
        toast.success("INVITATION_SENT");
        refetchMembers();
    },
    onError: (e: any) => toast.error(e.message || "INVITE_FAILED")
  });

  const approveMutation = useMutation({
    mutationFn: (postId: string) => api.post(`/posts/${postId}/approve`, {}),
    onSuccess: () => {
        toast.success("CONTENT_APPROVED_LIVE");
        refetchReviews();
        queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error("APPROVAL_FAILED")
  });

  const rejectMutation = useMutation({
    mutationFn: (postId: string) => api.patch(`/posts/${postId}`, { status: 'DRAFT' }),
    onSuccess: () => {
        toast.warning("SENT_BACK_TO_DRAFT");
        refetchReviews();
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspaces/${workspaceId}/members/${id}`),
    onSuccess: () => {
        toast.success("MEMBER_REMOVED");
        refetchMembers();
    }
  });

  // Form State
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleInvite = () => {
    if (!email.includes('@')) return toast.error("INVALID_EMAIL");
    inviteMutation.mutate({ email, role });
    setEmail("");
  };

  const activeCrew = members.filter((m: any) => m.status === 'ACTIVE' || m.status === 'JOINED' || m.status === 'OWNER');
  const pendingInvites = members.filter((m: any) => m.status === 'INVITED' || m.status === 'PENDING');

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 font-sans text-black dark:text-white transition-colors">
      
      {/* LEFT: MANAGEMENT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 min-h-0">
        
        {/* Invite Box */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] flex-shrink-0">
            <div className="flex justify-between items-start mb-6 border-b-2 border-dashed border-gray-300 dark:border-zinc-700 pb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                      {workspace?.name || 'Team Control Center'}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                        {activeCrew.length} member{activeCrew.length !== 1 ? 's' : ''}
                      </span>
                      {pendingInvites.length > 0 && (
                        <span className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                          · {pendingInvites.length} pending
                        </span>
                      )}
                      {workspace?.owner?.planType && (
                        <span className="bg-[#3C48F5] text-white text-[9px] font-black px-2 py-0.5 uppercase border border-black">
                          {workspace.owner.planType}
                        </span>
                      )}
                    </div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <UserPlus size={24} className="text-black dark:text-white" />
                </div>
            </div>
            
            <div className="flex gap-4 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-zinc-400" size={18} />
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="TEAM_MEMBER_EMAIL"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all uppercase text-black dark:text-white"
                    />
                </div>
                <div className="relative min-w-[160px]">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white z-10 pointer-events-none" size={16} />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white z-10 pointer-events-none" size={14} strokeWidth={3} />
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full h-full bg-white dark:bg-zinc-800 border-2 border-black dark:border-white pl-10 pr-9 py-3 font-black text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:bg-yellow-50 dark:hover:bg-zinc-700 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all text-black dark:text-white"
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <NeuButton onClick={handleInvite} disabled={inviteMutation.isPending} variant="primary" className="px-8 py-3">
                    {inviteMutation.isPending ? 'SYNCING...' : 'INVITE'}
                </NeuButton>
            </div>
        </div>

        {/* Workspace Explorer */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden flex-1 flex flex-col min-h-0">
             <div className="flex border-b-2 border-black dark:border-white flex-shrink-0 bg-gray-50 dark:bg-zinc-800">
                 <button onClick={() => setActiveTab('members')} className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'members' ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-none' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                    ACTIVE_CREW <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-mono">{activeCrew.length}</span>
                 </button>
                 <button onClick={() => setActiveTab('invites')} className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'invites' ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-none' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                    PENDING <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-mono">{pendingInvites.length}</span>
                 </button>
                 <button onClick={() => setActiveTab('approvals')} className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'approvals' ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>
                    WAITING_APPROVAL <span className="bg-white text-black px-1.5 py-0.5 text-[8px] font-mono">{reviewPosts.length}</span>
                 </button>
                 <button onClick={() => { refetchMembers(); refetchReviews(); }} className="ml-auto px-4 hover:bg-gray-200 dark:hover:bg-zinc-700 border-l-2 border-black dark:border-white text-black dark:text-white"><RefreshCw size={14} /></button>
             </div>

             <div className="flex-1 overflow-y-auto bg-blue-50 dark:bg-zinc-900 p-4">
                 {/* LIST: MEMBERS */}
                 {activeTab === 'members' && (
                     <div className="space-y-3">
                         {membersLoading && [1, 2, 3].map(i => <SkeletonMemberRow key={i} />)}
                         {!membersLoading && activeCrew.map((m: any) => (
                             <div key={m.id} className="p-4 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-between bg-white dark:bg-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                 <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 flex items-center justify-center font-black uppercase text-sm">
                                         {m.user?.firstName?.charAt(0) || m.user?.email?.charAt(0)}
                                     </div>
                                     <div>
                                         <p className="text-sm font-black uppercase text-black dark:text-white">{m.user?.firstName || 'User'} {m.user?.lastName}</p>
                                         <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{m.user?.email}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <div className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black border border-black dark:border-white uppercase flex items-center gap-1">
                                         {m.role === 'OWNER' && <Crown size={10} />} {m.role}
                                     </div>
                                     {m.role !== 'OWNER' && (
                                         <button onClick={() => removeMemberMutation.mutate(m.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* LIST: APPROVALS (Visual Review) */}
                 {activeTab === 'approvals' && (
                     <div className="space-y-6">
                         {reviewsLoading ? <div className="py-10 flex justify-center"><RefreshCw className="animate-spin" /></div> : null}
                         {reviewPosts.length === 0 && !reviewsLoading && (
                             <div className="py-20 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800">
                                 <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                                 <p className="font-black uppercase text-zinc-300 dark:text-zinc-700 text-2xl">All_Clear_No_Pending_Reviews</p>
                             </div>
                         )}
                         {reviewPosts.map((post: any) => (
                             <div key={post.id} className="border-4 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] overflow-hidden flex flex-col sm:flex-row transition-all">
                                 {/* Visual Preview Side */}
                                 <div className="w-full sm:w-1/3 bg-zinc-100 dark:bg-zinc-950 p-4 border-b-4 sm:border-b-0 sm:border-r-4 border-black dark:border-white flex flex-col gap-3">
                                     <div className="flex items-center justify-between mb-2">
                                         <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">PREVIEW_ENGINE</span>
                                         <Eye size={14} className="text-zinc-400" />
                                     </div>
                                     {post.media?.length > 0 ? (
                                         <img src={post.media[0].media.url} className="w-full aspect-square object-cover border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000]" alt="Preview" />
                                     ) : (
                                         <div className="w-full aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-[10px] font-bold uppercase">No_Media_Attached</div>
                                     )}
                                     <div className="flex gap-1 flex-wrap mt-2">
                                         {post.socialAccounts?.map((sa: any, i: number) => (
                                             <span key={i} className="text-[8px] font-black uppercase bg-white dark:bg-zinc-900 border border-black dark:border-white px-1.5 py-0.5">{sa.socialAccount?.platform}</span>
                                         ))}
                                     </div>
                                 </div>

                                 {/* Content & Actions Side */}
                                 <div className="flex-1 p-6 flex flex-col justify-between">
                                     <div className="space-y-4">
                                         <div className="flex justify-between items-start">
                                             <div className="flex items-center gap-2">
                                                 <div className="w-6 h-6 bg-[#3C48F5] rounded-none border border-black"></div>
                                                 <span className="font-black uppercase text-xs">Post_Review_Request</span>
                                             </div>
                                             <span className="text-[10px] font-mono opacity-50 uppercase">{format(parseISO(post.createdAt), 'MMM d, HH:mm')}</span>
                                         </div>
                                         <p className="text-sm font-medium leading-relaxed italic border-l-4 border-zinc-200 dark:border-zinc-700 pl-4">{post.content}</p>
                                         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500">
                                             <Clock size={12} /> Scheduled_For: {post.scheduledFor ? format(parseISO(post.scheduledFor), 'EEEE, MMMM d @ HH:mm') : 'IMMEDIATE'}
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-4 mt-8">
                                         <NeuButton onClick={() => rejectMutation.mutate(post.id)} variant="default" className="py-3 bg-red-50 hover:bg-red-100 text-red-600 border-red-500">
                                             <X size={16} strokeWidth={3} /> REJECT_DRAFT
                                         </NeuButton>
                                         <NeuButton onClick={() => approveMutation.mutate(post.id)} variant="primary" className="py-3 bg-green-600 hover:bg-green-700 text-white border-green-900 shadow-green-900/20">
                                             <FileCheck size={16} strokeWidth={3} /> APPROVE_PUBLISH
                                         </NeuButton>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden h-full">
         <div className="p-4 border-b-2 border-black dark:border-white flex items-center justify-between bg-yellow-400 dark:bg-yellow-600 z-10">
             <div className="flex items-center gap-2">
                 <div className="p-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white"><Hash size={16} /></div>
                 <span className="font-black text-sm uppercase">TEAM_FLOW</span>
             </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-900 flex flex-col-reverse bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] dark:opacity-90">
             <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 opacity-50">
                 <MessageSquare size={48} strokeWidth={1} className="mb-2" />
                 <p className="text-xs font-bold uppercase tracking-widest">Team_Chat_Active</p>
             </div>
         </div>
         <div className="p-3 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-900">
             <div className="relative w-full flex gap-2">
                 <input placeholder="TYPE_MESSAGE..." className="w-full pl-4 pr-4 py-3 bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white font-bold text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all placeholder:text-gray-400 uppercase text-black dark:text-white" />
                 <button className="px-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-all"><Send size={18} strokeWidth={3} /></button>
             </div>
         </div>
      </div>
    </div>
  );
}
