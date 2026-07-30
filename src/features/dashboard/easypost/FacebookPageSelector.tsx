
'use client';

import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppToast } from '@/hooks/useAppToast';
import { api } from '@/lib/api';
import { Loader2, Plus } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa6';
import { NeuModal } from './DashboardUI';
import { useLanguage } from '@/context/LanguageContext';

interface FacebookPageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: any) => void;
  exchangeToken: string;
}

export const FacebookPageSelector = ({ isOpen, onClose, onAccountConnected, exchangeToken }: FacebookPageSelectorProps) => {
    const { t } = useLanguage();
    const toast = useAppToast();

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
        <NeuModal title={t("Select page", "Choisir une page")} isOpen={isOpen} onClose={onClose}>
            {isLoading ? (
                <div className="p-8 flex justify-center flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#174CD2]" size={32} />
                    <span className="text-sm font-medium animate-pulse text-[#8E8E8E]">{t("Connecting to Graph API...", "Connexion à l'API Graph...")}</span>
                </div>
            ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {pages.length === 0 && (
                        <div className="p-6 rounded-[12px] bg-[#F5F7FA] dark:bg-white/5 text-center text-sm font-medium text-[#8E8E8E]">
                            {t("No pages found.", "Aucune page trouvée.")}<br/><span className="mt-2 block">{t("Did you uncheck pages in the popup?", "Avez-vous décoché des pages dans la fenêtre?")}</span>
                        </div>
                    )}
                    {pages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => selectMutation.mutate(page)}
                            className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 hover:border-[#174CD2]/30 hover:bg-[#174CD2]/5 transition-all text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaFacebookF size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-[#040028] dark:text-white">{page.name}</p>
                                <p className="text-xs text-[#8E8E8E]">ID: {page.id}</p>
                            </div>
                            <Plus size={16} className="text-[#8E8E8E]" />
                        </button>
                    ))}
                </div>
            )}
        </NeuModal>
    );
};
