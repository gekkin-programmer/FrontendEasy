
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Loader2, Plus } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa6';
import { NeuModal } from './DashboardUI';

interface FacebookPageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: any) => void;
  exchangeToken: string;
}

export const FacebookPageSelector = ({ isOpen, onClose, onAccountConnected, exchangeToken }: FacebookPageSelectorProps) => {
    const [pages, setPages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsLoading(true), 0);
            let endpoint = '/social-accounts/facebook/pages';
            if (exchangeToken) endpoint += `?exchange_token=${encodeURIComponent(exchangeToken)}`;
            
            api.get<any>(endpoint)
                .then(res => {
                    const list = Array.isArray(res.data) ? res.data : [];
                    setPages(list);
                })
                .catch(() => toast.error("FB_FETCH_FAILED"))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, exchangeToken]);

    const selectMutation = useMutation({
        mutationFn: (page: any) => api.post<any>('/social-accounts/facebook/pages/select', {
            pageId: page.id, pageName: page.name, pageAccessToken: page.access_token, exchangeToken
        }),
        onSuccess: (res, variables) => {
            toast.success(`CONNECTED: ${variables.name}`);
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
        onError: () => toast.error("CONNECTION_FAILED")
    });

    return (
        <NeuModal title="SELECT_ENTITY" isOpen={isOpen} onClose={onClose}>
            {isLoading ? (
                <div className="p-8 flex justify-center flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#3C48F5]" size={32} />
                    <span className="text-xs font-bold animate-pulse uppercase tracking-widest text-black dark:text-white">Connecting_To_Graph_API...</span>
                </div>
            ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {pages.length === 0 && (
                        <div className="p-6 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 text-center text-xs font-mono font-bold uppercase text-black dark:text-white">
                            NO_ENTITIES_FOUND.<br/><span className="opacity-50 mt-2 block">Did you uncheck pages in the popup?</span>
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
