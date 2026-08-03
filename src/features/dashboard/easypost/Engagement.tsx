'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppToast } from '@/hooks/useAppToast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';

// Icons
import {
  FiMessageCircle, FiCheck, FiCheckCircle,
  FiSmile, FiArchive,
  FiChevronLeft, FiChevronRight, FiLock, FiClock, FiSearch, FiX
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Avatar } from '@astryxdesign/core/Avatar';
import {
  ChatLayout, ChatMessageList, ChatMessage, ChatMessageBubble, ChatMessageMetadata, ChatComposer,
} from '@astryxdesign/core/Chat';
import { PlatformIcon } from '@/features/dashboard/easypost/composer/PlatformIcon';

// --- CONFIGS ---
const SENTIMENT_STYLES: any = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-[#F5F7FA] text-[#040028]',
  question: 'bg-[#174CD2]/10 text-[#174CD2]',
};

const PLATFORM_FILTERS = [
  { id: 'all', labelEn: 'All', labelFr: 'Tous' },
  { id: 'unread', labelEn: 'Unread', labelFr: 'Non lus' },
  { id: 'facebook', labelEn: 'Facebook', labelFr: 'Facebook' },
  { id: 'instagram', labelEn: 'Instagram', labelFr: 'Instagram' },
  { id: 'tiktok', labelEn: 'TikTok', labelFr: 'TikTok' },
  { id: 'whatsapp', labelEn: 'WhatsApp', labelFr: 'WhatsApp' },
  { id: 'youtube', labelEn: 'YouTube', labelFr: 'YouTube' },
];

// The Chat kit's `sender` prop is 'user' | 'assistant' | 'system' — AI-copilot naming,
// where 'user' renders right-aligned and 'assistant' left-aligned. This is a two-human
// conversation (customer <-> agent) today, with room to slot an AI-authored reply in on
// the agent's side later — route every message through this instead of hardcoding
// 'assistant'/'user' so the actual meaning stays explicit at each call site.
type ChatAuthorRole = 'customer' | 'agent' | 'ai';
const roleToSender = (role: ChatAuthorRole): 'user' | 'assistant' => (role === 'customer' ? 'assistant' : 'user');

// Dev-only avatar placeholder — inline SVG so it never depends on network access.
const MOCK_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23174CD2"/><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="16" text-anchor="middle" dy=".35em">A</text></svg>'
);

// Local design-preview data only — never rendered when NODE_ENV is production,
// and only used as a fallback when the real fetch returns nothing.
function buildMockWhatsappStates() {
  const now = Date.now();
  return [
    {
      _id: 'mock-unread', conversationId: 'mock-unread', type: 'dm', platform: 'whatsapp',
      authorName: 'Amara N.', authorAvatar: MOCK_AVATAR,
      content: 'Hey! Do you still have the blue one in stock?',
      receivedAt: new Date(now - 3 * 60 * 1000).toISOString(),
      status: 'unread', unreadCount: 3, canReplyFreely: true,
      windowExpiresAt: new Date(now + 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-read', conversationId: 'mock-read', type: 'dm', platform: 'whatsapp',
      authorName: 'Jordan Lee', authorAvatar: null,
      content: 'Perfect, thank you so much!',
      receivedAt: new Date(now - 45 * 60 * 1000).toISOString(),
      status: 'read', unreadCount: 0, canReplyFreely: true,
      windowExpiresAt: new Date(now + 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-nearing-expiry', conversationId: 'mock-nearing-expiry', type: 'dm', platform: 'whatsapp',
      authorName: 'Bryan T.', authorAvatar: null,
      content: 'Ok noted, will check tomorrow morning.',
      receivedAt: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
      status: 'read', unreadCount: 0, canReplyFreely: true,
      windowExpiresAt: new Date(now + 45 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-closed', conversationId: 'mock-closed', type: 'dm', platform: 'whatsapp',
      authorName: 'Fatou D.', authorAvatar: null,
      content: 'Alright, talk soon!',
      receivedAt: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
      status: 'read', unreadCount: 0, canReplyFreely: false,
      windowExpiresAt: null,
    },
    {
      _id: 'mock-replied', conversationId: 'mock-replied', type: 'dm', platform: 'whatsapp',
      authorName: 'Kwame O.', authorAvatar: null,
      content: 'Sounds good, appreciate the quick turnaround on this one.',
      receivedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      status: 'replied', unreadCount: 0, canReplyFreely: true,
      windowExpiresAt: new Date(now + 19 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-long', conversationId: 'mock-long', type: 'dm', platform: 'whatsapp',
      authorName: 'Chidinma Okonkwo-Adeyemi', authorAvatar: null,
      content: "I wanted to follow up on the order from last week — I think there might have been a mix-up with the sizing, could someone take a look and get back to me when they have a moment? No rush at all, just want to make sure it's sorted before the weekend.",
      receivedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      status: 'unread', unreadCount: 12, canReplyFreely: true,
      windowExpiresAt: new Date(now + 21 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// TEMP PREVIEW DATA — remove once the API returns real engagement items.
// Only kicks in when the query comes back empty, so real data always wins.
// ---------------------------------------------------------------------------
const MOCK_ENGAGEMENTS = [
  { _id: 'mock-1', authorName: 'Amara K.', authorAvatar: 'https://i.pravatar.cc/64?img=47', platform: 'instagram', content: 'Adore ce produit ! Où puis-je l\'acheter ?', receivedAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'unread', unreadCount: 1, sentiment: 'positive', type: 'comment', postId: 'post-1', postCaption: 'Ravis de partager notre dernière mise à jour produit !' },
  { _id: 'mock-2', authorName: 'Jason M.', authorAvatar: 'https://i.pravatar.cc/64?img=13', platform: 'facebook', content: 'Est-ce que la livraison est disponible au Cameroun ?', receivedAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'unread', unreadCount: 2, sentiment: 'question', type: 'comment', postId: 'post-1', postCaption: 'Ravis de partager notre dernière mise à jour produit !' },
  { _id: 'mock-3', authorName: 'Sarah T.', authorAvatar: 'https://i.pravatar.cc/64?img=25', platform: 'tiktok', content: 'Ce n\'est pas arrivé comme prévu, un peu déçue.', receivedAt: new Date(Date.now() - 8 * 3600000).toISOString(), status: 'read', sentiment: 'negative', type: 'comment', postId: 'post-2', postCaption: 'Les coulisses de notre dernier shooting photo' },
  { _id: 'mock-4', authorName: 'Kevin O.', authorAvatar: 'https://i.pravatar.cc/64?img=52', platform: 'whatsapp', content: 'Merci pour la réponse rapide !', receivedAt: new Date(Date.now() - 26 * 3600000).toISOString(), status: 'replied', sentiment: 'positive', type: 'dm', conversationId: 'mock-conv-4' },
  { _id: 'mock-5', authorName: 'Linda P.', authorAvatar: 'https://i.pravatar.cc/64?img=31', platform: 'youtube', content: 'Super tuto, merci beaucoup 🙌', receivedAt: new Date(Date.now() - 30 * 3600000).toISOString(), status: 'read', sentiment: 'positive', type: 'comment', postId: 'post-3', postCaption: 'Nouveau tuto vidéo cette semaine' },
  { _id: 'mock-6', authorName: 'Marc D.', authorAvatar: 'https://i.pravatar.cc/64?img=8', platform: 'facebook', content: 'Vous proposez ça aussi en taille XL ?', receivedAt: new Date(Date.now() - 48 * 3600000).toISOString(), status: 'unread', unreadCount: 1, sentiment: 'question', type: 'comment', postId: 'post-2', postCaption: 'Les coulisses de notre dernier shooting photo' },
];

export default function Engagement() {
  const { t } = useLanguage();
  const params = useParams();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const toast = useAppToast();

  // STATE
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCannedOpen, setIsCannedOpen] = useState(false);
  const [inboxViewMode, setInboxViewMode] = useState<'list' | 'post'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'unread' | 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'youtube'>('all');

  // Handle browser back button on mobile view
  useEffect(() => {
    const handlePopState = () => {
      if (activeId !== null && window.innerWidth < 768) {
        setActiveId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeId]);

  const selectConversation = (id: string) => {
    setActiveId(id);
    setSendError(null);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.history.pushState({ conversationId: id }, '');
    }
  };

  const handleBackToList = () => {
    setActiveId(null);
    setSendError(null);
  };

  // 🟢 1. FETCH ENGAGEMENT
  const { data: rawEngagements = [], isLoading, error: engagementError } = useQuery({
    queryKey: ['engagement', workspaceId],
    gcTime: 0,
    queryFn: async () => {
        const res: any = await api.get(`/engagement?workspaceId=${workspaceId}`);
        return Array.isArray(res) ? res : (res?.data ?? []);
    }
  });
  const engagements = rawEngagements;
  const isWorkspaceForbidden = (engagementError as any)?.status === 403;

  // 🟢 1b. WHATSAPP INBOX LIST — carries canReplyFreely/windowExpiresAt so the
  // left panel can mark closed threads before an agent opens them.
  const { data: whatsappInbox = [] } = useQuery({
    queryKey: ['whatsapp-inbox', workspaceId],
    queryFn: async () => {
      const res: any = await api.get(`/whatsapp/inbox?workspaceId=${workspaceId}`);
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
    enabled: !!workspaceId,
  });

  // 🟢 1c. MERGE — /engagement doesn't carry WhatsApp DMs itself, so any conversation
  // from /whatsapp/inbox not already present has to be added as its own list item,
  // not just used to annotate matches (that silently dropped every WhatsApp thread).
  const engagementsWithStatus = useMemo(() => {
    const existingWaIds = new Set(
      engagements
        .filter((e: any) => e.platform === 'whatsapp' && e.type === 'dm' && e.conversationId)
        .map((e: any) => e.conversationId)
    );

    const waStatusById = new Map<string, { canReplyFreely: boolean; windowExpiresAt: string | null }>();
    whatsappInbox.forEach((c: any) => {
      const id = c.conversationId || c.id || c._id;
      if (id) waStatusById.set(id, { canReplyFreely: c.canReplyFreely, windowExpiresAt: c.windowExpiresAt ?? null });
    });

    const annotated = engagements.map((e: any) => {
      if (e.platform === 'whatsapp' && e.type === 'dm' && e.conversationId && waStatusById.has(e.conversationId)) {
        const status = waStatusById.get(e.conversationId)!;
        return { ...e, canReplyFreely: status.canReplyFreely, windowExpiresAt: status.windowExpiresAt };
      }
      return e;
    });

    const whatsappOnly = whatsappInbox
      .filter((c: any) => {
        const id = c.conversationId || c.id || c._id;
        return id && !existingWaIds.has(id);
      })
      .map((c: any) => {
        const id = c.conversationId || c.id || c._id;
        return {
          _id: id,
          conversationId: id,
          type: 'dm',
          platform: 'whatsapp',
          authorName: c.participantName || c.participantId || 'WhatsApp',
          authorAvatar: c.participantAvatar ?? null,
          content: c.lastMessage?.content ?? '',
          receivedAt: c.lastMessage?.sentAt ?? c.lastMessageAt ?? null,
          status: c.status ?? (c.unreadCount > 0 ? 'unread' : 'read'),
          unreadCount: c.unreadCount ?? 0,
          canReplyFreely: c.canReplyFreely,
          windowExpiresAt: c.windowExpiresAt ?? null,
          _synthetic: true,
        };
      });

    const merged = [...annotated, ...whatsappOnly].sort((a: any, b: any) => {
      const at = a.receivedAt ? new Date(a.receivedAt).getTime() : 0;
      const bt = b.receivedAt ? new Date(b.receivedAt).getTime() : 0;
      return bt - at;
    });

    // Design-preview only — lets us see every visual state (unread, closed,
    // nearing expiry, replied, long content, plus a broader cross-platform mix)
    // without hunting for real conversations in each state. Never runs in
    // production, never overrides real data.
    if (merged.length === 0 && process.env.NODE_ENV !== 'production') {
      return [...MOCK_ENGAGEMENTS, ...buildMockWhatsappStates()];
    }

    return merged;
  }, [engagements, whatsappInbox]);

  // 🟢 2. REPLY MUTATION
  const [sendError, setSendError] = useState<string | null>(null);
  const replyMutation = useMutation({
    mutationFn: async ({ id, text, type, platform, conversationId }: { id: string; text: string; type?: string; platform?: string; conversationId?: string }) => {
      if (type === 'dm' && platform === 'whatsapp' && conversationId) {
        await api.post(`/whatsapp/inbox/${conversationId}/send`, { text });
      } else {
        await api.post(`/engagement/${id}/reply`, { text, workspaceId });
      }
    },
    onSuccess: (_, vars) => {
        setReplyText('');
        setSendError(null);
        queryClient.setQueryData(['engagement', workspaceId], (old: any[]) =>
            old ? old.map((e: any) => e._id === vars.id ? { ...e, status: 'replied' } : e) : []
        );
        // Auto-advance to next item
        setActiveId((prev) => {
          const list: any[] = queryClient.getQueryData(['engagement', workspaceId]) ?? [];
          const idx = list.findIndex((e: any) => e._id === prev);
          return list[idx + 1]?._id ?? prev;
        });
    },
    onError: (err: any) => {
        if (err?.status === 403) {
          setSendError(t("You no longer have access to this workspace. Switch to a workspace you're a member of.", "Vous n'avez plus accès à cet espace de travail. Changez pour un espace auquel vous appartenez."));
          return;
        }
        setSendError(err?.message || t('Something went wrong. Please try again.', 'Une erreur est survenue. Veuillez réessayer.'));
    },
  });

  // 🟢 3. STATUS MUTATION
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
        await api.post(`/engagement/${id}/status`, { status, workspaceId });
    },
    onSuccess: (_, variables) => {
        toast.success(t('Status updated', 'Statut mis à jour'));
        if (variables.status === 'archived') { setActiveId(null); setSendError(null); }
        queryClient.invalidateQueries({ queryKey: ['engagement'] });
    }
  });

  // DERIVED STATE
  const activeEngagement = engagementsWithStatus.find((e: any) => e._id === activeId);

  const filteredEngagements = engagementsWithStatus.filter((e: any) => {
    if (e.status === 'archived') return false;

    // Platform & unread status filter
    if (platformFilter === 'unread') {
      if (e.status !== 'unread' && !(e.unreadCount > 0)) return false;
    } else if (platformFilter !== 'all') {
      if (e.platform?.toLowerCase() !== platformFilter) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = e.authorName?.toLowerCase().includes(q);
      const contentMatch = e.content?.toLowerCase().includes(q);
      if (!nameMatch && !contentMatch) return false;
    }

    return true;
  });

  // Group by post for the "By post" inbox view
  const postGroups: { key: string; caption: string; items: any[] }[] = [];
  filteredEngagements.forEach((e: any) => {
    const key = e.postId ?? 'no-post';
    let group = postGroups.find(g => g.key === key);
    if (!group) {
      group = { key, caption: e.postId ? e.postCaption : t('Not linked to a post', 'Non liés à une publication'), items: [] };
      postGroups.push(group);
    }
    group.items.push(e);
  });

  const activeIndex = filteredEngagements.findIndex((e: any) => e._id === activeId);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < filteredEngagements.length - 1;

  const goNext = () => {
    if (hasNext) { selectConversation(filteredEngagements[activeIndex + 1]._id); setReplyText(''); }
  };
  const goPrev = () => {
    if (hasPrev) { selectConversation(filteredEngagements[activeIndex - 1]._id); setReplyText(''); }
  };

  const handleReply = (text?: string) => {
      const value = text ?? replyText;
      if (!activeId || !value) return;
      replyMutation.mutate({
        id: activeId,
        text: value,
        type: activeEngagement?.type,
        platform: activeEngagement?.platform,
        conversationId: activeEngagement?.conversationId,
      });
  };

  const isActiveWhatsappDm = activeEngagement?.type === 'dm' && activeEngagement?.platform === 'whatsapp' && !!activeEngagement?.conversationId;

  // 🟢 4. WHATSAPP THREAD — authoritative canReplyFreely/windowExpiresAt for the open
  // conversation (also marks it read on the backend), refining the list snapshot above.
  const { data: whatsappThread } = useQuery({
    queryKey: ['whatsapp-thread', activeEngagement?.conversationId],
    queryFn: async () => {
      const res: any = await api.get(`/whatsapp/inbox/${activeEngagement.conversationId}`);
      return res.data || res;
    },
    enabled: isActiveWhatsappDm,
  });

  const activeCanReplyFreely = !isActiveWhatsappDm || (whatsappThread?.canReplyFreely ?? activeEngagement?.canReplyFreely ?? true);
  const activeWindowExpiresAt: string | null = isActiveWhatsappDm ? (whatsappThread?.windowExpiresAt ?? activeEngagement?.windowExpiresAt ?? null) : null;

  // 🟢 5. LIVE UPDATES — the server pushes `inbox:message` on the workspace room;
  // refetch instead of polling.
  useEffect(() => {
    if (!socket) return;
    const handler = (payload: any) => {
      if (payload?.platform !== 'whatsapp') return;
      queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['engagement', workspaceId] });
      if (payload.conversationId && payload.conversationId === activeEngagement?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['whatsapp-thread', payload.conversationId] });
      }
    };
    socket.on('inbox:message', handler);
    return () => { socket.off('inbox:message', handler); };
  }, [socket, queryClient, workspaceId, activeEngagement?.conversationId]);

  const CANNED_REPLIES = [
    t('Thanks so much for reaching out!', 'Merci beaucoup de nous avoir contactés !'),
    t("We'll get back to you shortly.", 'Nous revenons vers vous très vite.'),
    t('Glad you liked it! 🎉', 'Ravi que ça vous ait plu ! 🎉'),
    t('Sorry to hear that — can you tell us more?', "Désolé de l'apprendre — pouvez-vous nous en dire plus ?"),
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-60px)] md:h-[calc(100vh-140px)] font-sans text-[#040028] dark:text-white transition-colors w-full max-w-full">

      {/* PAGE HEADER (Hidden on mobile when detail view is open to maximize screen space) */}
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 flex-shrink-0 w-full px-3 sm:px-0", activeId !== null ? "hidden md:flex" : "flex")}>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#040028] dark:text-white">{t('Discussions', 'Messages')}</h2>
        </div>

        <div className="flex bg-[#F7F6F3] dark:bg-white/5 rounded-[10px] p-1 self-start sm:self-auto">
            <button
              onClick={() => setInboxViewMode('post')}
              className={cn("px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all", inboxViewMode === 'post' ? "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white shadow-sm" : "text-[#8E8E8E]")}
            >
              {t('By post', 'Par publication')}
            </button>
            <button
              onClick={() => setInboxViewMode('list')}
              className={cn("px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all", inboxViewMode === 'list' ? "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white shadow-sm" : "text-[#8E8E8E]")}
            >
              {t('By list', 'Par liste')}
            </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 bg-white dark:bg-[#0A0A2E] border-0 md:border md:border-black/5 dark:md:border-white/5 rounded-none md:rounded-[16px] shadow-none md:shadow-xs overflow-hidden animate-in fade-in transition-colors relative w-full max-w-full">

        {/* LEFT PANEL: INBOX LIST (Full-width on mobile when activeId === null, fixed column on desktop) */}
        <div className={cn(
          "flex flex-col bg-white dark:bg-[#0A0A2E] transition-all w-full md:w-[340px] lg:w-[380px] shrink-0 h-full",
          activeId !== null ? "hidden md:flex" : "flex"
        )}>

          {/* Search & Platform Filters */}
          <div className="p-3 border-b border-black/5 dark:border-white/5 space-y-2 bg-white dark:bg-[#0A0A2E] w-full">
            {/* Search Input */}
            <div className="relative flex items-center w-full">
              <FiSearch className="absolute left-3 text-[#8E8E8E]" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search conversations...', 'Rechercher une discussion...')}
                className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F7F6F3] dark:bg-white/5 rounded-[10px] border border-transparent focus:border-[#174CD2] focus:outline-none text-[#040028] dark:text-white placeholder:text-[#8E8E8E] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white">
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Platform / Status Filters Bar (Horizontally scrollable on mobile) */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 px-0.5 touch-pan-x select-none w-full">
              {PLATFORM_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPlatformFilter(f.id as any)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#174CD2]/30",
                    platformFilter === f.id
                      ? "bg-[#174CD2] text-white shadow-xs"
                      : "bg-[#F7F6F3] dark:bg-white/5 text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  {f.id !== 'all' && f.id !== 'unread' && <PlatformIcon platform={f.id} size={12} />}
                  <span>{t(f.labelEn, f.labelFr)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto bg-[#F7F6F3] dark:bg-[#0A0A2E] transition-colors">
            {isLoading && (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-4">
                    <Skeleton width={36} height={36} radius="rounded" className="flex-shrink-0" index={i} />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton width={112} height={12} radius={1} index={i} />
                        <Skeleton width={48} height={12} radius={1} index={i} />
                      </div>
                      <Skeleton width="100%" height={12} radius={1} index={i} />
                      <Skeleton width="75%" height={12} radius={1} index={i} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && isWorkspaceForbidden && (
              <div className="p-8 text-center text-[#8E8E8E]">
                <FiLock size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">{t("You no longer have access to this workspace. Switch to a workspace you're a member of.", "Vous n'avez plus accès à cet espace de travail. Changez pour un espace auquel vous appartenez.")}</p>
              </div>
            )}

            {!isLoading && !isWorkspaceForbidden && filteredEngagements.length === 0 && (
              <div className="p-8 text-center text-[#8E8E8E]">
                <FiMessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">{t('No discussions found', 'Aucune discussion trouvée')}</p>
              </div>
            )}

            {!isLoading && inboxViewMode === 'list' && filteredEngagements.map((e: any) => (
              <EngagementListItem key={e._id} e={e} active={activeId === e._id} onClick={() => selectConversation(e._id)} t={t} />
            ))}
            {!isLoading && inboxViewMode === 'post' && postGroups.map((group) => (
              <div key={group.key}>
                <div className="px-4 py-2 bg-[#F7F6F3] dark:bg-white/5 text-xs font-semibold text-[#040028] dark:text-white truncate">
                  {group.caption}
                </div>
                {group.items.map((e: any) => (
                  <EngagementListItem key={e._id} e={e} active={activeId === e._id} onClick={() => selectConversation(e._id)} t={t} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: DETAIL VIEW (Full-width on mobile when activeId !== null, flex-1 on desktop) */}
        <div className={cn(
          "flex-1 flex flex-col bg-white dark:bg-[#0A0A2E] min-w-0 relative transition-colors h-full",
          activeId === null ? "hidden md:flex" : "flex"
        )}>

          {activeEngagement ? (
             <>
               {/* Header Toolbar with Back Button for Mobile */}
               <div className="min-h-[56px] md:h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-3 md:px-6 bg-white dark:bg-[#0A0A2E] z-10 transition-colors gap-2">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                     {/* Mobile Back Button */}
                     <button
                       onClick={handleBackToList}
                       className="md:hidden p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white transition-all shrink-0 flex items-center gap-1 text-xs font-bold"
                       aria-label={t('Back to discussions', 'Retour aux discussions')}
                     >
                       <FiChevronLeft size={18} />
                       <span className="hidden xs:inline">{t('Discussions', 'Retour')}</span>
                     </button>

                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-[#040028] dark:text-white shrink-0">
                        {activeEngagement.authorName.charAt(0)}
                     </div>
                     <div className="min-w-0">
                         <div className="text-xs md:text-sm font-semibold leading-none text-[#040028] dark:text-white truncate">{activeEngagement.authorName}</div>
                         <div className="flex items-center gap-2 mt-1">
                             <span className="text-[11px] text-[#8E8E8E] capitalize flex items-center gap-1">
                               <PlatformIcon platform={activeEngagement.platform} size={10} />
                               {activeEngagement.platform}
                             </span>
                             {activeEngagement.sentiment && (
                                 <span className={cn("px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold capitalize hidden sm:inline-block", SENTIMENT_STYLES[activeEngagement.sentiment])}>
                                     {activeEngagement.sentiment}
                                 </span>
                             )}
                             {isActiveWhatsappDm && (
                                 activeCanReplyFreely
                                   ? <WhatsappWindowCountdown expiresAt={activeWindowExpiresAt} t={t} />
                                   : (
                                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold bg-red-100 text-red-700">
                                       <FiLock size={9} /> {t('Closed', 'Fermé')}
                                     </span>
                                   )
                             )}
                         </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      {!activeEngagement._synthetic && (
                        <>
                          <ActionButton icon={<FiCheckCircle />} tooltip={t('Mark read', 'Marquer comme lu')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'read' })} />
                          <ActionButton icon={<FiArchive />} tooltip={t('Archive', 'Archiver')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'archived' })} />
                        </>
                      )}
                      <div className="w-px h-5 md:h-6 bg-black/10 dark:bg-white/10 mx-1 md:mx-2 hidden sm:block" />
                      {/* Prev / Next navigation */}
                      <span className="text-xs text-[#8E8E8E] select-none hidden sm:inline">
                        {activeIndex + 1}/{filteredEngagements.length}
                      </span>
                      <button
                        onClick={goPrev}
                        disabled={!hasPrev}
                        className="p-1.5 md:p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                        title={t('Previous', 'Précédent')}
                      >
                        <FiChevronLeft size={16} />
                      </button>
                      <button
                        onClick={goNext}
                        disabled={!hasNext}
                        className="p-1.5 md:p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                        title={t('Next', 'Suivant')}
                      >
                        <FiChevronRight size={16} />
                      </button>
                  </div>
               </div>

               {/* Chat thread + composer */}
               <ChatLayout
                 density="balanced"
                 className="flex-1 min-h-0"
                 composer={
                   <ChatComposer
                     value={replyText}
                     onChange={setReplyText}
                     onSubmit={(text) => handleReply(text)}
                     isDisabled={!activeCanReplyFreely || replyMutation.isPending}
                     placeholder={activeCanReplyFreely ? `${t('Reply to', 'Répondre à')} ${activeEngagement.authorName}...` : t('Replies are disabled for this conversation', 'Les réponses sont désactivées pour cette conversation')}
                     footerActions={
                       <div className="relative">
                         <IconButton icon={<FiSmile />} disabled={!activeCanReplyFreely} />
                         <IconButton icon={<FiMessageCircle />} onClick={() => setIsCannedOpen(v => !v)} disabled={!activeCanReplyFreely} />
                         {isCannedOpen && (
                             <div className="absolute bottom-full left-0 mb-2 w-64 md:w-72 bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden z-30">
                                 {CANNED_REPLIES.map((reply, i) => (
                                     <button
                                         key={i}
                                         type="button"
                                         onClick={() => { setReplyText(reply); setIsCannedOpen(false); }}
                                         className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-xs font-medium text-[#040028] dark:text-white hover:bg-[#F5F7FA] dark:hover:bg-white/5 border-b border-black/5 dark:border-white/5 last:border-0 transition-colors truncate"
                                     >
                                         {reply}
                                     </button>
                                 ))}
                             </div>
                         )}
                       </div>
                     }
                     status={
                       sendError
                         ? { type: 'error', message: sendError }
                         : !activeCanReplyFreely
                           ? { type: 'warning', message: t("This conversation is past the 24-hour window. WhatsApp no longer allows a free-form reply.", "Cette conversation a dépassé la fenêtre de 24 h. WhatsApp n'autorise plus de réponse libre.") }
                           : undefined
                     }
                   />
                 }
               >
                 <ChatMessageList>
                   <ChatMessage
                     sender={roleToSender('customer')}
                     avatar={<Avatar name={activeEngagement.authorName} src={activeEngagement.authorAvatar || undefined} size="md" />}
                   >
                     <ChatMessageBubble
                       name={activeEngagement.authorName}
                       metadata={<ChatMessageMetadata timestamp={new Date(activeEngagement.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />}
                     >
                       {activeEngagement.content}
                     </ChatMessageBubble>
                   </ChatMessage>

                   {/* Design-preview only, on mock threads — real message history isn't
                       available from the backend yet (it only gives us the latest
                       message per conversation). Shows the agent + a future AI-authored
                       reply on the "us" side so the hybrid layout is actually visible. */}
                   {process.env.NODE_ENV !== 'production' && typeof activeEngagement._id === 'string' && activeEngagement._id.startsWith('mock-') && (
                     <>
                       <ChatMessage sender={roleToSender('agent')} avatar={<Avatar name="You" size="md" />}>
                         <ChatMessageBubble
                           name={t('You', 'Vous')}
                           metadata={<ChatMessageMetadata timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} status="read" />}
                         >
                           {t('Thanks for reaching out — let me check that for you!', 'Merci de nous avoir contactés — je vérifie ça tout de suite !')}
                         </ChatMessageBubble>
                       </ChatMessage>
                       <ChatMessage sender={roleToSender('ai')} avatar={<Avatar name="AI" size="md" />}>
                         <ChatMessageBubble
                           name={t('AI Assistant', 'Assistant IA')}
                           metadata={<ChatMessageMetadata timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} footer={t('AI-drafted', 'Rédigé par IA')} />}
                         >
                           {t("I found their last order — want me to draft a reply?", "J'ai trouvé leur dernière commande — je rédige une réponse ?")}
                         </ChatMessageBubble>
                       </ChatMessage>
                     </>
                   )}
                 </ChatMessageList>
               </ChatLayout>
             </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#040028] dark:text-white transition-colors p-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] bg-white dark:bg-white/5 flex items-center justify-center mb-4 md:mb-6 shadow-xs">
                      <FiMessageCircle size={28} strokeWidth={1.5} className="text-[#040028] dark:text-white" />
                  </div>
                  <p className="text-base md:text-lg font-semibold text-center">{t('Select a message', 'Sélectionnez un message')}</p>
                  <p className="text-xs md:text-sm text-[#8E8E8E] mt-1 md:mt-2 text-center">{t('Click an item from your inbox', 'Cliquez sur un élément de votre boîte de réception')}</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
const EngagementListItem = ({ e, active, onClick, t }: any) => (
    <div
      onClick={onClick}
      className={`p-3 md:p-4 cursor-pointer border-b border-black/5 dark:border-white/5 transition-all group relative select-none
        ${active ? 'bg-[#174CD2]/8' : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white hover:bg-[#F5F7FA] dark:hover:bg-white/5'}`}
    >
      <div className="flex gap-3">
         <div className="flex-shrink-0 relative w-10 h-10">
            {e.authorAvatar ? (
                <img src={e.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white">
                    {e.authorName.charAt(0)}
                </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0A0A2E] border border-white dark:border-[#0A0A2E] flex items-center justify-center shadow-xs">
                <PlatformIcon platform={e.platform} size={9} />
            </div>
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
                <span className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold truncate text-[#040028] dark:text-white ${e.status === 'unread' ? '' : 'opacity-70'}`}>
                    {e.authorName}
                </span>
                <span className="text-[10px] md:text-xs text-[#8E8E8E] shrink-0 ml-2">
                    {e.receivedAt ? formatDistanceToNow(new Date(e.receivedAt), { addSuffix: true }) : t('Now', 'Maintenant')}
                </span>
            </div>
            <p className="text-xs line-clamp-2 text-[#8E8E8E] leading-relaxed">
                {e.content}
            </p>
            <div className="flex items-center justify-between mt-2 gap-2">
                 <div className="flex gap-1.5 flex-wrap items-center min-w-0">
                     {e.type === 'dm' && (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white">
                             {t('DM', 'MP')}
                         </span>
                     )}
                     {e.status === 'replied' && (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                             <FiCheck size={10} strokeWidth={3} /> {t('Replied', 'Répondu')}
                         </span>
                     )}
                     {e.platform === 'whatsapp' && e.type === 'dm' && e.canReplyFreely === false && (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                             <FiLock size={9} /> {t('Closed', 'Fermé')}
                         </span>
                     )}
                 </div>
                 {(e.unreadCount ?? 0) > 0 && (
                     <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold bg-[#040028] text-white shrink-0">
                         {e.unreadCount}
                     </span>
                 )}
            </div>
         </div>
      </div>
    </div>
);

const ActionButton = ({ icon, tooltip, onClick, variant = 'default' }: any) => (
    <button onClick={onClick} className={`p-1.5 md:p-2 rounded-[10px] transition-all ${variant === 'danger' ? 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-red-500 hover:text-white' : 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white'}`} title={tooltip}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);

const IconButton = ({ icon, onClick, disabled }: { icon: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onClick} disabled={disabled} className="p-1.5 md:p-2 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#040028] dark:hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);

// Live countdown shown only once a WhatsApp 24h window is close to lapsing —
// far-off expiries would just be visual noise.
const NEARING_EXPIRY_MS = 2 * 60 * 60 * 1000;
const WhatsappWindowCountdown = ({ expiresAt, t }: { expiresAt: string | null; t: (en: string, fr: string) => string }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const remainingMs = new Date(expiresAt).getTime() - now;
  if (remainingMs <= 0 || remainingMs > NEARING_EXPIRY_MS) return null;

  const totalMinutes = Math.max(1, Math.floor(remainingMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold bg-orange-100 text-orange-700">
      <FiClock size={9} /> {t(`Closes in ${label}`, `Se ferme dans ${label}`)}
    </span>
  );
};
