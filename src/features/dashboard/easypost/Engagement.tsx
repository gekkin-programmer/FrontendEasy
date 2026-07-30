'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';

// Icons
import {
  FiMessageCircle, FiCheck, FiCheckCircle,
  FiSend, FiSmile, FiArchive,
  FiChevronLeft, FiChevronRight, FiLock, FiClock
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { PlatformIcon } from '@/features/dashboard/easypost/composer/PlatformIcon';

// --- CONFIGS ---
const SENTIMENT_STYLES: any = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-[#F5F7FA] text-[#040028]',
  question: 'bg-[#174CD2]/10 text-[#174CD2]',
};

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

  // STATE
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCannedOpen, setIsCannedOpen] = useState(false);
  const [inboxViewMode, setInboxViewMode] = useState<'list' | 'post'>('list');

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
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.history.pushState({ conversationId: id }, '');
    }
  };

  const handleBackToList = () => {
    setActiveId(null);
  };

  // 🟢 1. FETCH ENGAGEMENT
  const { data: rawEngagements = [], isLoading } = useQuery({
    queryKey: ['engagement', workspaceId],
    gcTime: 0,
    queryFn: async () => {
        const res: any = await api.get(`/engagement?workspaceId=${workspaceId}`);
        return res.data || [];
    }
  });
  const engagements = rawEngagements.length > 0 ? rawEngagements : MOCK_ENGAGEMENTS;

  // 🟢 1b. WHATSAPP INBOX LIST — carries canReplyFreely/windowExpiresAt so the
  // left panel can mark closed threads before an agent opens them.
  const { data: whatsappInbox = [] } = useQuery({
    queryKey: ['whatsapp-inbox', workspaceId],
    queryFn: async () => {
      const res: any = await api.get(`/whatsapp/inbox?workspaceId=${workspaceId}`);
      return res.data || [];
    },
    enabled: !!workspaceId,
  });

  const whatsappStatusById = useMemo(() => {
    const map = new Map<string, { canReplyFreely: boolean; windowExpiresAt: string | null }>();
    whatsappInbox.forEach((c: any) => {
      const id = c.conversationId || c._id || c.id;
      if (id) map.set(id, { canReplyFreely: c.canReplyFreely, windowExpiresAt: c.windowExpiresAt ?? null });
    });
    return map;
  }, [whatsappInbox]);

  const engagementsWithStatus = useMemo(() => engagements.map((e: any) => {
    if (e.platform === 'whatsapp' && e.type === 'dm' && e.conversationId && whatsappStatusById.has(e.conversationId)) {
      const status = whatsappStatusById.get(e.conversationId)!;
      return { ...e, canReplyFreely: status.canReplyFreely, windowExpiresAt: status.windowExpiresAt };
    }
    return e;
  }), [engagements, whatsappStatusById]);

  // 🟢 2. REPLY MUTATION
  const [sendError, setSendError] = useState<string | null>(null);
  const replyMutation = useMutation({
    mutationFn: async ({ id, text, type, platform, conversationId }: { id: string; text: string; type?: string; platform?: string; conversationId?: string }) => {
      if (type === 'dm' && platform === 'whatsapp' && conversationId) {
        await api.post(`/whatsapp/inbox/${conversationId}/send`, { text });
      } else {
        await api.post(`/engagement/${id}/reply`, { text });
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
        setSendError(err?.message || t('Something went wrong. Please try again.', 'Une erreur est survenue. Veuillez réessayer.'));
    },
  });

  // 🟢 3. STATUS MUTATION
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
        await api.post(`/engagement/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
        if (variables.status === 'archived') setActiveId(null);
        queryClient.invalidateQueries({ queryKey: ['engagement'] });
    }
  });

  // DERIVED STATE
  const activeEngagement = engagementsWithStatus.find((e: any) => e._id === activeId);
  const filteredEngagements = engagementsWithStatus.filter((e: any) => e.status !== 'archived');

  // Group by post for the "By post" inbox view — items without a postId fall under a shared bucket
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

  const handleReply = () => {
      if (!activeId || !replyText) return;
      replyMutation.mutate({
        id: activeId,
        text: replyText,
        type: activeEngagement?.type,
        platform: activeEngagement?.platform,
        conversationId: activeEngagement?.conversationId,
      });
  };

  // Reset the send error whenever the agent switches conversation or edits their draft
  useEffect(() => { setSendError(null); }, [activeId]);

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
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-2 md:mb-4 gap-2 flex-shrink-0 w-full px-3 sm:px-0", activeId !== null ? "hidden md:flex" : "flex")}>
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
          "flex flex-col border-r-0 md:border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-all w-full md:w-[340px] lg:w-[380px] shrink-0 h-full",
          activeId !== null ? "hidden md:flex" : "flex"
        )}>

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

            {!isLoading && filteredEngagements.length === 0 && (
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
                      <ActionButton icon={<FiCheckCircle />} tooltip={t('Mark read', 'Marquer comme lu')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'read' })} />
                      <ActionButton icon={<FiArchive />} tooltip={t('Archive', 'Archiver')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'archived' })} />
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

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 bg-[#F7F6F3] dark:bg-transparent transition-colors">
                   <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">

                       <div className="flex gap-3 md:gap-4">
                           <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex-shrink-0 flex items-center justify-center text-sm md:text-base font-semibold text-[#040028] dark:text-white">
                              {activeEngagement.authorName.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[14px] p-4 md:p-6 text-[#040028] dark:text-white transition-colors shadow-xs">
                                  <div className="flex justify-between items-center mb-3 border-b border-black/5 dark:border-white/5 pb-2.5">
                                       <div className="flex items-center gap-2">
                                          <span className="font-semibold text-xs md:text-sm">{activeEngagement.authorName}</span>
                                          <span className="text-[11px] text-[#8E8E8E]">{new Date(activeEngagement.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       </div>
                                  </div>
                                  <p className="text-[#040028] dark:text-white text-sm md:text-base font-medium leading-relaxed break-words">{activeEngagement.content}</p>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Composer */}
               <div className="p-3 md:p-6 bg-white dark:bg-[#0A0A2E] border-t border-black/5 dark:border-white/5 z-20 transition-colors">
                  <div className="max-w-3xl mx-auto">
                      {!activeCanReplyFreely && (
                          <div className="flex items-start gap-2 p-3 mb-3 rounded-[10px] bg-red-50 text-red-600 text-xs md:text-sm border border-red-200">
                              <FiLock size={14} className="mt-0.5 shrink-0" />
                              <span>{t("This conversation is past the 24-hour window. WhatsApp no longer allows a free-form reply.", "Cette conversation a dépassé la fenêtre de 24 h. WhatsApp n'autorise plus de réponse libre.")}</span>
                          </div>
                      )}
                      {sendError && (
                          <div className="p-3 mb-3 rounded-[10px] bg-red-50 text-red-600 text-xs md:text-sm border border-red-200">
                              {sendError}
                          </div>
                      )}
                      <div className={cn("relative rounded-[14px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-white/5 focus-within:border-[#174CD2] focus-within:ring-2 focus-within:ring-[#174CD2]/15 transition-all", !activeCanReplyFreely && "opacity-60")}>
                          <textarea
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             disabled={!activeCanReplyFreely}
                             className="w-full p-3 md:p-4 text-xs md:text-sm font-medium focus:outline-none bg-transparent resize-none min-h-[70px] md:min-h-[100px] placeholder:text-[#8E8E8E] text-[#040028] dark:text-white disabled:cursor-not-allowed"
                             placeholder={activeCanReplyFreely ? `${t('Reply to', 'Répondre à')} ${activeEngagement.authorName}...` : t('Replies are disabled for this conversation', 'Les réponses sont désactivées pour cette conversation')}
                          />
                          <div className="flex items-center justify-between p-2 border-t border-black/5 dark:border-white/5 transition-colors gap-2">
                              <div className="flex gap-1 md:gap-2 relative">
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
                              <button
                                  onClick={handleReply}
                                  disabled={!replyText || replyMutation.isPending || !activeCanReplyFreely}
                                  className="bg-[#174CD2] text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-2 rounded-[10px] hover:bg-[#123a9e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                              >
                                  <FiSend size={14} /> {replyMutation.isPending ? t('Sending...', 'Envoi...') : t('Reply', 'Répondre')}
                              </button>
                          </div>
                      </div>
                  </div>
               </div>
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
            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                 {e.type === 'dm' && (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white">
                         {t('DM', 'MP')}
                     </span>
                 )}
                 {(e.unreadCount ?? 0) > 0 && (
                     <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#174CD2] text-white min-w-[20px]">
                         {e.unreadCount}
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
