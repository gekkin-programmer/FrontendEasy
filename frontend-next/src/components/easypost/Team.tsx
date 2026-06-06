'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { useSocket } from '@/src/context/SocketContext';
import { useLanguage } from '@/src/context/LanguageContext';

// Icons
import {
  Mail, Trash2, Send, MessageSquare,
  Clock, X, UserPlus, Shield, Crown, RefreshCw,
  FileCheck, Eye, CheckCircle2, ChevronDown,
} from 'lucide-react';

// Available Roles
const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'];

const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black dark:border-white disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";

  const variants = {
    default: "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    primary: "bg-black dark:bg-white text-white hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    ghost: "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none hover:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px]",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>
      {children}
    </button>
  );
};

import { Skeleton } from '@/components/ui/skeleton';

const SkeletonMemberRow = () => (
  <div className="p-4 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-between bg-white dark:bg-zinc-900">
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10 border-2 border-black dark:border-white flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-2 w-52" />
      </div>
    </div>
    <Skeleton className="h-6 w-16" />
  </div>
);

interface ChatMsg {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
  };
}

interface TeamProps {
  workspaceId: string;
}

export default function Team({ workspaceId }: TeamProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'approvals'>('members');

  // ── QUERIES ───────────────────────────────────────────────────────────
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any>(`/workspaces/${workspaceId}`).then(res => res?.data || res),
    enabled: !!workspaceId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    gcTime: 0,
    queryFn: () => api.get<any>('/auth/profile').then(res => res?.data || res),
  });

  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['team-members', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any[]>(`/workspaces/${workspaceId}/members`).then(res => res || []),
    enabled: !!workspaceId,
  });

  const { data: reviewPosts = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['review-posts', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&status=REVIEW`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
    enabled: !!workspaceId && activeTab === 'approvals',
  });

  // ── MUTATIONS ─────────────────────────────────────────────────────────
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => api.post(`/workspaces/${workspaceId}/members/invite`, data),
    onSuccess: () => { toast.success(t('Invitation sent', 'Invitation envoyée')); refetchMembers(); },
    onError: (e: any) => toast.error(e.message || t('Invite failed', 'Échec de l\'invitation')),
  });

  const approveMutation = useMutation({
    mutationFn: (postId: string) => api.post(`/posts/${postId}/approve`, {}),
    onSuccess: () => {
      toast.success(t('Content approved and live', 'Contenu approuvé et en ligne'));
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error(t('Approval failed', 'Échec de l\'approbation')),
  });

  const rejectMutation = useMutation({
    mutationFn: (postId: string) => api.patch(`/posts/${postId}`, { status: 'DRAFT' }),
    onSuccess: () => { toast.warning(t('Sent back to draft', 'Renvoyé en brouillon')); refetchReviews(); },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspaces/${workspaceId}/members/${id}`),
    onSuccess: () => { toast.success(t('Member removed', 'Membre retiré')); refetchMembers(); },
  });

  // ── FORM STATE ────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setIsRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInvite = () => {
    if (!email.includes('@')) return toast.error(t('Invalid email', 'E-mail invalide'));
    inviteMutation.mutate({ email, role });
    setEmail("");
  };

  const activeCrew = members.filter((m: any) => m.status === 'ACTIVE' || m.status === 'JOINED' || m.status === 'OWNER');
  const pendingInvites = members.filter((m: any) => m.status === 'INVITED' || m.status === 'PENDING');
  const currentUserMember = members.find((m: any) => m.user?.id === currentUser?.id || m.user?.email === currentUser?.email);
  const canManageMembers = currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN' || workspace?.ownerId === currentUser?.id;

  // ── CHAT STATE ────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  // Bootstrap: get or create the "general" channel
  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    const bootstrap = async () => {
      try {
        setChatLoading(true);
        const channels = await api.get<any[]>(`/workspaces/${workspaceId}/channels`).then(r => Array.isArray(r) ? r : (r as any)?.data || []);
        let channel = channels.find((c: any) => c.name === 'general') || channels[0];

        if (!channel) {
          channel = await api.post<any>(`/workspaces/${workspaceId}/channels`, { name: 'general', description: 'Team workspace chat' }).then(r => r?.data || r);
        }

        if (!cancelled && channel?.id) {
          setChannelId(channel.id);
          const history = await api.get<any[]>(`/channels/${channel.id}/messages`).then(r => Array.isArray(r) ? r : (r as any)?.data || []);
          if (!cancelled) {
            setMessages(history);
            setChatLoading(false);
            setTimeout(() => scrollToBottom(false), 50);
          }
        }
      } catch {
        if (!cancelled) setChatLoading(false);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [workspaceId, scrollToBottom]);

  // Real-time: listen for new messages
  useEffect(() => {
    if (!socket || !channelId) return;

    const handler = (msg: ChatMsg) => {
      if (msg.channelId !== channelId) return;
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => scrollToBottom(), 30);
    };

    socket.on('chat_message', handler);
    return () => { socket.off('chat_message', handler); };
  }, [socket, channelId, scrollToBottom]);

  // Auto-scroll when messages grow
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || !channelId) return;
    setChatInput('');
    setChatExpanded(false);
    inputRef.current?.focus();

    // Optimistic: add message locally (will be deduped by socket)
    const optimistic: ChatMsg = {
      id: `opt_${Date.now()}`,
      content: text,
      channelId,
      senderId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser?.id || '',
        firstName: currentUser?.firstName,
        lastName: currentUser?.lastName,
        avatar: currentUser?.avatar,
        email: currentUser?.email,
      },
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(), 30);

    try {
      const saved = await api.post<any>(`/channels/${channelId}/messages`, { content: text }).then(r => r?.data || r);
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, channelId } : m));
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      toast.error(t('Message failed to send', 'Échec de l\'envoi du message'));
      setChatInput(text);
    }
  };

  const handleChatKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const getInitial = (sender: ChatMsg['sender']) =>
    sender?.firstName?.[0]?.toUpperCase() || sender?.email?.[0]?.toUpperCase() || '?';

  const getDisplayName = (sender: ChatMsg['sender']) =>
    sender?.firstName ? `${sender.firstName} ${sender.lastName || ''}`.trim() : (sender?.email || t('Unknown', 'Inconnu'));

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: ChatMsg[] }[]>((groups, msg) => {
    const date = format(parseISO(msg.createdAt), 'MMMM d, yyyy');
    const last = groups[groups.length - 1];
    if (last && last.date === date) { last.msgs.push(msg); }
    else groups.push({ date, msgs: [msg] });
    return groups;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans text-black dark:text-white transition-colors" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>

      {/* LEFT: MANAGEMENT */}
      <div className={cn("flex flex-col gap-6 overflow-hidden transition-all duration-300", chatExpanded ? "w-0 opacity-0 pointer-events-none flex-none" : "flex-1 min-w-0 opacity-100")}>

        {/* Invite Box */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] flex-shrink-0">
          <div className="flex justify-between items-start mb-6 border-b-2 border-dashed border-gray-300 dark:border-zinc-700 pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                {workspace?.name || t('Team Control Center', 'Centre de contrôle d\'équipe')}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                  {activeCrew.length} {t('member', 'membre')}{activeCrew.length !== 1 ? t('s', 's') : ''}
                </span>
                {pendingInvites.length > 0 && (
                  <span className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                    · {pendingInvites.length} {t('pending', 'en attente')}
                  </span>
                )}
                {workspace?.owner?.planType && (
                  <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-black px-2 py-0.5 uppercase border border-black">
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
            {/* Email Input */}
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder={t('Team member email', 'E-mail du membre')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-bold placeholder:text-gray-400 focus:outline-none focus:border-black dark:border-white focus:bg-[#EEF0FF] dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] transition-all uppercase text-black dark:text-white"
              />
            </div>

            {/* Role Dropdown */}
            <div ref={roleRef} className="relative min-w-[160px]">
              <button
                type="button"
                onClick={() => setIsRoleOpen(v => !v)}
                className={cn(
                  "w-full flex items-center pl-10 pr-4 py-3 border-2 border-black dark:border-white font-black text-sm uppercase transition-all text-left text-black dark:text-white",
                  isRoleOpen
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-none translate-x-[4px] translate-y-[4px]"
                    : "bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:bg-yellow-100 dark:hover:bg-zinc-700 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:bg-yellow-200 dark:active:bg-zinc-600"
                )}
              >
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                <span className="flex-1">{role}</span>
                <ChevronDown size={14} strokeWidth={3} className={cn("transition-transform duration-150", isRoleOpen && "rotate-180")} />
              </button>

              {isRoleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] z-50 overflow-hidden">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setIsRoleOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-3 font-black text-sm uppercase transition-colors border-b border-black/10 dark:border-white/10 last:border-b-0",
                        role === r
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "text-black dark:text-white hover:bg-yellow-50 dark:hover:bg-zinc-700"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <NeuButton onClick={handleInvite} disabled={inviteMutation.isPending} variant="primary" className="px-8 py-3">
              {inviteMutation.isPending ? t('Sending...', 'Envoi...') : t('Invite', 'Inviter')}
            </NeuButton>
          </div>
        </div>

        {/* Workspace Explorer */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex border-b-2 border-black dark:border-white flex-shrink-0 bg-gray-50 dark:bg-zinc-800">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'members' ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-none' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200 dark:active:bg-zinc-600'}`}
            >
              {t('Active Crew', 'Équipe active')} <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-mono">{activeCrew.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'invites' ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-none' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200 dark:active:bg-zinc-600'}`}
            >
              {t('Pending', 'En attente')} <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-mono">{pendingInvites.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-4 text-[10px] font-black uppercase transition-all flex items-center gap-2 border-r-2 border-black dark:border-white ${activeTab === 'approvals' ? 'bg-black dark:bg-white text-white dark:text-black active:bg-zinc-800' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200 dark:active:bg-zinc-600'}`}
            >
              {t('Waiting Approval', 'En attente d\'approbation')} <span className={`px-1.5 py-0.5 text-[8px] font-mono ${activeTab === 'approvals' ? 'bg-white text-black' : 'bg-black dark:bg-white text-white dark:text-black'}`}>{reviewPosts.length}</span>
            </button>
            <button
              onClick={() => { refetchMembers(); if (activeTab === 'approvals') refetchReviews(); }}
              className="ml-auto px-5 py-4 hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200 dark:active:bg-zinc-600 border-l-2 border-black dark:border-white text-black dark:text-white transition-colors"
              title={t('Refresh', 'Actualiser')}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 p-4">
            {/* MEMBERS */}
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
                        <p className="text-sm font-black uppercase text-black dark:text-white">{m.user?.firstName || t('User', 'Utilisateur')} {m.user?.lastName}</p>
                        <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black border border-black dark:border-white uppercase flex items-center gap-1">
                        {m.role === 'OWNER' && <Crown size={10} />} {m.role}
                      </div>
                      {m.role !== 'OWNER' && canManageMembers && m.user?.id !== currentUser?.id && m.user?.email !== currentUser?.email && (
                        <button onClick={() => removeMemberMutation.mutate(m.id)} className="text-gray-400 hover:text-red-500 active:text-red-700 transition-colors"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PENDING INVITES */}
            {activeTab === 'invites' && (
              <div className="space-y-3">
                {membersLoading && [1, 2].map(i => <SkeletonMemberRow key={i} />)}
                {!membersLoading && pendingInvites.length === 0 && (
                  <div className="py-20 text-center border-4 border-dashed border-gray-200 dark:border-zinc-800">
                    <Mail size={48} className="mx-auto text-gray-300 dark:text-zinc-600 mb-4" />
                    <p className="font-black uppercase text-gray-300 dark:text-zinc-600 text-xl">{t('No Pending Invites', 'Aucune invitation en attente')}</p>
                  </div>
                )}
                {!membersLoading && pendingInvites.map((m: any) => (
                  <div key={m.id} className="p-4 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-between bg-white dark:bg-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border-2 border-dashed border-black dark:border-white bg-gray-50 dark:bg-zinc-700 flex items-center justify-center">
                        <Mail size={16} className="text-gray-400 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-black dark:text-white">{m.user?.email}</p>
                        <p className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400 uppercase">{t('awaiting acceptance', 'en attente d\'acceptation')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-yellow-400 text-black text-[10px] font-black border border-black uppercase">{m.role}</div>
                      <button onClick={() => removeMemberMutation.mutate(m.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                {reviewsLoading ? <div className="py-10 flex justify-center"><RefreshCw className="animate-spin" /></div> : null}
                {reviewPosts.length === 0 && !reviewsLoading && (
                  <div className="py-20 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800">
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                    <p className="font-black uppercase text-zinc-300 dark:text-zinc-700 text-2xl">{t('All Clear — No Pending Reviews', 'Tout est bon — Aucune révision en attente')}</p>
                  </div>
                )}
                {reviewPosts.map((post: any) => (
                  <div key={post.id} className="border-4 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] overflow-hidden flex flex-col sm:flex-row transition-all">
                    <div className="w-full sm:w-1/3 bg-zinc-100 dark:bg-zinc-950 p-4 border-b-4 sm:border-b-0 sm:border-r-4 border-black dark:border-white flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">{t('PREVIEW ENGINE', 'MOTEUR DE PRÉVISUALISATION')}</span>
                        <Eye size={14} className="text-zinc-400" />
                      </div>
                      {post.media?.length > 0 ? (
                        <img src={post.media[0].media.url} className="w-full aspect-square object-cover border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000]" alt={t('Preview', 'Aperçu')} />
                      ) : (
                        <div className="w-full aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-[10px] font-bold uppercase">{t('No Media Attached', 'Aucun média joint')}</div>
                      )}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {post.socialAccounts?.map((sa: any, i: number) => (
                          <span key={i} className="text-[8px] font-black uppercase bg-white dark:bg-zinc-900 border border-black dark:border-white px-1.5 py-0.5">{sa.socialAccount?.platform}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-black dark:bg-white rounded-none border border-black"></div>
                            <span className="font-black uppercase text-xs">{t('Post Review Request', 'Demande de révision')}</span>
                          </div>
                          <span className="text-[10px] font-mono opacity-50 uppercase">{format(parseISO(post.createdAt), 'MMM d, HH:mm')}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic border-l-4 border-zinc-200 dark:border-zinc-700 pl-4">{post.content}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500">
                          <Clock size={12} /> {t('Scheduled For', 'Planifié pour')}: {post.scheduledFor ? format(parseISO(post.scheduledFor), 'EEEE, MMMM d @ HH:mm') : t('IMMEDIATE', 'IMMÉDIAT')}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <NeuButton onClick={() => rejectMutation.mutate(post.id)} variant="default" className="py-3 bg-red-50 hover:bg-red-100 text-red-600 border-red-500">
                          <X size={16} strokeWidth={3} /> {t('Reject', 'Rejeter')}
                        </NeuButton>
                        <NeuButton onClick={() => approveMutation.mutate(post.id)} variant="primary" className="py-3 bg-green-600 hover:bg-green-700 text-white border-green-900">
                          <FileCheck size={16} strokeWidth={3} /> {t('Approve & Publish', 'Approuver et publier')}
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

      {/* RIGHT: TEAM CHAT */}
      <div className={cn("flex-shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden min-h-0 transition-all duration-300", chatExpanded ? "flex-1 w-full" : "w-full lg:w-[320px]")}>

        {/* Chat Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900" />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white dark:bg-zinc-900 min-h-0">
          {chatLoading && (
            <div className="flex justify-center py-8">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
            </div>
          )}

          {!chatLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400 dark:text-zinc-600">
              <MessageSquare size={40} strokeWidth={1} className="mb-3 opacity-40" />
              <p className="text-xs font-black uppercase tracking-widest text-center">
                {t('Say hello to your team!', 'Dites bonjour à votre équipe !')}
              </p>
            </div>
          )}

          {!chatLoading && groupedMessages.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="text-center my-3">
                <span className="text-[9px] font-black uppercase text-gray-400 dark:text-zinc-500 px-2">{date}</span>
              </div>

              {msgs.map((msg, idx) => {
                const isMine = msg.senderId === currentUser?.id;
                const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                const isGrouped = prevMsg?.senderId === msg.senderId &&
                  new Date(msg.createdAt).getTime() - new Date(prevMsg?.createdAt || 0).getTime() < 60_000 * 5;

                return (
                  <div key={msg.id} className={cn("flex gap-2 mb-0.5", isMine ? "flex-row-reverse" : "flex-row", isGrouped ? "mt-0.5" : "mt-3")}>
                    {/* Avatar */}
                    {!isGrouped ? (
                      <div className={cn(
                        "w-7 h-7 flex-shrink-0 border-2 border-black dark:border-white flex items-center justify-center text-[10px] font-black overflow-hidden",
                        isMine ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-100 dark:bg-zinc-700 text-black dark:text-white"
                      )}>
                        {msg.sender?.avatar
                          ? <img src={msg.sender.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          : getInitial(msg.sender)
                        }
                      </div>
                    ) : (
                      <div className="w-7 flex-shrink-0" />
                    )}

                    <div className={cn("flex flex-col max-w-[210px]", isMine ? "items-end" : "items-start")}>
                      {!isGrouped && (
                        <span className={cn("text-[9px] font-black uppercase mb-0.5 text-gray-500 dark:text-zinc-400", isMine && "text-right")}>
                          {isMine ? t('You', 'Vous') : getDisplayName(msg.sender)}
                        </span>
                      )}
                      <div className={cn(
                        "px-3 py-2 text-[12px] leading-relaxed border-2 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] break-words",
                        isMine
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : "bg-white dark:bg-zinc-800 text-black dark:text-white border-black dark:border-white",
                        msg.id.startsWith('opt_') && "opacity-60"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] text-gray-400 dark:text-zinc-600 mt-0.5 font-mono">
                        {format(parseISO(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-900">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKey}
              onFocus={() => setChatExpanded(true)}
              placeholder={t('Type a message...', 'Tapez un message...')}
              disabled={!channelId}
              className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-bold text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-700 focus:border-black dark:border-white focus:shadow-[3px_3px_0px_0px_#000] transition-all placeholder:text-gray-400 uppercase text-black dark:text-white"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || !channelId}
              className="flex-shrink-0 px-3 py-2.5 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-black/80 hover:border-black active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
