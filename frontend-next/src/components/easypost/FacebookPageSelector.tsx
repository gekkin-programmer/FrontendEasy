
'use client';

import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { Loader2, Plus } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa6';
import { NeuModal } from './DashboardUI';
import { useLanguage } from '@/src/context/LanguageContext';

interface FacebookPageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: any) => void;
  exchangeToken: string;
}

export const FacebookPageSelector = ({ isOpen, onClose, onAccountConnected, exchangeToken }: FacebookPageSelectorProps) => {
    const { t } = useLanguage();

    const { data: pages = [], isLoading } = useQuery<any[]>({
        queryKey: ['facebook-pages', exchangeToken],
        queryFn: async () => {
            let endpoint = '/social-accounts/facebook/pages';
            if (exchangeToken) endpoint += `?exchange_token=${encodeURIComponent(exchangeToken)}`;
            try {
                const res = await api.get<any>(endpoint);
                return Array.isArray(res.data) ? res.data : [];
            } catch {
                toast.error(t("Failed to fetch Facebook pages", "Échec de la récupération des pages Facebook"));
                return [];
            }
        },
        enabled: isOpen,
    });

    const selectMutation = useMutation({
        mutationFn: (page: any) => api.post<any>('/social-accounts/facebook/pages/select', {
            pageId: page.id, pageName: page.name, pageAccessToken: page.access_token, exchangeToken
        }),
        onSuccess: (res, variables) => {
            toast.success(t(`Connected: ${variables.name}`, `Connecté : ${variables.name}`));
            if (onAccountConnected) {
                const optimisticAccount = {
                    id: res.data?.id || `temp-${Date.now()}`,
                    username: variables.name,
                    platform: 'FACEBOOK',
                    avatar: `https://graph.facebook.com/${variables.id}/picture`
                };
                onAccountConnected(optimisticAccount);
            }
            onClose();
        },
        onError: () => toast.error(t("Connection failed", "Échec de la connexion"))
    });

    return (
        <NeuModal title={t("SELECT PAGE", "CHOISIR UNE PAGE")} isOpen={isOpen} onClose={onClose}>
            {isLoading ? (
                <div className="p-8 flex justify-center flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-black dark:text-white" size={32} />
                    <span className="text-xs font-bold animate-pulse uppercase tracking-widest text-black dark:text-white">{t("Connecting to Graph API...", "Connexion à l'API Graph...")}</span>
                </div>
            ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {pages.length === 0 && (
                        <div className="p-6 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 text-center text-xs font-mono font-bold uppercase text-black dark:text-white">
                            {t("NO PAGES FOUND.", "AUCUNE PAGE TROUVÉE.")}<br/><span className="opacity-50 mt-2 block">{t("Did you uncheck pages in the popup?", "Avez-vous décoché des pages dans la fenêtre?")}</span>
                        </div>
                    )}
                    {pages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => selectMutation.mutate(page)}
                            className="w-full flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-yellow-100 dark:hover:bg-yellow-600 transition-all text-left group shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
                        >
                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center border-2 border-black dark:border-white group-hover:scale-110 transition-transform">
                                <FaFacebookF size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-sm uppercase text-black dark:text-white">{page.name}</p>
                                <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">UID: {page.id}</p>
                            </div>
                            <Plus size={16} className="text-black dark:text-white" />
                        </button>
                    ))}
                </div>
            )}
        </NeuModal>
    );
};
