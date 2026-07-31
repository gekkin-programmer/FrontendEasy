'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCookie } from 'cookies-next';
import { cn } from '@/lib/utils';
import {
  X, Copy, CheckCheck
} from 'lucide-react';
import { FaMedium, FaSnapchat, FaThreads } from 'react-icons/fa6';
import {
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon,
  TiktokIcon, YoutubeIcon, PinterestIcon, WhatsappIcon, TelegramIcon,
  DiscordIcon, TwitchIcon
} from '@/components/icons/PlatformIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAppToast } from '@/hooks/useAppToast';

interface QuickConnectSidebarProps {
  accounts: any[];
  workspaceId: string;
  refreshData: () => void;
  currentWorkspace: any;
  onManageChannels?: () => void;
}

export const QuickConnectSidebar = ({ accounts, workspaceId, refreshData, onManageChannels }: QuickConnectSidebarProps) => {
    const { t } = useLanguage();
    const toast = useAppToast();
    const queryClient = useQueryClient();
    const [telegramModal, setTelegramModal] = useState(false);
    const [telegramToken, setTelegramToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [waConnecting, setWaConnecting] = useState(false);
    const waSignupDataRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

    // WhatsApp connections live in WhatsAppConnection, not SocialAccount, so
    // its "connected" state can't come from the generic `accounts` prop.
    const { data: waStatus } = useQuery({
        queryKey: ['whatsapp-status', workspaceId],
        queryFn: async () => {
            const res: any = await api.get(`/whatsapp/status?workspaceId=${workspaceId}`);
            return res.data ?? res;
        },
        enabled: !!workspaceId,
    });

    // Meta posts the WABA/phone number IDs via postMessage during the Embedded
    // Signup popup flow, separately from the FB.login callback's auth code —
    // the message arrives first, so stash it here for connectWhatsApp to read
    // once the callback fires. CANCEL is the most common outcome (user just
    // closes the dialog) and is not an error; ERROR carries Meta's own message.
    useEffect(() => {
        const handleSignupMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.facebook.com') return;
            let payload: any;
            try {
                payload = JSON.parse(event.data);
            } catch {
                return;
            }
            if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return;

            if (payload.event === 'FINISH') {
                waSignupDataRef.current = {
                    wabaId: payload.data?.waba_id,
                    phoneNumberId: payload.data?.phone_number_id,
                };
            } else if (payload.event === 'CANCEL') {
                toast.info(t('WhatsApp setup cancelled — you can try again anytime', 'Configuration WhatsApp annulée — vous pouvez réessayer à tout moment'));
                setWaConnecting(false);
            } else if (payload.event === 'ERROR') {
                toast.error(payload.data?.error_message || t('WhatsApp setup failed', 'Échec de la configuration WhatsApp'));
                setWaConnecting(false);
            }
        };
        window.addEventListener('message', handleSignupMessage);
        return () => window.removeEventListener('message', handleSignupMessage);
    }, [t, toast]);

    const connectWhatsApp = () => {
        setWaConnecting(true);
        waSignupDataRef.current = {};
        if (typeof window === 'undefined' || !(window as any).FB) {
            toast.error(t('Meta SDK not loaded — please refresh', 'SDK Meta non chargé — actualisez la page'));
            setWaConnecting(false);
            return;
        }
        (window as any).FB.login(
            async (response: any) => {
                if (!response.authResponse) {
                    setWaConnecting(false);
                    return;
                }
                const { wabaId, phoneNumberId } = waSignupDataRef.current;
                if (!wabaId || !phoneNumberId) {
                    toast.error(t("WhatsApp setup didn't finish — please try again", "La configuration WhatsApp ne s'est pas terminée — veuillez réessayer"));
                    setWaConnecting(false);
                    return;
                }
                try {
                    const res: any = await api.post('/whatsapp/connect', {
                        workspaceId,
                        code: response.authResponse.code,
                        wabaId,
                        phoneNumberId,
                    });
                    const body = res?.data ?? res;
                    if (body?.warnings?.length) {
                        toast.success(t(`Connected, but: ${body.warnings.join(' ')}`, `Connecté, mais : ${body.warnings.join(' ')}`));
                    } else {
                        toast.success(t('WhatsApp connected', 'WhatsApp connecté'));
                    }
                    queryClient.invalidateQueries({ queryKey: ['whatsapp-status', workspaceId] });
                    refreshData();
                } catch (err: any) {
                    toast.error(err?.message || t('WhatsApp connection failed', 'Connexion WhatsApp échouée'));
                }
                setWaConnecting(false);
            },
            {
                config_id: process.env.NEXT_PUBLIC_META_ES_CONFIG_ID || '',
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    version: 'v4',
                    sessionInfoVersion: '3',
                },
            },
        );
    };

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

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
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
        if (platform === 'whatsapp') {
            // WhatsApp is the exception: Embedded Signup (FB.login), not the
            // redirect-based generic platform connect.
            connectWhatsApp();
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

    return (
        <>
            <div className="flex flex-col w-full">
            <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-[14px] bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10">
                {platforms.map((p) => {
                        const isWhatsapp = p.id === 'whatsapp';
                        const connected = isWhatsapp
                            ? (waStatus?.connected ? { username: waStatus.displayName || waStatus.phoneNumber } : null)
                            : accounts.find((a:any) => a.platform?.toLowerCase() === p.id.toLowerCase());

                        return (
                            <div key={p.id} className="relative group flex-shrink-0">
                                {connected ? (
                                    <button className="w-12 h-12 rounded-[10px] flex items-center justify-center cursor-default transition-colors" title={connected.username}>
                                        <p.Icon size={24} className={p.color} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(p.id, (p as any).comingSoon)}
                                        disabled={isWhatsapp && waConnecting}
                                        className={cn(
                                            "group w-12 h-12 rounded-[10px] flex items-center justify-center cursor-pointer transition-all",
                                            (p as any).comingSoon || (isWhatsapp && waConnecting)
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

            {onManageChannels && (
                <button
                    onClick={onManageChannels}
                    className="self-center text-center text-xs font-semibold text-[#040028] dark:text-white px-1.5 py-0.5 mt-2"
                >
                    {t('Manage your channels', 'Gérer vos canaux')}
                </button>
            )}
            </div>

            {/* TELEGRAM LINK MODAL */}
            <AnimatePresence>
                {telegramModal && telegramToken && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#333333]/20 backdrop-blur-sm p-4">
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
