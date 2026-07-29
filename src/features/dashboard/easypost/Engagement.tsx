'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppToast } from '@/hooks/useAppToast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

// Icons
import {
  FiMessageCircle, FiCheck, FiCheckCircle, FiMoreHorizontal,
  FiSend, FiSmile, FiArchive,
  FiChevronLeft, FiChevronRight
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
  const toast = useAppToast();
  const params = useParams();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();

  // STATE
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCannedOpen, setIsCannedOpen] = useState(false);
  const [inboxViewMode, setInboxViewMode] = useState<'list' | 'post'>('list');

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

  // 🟢 2. REPLY MUTATION (routes to WhatsApp or engagement endpoint based on type)
  const replyMutation = useMutation({
    mutationFn: async ({ id, text, type, platform, conversationId }: { id: string; text: string; type?: string; platform?: string; conversationId?: string }) => {
      if (type === 'dm' && platform === 'whatsapp' && conversationId) {
        await api.post(`/whatsapp/inbox/${conversationId}/send`, { workspaceId, text });
      } else {
        await api.post(`/engagement/${id}/reply`, { text });
      }
    },
    onSuccess: (_, vars) => {
        toast.success(t('Reply sent', 'Réponse envoyée'));
        setReplyText('');
        queryClient.setQueryData(['engagement', workspaceId], (old: any[]) =>
            old.map((e: any) => e._id === vars.id ? { ...e, status: 'replied' } : e)
        );
        // Auto-advance to next item
        setActiveId((prev) => {
          const list: any[] = queryClient.getQueryData(['engagement', workspaceId]) ?? [];
          const idx = list.findIndex((e: any) => e._id === prev);
          return list[idx + 1]?._id ?? prev;
        });
    },
    onError: () => toast.error(t('Failed to send reply', 'Échec de l\'envoi de la réponse'))
  });

  // 🟢 3. STATUS MUTATION
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
        await api.post(`/engagement/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
        toast.success(t('Status updated', 'Statut mis à jour'));
        if(variables.status === 'archived') setActiveId(null);
        queryClient.invalidateQueries({ queryKey: ['engagement'] });
    }
  });

  // DERIVED STATE
  const activeEngagement = engagements.find((e: any) => e._id === activeId);
  const filteredEngagements = engagements.filter((e: any) => e.status !== 'archived');

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
    if (hasNext) { setActiveId(filteredEngagements[activeIndex + 1]._id); setReplyText(''); }
  };
  const goPrev = () => {
    if (hasPrev) { setActiveId(filteredEngagements[activeIndex - 1]._id); setReplyText(''); }
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

  const CANNED_REPLIES = [
    t('Thanks so much for reaching out!', 'Merci beaucoup de nous avoir contactés !'),
    t("We'll get back to you shortly.", 'Nous revenons vers vous très vite.'),
    t('Glad you liked it! 🎉', 'Ravi que ça vous ait plu ! 🎉'),
    t('Sorry to hear that — can you tell us more?', "Désolé de l'apprendre — pouvez-vous nous en dire plus ?"),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] font-sans text-[#040028] dark:text-white transition-colors">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-[#040028] dark:text-white">{t('Inbox', 'Boîte de réception')}</h2>
        <div className="flex bg-[#F7F6F3] dark:bg-white/5 rounded-[10px] p-1">
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

      <div className="flex flex-1 min-h-0 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] overflow-hidden animate-in fade-in transition-colors">

      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">

        {/* List */}
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
          {!isLoading && inboxViewMode === 'list' && filteredEngagements.map((e: any) => (
            <EngagementListItem key={e._id} e={e} active={activeId === e._id} onClick={() => setActiveId(e._id)} t={t} />
          ))}
          {!isLoading && inboxViewMode === 'post' && postGroups.map((group) => (
            <div key={group.key}>
              <div className="px-4 py-2 bg-[#F7F6F3] dark:bg-white/5 text-xs font-semibold text-[#040028] dark:text-white truncate">
                {group.caption}
              </div>
              {group.items.map((e: any) => (
                <EngagementListItem key={e._id} e={e} active={activeId === e._id} onClick={() => setActiveId(e._id)} t={t} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: DETAIL VIEW */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0A0A2E] min-w-0 relative transition-colors">

        {activeEngagement ? (
           <>
             {/* Toolbar */}
             <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0A0A2E] z-10 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-[#040028] dark:text-white">
                      {activeEngagement.authorName.charAt(0)}
                   </div>
                   <div>
                       <div className="text-sm font-semibold leading-none text-[#040028] dark:text-white">{activeEngagement.authorName}</div>
                       <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs text-[#8E8E8E] capitalize">{activeEngagement.platform}</span>
                           {activeEngagement.sentiment && (
                               <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize", SENTIMENT_STYLES[activeEngagement.sentiment])}>
                                   {activeEngagement.sentiment}
                               </span>
                           )}
                       </div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton icon={<FiCheckCircle />} tooltip={t('Mark read', 'Marquer comme lu')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'read' })} />
                    <ActionButton icon={<FiArchive />} tooltip={t('Archive', 'Archiver')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'archived' })} />
                    <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />
                    {/* Prev / Next navigation */}
                    <span className="text-xs text-[#8E8E8E] select-none">
                      {activeIndex + 1}/{filteredEngagements.length}
                    </span>
                    <button
                      onClick={goPrev}
                      disabled={!hasPrev}
                      className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                      title={t('Previous', 'Précédent')}
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!hasNext}
                      className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                      title={t('Next', 'Suivant')}
                    >
                      <FiChevronRight size={16} />
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-8 relative z-0 bg-[#F7F6F3] dark:bg-transparent transition-colors">
                 <div className="max-w-3xl mx-auto space-y-8">

                     <div className="flex gap-4">
                         <div className="w-11 h-11 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex-shrink-0 flex items-center justify-center text-base font-semibold text-[#040028] dark:text-white">
                            {activeEngagement.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[14px] p-6 text-[#040028] dark:text-white transition-colors">
                                <div className="flex justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-3">
                                     <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{activeEngagement.authorName}</span>
                                        <span className="text-xs text-[#8E8E8E]">{new Date(activeEngagement.receivedAt).toLocaleTimeString()}</span>
                                     </div>
                                </div>
                                <p className="text-[#040028] dark:text-white text-base font-medium leading-relaxed">{activeEngagement.content}</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Composer */}
             <div className="p-6 bg-white dark:bg-[#0A0A2E] border-t border-black/5 dark:border-white/5 z-20 transition-colors">
                <div className="max-w-3xl mx-auto">
                    <div className="relative rounded-[14px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-white/5 focus-within:border-[#174CD2] focus-within:ring-2 focus-within:ring-[#174CD2]/15 transition-all">
                        <textarea
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           className="w-full p-4 text-sm font-medium focus:outline-none bg-transparent resize-none min-h-[100px] placeholder:text-[#8E8E8E] text-[#040028] dark:text-white"
                           placeholder={`${t('Reply to', 'Répondre à')} ${activeEngagement.authorName}...`}
                        />
                        <div className="flex items-center justify-between p-2 border-t border-black/5 dark:border-white/5 transition-colors">
                            <div className="flex gap-2 relative">
                                <IconButton icon={<FiSmile />} />
                                <IconButton icon={<FiMessageCircle />} onClick={() => setIsCannedOpen(v => !v)} />
                                {isCannedOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden z-30">
                                        {CANNED_REPLIES.map((reply, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => { setReplyText(reply); setIsCannedOpen(false); }}
                                                className="w-full text-left px-4 py-3 text-xs font-medium text-[#040028] dark:text-white hover:bg-[#F5F7FA] dark:hover:bg-white/5 border-b border-black/5 dark:border-white/5 last:border-0 transition-colors"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleReply}
                                disabled={!replyText || replyMutation.isPending}
                                className="bg-[#174CD2] text-white text-sm font-semibold px-5 py-2 rounded-[10px] hover:bg-[#123a9e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <FiSend size={14} /> {replyMutation.isPending ? t('Sending...', 'Envoi...') : t('Reply', 'Répondre')}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
           </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#040028] dark:text-white transition-colors">
                <div className="w-16 h-16 rounded-[16px] bg-white dark:bg-white/5 flex items-center justify-center mb-6">
                    <FiMessageCircle size={28} strokeWidth={1.5} className="text-[#040028] dark:text-white" />
                </div>
                <p className="text-lg font-semibold">{t('Select a message', 'Sélectionnez un message')}</p>
                <p className="text-sm text-[#8E8E8E] mt-2">{t('Click an item from your inbox', 'Cliquez sur un élément de votre boîte de réception')}</p>
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
      className={`p-4 cursor-pointer border-b border-black/5 dark:border-white/5 transition-all group relative
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
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0A0A2E] border border-white dark:border-[#0A0A2E] flex items-center justify-center shadow-sm">
                <PlatformIcon platform={e.platform} size={9} />
            </div>
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
                <span className={`flex items-center gap-1.5 text-sm font-semibold truncate text-[#040028] dark:text-white ${e.status === 'unread' ? '' : 'opacity-70'}`}>
                    {e.authorName}
                </span>
                <span className="text-xs text-[#8E8E8E]">
                    {e.receivedAt ? formatDistanceToNow(new Date(e.receivedAt), { addSuffix: true }) : t('Now', 'Maintenant')}
                </span>
            </div>
            <p className="text-xs line-clamp-2 text-[#8E8E8E]">
                {e.content}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
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
            </div>
         </div>
      </div>
    </div>
);

const ActionButton = ({ icon, tooltip, onClick, variant = 'default' }: any) => (
    <button onClick={onClick} className={`p-2 rounded-[10px] transition-all ${variant === 'danger' ? 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-red-500 hover:text-white' : 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white'}`} title={tooltip}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);

const IconButton = ({ icon, onClick }: { icon: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick} className="p-2 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#040028] dark:hover:text-white transition-all">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);
