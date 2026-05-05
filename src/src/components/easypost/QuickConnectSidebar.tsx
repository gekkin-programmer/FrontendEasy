'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { getCookie } from 'cookies-next';
import { cn } from '@/lib/utils';
import {
  Link as LinkIcon, Trash2, Check, Crown, X, Copy, CheckCheck
} from 'lucide-react';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaTiktok, FaYoutube, FaPinterestP, FaWhatsapp, FaMedium, FaSnapchat, FaTelegram,
  FaDiscord, FaTwitch, FaThreads
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/src/context/LanguageContext';

interface QuickConnectSidebarProps {
  accounts: any[];
  workspaceId: string;
  refreshData: () => void;
  currentWorkspace: any;
}

export const QuickConnectSidebar = ({ accounts, workspaceId, refreshData, currentWorkspace }: QuickConnectSidebarProps) => {
    const { t } = useLanguage();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [telegramModal, setTelegramModal] = useState(false);
    const [telegramToken, setTelegramToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const platforms = [
        { id: 'facebook', Icon: FaFacebookF, color: 'text-[#1877F2]' },
        { id: 'instagram', Icon: FaInstagram, color: 'text-[#E4405F]' },
        { id: 'twitter', Icon: FaTwitter, color: 'text-black dark:text-white' },
        { id: 'linkedin', Icon: FaLinkedinIn, color: 'text-[#0A66C2]' },
        { id: 'tiktok', Icon: FaTiktok, color: 'text-black dark:text-white' },
        { id: 'youtube', Icon: FaYoutube, color: 'text-[#FF0000]' },
        { id: 'pinterest', Icon: FaPinterestP, color: 'text-[#BD081C]' },
        { id: 'whatsapp', Icon: FaWhatsapp, color: 'text-[#25D366]' },
        { id: 'medium', Icon: FaMedium, color: 'text-black dark:text-white' },
        { id: 'snapchat', Icon: FaSnapchat, color: 'text-[#FFFC00]' },
        { id: 'telegram', Icon: FaTelegram, color: 'text-[#2AABEE]' },
        { id: 'discord', Icon: FaDiscord, color: 'text-[#5865F2]' },
        { id: 'twitch', Icon: FaTwitch, color: 'text-[#9146FF]', comingSoon: true },
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
            <div className="w-[104px] flex flex-col items-center gap-3 py-4 px-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] h-full overflow-y-auto scrollbar-hide transition-colors">
                {/* Header row */}
                <div className="flex items-center gap-2 w-full justify-center mb-1 bg-black -mx-2 mt-1 px-2 pt-3 pb-2">
                    {accounts.length >= 2 && currentWorkspace?.owner?.planType === 'FREE' && (
                        <button
                            onClick={() => router.push('/pricing')}
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-yellow-300 dark:hover:bg-zinc-600 active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                            title={t("Upgrade to add more accounts", "Passez à la version payante pour ajouter plus de comptes")}
                        >
                            <Crown size={16} className="text-black dark:text-white" />
                        </button>
                    )}
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-2 border-black dark:border-white bg-black hover:bg-zinc-700 transition-colors">
                        <LinkIcon size={14} className="text-white" />
                    </div>
                </div>

                {/* Platform icons — 2-column grid */}
                <div className="grid grid-cols-2 gap-2 w-full">
                    {platforms.map((p) => {
                        const connected = accounts.find((a:any) => a.platform?.toLowerCase() === p.id.toLowerCase());

                        return (
                            <div key={p.id} className="relative group flex-shrink-0">
                                {connected ? (
                                    <>
                                        {/* Base layer: platform icon */}
                                        <button className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white cursor-default transition-colors bg-gray-50 dark:bg-zinc-800">
                                            <p.Icon size={16} className={cn(p.color, "opacity-60")} />
                                        </button>

                                        {/* Hover overlay: disconnect only */}
                                        <div className="absolute inset-0 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex">
                                            <button
                                                onClick={() => disconnectMutation.mutate(connected.id)}
                                                className="w-full flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:border-red-500 transition-colors cursor-pointer"
                                                title={t("Disconnect", "Déconnecter")}
                                            >
                                                <Trash2 size={10} className="text-red-500" strokeWidth={3} />
                                            </button>
                                        </div>

                                        {/* Status dot: always green */}
                                        <div className="absolute -top-1 -right-1 pointer-events-none z-20">
                                            <div className="w-3.5 h-3.5 bg-green-500 border-2 border-black dark:border-white flex items-center justify-center text-white">
                                                <Check size={8} strokeWidth={4} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(p.id, (p as any).comingSoon)}
                                        className={cn(
                                            "group w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white cursor-pointer transition-all",
                                            (p as any).comingSoon
                                                ? "bg-zinc-100 dark:bg-zinc-800 opacity-50"
                                                : "bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:-translate-x-[1px] hover:-translate-y-[1px]"
                                        )}
                                        title={(p as any).comingSoon
                                            ? t(`${p.id} — coming soon`, `${p.id} — bientôt disponible`)
                                            : t(`Connect ${p.id}`, `Connecter ${p.id}`)}
                                    >
                                        <p.Icon
                                            size={16}
                                            className={cn(p.color, "transition-transform group-hover:scale-110")}
                                        />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TELEGRAM LINK MODAL */}
            <AnimatePresence>
                {telegramModal && telegramToken && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] w-full max-w-sm overflow-hidden"
                        >
                            <div className="bg-[#2AABEE] text-white p-4 border-b-4 border-black dark:border-white flex justify-between items-center">
                                <span className="font-black uppercase tracking-wider flex items-center gap-2">
                                    <FaTelegram size={20} /> {t("Connect Telegram", "Connecter Telegram")}
                                </span>
                                <button onClick={() => setTelegramModal(false)}><X size={24} strokeWidth={3} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="font-bold uppercase text-xs text-black dark:text-white">
                                    {t("1. Open Telegram and message", "1. Ouvrez Telegram et envoyez un message à")}
                                </p>
                                <a
                                    href="https://t.me/Eazy_Post_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center font-black text-[#2AABEE] underline text-sm"
                                >
                                    @Eazy_Post_bot
                                </a>
                                <p className="font-bold uppercase text-xs text-black dark:text-white">
                                    {t("2. Send this command (expires in 15 min):", "2. Envoyez cette commande (expire dans 15 min):")}
                                </p>
                                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white p-3">
                                    <code className="flex-1 font-mono text-sm text-black dark:text-white break-all">
                                        /link {telegramToken}
                                    </code>
                                    <button
                                        onClick={copyCommand}
                                        className="flex-shrink-0 p-1 border-2 border-black dark:border-white bg-white dark:bg-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                        title={t("Copy", "Copier")}
                                    >
                                        {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] font-mono opacity-60 text-black dark:text-white">
                                    {t("The bot will confirm when your account is linked.", "Le bot confirmera lorsque votre compte sera lié.")}
                                </p>
                                <button
                                    onClick={() => { setTelegramModal(false); refreshData(); }}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_#555] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
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
