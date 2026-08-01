'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppToast } from '@/hooks/useAppToast';
import { api } from '@/lib/api';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaTelegram, FaThreads
} from 'react-icons/fa6';
import { FaWhatsapp } from 'react-icons/fa';
import { Check, Plus, Trash2, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Zap, Copy, X } from 'lucide-react';
import { format } from 'date-fns';
import SpinningLoader from '@/components/common/SpinningLoader';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/LanguageContext';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
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
  const toast = useAppToast();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#333333]/20 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#26A5E4] flex items-center justify-center">
              <FaTelegram size={18} className="text-white" />
            </div>
            <h3 className="font-bold text-lg text-[#040028] dark:text-white">{t("Connect Telegram", "Connecter Telegram")}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors text-[#040028] dark:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Instructions */}
        <ol className="space-y-3 text-sm font-medium">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#174CD2] text-white flex items-center justify-center text-xs font-semibold">1</span>
            <span className="text-[#040028] dark:text-white">{t("Open Telegram and search for", "Ouvrez Telegram et recherchez")} <span className="bg-[#F5F7FA] dark:bg-white/10 px-1.5 py-0.5 rounded-[6px]">@Eazy_Post_bot</span></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#174CD2] text-white flex items-center justify-center text-xs font-semibold">2</span>
            <span className="text-[#040028] dark:text-white">{t("Generate your link token below", "Générez votre jeton de liaison ci-dessous")}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#174CD2] text-white flex items-center justify-center text-xs font-semibold">3</span>
            <span className="text-[#040028] dark:text-white">{t("Send the copied command to the bot", "Envoyez la commande copiée au bot")}</span>
          </li>
        </ol>

        {/* Token area */}
        {!linkToken ? (
          <button
            onClick={() => void generate()}
            disabled={loading}
            className="w-full py-3 rounded-[10px] bg-[#26A5E4] text-white font-semibold text-sm hover:brightness-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="inline animate-spin mr-2" /> : null}
            {loading ? t('Generating...', 'Génération en cours...') : t('Generate link token', 'Générer le jeton de liaison')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#8E8E8E]">{t("Token expires in 15 minutes", "Le jeton expire dans 15 minutes")}</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#F5F7FA] dark:bg-white/5 rounded-[10px] px-4 py-3 text-sm font-semibold text-[#040028] dark:text-white truncate">
                /link {linkToken}
              </div>
              <button
                onClick={copy}
                className="px-4 rounded-[10px] bg-[#174CD2] text-white hover:bg-[#123a9e] transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs font-medium text-[#8E8E8E]">
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
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [waConnecting, setWaConnecting] = useState(false);
  const waSignupDataRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

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

  const { data: waStatus } = useQuery({
    queryKey: ['whatsapp-status', workspaceId],
    queryFn: async () => {
      const res: any = await api.get(`/whatsapp/status?workspaceId=${workspaceId}`);
      return res.data ?? res;
    },
  });

  const waDisconnectMutation = useMutation({
    mutationFn: () => api.delete(`/whatsapp/disconnect?workspaceId=${workspaceId}`),
    onSuccess: () => {
      toast.success(t('WhatsApp disconnected', 'WhatsApp déconnecté'));
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', workspaceId] });
    },
  });

  const handleWhatsappLoginResponse = async (response: any) => {
    if (!response.authResponse) {
      // CANCEL/ERROR feedback is handled by the postMessage listener above.
      setWaConnecting(false);
      return;
    }
    const { wabaId, phoneNumberId } = waSignupDataRef.current;
    if (!wabaId || !phoneNumberId) {
      // FINISH never arrived on the message channel.
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
    } catch (err: any) {
      toast.error(err?.message || t('WhatsApp connection failed', 'Connexion WhatsApp échouée'));
    }
    setWaConnecting(false);
  };

  const connectWhatsApp = () => {
    setWaConnecting(true);
    waSignupDataRef.current = {};
    // Meta Embedded Signup — launches the FB SDK dialog
    if (typeof window === 'undefined' || !(window as any).FB) {
      toast.error(t('Meta SDK not loaded — please refresh', 'SDK Meta non chargé — actualisez la page'));
      setWaConnecting(false);
      return;
    }
    // FB.login's own type-checking rejects an async function as the callback
    // ("Expression is of type asyncfunction, not function") and throws before
    // ever opening the popup — so this must stay a plain sync function that
    // fires the async handler without being async itself.
    (window as any).FB.login(
      (response: any) => {
        void handleWhatsappLoginResponse(response);
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

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/social-accounts/${id}`),
    onSuccess: () => {
      toast.success(t("Account disconnected", "Compte déconnecté"));
      queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
    },
    onError: () => toast.error(t("Disconnection failed", "Échec de la déconnexion"))
  });

  const handleConnect = (platform: string, oauth: boolean, reauth = false) => {
    if (!oauth) {
      if (platform === 'telegram') setShowTelegramModal(true);
      return;
    }
    const freshToken = getCookie('accessToken');
    const reauthParam = reauth ? '&reauth=true' : '';
    window.location.assign(`${API_URL}/social-accounts/connect/${platform}?token=${freshToken}&workspaceId=${workspaceId}${reauthParam}`);
  };

  const handleForceRefresh = () => {
      deleteCookie('accessToken');
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
      window.location.assign('/login');
  };

  if (isLoading) return (
    <div className="space-y-12 font-sans pb-20">
      <div className="border-b border-black/5 dark:border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-[8px] bg-[#F5F7FA] dark:bg-white/10 animate-pulse" />
          <div className="h-4 w-72 rounded-[6px] bg-[#F5F7FA] dark:bg-white/5 animate-pulse" />
        </div>
        <div className="h-16 w-44 rounded-[14px] bg-[#F5F7FA] dark:bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col p-8 rounded-[16px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-[14px] bg-[#F5F7FA] dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-5 w-24 rounded-[6px] bg-[#F5F7FA] dark:bg-white/10" />
                <div className="h-3 w-16 rounded-[4px] bg-[#F5F7FA] dark:bg-white/5" />
              </div>
            </div>
            <div className="h-10 w-full rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 mb-auto" />
            <div className="mt-10 h-12 w-full rounded-[10px] bg-[#F5F7FA] dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
    {showTelegramModal && <TelegramLinkModal workspaceId={workspaceId} onClose={() => setShowTelegramModal(false)} />}
    <div className="space-y-12 font-sans text-[#040028] dark:text-white transition-colors pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[#040028] dark:text-white">{t("Connected accounts", "Comptes connectés")}</h2>
            </div>
            <p className="text-sm font-medium text-[#8E8E8E]">
                {t("Active:", "Actifs:")} {accounts.filter((a: any) => a.isActive).length} · {t("Total:", "Total:")} {accounts.length}
            </p>
        </div>

        {/* SESSION STATUS PANEL */}
        <div className="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white p-4 rounded-[14px] border border-black/5 dark:border-white/5 flex flex-col gap-1 min-w-[180px]">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide border-b border-black/5 dark:border-white/5 pb-1 mb-1 text-[#8E8E8E]">
                <span>{t("Session sync", "Sync session")}</span>
                <span className={cn(tokenStatus === t("Valid", "Valide") ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>● {tokenStatus}</span>
            </div>
            {tokenExpiry && <p className="text-[10px] font-medium text-[#8E8E8E]">{t("Exp:", "Exp:")} {format(tokenExpiry, 'HH:mm dd/MM')}</p>}
            {tokenStatus !== t("Valid", "Valide") && (
                <button onClick={handleForceRefresh} className="text-[10px] font-semibold uppercase rounded-full bg-red-600 text-white px-2.5 py-1 mt-1 hover:bg-red-700 transition-all">{t("Emergency reset", "Réinitialisation d'urgence")}</button>
            )}
        </div>
      </div>

      {/* PLATFORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const connectedAccount = accounts.find((a: any) => a.platform.toLowerCase() === platform.id);
          const isConnected = !!connectedAccount;
          const isExpired = isConnected && !connectedAccount.isActive;

          return (
            <div
              key={platform.id}
              className={cn(
                "relative group flex flex-col p-6 rounded-[16px] border transition-all duration-300",
                isExpired
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    : isConnected
                        ? 'bg-white dark:bg-[#0A0A2E] border-black/5 dark:border-white/5'
                        : 'bg-transparent border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#0A0A2E]'
              )}
            >
              {/* Status Indicator */}
              {isExpired && (
                <div className="absolute top-4 right-4">
                  <div className="bg-white dark:bg-[#0A0A2E] text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={2.5} /> {t("Reauthorization needed", "Réautorisation requise")}
                  </div>
                </div>
              )}

              {/* Platform Identity */}
              <div className="flex items-center gap-4 mb-6">
                  <div
                    className={cn(
                        "w-14 h-14 flex items-center justify-center rounded-[14px] transition-all duration-500",
                        isExpired ? 'bg-white dark:bg-white/10' : isConnected ? 'bg-[#174CD2]/10' : 'bg-[#F5F7FA] dark:bg-white/5'
                    )}
                  >
                    <platform.icon
                        size={26}
                        className={cn(
                            "transition-colors",
                            isExpired ? "text-red-500" : isConnected ? "text-[#174CD2]" : "text-[#8E8E8E]"
                        )}
                    />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-[#040028] dark:text-white leading-none">{platform.label}</h3>
                  </div>
              </div>

              {/* Account Data */}
              <div className="flex-1 space-y-3">
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-sm font-medium text-[#040028] dark:text-white truncate">
                        @{connectedAccount.username}
                      </div>
                      <p className="text-xs font-medium text-[#8E8E8E]">
                        {t("Connected on", "Connecté le")} {format(new Date(connectedAccount.createdAt), 'dd/MM/yyyy · HH:mm')}
                      </p>
                    </div>
                  ) : (
                    <div className="h-12 flex items-center px-4">
                        <p className="text-xs font-medium text-[#8E8E8E]">{t("Not connected", "Non connecté")}</p>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                {isExpired ? (
                    <button
                        onClick={() => handleConnect(platform.id, platform.oauth)}
                        className="w-full py-2.5 rounded-[10px] bg-white dark:bg-[#0A0A2E] text-red-600 dark:text-red-400 font-semibold text-sm border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                        {t("Reconnect", "Reconnecter")}
                    </button>
                ) : isConnected ? (
                  <>
                    <button
                        onClick={() => { if(confirm(t("Disconnect this account?", "Déconnecter ce compte?"))) disconnectMutation.mutate(connectedAccount.id) }}
                        className="w-full py-2.5 rounded-[10px] font-semibold text-sm bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={14} className="inline mr-2" /> {t("Disconnect", "Déconnecter")}
                    </button>
                    {platform.oauth && (
                      <button
                          onClick={() => handleConnect(platform.id, platform.oauth, true)}
                          className="w-full py-2 font-medium text-xs text-[#8E8E8E] hover:text-[#174CD2] transition-colors"
                      >
                          {t("Reconnect with fresh consent", "Reconnecter avec un nouveau consentement")}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id, platform.oauth)}
                    className="w-full py-2.5 rounded-[10px] bg-[#174CD2] text-white font-semibold text-sm hover:bg-[#123a9e] transition-all"
                  >
                    <Plus size={16} className="inline mr-2" strokeWidth={2.5} /> {t("Connect", "Connecter")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Business Messaging ─────────────────────────────────────────────── */}
      <div className="border-t border-black/5 dark:border-white/5 pt-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#040028] dark:text-white">{t("Business messaging", "Messagerie Business")}</h3>
          <p className="text-sm font-medium text-[#8E8E8E]">{t("Direct messaging channels", "Canaux de messagerie directe")}</p>
        </div>

        {/* WhatsApp Card */}
        <div className={cn(
          "relative flex flex-col p-6 rounded-[16px] border transition-all duration-300 max-w-sm",
          waStatus?.connected
            ? 'bg-white dark:bg-[#0A0A2E] border-black/5 dark:border-white/5'
            : 'bg-transparent border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#0A0A2E]'
        )}>
          {/* Identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-14 h-14 flex items-center justify-center rounded-[14px] transition-all duration-500",
              waStatus?.connected ? 'bg-[#174CD2]/10' : 'bg-[#F5F7FA] dark:bg-white/5'
            )}>
              <FaWhatsapp size={26} className={cn("transition-colors", waStatus?.connected ? "text-[#174CD2]" : "text-[#8E8E8E]")} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#040028] dark:text-white leading-none">WhatsApp</h3>
              <p className="text-xs font-medium text-[#8E8E8E] mt-1">
                {waStatus?.connected ? t("Business API", "API Business") : t("Not connected", "Non connecté")}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            {waStatus?.connected ? (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-sm font-medium text-[#040028] dark:text-white truncate">
                  {waStatus.phoneNumber}
                </div>
                {waStatus.displayName && (
                  <p className="text-xs font-medium text-[#8E8E8E]">{waStatus.displayName}</p>
                )}
              </div>
            ) : (
              <div className="h-12 flex items-center px-4">
                <p className="text-xs font-medium text-[#8E8E8E]">{t("Connect your WhatsApp Business account", "Connectez votre compte WhatsApp Business")}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            {waStatus?.connected ? (
              <button
                onClick={() => { if (confirm(t("Disconnect WhatsApp?", "Déconnecter WhatsApp?"))) waDisconnectMutation.mutate(); }}
                className="w-full py-2.5 rounded-[10px] font-semibold text-sm bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} className="inline mr-2" /> {t("Disconnect", "Déconnecter")}
              </button>
            ) : (
              <button
                onClick={connectWhatsApp}
                disabled={waConnecting}
                className="w-full py-2.5 rounded-[10px] bg-[#174CD2] text-white font-semibold text-sm hover:bg-[#123a9e] transition-all disabled:opacity-50"
              >
                {waConnecting ? <Loader2 size={16} className="inline animate-spin mr-2" /> : <FaWhatsapp size={16} className="inline mr-2" />}
                {waConnecting ? t('Connecting...', 'Connexion...') : t('Connect via Meta', 'Connecter via Meta')}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
