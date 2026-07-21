'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getCookie } from 'cookies-next';
import { cn } from '@/lib/utils';
import {
  Trash2, Check, X, Copy, CheckCheck
} from 'lucide-react';
import { FaMedium, FaSnapchat, FaThreads } from 'react-icons/fa6';
import {
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon,
  TiktokIcon, YoutubeIcon, PinterestIcon, WhatsappIcon, TelegramIcon,
  DiscordIcon, TwitchIcon
} from '@/components/icons/PlatformIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface QuickConnectSidebarProps {
  accounts: any[];
  workspaceId: string;
  refreshData: () => void;
  currentWorkspace: any;
}

export const QuickConnectSidebar = ({ accounts, workspaceId, refreshData }: QuickConnectSidebarProps) => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [telegramModal, setTelegramModal] = useState(false);
    const [telegramToken, setTelegramToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const platforms = [
        { id: 'facebook', Icon: FacebookIcon, color: '' },
        { id: 'instagram', Icon: InstagramIcon, color: '' },
        { id: 'twitter', Icon: TwitterIcon, color: '' },
        { id: 'linkedin', Icon: LinkedinIcon, color: '' },
        { id: 'tiktok', Icon: TiktokIcon, color: '' },
        { id: 'youtube', Icon: YoutubeIcon, color: '' },
        { id: 'pinterest', Icon: PinterestIcon, color: '' },
        { id: 'whatsapp', Icon: WhatsappIcon, color: '' },
        { id: 'medium', Icon: FaMedium, color: 'text-black dark:text-white' },
        { id: 'snapchat', Icon: FaSnapchat, color: 'text-[#FFFC00]' },
        { id: 'telegram', Icon: TelegramIcon, color: '' },
        { id: 'discord', Icon: DiscordIcon, color: '' },
        { id: 'twitch', Icon: TwitchIcon, color: '', comingSoon: true },
        { id: 'threads', Icon: FaThreads, color: 'text-black dark:text-white' },
    ];

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com')
        .replace(/\/$/, '')
        .replace(/\/api$/, '') + '/api';

    const telegramTokenMutation = useMutation({
        mutationFn: () => api.post('/telegram/link-token', { workspaceId }),
        onSuccess: (res: any) => {
            setTelegramToken(res.token ?? res.data?.token ?? null);
            setTelegramModal(true);
        },
        onError: () => {},
    });

    const handleConnect = (platform: string, comingSoon?: boolean) => {
        if (comingSoon) {
            return;
        }
        if (platform === 'telegram') {
            telegramTokenMutation.mutate();
            return;
        }
        const token = getCookie('accessToken');
        window.location.assign(`${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`);
    };

    const copyCommand = () => {
        if (!telegramToken) return;
        void navigator.clipboard.writeText(`/link ${telegramToken}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const disconnectMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/social-accounts/${id}`),
        onSuccess: () => refreshData(),
        onError: () => {},
    });


    return (
        <>
            <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-[14px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10">
                {platforms.map((p) => {
                        const connected = accounts.find((a:any) => a.platform?.toLowerCase() === p.id.toLowerCase());

                        return (
                            <div key={p.id} className="relative group flex-shrink-0">
                                {connected ? (
                                    <>
                                        {/* Base layer: platform icon */}
                                        <button className="w-12 h-12 rounded-[10px] flex items-center justify-center cursor-default transition-colors">
                                            <p.Icon size={24} className={cn(p.color, "opacity-60")} />
                                        </button>

                                        {/* Hover overlay: disconnect only */}
                                        <div className="absolute inset-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex">
                                            <button
                                                onClick={() => disconnectMutation.mutate(connected.id)}
                                                className="w-full rounded-[10px] flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                                                title={t("Disconnect", "Déconnecter")}
                                            >
                                                <Trash2 size={12} className="text-red-500" />
                                            </button>
                                        </div>

                                        {/* Status dot: always green */}
                                        <div className="absolute -top-1 -right-1 pointer-events-none z-20">
                                            <div className="w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#0A0A2E] flex items-center justify-center text-white">
                                                <Check size={8} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(p.id, (p as any).comingSoon)}
                                        className={cn(
                                            "group w-12 h-12 rounded-[10px] flex items-center justify-center cursor-pointer transition-all",
                                            (p as any).comingSoon
                                                ? "opacity-50"
                                                : "hover:bg-[#174CD2]/8"
                                        )}
                                        title={(p as any).comingSoon
                                            ? t(`${p.id} — coming soon`, `${p.id} — bientôt disponible`)
                                            : t(`Connect ${p.id}`, `Connecter ${p.id}`)}
                                    >
                                        <p.Icon
                                            size={24}
                                            className={cn(p.color, "transition-transform group-hover:scale-110")}
                                        />
                                    </button>
                                )}
                            </div>
                        );
                })}
            </div>

            {/* TELEGRAM LINK MODAL */}
            <AnimatePresence>
                {telegramModal && telegramToken && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#040028]/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 10 }}
                            className="bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden"
                        >
                            <div className="bg-[#2AABEE] text-white p-4 flex justify-between items-center">
                                <span className="font-bold flex items-center gap-2">
                                    <TelegramIcon size={20} /> {t("Connect Telegram", "Connecter Telegram")}
                                </span>
                                <button onClick={() => setTelegramModal(false)} className="text-white/80 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="font-semibold text-xs text-[#8E8E8E]">
                                    {t("1. Open Telegram and message", "1. Ouvrez Telegram et envoyez un message à")}
                                </p>
                                <a
                                    href="https://t.me/Eazy_Post_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center font-semibold text-[#2AABEE] hover:underline text-sm"
                                >
                                    @Eazy_Post_bot
                                </a>
                                <p className="font-semibold text-xs text-[#8E8E8E]">
                                    {t("2. Send this command (expires in 15 min):", "2. Envoyez cette commande (expire dans 15 min):")}
                                </p>
                                <div className="flex items-center gap-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 p-3">
                                    <code className="flex-1 font-mono text-sm text-[#040028] dark:text-white break-all">
                                        /link {telegramToken}
                                    </code>
                                    <button
                                        onClick={copyCommand}
                                        className="flex-shrink-0 p-2 rounded-[8px] bg-white dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/20 text-[#040028] dark:text-white transition-colors"
                                        title={t("Copy", "Copier")}
                                    >
                                        {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-[#8E8E8E]">
                                    {t("The bot will confirm when your account is linked.", "Le bot confirmera lorsque votre compte sera lié.")}
                                </p>
                                <button
                                    onClick={() => { setTelegramModal(false); refreshData(); }}
                                    className="w-full py-2.5 rounded-[10px] bg-[#174CD2] text-white font-semibold text-sm hover:bg-[#123a9e] transition-all"
                                >
                                    {t("Done", "Terminé")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </>
    );
};
