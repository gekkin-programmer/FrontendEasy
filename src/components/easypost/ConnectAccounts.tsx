'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaTelegram, FaThreads
} from 'react-icons/fa6';
import { Check, Plus, Trash2, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Zap, Copy, X } from 'lucide-react';
import { format } from 'date-fns';
import SpinningLoader from '../SpinningLoader';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/src/context/LanguageContext';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com')
  .replace(/\/$/, '')
  .replace(/\/api$/, '') + '/api';

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',   icon: FaFacebookF,  color: '#1877F2', oauth: true  },
  { id: 'instagram', label: 'Instagram',  icon: FaInstagram,  color: '#E4405F', oauth: true  },
  { id: 'twitter',   label: 'Twitter (X)',icon: FaTwitter,    color: '#000000', oauth: true  },
  { id: 'linkedin',  label: 'LinkedIn',   icon: FaLinkedinIn, color: '#0077B5', oauth: true  },
  { id: 'tiktok',    label: 'TikTok',     icon: FaTiktok,     color: '#000000', oauth: true  },
  { id: 'youtube',   label: 'YouTube',    icon: FaYoutube,    color: '#FF0000', oauth: true  },
  { id: 'telegram',  label: 'Telegram',   icon: FaTelegram,   color: '#26A5E4', oauth: false },
  { id: 'threads',   label: 'Threads',    icon: FaThreads,    color: '#000000', oauth: true  },
];

// ─── Telegram Link Modal ─────────────────────────────────────────────────────

function TelegramLinkModal({ onClose, workspaceId }: { onClose: () => void; workspaceId: string }) {
  const { t } = useLanguage();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res: any = await api.post('/telegram/link-token', { workspaceId });
      setLinkToken(res.token ?? res.data?.token);
    } catch {
      toast.error(t('Failed to generate link token', 'Échec de la génération du jeton de liaison'));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!linkToken) return;
    void navigator.clipboard.writeText(`/link ${linkToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#3C48F5] p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black dark:border-white pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#26A5E4] border-4 border-black flex items-center justify-center">
              <FaTelegram size={18} className="text-white" />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tighter">{t("Connect Telegram", "Connecter Telegram")}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white border-2 border-black transition-colors">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Instructions */}
        <ol className="space-y-3 font-mono text-sm font-bold">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-black">1</span>
            <span className="text-black dark:text-white">{t("Open Telegram and search for", "Ouvrez Telegram et recherchez")} <span className="bg-zinc-100 dark:bg-zinc-800 px-1 border border-black dark:border-white">@Eazy_Post_bot</span></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-black">2</span>
            <span className="text-black dark:text-white">{t("Generate your link token below", "Générez votre jeton de liaison ci-dessous")}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-black">3</span>
            <span className="text-black dark:text-white">{t("Send the copied command to the bot", "Envoyez la commande copiée au bot")}</span>
          </li>
        </ol>

        {/* Token area */}
        {!linkToken ? (
          <button
            onClick={() => void generate()}
            disabled={loading}
            className="w-full py-4 bg-[#26A5E4] text-white border-4 border-black font-black text-sm uppercase shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="inline animate-spin mr-2" /> : null}
            {loading ? t('Generating...', 'Génération en cours...') : t('Generate Link Token', 'Générer le jeton de liaison')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-mono font-black uppercase text-gray-500">{t("Token expires in 15 minutes", "Le jeton expire dans 15 minutes")}</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-4 border-black dark:border-white px-4 py-3 font-mono text-sm font-black text-black dark:text-white truncate">
                /link {linkToken}
              </div>
              <button
                onClick={copy}
                className="px-4 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-[#3C48F5] hover:border-[#3C48F5] transition-colors"
              >
                {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
              </button>
            </div>
            <p className="text-[10px] font-mono font-bold text-gray-500 uppercase">
              {t("Paste this command in the Telegram bot chat", "Collez cette commande dans le chat du bot Telegram")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConnectAccounts({ workspaceId }: { workspaceId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const token = getCookie('accessToken');
  let tokenStatus = t("Unknown", "Inconnu");
  let tokenExpiry = null;

  try {
    if (token) {
        const decoded: any = jwtDecode(token as string);
        tokenExpiry = new Date(decoded.exp * 1000);
        tokenStatus = tokenExpiry > new Date() ? t("Valid", "Valide") : t("Expired", "Expiré");
    } else {
        tokenStatus = t("Missing", "Absent");
    }
  } catch (e) { tokenStatus = t("Invalid", "Invalide"); }

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', workspaceId],
    queryFn: async () => {
        const res: any = await api.get(`/social-accounts?workspaceId=${workspaceId}`);
        return Array.isArray(res) ? res : (res.data || []);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/social-accounts/${id}`),
    onSuccess: () => {
      toast.success(t("Account disconnected", "Compte déconnecté"));
      queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
    },
    onError: () => toast.error(t("Disconnection failed", "Échec de la déconnexion"))
  });

  const handleConnect = (platform: string, oauth: boolean) => {
    if (!oauth) {
      if (platform === 'telegram') setShowTelegramModal(true);
      return;
    }
    const freshToken = getCookie('accessToken');
    window.location.assign(`${API_URL}/social-accounts/connect/${platform}?token=${freshToken}&workspaceId=${workspaceId}`);
  };

  const handleForceRefresh = () => {
      deleteCookie('accessToken');
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
      window.location.assign('/login');
  };

  if (isLoading) return (
    <div className="space-y-12 font-sans pb-20">
      <div className="border-b-8 border-black dark:border-white pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-gray-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="h-16 w-44 bg-gray-100 dark:bg-zinc-800 border-4 border-black dark:border-white animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col p-8 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 border-4 border-black dark:border-white" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-700" />
                <div className="h-3 w-16 bg-gray-100 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="h-10 w-full bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white mb-auto" />
            <div className="mt-10 h-12 w-full bg-gray-200 dark:bg-zinc-700 border-4 border-black dark:border-white" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
    {showTelegramModal && <TelegramLinkModal workspaceId={workspaceId} onClose={() => setShowTelegramModal(false)} />}
    <div className="space-y-12 font-sans text-black dark:text-white transition-colors pb-20">

      {/* NEUBRUTALIST HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black dark:border-white pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">{t("Network Nodes", "Nœuds Réseau")}</h2>
            </div>
            <p className="font-mono text-sm font-bold opacity-60 uppercase tracking-widest">
                {t("Nodes active:", "Nœuds actifs:")} {accounts.filter((a: any) => a.isActive).length} {'//'} {t("Capacity:", "Capacité:")} {accounts.length}/UNLIMITED
            </p>
        </div>

        {/* SESSION DEBUG PANEL */}
        <div className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white p-4 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#3C48F5] flex flex-col gap-1 min-w-[180px]">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter border-b border-black/20 dark:border-white/20 pb-1 mb-1">
                <span>{t("Session Sync", "Sync Session")}</span>
                <span className={cn(tokenStatus === t("Valid", "Valide") ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>● {tokenStatus}</span>
            </div>
            {tokenExpiry && <p className="text-[9px] font-mono font-bold">{t("EXP:", "EXP:")} {format(tokenExpiry, 'HH:mm dd/MM')}</p>}
            {tokenStatus !== t("Valid", "Valide") && (
                <button onClick={handleForceRefresh} className="text-[10px] font-black uppercase bg-red-500 text-white px-2 py-1 mt-1 hover:bg-white hover:text-red-500 transition-all">{t("Emergency Reset", "Réinitialisation d'urgence")}</button>
            )}
        </div>
      </div>

      {/* NODE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PLATFORMS.map((platform) => {
          const connectedAccount = accounts.find((a: any) => a.platform.toLowerCase() === platform.id);
          const isConnected = !!connectedAccount;
          const isExpired = isConnected && !connectedAccount.isActive;

          return (
            <div
              key={platform.id}
              className={cn(
                "relative group flex flex-col p-8 border-4 border-black dark:border-white transition-all duration-300",
                isExpired
                    ? 'bg-red-500 text-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]'
                    : isConnected
                        ? 'bg-white dark:bg-black shadow-[12px_12px_0px_0px_#3C48F5]'
                        : 'bg-transparent hover:bg-white dark:hover:bg-zinc-900 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#fff]'
              )}
            >
              {/* Status Indicator */}
              {isExpired && (
                <div className="absolute top-4 right-4">
                  <div className="bg-white text-red-600 border-2 border-black px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={4} /> {t("Critical Failure", "Défaillance critique")}
                  </div>
                </div>
              )}

              {/* Platform Identity */}
              <div className="flex items-center gap-4 mb-8">
                  <div
                    className={cn(
                        "w-16 h-16 flex items-center justify-center border-4 transition-all duration-500",
                        isExpired ? 'bg-white border-black' : isConnected ? 'bg-black dark:bg-white border-black dark:border-white scale-110' : 'bg-white dark:bg-black border-black dark:border-white'
                    )}
                  >
                    <platform.icon
                        size={32}
                        className={cn(
                            "transition-colors",
                            isExpired ? "text-red-600" : isConnected ? "text-white dark:text-black" : "text-black dark:text-white"
                        )}
                    />
                  </div>
                  <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{platform.label}</h3>
                      <p className="text-[10px] font-mono font-bold uppercase opacity-50 mt-1">{t("Social Node v2", "Nœud social v2")}</p>
                  </div>
              </div>

              {/* Node Data */}
              <div className="flex-1 space-y-4">
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className={cn(
                          "px-3 py-2 border-2 border-black dark:border-white font-mono text-xs font-bold truncate",
                          isExpired ? "bg-white text-black" : "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
                      )}>
                        ID: @{connectedAccount.username}
                      </div>
                      <p className={cn("text-[10px] font-mono uppercase font-black", isExpired ? "text-white" : "text-gray-400")}>
                        {t("Established:", "Établi le:")} {format(new Date(connectedAccount.createdAt), 'yyyy.MM.dd // HH:mm')}
                      </p>
                    </div>
                  ) : (
                    <div className="h-16 flex items-center border-2 border-dashed border-black dark:border-white px-4">
                        <p className="text-[10px] font-mono font-black uppercase text-gray-400">{t("Signal Lost // No Link Detected", "Signal perdu // Aucune liaison détectée")}</p>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col gap-3">
                {isExpired ? (
                    <button
                        onClick={() => handleConnect(platform.id, platform.oauth)}
                        className="w-full py-4 bg-white text-red-600 border-4 border-black font-black text-sm uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_#000]"
                    >
                        {t("Force Reboot", "Forcer le redémarrage")}
                    </button>
                ) : isConnected ? (
                    <button
                        onClick={() => { if(confirm(t("Terminate stream connection?", "Terminer la connexion?"))) disconnectMutation.mutate(connectedAccount.id) }}
                        className="w-full py-3 border-4 border-black dark:border-white font-black text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white"
                    >
                        <Trash2 size={14} className="inline mr-2" /> {t("Disconnect", "Déconnecter")}
                    </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id, platform.oauth)}
                    className="w-full py-4 bg-[#3C48F5] text-white border-4 border-black dark:border-white font-black text-sm uppercase hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#3C48F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Plus size={16} className="inline mr-2" strokeWidth={4} /> {t("Connect", "Connecter")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
