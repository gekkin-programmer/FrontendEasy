'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppToast } from '@/hooks/useAppToast';
import { parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatFullDateTimeInTz } from '@/lib/timezone';

// Icons
import {
  Mail, Trash2, Send, MessageSquare,
  Clock, X, UserPlus, Shield, Crown, RefreshCw,
  FileCheck, Eye, CheckCircle2, ChevronDown,
} from 'lucide-react';

// Available Roles
const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'];

const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-semibold text-sm rounded-[10px] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";

  const variants = {
    default: "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40",
    primary: "bg-[#174CD2] text-white hover:bg-[#123a9e]",
    ghost: "bg-transparent hover:bg-black/[0.03] dark:hover:bg-white/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>
      {children}
    </button>
  );
};

import { Skeleton } from '@astryxdesign/core/Skeleton';

const SkeletonMemberRow = () => (
  <div className="p-4 rounded-[14px] border border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0A0A2E]">
    <div className="flex items-center gap-4">
      <Skeleton width={40} height={40} radius="rounded" className="flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton width={144} height={12} radius={1} />
        <Skeleton width={208} height={8} radius={1} />
      </div>
    </div>
    <Skeleton width={64} height={24} radius={1} />
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
  const toast = useAppToast();
  const ROLE_DESCRIPTIONS: Record<string, string> = {
    OWNER: t('Full control — billing, workspace settings, and can remove anyone.', 'Contrôle total — facturation, paramètres de l\'espace, et peut retirer n\'importe qui.'),
    ADMIN: t('Can manage members and approve content — no billing access.', 'Peut gérer les membres et approuver le contenu — pas d\'accès à la facturation.'),
    MEMBER: t('Can create and schedule content; posts may require approval.', 'Peut créer et planifier du contenu ; les publications peuvent nécessiter une approbation.'),
    VIEWER: t('Read-only — can view content and analytics, cannot post or invite.', 'Lecture seule — peut consulter le contenu et les statistiques, ne peut pas publier ni inviter.'),
  };
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [activeTabOverride, setActiveTab] = useState<'members' | 'invites' | 'approvals' | null>(null);

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
    enabled: !!workspaceId,
  });

  const { data: pendingApprovalPosts = [], isLoading: pendingApprovalLoading, refetch: refetchPendingApproval } = useQuery({
    queryKey: ['pending-approval-posts', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&status=PENDING_APPROVAL`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
    enabled: !!workspaceId,
  });

  // Both "REVIEW" (author-submitted) and "PENDING_APPROVAL" (workspace-gated) posts land in the
  // same Approvals tab and share the same approve/reject actions.
  const approvalPosts = [...reviewPosts, ...pendingApprovalPosts];
  const approvalsLoading = reviewsLoading || pendingApprovalLoading;
  const refetchApprovals = () => { refetchReviews(); refetchPendingApproval(); };

  // Surface pending approvals first — that's the item most likely to need action right now —
  // until the user picks a tab themselves, at which point their choice always wins.
  const activeTab = activeTabOverride ?? (approvalPosts.length > 0 ? 'approvals' : 'members');

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
      refetchApprovals();
      queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error(t('Approval failed', 'Échec de l\'approbation')),
  });

  const rejectMutation = useMutation({
    mutationFn: (postId: string) => api.patch(`/posts/${postId}`, { status: 'DRAFT' }),
    onSuccess: () => { toast.warning(t('Sent back to draft', 'Renvoyé en brouillon')); refetchApprovals(); },
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
    <div className="flex flex-col lg:flex-row gap-6 font-sans text-[#040028] dark:text-white transition-colors" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>

      {/* LEFT: MANAGEMENT */}
      <div className={cn("flex flex-col gap-6 overflow-hidden transition-all duration-300", chatExpanded ? "w-0 opacity-0 pointer-events-none flex-none" : "flex-1 min-w-0 opacity-100")}>

        {/* Invite Box */}
        <div className="bg-white dark:bg-[#0A0A2E] p-6 rounded-[16px] border border-black/5 dark:border-white/5 flex-shrink-0">
          <div className="flex justify-between items-start mb-6 border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#040028] dark:text-white">
                {workspace?.name || t('Team control center', 'Centre de contrôle d\'équipe')}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-[#8E8E8E]">
                  {activeCrew.length} {t('member', 'membre')}{activeCrew.length !== 1 ? t('s', 's') : ''}
                </span>
                {pendingInvites.length > 0 && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    · {pendingInvites.length} {t('pending', 'en attente')}
                  </span>
                )}
                {workspace?.owner?.planType && (
                  <span className="bg-[#174CD2] text-white text-[10px] font-semibold px-2.5 py-1 uppercase rounded-full">
                    {workspace.owner.planType}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5">
              <UserPlus size={22} className="text-[#174CD2]" />
            </div>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Email Input */}
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E] z-10 pointer-events-none" size={18} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder={t('Team member email', 'E-mail du membre')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] font-medium placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all text-[#040028] dark:text-white"
              />
            </div>

            {/* Role Dropdown */}
            <div ref={roleRef} className="relative min-w-[160px]">
              <button
                type="button"
                onClick={() => setIsRoleOpen(v => !v)}
                className={cn(
                  "w-full flex items-center pl-10 pr-4 py-3 rounded-[10px] font-semibold text-sm transition-all text-left",
                  isRoleOpen
                    ? "bg-[#174CD2] text-white"
                    : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40"
                )}
              >
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                <span className="flex-1" title={ROLE_DESCRIPTIONS[role]}>{role}</span>
                <ChevronDown size={14} strokeWidth={2.5} className={cn("transition-transform duration-150", isRoleOpen && "rotate-180")} />
              </button>

              {isRoleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setIsRoleOpen(false); }}
                      title={ROLE_DESCRIPTIONS[r]}
                      className={cn(
                        "w-full text-left px-4 py-3 font-medium text-sm transition-colors border-b border-black/5 dark:border-white/5 last:border-b-0",
                        role === r
                          ? "bg-[#174CD2] text-white"
                          : "text-[#040028] dark:text-white hover:bg-[#174CD2]/8"
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
        <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex border-b border-black/5 dark:border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-4 text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'approvals' ? 'text-[#174CD2] border-b-2 border-[#174CD2] -mb-px' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'}`}
            >
              {t('Waiting approval', 'En attente d\'approbation')} <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === 'approvals' ? 'bg-[#174CD2] text-white' : 'bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white'}`}>{approvalPosts.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-4 text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'members' ? 'text-[#174CD2] border-b-2 border-[#174CD2] -mb-px' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'}`}
            >
              {t('Active crew', 'Équipe active')} <span className="bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">{activeCrew.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-6 py-4 text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'text-[#174CD2] border-b-2 border-[#174CD2] -mb-px' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'}`}
            >
              {t('Pending', 'En attente')} <span className="bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">{pendingInvites.length}</span>
            </button>
            <button
              onClick={() => { refetchMembers(); if (activeTab === 'approvals') refetchApprovals(); }}
              className="ml-auto px-5 py-4 hover:bg-black/[0.03] dark:hover:bg-white/5 text-[#8E8E8E] hover:text-[#174CD2] transition-colors"
              title={t('Refresh', 'Actualiser')}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A2E] p-4">
            {/* MEMBERS */}
            {activeTab === 'members' && (
              <div className="space-y-3">
                {membersLoading && [1, 2, 3].map(i => <SkeletonMemberRow key={i} />)}
                {!membersLoading && activeCrew.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-[14px] border border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0A0A2E] hover:border-[#174CD2]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center font-semibold text-sm text-[#040028] dark:text-white">
                        {m.user?.firstName?.charAt(0) || m.user?.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#040028] dark:text-white">{m.user?.firstName || t('User', 'Utilisateur')} {m.user?.lastName}</p>
                        <p className="text-xs text-[#8E8E8E]">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-2.5 py-1 bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white text-[10px] font-semibold uppercase rounded-full flex items-center gap-1" title={ROLE_DESCRIPTIONS[m.role]}>
                        {m.role === 'OWNER' && <Crown size={10} />} {m.role}
                      </div>
                      {m.role !== 'OWNER' && canManageMembers && m.user?.id !== currentUser?.id && m.user?.email !== currentUser?.email && (
                        <button onClick={() => removeMemberMutation.mutate(m.id)} className="text-[#8E8E8E] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
                  <div className="py-20 text-center rounded-[14px] border border-dashed border-black/10 dark:border-white/10">
                    <Mail size={40} className="mx-auto text-[#D9D9D9] dark:text-zinc-600 mb-4" />
                    <p className="font-semibold text-[#8E8E8E] text-lg">{t('No pending invites', 'Aucune invitation en attente')}</p>
                  </div>
                )}
                {!membersLoading && pendingInvites.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-[14px] border border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0A0A2E] hover:border-[#174CD2]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-dashed border-black/20 dark:border-white/20 bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center">
                        <Mail size={16} className="text-[#8E8E8E]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#040028] dark:text-white">{m.user?.email}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('awaiting acceptance', 'en attente d\'acceptation')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-semibold uppercase rounded-full">{m.role}</div>
                      <button onClick={() => removeMemberMutation.mutate(m.id)} className="text-[#8E8E8E] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                {approvalsLoading ? <div className="py-10 flex justify-center"><RefreshCw className="animate-spin text-[#174CD2]" /></div> : null}
                {approvalPosts.length === 0 && !approvalsLoading && (
                  <div className="py-20 text-center rounded-[14px] border border-dashed border-black/10 dark:border-white/10">
                    <CheckCircle2 size={44} className="mx-auto text-green-500 mb-4 opacity-70" />
                    <p className="font-semibold text-[#8E8E8E] text-xl">{t('All clear — no pending reviews', 'Tout est bon — Aucune révision en attente')}</p>
                  </div>
                )}
                {approvalPosts.map((post: any) => (
                  <div key={post.id} className="rounded-[16px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] overflow-hidden flex flex-col sm:flex-row transition-all">
                    <div className="w-full sm:w-1/3 bg-[#F5F7FA] dark:bg-black/20 p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E8E8E]">{t('Preview', 'Aperçu')}</span>
                        <Eye size={14} className="text-[#8E8E8E]" />
                      </div>
                      {post.media?.length > 0 ? (
                        <img src={post.media[0].media.url} className="w-full aspect-square object-cover rounded-[10px]" alt={t('Preview', 'Aperçu')} />
                      ) : (
                        <div className="w-full aspect-square rounded-[10px] border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center text-[#8E8E8E] text-xs font-medium">{t('No media attached', 'Aucun média joint')}</div>
                      )}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {post.socialAccounts?.map((sa: any, i: number) => (
                          <span key={i} className="text-[10px] font-semibold uppercase bg-white dark:bg-white/10 rounded-full px-2 py-0.5 text-[#040028] dark:text-white">{sa.socialAccount?.platform}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#174CD2]"></div>
                            <span className="font-semibold text-xs text-[#040028] dark:text-white">
                              {post.status === 'PENDING_APPROVAL' ? t('Pending approval', 'En attente d\'approbation') : t('Post review request', 'Demande de révision')}
                            </span>
                          </div>
                          <span className="text-xs text-[#8E8E8E]">{formatFullDateTimeInTz(post.createdAt, workspace?.timezone || 'UTC')}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic border-l-2 border-[#174CD2]/30 pl-4 text-[#040028] dark:text-white">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#8E8E8E]">
                          <Clock size={12} /> {t('Scheduled for', 'Planifié pour')}: {post.scheduledFor ? formatFullDateTimeInTz(post.scheduledFor, workspace?.timezone || 'UTC') : t('Immediate', 'Immédiat')}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <NeuButton onClick={() => rejectMutation.mutate(post.id)} variant="default" className="py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 border-red-200 dark:border-red-900/40">
                          <X size={16} /> {t('Reject', 'Rejeter')}
                        </NeuButton>
                        <NeuButton onClick={() => approveMutation.mutate(post.id)} className="py-3 bg-green-600 hover:bg-green-700 text-white">
                          <FileCheck size={16} /> {t('Approve & publish', 'Approuver et publier')}
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
      <div className={cn("flex-shrink-0 flex flex-col bg-white dark:bg-[#0A0A2E] rounded-[16px] border border-black/5 dark:border-white/5 overflow-hidden min-h-0 transition-all duration-300", chatExpanded ? "flex-1 w-full" : "w-full lg:w-[320px]")}>

        {/* Chat Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]" />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white dark:bg-[#0A0A2E] min-h-0">
          {chatLoading && (
            <div className="flex justify-center py-8">
              <RefreshCw size={20} className="animate-spin text-[#8E8E8E]" />
            </div>
          )}

          {!chatLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-[#8E8E8E]">
              <MessageSquare size={40} strokeWidth={1} className="mb-3 opacity-40" />
              <p className="text-xs font-medium text-center">
                {t('Say hello to your team!', 'Dites bonjour à votre équipe !')}
              </p>
            </div>
          )}

          {!chatLoading && groupedMessages.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="text-center my-3">
                <span className="text-[10px] font-semibold uppercase text-[#8E8E8E] px-2">{date}</span>
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
                        "w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden",
                        isMine ? "bg-[#174CD2] text-white" : "bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white"
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
                        <span className={cn("text-[10px] font-semibold mb-0.5 text-[#8E8E8E]", isMine && "text-right")}>
                          {isMine ? t('You', 'Vous') : getDisplayName(msg.sender)}
                        </span>
                      )}
                      <div className={cn(
                        "px-3 py-2 text-[12px] leading-relaxed rounded-[14px] break-words",
                        isMine
                          ? "bg-[#174CD2] text-white"
                          : "bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white",
                        msg.id.startsWith('opt_') && "opacity-60"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#8E8E8E] mt-0.5">
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
        <div className="flex-shrink-0 p-3 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKey}
              onFocus={() => setChatExpanded(true)}
              placeholder={t('Type a message...', 'Tapez un message...')}
              disabled={!channelId}
              className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] font-medium text-sm focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all placeholder:text-[#8E8E8E] text-[#040028] dark:text-white"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || !channelId}
              className="flex-shrink-0 px-3 py-2.5 rounded-[10px] bg-[#174CD2] text-white hover:bg-[#123a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
