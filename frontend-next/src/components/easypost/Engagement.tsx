'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { useLanguage } from '@/src/context/LanguageContext';

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
  positive: 'bg-green-100 text-black border-2 border-black',
  negative: 'bg-red-100 text-black border-2 border-black',
  neutral: 'bg-gray-100 text-black border-2 border-black',
  question: 'bg-zinc-100 text-black border-2 border-black',
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
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-black border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] overflow-hidden animate-in fade-in font-sans text-black dark:text-white transition-colors">

      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r-2 border-black dark:border-white bg-white dark:bg-zinc-900 transition-colors">

        {/* Header & Filters */}
        <div className="p-4 border-b-2 border-black dark:border-white flex flex-col gap-4 bg-white dark:bg-zinc-900 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">{t('Inbox', 'Boîte de réception')}</h2>
            <div className="flex gap-2">
                <button onClick={() => queryClient.invalidateQueries({queryKey:['engagement', workspaceId]})} className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none transition-all" title={t('Refresh', 'Actualiser')}>
                  <FiRefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => void handleSync()} disabled={syncing} className="p-2 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:opacity-80 active:translate-y-[2px] transition-all disabled:opacity-50" title={t('Sync comments from all platforms', 'Synchroniser les commentaires')}>
                  {syncing ? <FiLoader size={16} className="animate-spin" /> : <span className="text-[10px] font-black">SYNC</span>}
                </button>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-zinc-400" size={16} />
            <input
              type="text"
              placeholder={t('Search messages...', 'Rechercher des messages...')}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all text-black dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <FilterBadge label={t('ALL', 'TOUT')} active={filter === 'all' && platformFilter === 'all'} onClick={() => { setFilter('all'); setPlatformFilter('all'); }} />
             <FilterBadge label={t('UNREAD', 'NON LU')} active={filter === 'unread'} count={engagements.filter((e:any) => e.status === 'unread' || (e.unreadCount ?? 0) > 0).length} onClick={() => { setFilter('unread'); setPlatformFilter('all'); }} />
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
        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 transition-colors">
          {isLoading && (
            <div className="divide-y-2 divide-black dark:divide-white">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredEngagements.length === 0 && (
             <div className="p-8 text-center text-gray-400 dark:text-zinc-500 text-sm font-mono border-b-2 border-dashed border-gray-300 dark:border-zinc-700">{t('No messages found', 'Aucun message trouvé')}</div>
          )}
          {!isLoading && filteredEngagements.map((e: any) => (
            <div
              key={e._id}
              onClick={() => setActiveId(e._id)}
              className={`p-4 cursor-pointer border-b-2 border-black dark:border-white transition-all group relative hover:bg-zinc-50 dark:hover:bg-zinc-800
                ${activeId === e._id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white'}`}
            >
              {activeId === e._id && <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400 dark:bg-yellow-600 border-r-2 border-black dark:border-white" />}
              <div className={`flex gap-3 ${activeId === e._id ? 'pl-2' : ''}`}>
                 <div className="flex-shrink-0 relative">
                    <div className={`w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center text-xs font-black uppercase overflow-hidden
                        ${activeId === e._id ? 'bg-white dark:bg-zinc-800 text-black dark:text-white' : 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white'}`}>
                        {e.authorAvatar ? <img src={e.authorAvatar} alt="" /> : e.authorName.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 p-0.5 border-2 border-black dark:border-white z-10 ${PLATFORM_BADGE_BG[e.platform.toLowerCase()] ?? 'bg-white dark:bg-zinc-900'}`}>
                        <span className="text-xs [&>svg]:text-white">{PLATFORM_ICONS[e.platform.toLowerCase()] || <FiMessageCircle className="text-white" />}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-black truncate uppercase ${e.status === 'unread' ? '' : 'opacity-80'}`}>
                            {e.authorName}
                        </span>
                        <span className={`text-[10px] font-mono ${activeId === e._id ? 'text-gray-300 dark:text-zinc-600' : 'text-gray-500 dark:text-zinc-400'}`}>
                            {e.receivedAt ? formatDistanceToNow(new Date(e.receivedAt), { addSuffix: true }) : t('Now', 'Maintenant')}
                        </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${activeId === e._id ? 'text-gray-200 dark:text-zinc-700' : 'text-gray-800 dark:text-zinc-300'}`}>
                        {e.content}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                         {e.type === 'dm' && (
                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white">
                                 DM
                             </span>
                         )}
                         {(e.unreadCount ?? 0) > 0 && (
                             <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white min-w-[20px]">
                                 {e.unreadCount}
                             </span>
                         )}
                         {e.status === 'replied' && (
                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-green-400 text-black border-2 border-black">
                                 <FiCheck size={10} strokeWidth={4} /> {t('REPLIED', 'RÉPONDU')}
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
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 min-w-0 relative transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {activeEngagement ? (
           <>
             {/* Toolbar */}
             <div className="h-16 border-b-2 border-black dark:border-white flex items-center justify-between px-6 bg-white dark:bg-zinc-900 z-10 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-1">
                      <div className="w-8 h-8 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-600 flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                         {activeEngagement.authorName.charAt(0)}
                      </div>
                   </div>
                   <div>
                       <div className="text-sm font-black uppercase leading-none text-black dark:text-white">{activeEngagement.authorName}</div>
                       <div className="text-xs font-mono text-gray-500 dark:text-zinc-400">{activeEngagement.platform}</div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton icon={<FiCheckCircle />} tooltip={t('Mark Read', 'Marquer comme lu')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'read' })} />
                    <ActionButton icon={<FiArchive />} tooltip={t('Archive', 'Archiver')} onClick={() => statusMutation.mutate({ id: activeEngagement._id, status: 'archived' })} />
                    <div className="w-0.5 h-6 bg-black dark:bg-white mx-2" />
                    {/* Prev / Next navigation */}
                    <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 select-none">
                      {activeIndex + 1}/{filteredEngagements.length}
                    </span>
                    <button
                      onClick={goPrev}
                      disabled={!hasPrev}
                      className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      title={t('Previous', 'Précédent')}
                    >
                      <FiChevronLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!hasNext}
                      className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      title={t('Next', 'Suivant')}
                    >
                      <FiChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-8 relative z-0 bg-white dark:bg-zinc-900 transition-colors">
                 <div className="max-w-3xl mx-auto space-y-8">

                     <div className="flex gap-4">
                         <div className="w-12 h-12 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center text-lg font-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-black dark:text-white">
                            {activeEngagement.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-black dark:text-white transition-colors">
                                <div className="flex justify-between mb-4 border-b-2 border-black dark:border-white pb-2 border-dashed">
                                     <div className="flex items-center gap-2">
                                        <span className="font-black uppercase text-sm">{activeEngagement.authorName}</span>
                                        <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">{new Date(activeEngagement.receivedAt).toLocaleTimeString()}</span>
                                     </div>
                                </div>
                                <p className="text-black dark:text-white text-base font-medium leading-relaxed">{activeEngagement.content}</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Composer */}
             <div className="p-6 bg-white dark:bg-zinc-900 border-t-2 border-black dark:border-white z-20 shadow-[0px_-4px_10px_rgba(0,0,0,0.05)] transition-colors">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_#000] transition-all">
                        <textarea
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           className="w-full p-4 text-sm font-medium focus:outline-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-zinc-500 placeholder:font-bold placeholder:uppercase text-black dark:text-white"
                           placeholder={`${t('Reply to', 'Répondre à')} ${activeEngagement.authorName}...`}
                        />
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-900 border-t-2 border-black dark:border-white transition-colors">
                            <div className="flex gap-2">
                                <IconButton icon={<FiSmile />} />
                            </div>
                            <button
                                onClick={handleReply}
                                disabled={!replyText || replyMutation.isPending}
                                className="bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase px-6 py-2 border-2 border-black dark:border-white hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
                            >
                                <FiSend size={14} strokeWidth={3} /> {replyMutation.isPending ? t('Sending...', 'Envoi...') : t('Reply', 'Répondre')}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
           </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-black dark:text-white transition-colors">
                <div className="w-20 h-20 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
                    <FiMessageCircle size={32} strokeWidth={1.5} />
                </div>
                <p className="text-lg font-black uppercase tracking-tight">{t('Select a Message', 'Sélectionnez un message')}</p>
                <p className="text-xs font-mono text-gray-500 dark:text-zinc-400 mt-2">{t('Click an item from your inbox', 'Cliquez sur un élément de votre boîte de réception')}</p>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
const FilterBadge = ({ label, active, count, onClick, icon }: any) => (
    <button onClick={onClick} className={`whitespace-nowrap px-3 py-1.5 text-xs font-black uppercase border-2 border-black dark:border-white transition-all flex items-center gap-2 ${active ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
        {icon && <span>{icon}</span>}
        {label}
        {count !== undefined && <span className={`px-1.5 py-0.5 text-[10px] border border-current ${active ? 'bg-white dark:bg-zinc-900 text-black dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>{count}</span>}
    </button>
);

const ActionButton = ({ icon, tooltip, onClick, variant = 'default' }: any) => (
    <button onClick={onClick} className={`p-2 border-2 border-black dark:border-white transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none ${variant === 'danger' ? 'bg-white dark:bg-zinc-900 hover:bg-red-500 hover:text-white' : 'bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white'}`} title={tooltip}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
    </button>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-2 text-black dark:text-white hover:bg-white dark:hover:bg-zinc-800 border-2 border-transparent hover:border-black dark:hover:border-white hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-all">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
    </button>
);
