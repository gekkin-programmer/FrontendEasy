'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

// Icons
import {
  FiMessageCircle, FiCheck, FiCheckCircle, FiSearch, FiMoreHorizontal,
  FiSend, FiSmile, FiArchive,
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiLoader
} from 'react-icons/fi';
import {
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaWhatsapp, FaYoutube
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// --- CONFIGS ---
const PLATFORM_ICONS: any = {
  twitter:   <FaTwitter className="text-white" />,
  instagram: <FaInstagram className="text-white" />,
  facebook:  <FaFacebook className="text-white" />,
  linkedin:  <FaLinkedin className="text-white" />,
  tiktok:    <FaTiktok className="text-white" />,
  youtube:   <FaYoutube className="text-white" />,
  whatsapp:  <FaWhatsapp className="text-white" />,
};

const PLATFORM_BADGE_BG: Record<string, string> = {
  facebook:  'bg-[#1877F2]',
  instagram: 'bg-[#E4405F]',
  tiktok:    'bg-black',
  youtube:   'bg-[#FF0000]',
  twitter:   'bg-black',
  linkedin:  'bg-[#0077B5]',
  whatsapp:  'bg-[#25D366]',
};

const PLATFORM_FILTERS = [
  { id: 'facebook',  label: 'FB', icon: <FaFacebook  size={10} className="text-[#1877F2]" /> },
  { id: 'instagram', label: 'IG', icon: <FaInstagram size={10} className="text-[#E4405F]" /> },
  { id: 'tiktok',    label: 'TT', icon: <FaTiktok    size={10} /> },
  { id: 'youtube',   label: 'YT', icon: <FaYoutube   size={10} className="text-[#FF0000]" /> },
  { id: 'whatsapp',  label: 'WA', icon: <FaWhatsapp  size={10} className="text-[#25D366]" /> },
];

const SENTIMENT_STYLES: any = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-[#F5F7FA] text-[#040028]',
  question: 'bg-[#174CD2]/10 text-[#174CD2]',
};

export default function Engagement() {
  const { t } = useLanguage();
  const params = useParams();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();

  // STATE
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);

  // 🟢 1. FETCH ENGAGEMENT
  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['engagement', workspaceId],
    gcTime: 0,
    queryFn: async () => {
        const res: any = await api.get(`/engagement?workspaceId=${workspaceId}`);
        return res.data || [];
    }
  });

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
  const filteredEngagements = engagements.filter((e: any) => {
      if (filter === 'unread') return e.status === 'unread' || (e.unreadCount ?? 0) > 0;
      if (filter === 'archived') return e.status === 'archived';
      const notArchived = e.status !== 'archived';
      if (platformFilter !== 'all') return notArchived && e.platform === platformFilter;
      return notArchived;
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post(`/engagement/sync?workspaceId=${workspaceId}`, {});
      queryClient.invalidateQueries({ queryKey: ['engagement', workspaceId] });
      toast.success(t('Comments refreshed', 'Commentaires actualisés'));
    } catch {
      toast.error(t('Sync failed', 'Échec de la synchronisation'));
    } finally {
      setSyncing(false);
    }
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

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in font-sans text-[#040028] dark:text-white transition-colors">

      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] transition-colors">

        {/* Header & Filters */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex flex-col gap-4 bg-white dark:bg-[#0A0A2E] transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#040028] dark:text-white">{t('Inbox', 'Boîte de réception')}</h2>
            <div className="flex gap-2">
                <button onClick={() => queryClient.invalidateQueries({queryKey:['engagement', workspaceId]})} className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all" title={t('Refresh', 'Actualiser')}>
                  <FiRefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => void handleSync()} disabled={syncing} className="px-3 py-2 rounded-[10px] bg-[#174CD2] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(23,76,210,0.3)] hover:bg-[#123a9e] transition-all disabled:opacity-50" title={t('Sync comments from all platforms', 'Synchroniser les commentaires')}>
                  {syncing ? <FiLoader size={16} className="animate-spin" /> : t('Sync', 'Synchroniser')}
                </button>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={16} />
            <input
              type="text"
              placeholder={t('Search messages...', 'Rechercher des messages...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 text-sm font-medium placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all text-[#040028] dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <FilterBadge label={t('All', 'Tout')} active={filter === 'all' && platformFilter === 'all'} onClick={() => { setFilter('all'); setPlatformFilter('all'); }} />
             <FilterBadge label={t('Unread', 'Non lu')} active={filter === 'unread'} count={engagements.filter((e:any) => e.status === 'unread' || (e.unreadCount ?? 0) > 0).length} onClick={() => { setFilter('unread'); setPlatformFilter('all'); }} />
             {PLATFORM_FILTERS.map(pf => (
               <FilterBadge
                 key={pf.id}
                 label={pf.label}
                 icon={pf.icon}
                 active={platformFilter === pf.id}
                 count={engagements.filter((e: any) => e.platform === pf.id).length || undefined}
                 onClick={() => { setFilter('all'); setPlatformFilter(platformFilter === pf.id ? 'all' : pf.id); }}
               />
             ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A2E] transition-colors">
          {isLoading && (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-28 rounded-[4px]" />
                      <Skeleton className="h-3 w-12 rounded-[4px]" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-[4px]" />
                    <Skeleton className="h-3 w-3/4 rounded-[4px]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredEngagements.length === 0 && (
             <div className="p-8 text-center text-[#8E8E8E] text-sm font-medium">{t('No messages found', 'Aucun message trouvé')}</div>
          )}
          {!isLoading && filteredEngagements.map((e: any) => (
            <div
              key={e._id}
              onClick={() => setActiveId(e._id)}
              className={`p-4 cursor-pointer border-b border-black/5 dark:border-white/5 transition-all group relative
                ${activeId === e._id ? 'bg-[#174CD2]/8' : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white hover:bg-[#F5F7FA] dark:hover:bg-white/5'}`}
            >
              {activeId === e._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#174CD2]" />}
              <div className="flex gap-3">
                 <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white">
                        {e.authorAvatar ? <img src={e.authorAvatar} alt="" /> : e.authorName.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ring-2 ring-white dark:ring-[#0A0A2E] z-10 ${PLATFORM_BADGE_BG[e.platform.toLowerCase()] ?? 'bg-[#8E8E8E]'}`}>
                        <span className="text-xs [&>svg]:text-white">{PLATFORM_ICONS[e.platform.toLowerCase()] || <FiMessageCircle className="text-white" />}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-semibold truncate text-[#040028] dark:text-white ${e.status === 'unread' ? '' : 'opacity-70'}`}>
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
                       <div className="text-xs text-[#8E8E8E] mt-1 capitalize">{activeEngagement.platform}</div>
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
             <div className="flex-1 overflow-y-auto p-8 relative z-0 bg-[#F5F7FA]/40 dark:bg-transparent transition-colors">
                 <div className="max-w-3xl mx-auto space-y-8">

                     <div className="flex gap-4">
                         <div className="w-11 h-11 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex-shrink-0 flex items-center justify-center text-base font-semibold text-[#040028] dark:text-white">
                            {activeEngagement.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[14px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] text-[#040028] dark:text-white transition-colors">
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
                            <div className="flex gap-2">
                                <IconButton icon={<FiSmile />} />
                            </div>
                            <button
                                onClick={handleReply}
                                disabled={!replyText || replyMutation.isPending}
                                className="bg-[#174CD2] text-white text-sm font-semibold px-5 py-2 rounded-[10px] shadow-[0_4px_14px_rgba(23,76,210,0.3)] hover:bg-[#123a9e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div className="w-16 h-16 rounded-[16px] bg-[#F5F7FA] dark:bg-white/5 flex items-center justify-center mb-6">
                    <FiMessageCircle size={28} strokeWidth={1.5} className="text-[#8E8E8E]" />
                </div>
                <p className="text-lg font-semibold">{t('Select a message', 'Sélectionnez un message')}</p>
                <p className="text-sm text-[#8E8E8E] mt-2">{t('Click an item from your inbox', 'Cliquez sur un élément de votre boîte de réception')}</p>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
const FilterBadge = ({ label, active, count, onClick, icon }: any) => (
    <button onClick={onClick} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${active ? 'bg-[#174CD2] text-white' : 'bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>
        {icon && <span>{icon}</span>}
        {label}
        {count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-[#040028] dark:text-white'}`}>{count}</span>}
    </button>
);

const ActionButton = ({ icon, tooltip, onClick, variant = 'default' }: any) => (
    <button onClick={onClick} className={`p-2 rounded-[10px] transition-all ${variant === 'danger' ? 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-red-500 hover:text-white' : 'bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white'}`} title={tooltip}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-2 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#040028] dark:hover:text-white transition-all">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);
