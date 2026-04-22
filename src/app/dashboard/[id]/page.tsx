'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api';
import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next';

// ICONS
import {
  Layers, BarChart2, Settings as SettingsIcon,
  Search, Bell, Check, ChevronDown, Plus, Users, Menu, X,
  ExternalLink, ArrowRight, Calendar as CalendarIcon, Home,
  AlertTriangle, Crown, MessageCircle, Layout,
  Heart, Bookmark, Share2, Music, Repeat2, MoreHorizontal, ThumbsUp
} from 'lucide-react';

// COMPONENTS
import Composer from '@/src/components/easypost/Composer';
import PostFeed from '@/src/components/easypost/PostFeed';
import Analytics from '@/src/components/easypost/Analytics';
import Settings from '@/src/components/easypost/Settings';
import Team from '@/src/components/easypost/Team';
import VoiceAiButton from '@/src/components/easypost/VoiceAiButton';
import CalendarView from '@/src/components/easypost/CalendarView';
import SpinningLoader from '@/src/components/SpinningLoader';

// EXTRACTED COMPONENTS
import { NeuButton, NeuCard, NeuInput, NeuModal } from '@/src/components/easypost/DashboardUI';
import { QuickConnectSidebar } from '@/src/components/easypost/QuickConnectSidebar';
import { FacebookPageSelector } from '@/src/components/easypost/FacebookPageSelector';
import { SidebarItem } from '@/src/components/easypost/SidebarItem';
import { EngagementWithTabs } from '@/src/components/easypost/EngagementWithTabs';

// SOCKET
import { SocketProvider, useSocket } from '@/src/context/SocketContext';
import { useLanguage } from '@/src/context/LanguageContext';

import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import BoardView from '@/src/components/easypost/BoardView';
import OnboardingGuide from '@/src/components/easypost/OnboardingGuide';

type TabType = 'queue' |'calendar' | 'boards' | 'analytics' | 'engagement' | 'settings' | 'team';

interface PreviewData { text: string; mediaPreviews: string[]; selectedAccountIds: string[]; }

const PLATFORM_COLORS: Record<string, string> = {
    INSTAGRAM: '#E4405F', FACEBOOK: '#1877F2', TWITTER: '#000000', X: '#000000',
    LINKEDIN: '#0A66C2', TIKTOK: '#010101', YOUTUBE: '#FF0000', DISCORD: '#5865F2',
    TELEGRAM: '#26A5E4', PINTEREST: '#BD081C', SNAPCHAT: '#FFFC00',
};

// ─── Platform-specific preview renderers ───────────────────────────────────

function TikTokPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    return (
        <div className="relative bg-black overflow-hidden" style={{ height: 380 }}>
            {media[0]
                ? <img src={media[0]} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="" />
                : <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
            }
            {/* Following | For You */}
            <div className="absolute top-0 left-0 right-0 flex justify-center gap-5 pt-3 z-20">
                <span className="text-white/50 text-[11px] font-semibold">Following</span>
                <span className="text-white text-[11px] font-bold border-b-[2px] border-white pb-0.5">For You</span>
            </div>
            {/* Right action column */}
            <div className="absolute right-2 bottom-16 flex flex-col items-center gap-4 z-20">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-zinc-600">
                        {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center">
                        <Plus size={9} className="text-white" strokeWidth={3} />
                    </div>
                </div>
                {[Heart, MessageCircle, Bookmark, Share2].map((Icon, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                        <Icon size={22} className="text-white" strokeWidth={1.5} />
                        <span className="text-white text-[9px]">0</span>
                    </div>
                ))}
            </div>
            {/* Bottom: username + caption + sound */}
            <div className="absolute bottom-0 left-0 right-12 p-3 z-20">
                {media[0] && (
                    <span className="inline-flex items-center gap-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded mb-1">
                        📷 Photo
                    </span>
                )}
                <div className="text-white text-[11px] font-bold">@{account?.username || 'creator'}</div>
                <div className="text-white/90 text-[10px] line-clamp-2 mt-0.5">{text || 'Your caption here…'}</div>
                <div className="flex items-center gap-1 mt-2">
                    <Music size={10} className="text-white" />
                    <span className="text-white/70 text-[9px]">Original sound</span>
                </div>
            </div>
        </div>
    );
}

function InstagramPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    return (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                            {account?.avatar
                                ? <img src={account.avatar} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full bg-gray-200" />}
                        </div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold leading-tight">{account?.username || 'your.account'}</div>
                        <div className="text-[9px] text-gray-400 leading-tight">Just now</div>
                    </div>
                </div>
                <MoreHorizontal size={14} className="text-gray-500" />
            </div>
            {media[0]
                ? <img src={media[0]} className="w-full aspect-square object-cover" alt="" />
                : <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-xs font-mono">NO_MEDIA</div>
            }
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                    <Heart size={18} strokeWidth={1.5} className="text-gray-800" />
                    <MessageCircle size={18} strokeWidth={1.5} className="text-gray-800" />
                    <Share2 size={18} strokeWidth={1.5} className="text-gray-800" />
                </div>
                <Bookmark size={18} strokeWidth={1.5} className="text-gray-800" />
            </div>
            <div className="px-3 pb-4 text-[11px]">
                <span className="font-bold">{account?.username || 'your.account'} </span>
                <span className="text-gray-800">{text || <span className="text-gray-400 italic">Your caption…</span>}</span>
            </div>
        </div>
    );
}

function TwitterPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    const truncated = text.length > 280;
    const display = truncated ? text.slice(0, 277) + '…' : text;
    return (
        <div className="bg-white p-3">
            <div className="flex gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[12px] font-black truncate">{account?.displayName || account?.username}</span>
                        <span className="text-[11px] text-gray-400 truncate">@{account?.username}</span>
                        <span className="text-[11px] text-gray-400">· now</span>
                    </div>
                    <div className="text-[12px] leading-relaxed mt-0.5 text-gray-900">
                        {display || <span className="text-gray-400">What&apos;s happening?</span>}
                    </div>
                    {media.length > 0 && (
                        <div className={cn("grid gap-0.5 mt-2 rounded-xl overflow-hidden", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                            {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                        </div>
                    )}
                    {truncated && <div className="text-[9px] text-red-500 mt-1">{text.length}/280 — will be cut off</div>}
                    <div className="flex items-center justify-between mt-2 max-w-[200px] text-gray-400">
                        <MessageCircle size={15} strokeWidth={1.5} />
                        <Repeat2 size={15} strokeWidth={1.5} />
                        <Heart size={15} strokeWidth={1.5} />
                        <Share2 size={15} strokeWidth={1.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedInPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    return (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-start gap-2 p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
                <div>
                    <div className="text-[12px] font-bold leading-tight">{account?.displayName || account?.username}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">Your headline here</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Just now · 🌐</div>
                </div>
            </div>
            <div className="px-3 pb-2 text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {text || <span className="text-gray-400 italic">Share an update…</span>}
            </div>
            {media.length > 0 && (
                <div className={cn("grid gap-0.5", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                </div>
            )}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-gray-500">
                <div className="flex items-center gap-1">
                    <ThumbsUp size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Like</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageCircle size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Comment</span>
                </div>
                <div className="flex items-center gap-1">
                    <Repeat2 size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Repost</span>
                </div>
                <div className="flex items-center gap-1">
                    <Share2 size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Send</span>
                </div>
            </div>
        </div>
    );
}

function GenericFeedPreview({ text, media, account, platform }: { text: string; media: string[]; account: any; platform: string }) {
    const color = PLATFORM_COLORS[platform] ?? '#3C48F5';
    return (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: `2px solid ${color}` }}>
                    {account?.avatar
                        ? <img src={account.avatar} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: color + '20', color }}>{account?.username?.[0]?.toUpperCase()}</div>}
                </div>
                <div>
                    <div className="text-[11px] font-bold">{account?.displayName || account?.username}</div>
                    <div className="text-[9px] text-gray-400">Just now</div>
                </div>
            </div>
            <div className="p-3 text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {text || <span className="text-gray-400 italic">Your content here…</span>}
            </div>
            {media.length > 0 && (
                <div className={cn("grid gap-0.5", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                </div>
            )}
            <div className="px-3 py-2 border-t border-gray-100 flex gap-4 text-gray-500 text-[10px] font-bold">
                <span>Like</span><span>Comment</span><span>Share</span>
            </div>
        </div>
    );
}

// ─── Main preview panel ────────────────────────────────────────────────────

function PhoneMockupPreview({ previewData, accounts, platformIdx, onPlatformChange, onClose }: {
    previewData: PreviewData; accounts: any[]; platformIdx: number;
    onPlatformChange: (i: number) => void; onClose: () => void;
}) {
    // Build unique platform entries, preserving account metadata
    const platformAccounts: { platform: string; account: any }[] = [];
    accounts
        .filter(a => previewData.selectedAccountIds.includes(a.id))
        .forEach(a => {
            const p = a.platform?.toUpperCase();
            if (p && !platformAccounts.find(x => x.platform === p)) platformAccounts.push({ platform: p, account: a });
        });

    const safeIdx = Math.min(platformIdx, Math.max(0, platformAccounts.length - 1));
    const current = platformAccounts[safeIdx] ?? null;
    const { text, mediaPreviews } = previewData;

    return (
        <div className="border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#3C48F5] border-b-2 border-black dark:border-white">
                <span className="font-black text-[10px] uppercase tracking-widest text-white">
                    {current ? `${current.platform} Preview` : 'Live Preview'}
                </span>
                <button onClick={onClose} className="hover:bg-black/20 p-0.5 transition-colors text-white">
                    <X size={14} strokeWidth={3} />
                </button>
            </div>

            {/* Account avatar tabs — click to switch platform */}
            {platformAccounts.length > 0 && (
                <div className="flex gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white overflow-x-auto scrollbar-hide">
                    {platformAccounts.map((item, i) => {
                        const color = PLATFORM_COLORS[item.platform] ?? '#3C48F5';
                        return (
                            <button
                                key={item.platform}
                                onClick={() => onPlatformChange(i)}
                                title={item.platform}
                                className={cn(
                                    "relative w-8 h-8 rounded-full flex-shrink-0 overflow-hidden transition-all",
                                    i === safeIdx
                                        ? "ring-2 ring-offset-1 ring-[#3C48F5] shadow-[2px_2px_0px_0px_#3C48F5]"
                                        : "ring-1 ring-gray-300 dark:ring-zinc-600 hover:ring-black dark:hover:ring-white opacity-60 hover:opacity-100"
                                )}
                            >
                                {item.account?.avatar
                                    ? <img src={item.account.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                    : <div className="w-full h-full flex items-center justify-center text-[11px] font-black" style={{ backgroundColor: color + '20', color }}>
                                        {item.account?.username?.[0]?.toUpperCase() ?? '?'}
                                      </div>
                                }
                                {/* Platform color dot */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: color }} />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Platform UI render */}
            <div className="overflow-hidden">
                {!current ? (
                    <div className="h-72 flex items-center justify-center text-[11px] text-gray-400 dark:text-zinc-500 font-mono text-center px-6 leading-relaxed bg-gray-50 dark:bg-zinc-950">
                        No accounts selected.<br />Add targets in the composer.
                    </div>
                ) : current.platform === 'TIKTOK' ? (
                    <TikTokPreview text={text} media={mediaPreviews} account={current.account} />
                ) : current.platform === 'INSTAGRAM' ? (
                    <InstagramPreview text={text} media={mediaPreviews} account={current.account} />
                ) : current.platform === 'TWITTER' || current.platform === 'X' ? (
                    <TwitterPreview text={text} media={mediaPreviews} account={current.account} />
                ) : current.platform === 'LINKEDIN' ? (
                    <LinkedInPreview text={text} media={mediaPreviews} account={current.account} />
                ) : (
                    <GenericFeedPreview text={text} media={mediaPreviews} account={current.account} platform={current.platform} />
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';

    return (
        <Suspense fallback={<SpinningLoader fullScreen={true} />}>
            <SocketProvider workspaceId={workspaceId}>
                <DashboardContent />
            </SocketProvider>
        </Suspense>
    );
}

function DashboardContent() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    // UI States
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    // Composer preview panel state
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData>({ text: '', mediaPreviews: [], selectedAccountIds: [] });
    const [previewPlatformIdx, setPreviewPlatformIdx] = useState(0);
    
    // OAUTH STATES
    const [isFbPageSelectorOpen, setIsFbPageSelectorOpen] = useState(
        () => searchParams.get('social_selection') === 'facebook'
    );
    const [tempExchangeToken, setTempExchangeToken] = useState(
        () => searchParams.get('exchange_token') ?? ""
    );
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notifications
    type AppNotif = { id: string; type: 'success' | 'error' | 'info'; message: string; time: string; read: boolean };
    const notifKey = `eazypost_notifs_${workspaceId}`;
    const [notifications, setNotifications] = useState<AppNotif[]>(() => {
        if (typeof window === 'undefined') return [];
        try { return JSON.parse(localStorage.getItem(`eazypost_notifs_${workspaceId}`) || '[]'); } catch { return []; }
    });
    const addNotification = useCallback((type: AppNotif['type'], message: string) => {
        const notif: AppNotif = { id: Date.now().toString(), type, message, time: new Date().toISOString(), read: false };
        setNotifications(prev => {
            const next = [notif, ...prev].slice(0, 50);
            try { localStorage.setItem(`eazypost_notifs_${workspaceId}`, JSON.stringify(next)); } catch {}
            return next;
        });
    }, [workspaceId]);
    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const next = prev.map(n => ({ ...n, read: true }));
            try { localStorage.setItem(`eazypost_notifs_${workspaceId}`, JSON.stringify(next)); } catch {}
            return next;
        });
    }, [workspaceId]);
    const clearNotifications = useCallback(() => {
        setNotifications([]);
        try { localStorage.removeItem(`eazypost_notifs_${workspaceId}`); } catch {}
    }, [workspaceId]);

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // --- QUERIES ---
    const { data: myWorkspaces = [] } = useQuery({ 
        queryKey: ['workspaces'], 
        queryFn: () => api.get<any[]>('/workspaces').then(res => Array.isArray(res) ? res : (res as any)?.data || []) 
    });

    const { data: currentWorkspace, isLoading: currentWsLoading } = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => api.get<any>(`/workspaces/${workspaceId}`).then(res => res?.data || res),
        enabled: !!workspaceId,
    });

    const { data: accounts = [], refetch: refetchAccounts } = useQuery({
        queryKey: ['social-accounts', workspaceId],
        queryFn: () => api.get<any[]>(`/social-accounts?workspaceId=${workspaceId}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
    });

    const { data: posts = [], refetch: refetchPosts, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', workspaceId, searchTerm],
        queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&search=${encodeURIComponent(searchTerm)}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
        refetchInterval: 60000,
    });

    const searchResults = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return { posts: [], accounts: [] };
        return {
            posts: posts.filter((p: any) =>
                p.content?.toLowerCase().includes(q) ||
                p.status?.toLowerCase().includes(q)
            ).slice(0, 5),
            accounts: accounts.filter((a: any) =>
                a.username?.toLowerCase().includes(q) ||
                a.platform?.toLowerCase().includes(q) ||
                a.displayName?.toLowerCase().includes(q)
            ).slice(0, 3),
        };
    }, [searchTerm, posts, accounts]);

    // 🟢 REAL-TIME LISTENERS
    useEffect(() => {
        if (!socket) return;

        socket.on('post_created', (newPost) => {
            addNotification('success', `Post published: "${newPost.content.substring(0, 50)}${newPost.content.length > 50 ? '…' : ''}"`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_updated', (updatedPost) => {
            addNotification('info', `Post updated: "${updatedPost.content.substring(0, 50)}${updatedPost.content.length > 50 ? '…' : ''}"`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_deleted', ({ id }) => {
            addNotification('info', 'A post was removed from the queue');
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        return () => {
            socket.off('post_created');
            socket.off('post_updated');
            socket.off('post_deleted');
        };
    }, [socket, workspaceId, queryClient, refetchPosts]);

    // 🟢 MANUAL UPDATE HELPER (Optimistic UI)
    const manuallyAddAccount = (newAccount: any) => {
        queryClient.setQueryData(['social-accounts', workspaceId], (oldData: any[]) => {
            if (!oldData) return [newAccount];
            const exists = oldData.some(a => a.id === newAccount.id);
            return exists ? oldData : [...oldData, newAccount];
        });
    };

    // --- INVITE ACCEPTANCE ---
    const inviteProcessedRef = useRef(false);
    useEffect(() => {
        const inviteToken = searchParams.get('invite');
        if (!inviteToken || !workspaceId || inviteProcessedRef.current) return;
        inviteProcessedRef.current = true;

        api.post(`/workspaces/${workspaceId}/members/accept`, { token: inviteToken })
            .then(() => {
                toast.success('You joined the workspace!');
                queryClient.invalidateQueries({ queryKey: ['team-members', workspaceId] });
                queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            })
            .catch(() => {})
            .finally(() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('invite');
                url.searchParams.delete('email');
                window.history.replaceState(null, '', url.toString());
            });
    }, [searchParams, workspaceId, queryClient]);

    // --- OAUTH LOGIC ---
    useEffect(() => {
        const selectionMode = searchParams.get('social_selection');
        const connected = searchParams.get('social_connected');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const token = searchParams.get('exchange_token');

        if (connected === 'true' || success === 'true') {
            setTimeout(() => addNotification('success', 'Social account connected successfully'), 0);
            const url = new URL(window.location.href);
            url.searchParams.delete('social_connected');
            url.searchParams.delete('social_selection');
            url.searchParams.delete('exchange_token');
            url.searchParams.delete('platform');
            url.searchParams.delete('success');
            window.history.replaceState(null, '', url.pathname);
            refetchAccounts();
            queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
        } else if (error) {
            const oauthErrors: Record<string, [string, string]> = {
                IG_NO_BUSINESS_ACCOUNT: [
                    'Instagram requires a Business or Creator account linked to a Facebook Page. Go to Instagram → Settings → Account type to switch, then retry.',
                    "Instagram nécessite un compte Professionnel ou Créateur lié à une Page Facebook. Allez sur Instagram → Paramètres → Type de compte pour changer, puis réessayez.",
                ],
                IG_API_ERROR: [
                    'Instagram connection failed. Please try again.',
                    'La connexion Instagram a échoué. Veuillez réessayer.',
                ],
                OAUTH_SESSION_LOST: [
                    'Connection session expired. Please try again.',
                    'La session de connexion a expiré. Veuillez réessayer.',
                ],
            };
            const [en, fr] = oauthErrors[error] ?? [error, error];
            setTimeout(() => addNotification('error', t(en, fr)), 0);
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.history.replaceState(null, '', url.pathname);
        }
    }, [searchParams, queryClient, workspaceId, refetchAccounts]);


    // --- MUTATIONS ---
    const createWorkspaceMutation = useMutation({
        mutationFn: (name: string) => api.post<any>('/workspaces', { name }),
        onSuccess: (res) => {
            setIsCreateModalOpen(false);
            setNewWorkspaceName("");
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            router.push(`/dashboard/${res.data.id}`);
        },
        onError: () => {}
    });

    const upsertPostMutation = useMutation({
        mutationFn: (payload: any) => {
            if (payload.id) return api.patch(`/posts/${payload.id}`, payload);
            return api.post('/posts', payload);
        },
        onSuccess: () => {
            addNotification('success', 'Post saved and scheduled successfully');
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            setEditingPost(null);
            setIsPreviewMode(false);
        },
        onError: () => {
            addNotification('error', 'Post failed to save — please retry');
        }
    });

    const handleCreateWorkspace = () => {
        if (!newWorkspaceName.trim()) return;
        createWorkspaceMutation.mutate(newWorkspaceName);
    };

    const handleAddPost = async (content: string, date?: Date, mediaIds?: string[], status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT', selectedAccountIds?: string[], postId?: string, targetWorkspaceId?: string, platformMeta?: Record<string, any>) => {
        const targets = selectedAccountIds && selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
        if (targets.length === 0) return;
        upsertPostMutation.mutate({
            id: postId,
            workspaceId: targetWorkspaceId || workspaceId,
            content,
            scheduledFor: date ? date.toISOString() : undefined,
            status,
            socialAccountIds: targets,
            mediaIds: mediaIds || [],
            ...(platformMeta ? { platformMeta } : {}),
        });
    };

    const handleVoiceCommand = (transcription: string) => {
        const text = transcription.toLowerCase();
        if (text.includes("analytics")) setActiveTab("analytics");
        else if (text.includes("team")) setActiveTab("team");
        else if (text.includes("queue")) setActiveTab("queue");
        else {}
    };

    const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

    if (currentWsLoading) return <SpinningLoader fullScreen={true} />;
    
    const navItems = [
        { id: 'queue', label: t('Queue', 'File'), icon: Layers },
        { id: 'calendar', label: t('Calendar', 'Calendrier'), icon: CalendarIcon },
        { id: 'boards', label: t('Boards', 'Tableaux'), icon: Layout },
        { id: 'analytics', label: t('Analytics', 'Analytique'), icon: BarChart2 },
        { id: 'engagement', label: t('Inbox', 'Messages'), icon: MessageCircle },
        { id: 'team', label: t('Team', 'Équipe'), icon: Users },
        { id: 'settings', label: t('Config', 'Config'), icon: SettingsIcon }
    ];

    return (
        <div className="min-h-screen bg-[#F4F4F0] dark:bg-black font-sans text-black dark:text-white relative selection:bg-yellow-300 transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 border-2 border-transparent active:bg-yellow-100 dark:active:bg-zinc-800"><Menu size={24} className="text-black dark:text-white" /></button><div className="font-black text-xl tracking-tighter italic text-black dark:text-white">EASYPOST.</div></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-none border-2 border-black dark:border-white overflow-hidden bg-white dark:bg-black"><img src={currentWorkspace?.logo || getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div></div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-black border-r-4 border-black dark:border-white flex flex-col z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.2)]"><div className="p-6 border-b-2 border-black dark:border-white flex justify-between items-center bg-[#3C48F5] text-white"><span className="font-black text-xl uppercase">Menu</span><button onClick={() => setIsSidebarOpen(false)} className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-red-500 hover:text-white transition-colors p-1"><X/></button></div><nav className="p-4 space-y-3">{navItems.map(item => (<SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} />))}</nav></motion.aside></>
                )}
            </AnimatePresence>

            {/* Main Layout */}
            <main className="relative z-10 flex flex-col min-h-screen">
                <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white/95 dark:bg-black/90 backdrop-blur-sm border-4 border-black dark:border-white items-center justify-between px-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/')}
                                className="p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-blue-50 dark:hover:bg-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                title={t("Back to Home", "Retour à l'accueil")}
                            >
                                <Home size={20} strokeWidth={3} className="text-black dark:text-white" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                                    <Image 
                                        src="/applogo.png" 
                                        alt="EasyPost Logo" 
                                        width={40} 
                                        height={40} 
                                        className="object-contain p-1" 
                                    />
                                </div>
                                <span className="font-black text-2xl tracking-tighter italic text-black dark:text-white">ASYPOST.</span>
                            </div>
                        </div>
                        <div className="relative group"><button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all"><div className="w-6 h-6 border-2 border-black dark:border-white rounded-none overflow-hidden bg-gray-100 dark:bg-zinc-800"><img src={currentWorkspace?.logo || getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div><span className="text-sm font-bold uppercase truncate max-w-[120px] text-black dark:text-white">{currentWorkspace?.name || 'Select'}</span><ChevronDown size={16} className="text-black dark:text-white" /></button>
                            <AnimatePresence>{isAccountMenuOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] z-50 p-2 origin-top"><div className="space-y-1">{myWorkspaces.map((ws: any) => (<button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-transparent transition-all"><div className="w-5 h-5 border border-black dark:border-white overflow-hidden bg-gray-50 dark:bg-zinc-800"><img src={ws.logo || getAvatarUrl(ws.name)} className="w-full h-full object-cover" /></div><span className="flex-1 font-bold truncate text-black dark:text-white">{ws.name}</span>{currentWorkspace?.id === ws.id && <Check size={16} className="text-blue-600 border-2 border-transparent"/>}</button>))}</div><div className="h-0.5 bg-black dark:bg-white my-2"/><button onClick={() => { setIsCreateModalOpen(true); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-black dark:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-black dark:border-white transition-all"><Plus size={16} className="text-black dark:text-white"/> {t("New Workspace", "Nouvel Espace")}</button></motion.div>)}</AnimatePresence>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div ref={searchRef} className="relative flex items-center gap-2">
                            <NeuInput
                                placeholder={t("Search...", "Rechercher...")}
                                value={searchTerm}
                                onChange={(e: any) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
                                onFocus={() => setIsSearchOpen(true)}
                                style={{ width: '250px' }}
                            />
                            <button
                                onClick={() => setIsSearchOpen(v => !v)}
                                className="bg-black dark:bg-white text-white dark:text-black p-2.5 border-2 border-black dark:border-white hover:bg-[#3C48F5] hover:border-[#3C48F5] transition-colors"
                            >
                                <Search size={18} />
                            </button>

                            {/* Real-time results dropdown */}
                            {isSearchOpen && searchTerm.trim() && (
                                <div className="absolute top-full left-0 mt-2 w-[400px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] z-50 overflow-hidden">
                                    {searchResults.posts.length === 0 && searchResults.accounts.length === 0 ? (
                                        <div className="p-4 text-center text-xs font-black uppercase text-gray-400">{t("No results found", "Aucun résultat")}</div>
                                    ) : (
                                        <>
                                            {searchResults.posts.length > 0 && (
                                                <div>
                                                    <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest">{t("Posts", "Publications")}</div>
                                                    {searchResults.posts.map((p: any) => (
                                                        <button key={p.id} onClick={() => { setActiveTab('queue'); setIsSearchOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 transition-colors">
                                                            <div className={`w-2 h-2 flex-shrink-0 ${p.status === 'SCHEDULED' ? 'bg-[#3C48F5]' : p.status === 'DRAFT' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                                                            <span className="text-xs font-bold truncate text-black dark:text-white">{p.content?.substring(0, 60)}...</span>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 ml-auto flex-shrink-0">{p.status}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.accounts.length > 0 && (
                                                <div>
                                                    <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest">{t("Accounts", "Comptes")}</div>
                                                    {searchResults.accounts.map((a: any) => (
                                                        <button key={a.id} onClick={() => { setActiveTab('settings'); setIsSearchOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
                                                            <div className="w-2 h-2 bg-green-500 flex-shrink-0" />
                                                            <span className="text-xs font-bold text-black dark:text-white">@{a.username}</span>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 ml-auto">{a.platform}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* 🔔 FUNCTIONAL NOTIFICATION BELL */}
                        <Popover onOpenChange={(open) => { if (open) markAllRead(); }}>
                            <PopoverTrigger asChild>
                                <button className="relative p-2.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all group">
                                    <Bell size={20} className="text-black dark:text-white group-hover:rotate-12 transition-transform" />
                                    {unreadCount > 0 && (
                                        <div className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-[#3C48F5] border-2 border-black dark:border-white flex items-center justify-center text-white text-[8px] font-black -translate-y-1/3 translate-x-1/3 px-0.5">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-0 rounded-none shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] mt-2" align="end">
                                <div className="bg-black dark:bg-white text-white dark:text-black p-3 font-black uppercase text-xs tracking-widest border-b-2 border-black dark:border-white flex items-center justify-between">
                                    <span>{t("Activity Feed", "Flux d'Activité")}</span>
                                    {notifications.length > 0 && <span className="text-[9px] opacity-60">{notifications.length} log{notifications.length !== 1 ? 's' : ''}</span>}
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-400 flex items-center justify-center">
                                                <Bell size={24} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="font-bold text-xs uppercase tracking-tight text-gray-500 dark:text-zinc-400">
                                            {t("No events logged yet.", "Aucun événement enregistré.")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-72 overflow-y-auto divide-y divide-black/10 dark:divide-white/10">
                                        {notifications.map(n => (
                                            <div key={n.id} className="flex items-start gap-3 px-3 py-2.5">
                                                <div className={`mt-0.5 w-2 h-2 flex-shrink-0 rounded-none ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-[#3C48F5]'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-black dark:text-white leading-tight">{n.message}</p>
                                                    <p className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 mt-0.5">
                                                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="p-2 border-t-2 border-black dark:border-white">
                                    <button
                                        onClick={clearNotifications}
                                        className="w-full py-2 font-black text-[10px] uppercase border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                    >
                                        {t("Clear Logs", "Effacer les Logs")}
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                <div className="flex-1 px-4 md:px-8 pb-32 pt-8 bg-white dark:bg-black border-x-4 border-black dark:border-white">
                    <div className="max-w-[1600px] mx-auto flex gap-8 items-start">
                        <div className="hidden lg:block sticky top-32 z-10 self-start -ml-4">
                            <QuickConnectSidebar 
                                accounts={accounts} 
                                workspaceId={workspaceId} 
                                currentWorkspace={currentWorkspace}
                                refreshData={() => {
                                    refetchAccounts();
                                    queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
                                }} 
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* OnboardingGuide hidden — not enough space */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                    {currentWorkspace?.owner?.planType === 'FREE' && currentWorkspace.currentPostCount >= 8 && currentWorkspace.currentPostCount < 10 && (
                                        <div className="mb-6 bg-yellow-400 border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle size={20} className="text-black" />
                                                <span className="font-black uppercase text-sm italic text-black">{t(`Warning: ${10 - currentWorkspace.currentPostCount} posts remaining this month.`, `Attention : ${10 - currentWorkspace.currentPostCount} publications restantes ce mois.`)}</span>
                                            </div>
                                            <button onClick={() => router.push('/pricing')} className="bg-black text-white px-4 py-1 font-black text-xs uppercase border-2 border-black hover:bg-white hover:text-black transition-all">{t("Upgrade Now", "Passer à la version payante")}</button>
                                        </div>
                                    )}

                                    {activeTab === 'queue' && (
                                        <div className="grid gap-8">
                                            <NeuCard className="bg-white dark:bg-zinc-900 relative overflow-hidden min-h-[520px]">
                                                {currentWorkspace?.owner?.planType === 'FREE' && currentWorkspace.currentPostCount >= 10 && (
                                                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
                                                        <Crown size={64} className="text-yellow-400 mb-6 animate-bounce" />
                                                        <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">{t("Post Limit Reached!", "Limite de Publications Atteinte !")}</h2>
                                                        <p className="max-w-md font-bold mb-8 opacity-80">
                                                            🎉 {t("Upgrade to STARTER for only", "Passez à STARTER pour seulement")} <span className="text-yellow-400">4,900 FCFA/{t("month", "mois")}</span><br/>
                                                            → 100 {t("posts", "publications")}, 5 {t("accounts", "comptes")}, 100 AI requests
                                                        </p>
                                                        <button
                                                            onClick={() => router.push('/pricing')}
                                                            className="bg-[#3C48F5] text-white px-10 py-4 font-black uppercase text-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                        >
                                                            {t("Upgrade Now — 7 days free", "Upgrade Maintenant — 7 jours gratuits")}
                                                        </button>
                                                    </div>
                                                )}
                                                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white"><div className="w-4 h-4 bg-[#3C48F5] border-2 border-black dark:border-white"></div>{editingPost ? t('Edit Content', 'Modifier le Contenu') : t('Create New Content', 'Créer un Nouveau Contenu')}</h2>
                                                <Composer
                                    workspaceId={workspaceId}
                                    onSchedule={handleAddPost}
                                    accounts={accounts}
                                    postToEdit={editingPost}
                                    isPreviewActive={isPreviewMode}
                                    onPreviewToggle={() => { setIsPreviewMode(v => !v); setPreviewPlatformIdx(0); }}
                                    onPreviewDataChange={setPreviewData}
                                />
                                            </NeuCard>
                                            <div className="mt-4"><PostFeed posts={posts} accounts={accounts} workspaceId={workspaceId} onEdit={setEditingPost} isLoading={postsLoading} /></div>
                                        </div>
                                    )}
                                    {activeTab === 'calendar' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-black uppercase text-black dark:text-white">{t("Content Timeline", "Calendrier de Contenu")}</h2>
                                                <NeuButton onClick={() => setActiveTab('queue')}>+ {t("Quick Post", "Publication Rapide")}</NeuButton>
                                            </div>
                                            <CalendarView 
                                                workspaceId={workspaceId} 
                                                onPostClick={(post) => {
                                                    setEditingPost(post);
                                                    setActiveTab('queue');
                                                }}
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'boards' && <BoardView workspaceId={workspaceId} />}
                                    {activeTab === 'analytics' && <NeuCard className="bg-white dark:bg-zinc-900 min-h-[600px]"><Analytics /></NeuCard>}
                                    {activeTab === 'engagement' && <NeuCard className="bg-white dark:bg-zinc-900 min-h-[600px]"><EngagementWithTabs /></NeuCard>}
                                    {activeTab === 'team' && <Team workspaceId={workspaceId} />}
                                    {activeTab === 'settings' && <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] p-6 md:p-8"><Settings workspaceId={workspaceId} workspaceName={currentWorkspace?.name} /></div>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className={cn("hidden lg:block sticky top-32 self-start transition-all duration-200", isPreviewMode ? "w-80" : "w-64")}>
                            <AnimatePresence mode="wait">
                                {isPreviewMode ? (
                                    <motion.div key="preview" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                        <PhoneMockupPreview
                                            previewData={previewData}
                                            accounts={accounts}
                                            platformIdx={previewPlatformIdx}
                                            onPlatformChange={setPreviewPlatformIdx}
                                            onClose={() => setIsPreviewMode(false)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4">
                                        <div className="p-4 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]"><h3 className="font-black text-lg uppercase tracking-tight">{t("MENU", "MENU")}</h3></div>
                                        <nav className="space-y-3">{navItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center justify-between p-4 border-2 border-black dark:border-white transition-all duration-200 group ${activeTab === item.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'}`}><div className="flex items-center gap-3"><item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="font-bold uppercase tracking-wider">{item.label}</span></div>{activeTab === item.id && <ArrowRight size={16} />}</button>))}</nav>
                                        <div className="mt-8 p-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white border-dashed transition-colors"><p className="text-xs font-mono text-gray-500 mb-2 uppercase">{t("SUBSCRIPTION", "ABONNEMENT")}</p><div className="flex justify-between items-end text-black dark:text-white"><span
  className={`text-xl font-black ${
    !currentWorkspace?.owner?.planType || currentWorkspace.owner.planType === 'FREE'
      ? 'text-gray-400'
      : currentWorkspace.owner.planType === 'STARTER'
      ? 'text-[#3C48F5]'
      : currentWorkspace.owner.planType === 'PRO'
      ? 'text-[#3C48F5] drop-shadow-[0_0_10px_rgba(60,72,245,0.85)] animate-pulse'
      : currentWorkspace.owner.planType === 'ENTERPRISE'
      ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-clip-text text-transparent animate-pulse'
      : 'text-green-600'
  }`}
>{currentWorkspace?.owner?.planType || 'FREE'}</span><button onClick={() => setActiveTab('settings')} className="text-xs font-bold underline hover:text-[#3C48F5] uppercase">{t("MANAGE", "GÉRER")}</button></div></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <NeuModal title={t("CREATE WORKSPACE", "CRÉER UN ESPACE")} isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}><div className="space-y-4"><div><label className="text-xs font-bold uppercase mb-1 block text-black">{t("Workspace Name", "Nom de l'Espace")}</label><NeuInput value={newWorkspaceName} onChange={(e: any) => setNewWorkspaceName(e.target.value)} placeholder={t("E.G. DIGITAL AGENCY", "EX : AGENCE DIGITALE")} autoFocus /></div><div className="flex justify-end gap-2"><NeuButton onClick={() => setIsCreateModalOpen(false)} className="bg-white hover:bg-gray-100">{t("Cancel", "Annuler")}</NeuButton><NeuButton onClick={handleCreateWorkspace} className="bg-[#3C48F6] text-white hover:bg-blue-700">{t("Create", "Créer")}</NeuButton></div></div></NeuModal>
            
            <FacebookPageSelector 
                isOpen={isFbPageSelectorOpen} 
                onClose={() => { 
                    setIsFbPageSelectorOpen(false); 
                    const url = new URL(window.location.href);
                    url.searchParams.delete('social_selection');
                    url.searchParams.delete('exchange_token');
                    window.history.replaceState(null, '', url.pathname);
                }} 
                onAccountConnected={manuallyAddAccount} 
                exchangeToken={tempExchangeToken} 
            />
        </div>
    );
}