'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { getCookie } from 'cookies-next';
import { cn } from '@/lib/utils';
import { 
  Link as LinkIcon, ExternalLink, Trash2, Check, Crown
} from 'lucide-react';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, 
  FaTiktok, FaYoutube, FaPinterestP, FaWhatsapp, FaRedditAlien 
} from 'react-icons/fa6';

interface QuickConnectSidebarProps {
  accounts: any[];
  workspaceId: string;
  refreshData: () => void;
  currentWorkspace: any;
}

export const QuickConnectSidebar = ({ accounts, workspaceId, refreshData, currentWorkspace }: QuickConnectSidebarProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const platforms = [
        { id: 'facebook', Icon: FaFacebookF, color: 'text-[#1877F2]' },
        { id: 'instagram', Icon: FaInstagram, color: 'text-[#E4405F]' },
        { id: 'twitter', Icon: FaTwitter, color: 'text-black dark:text-white' },
        { id: 'linkedin', Icon: FaLinkedinIn, color: 'text-[#0A66C2]' },
        { id: 'tiktok', Icon: FaTiktok, color: 'text-black dark:text-white' },
        { id: 'youtube', Icon: FaYoutube, color: 'text-[#FF0000]' },
        { id: 'pinterest', Icon: FaPinterestP, color: 'text-[#BD081C]' },
        { id: 'whatsapp', Icon: FaWhatsapp, color: 'text-[#25D366]' },
        { id: 'reddit', Icon: FaRedditAlien, color: 'text-[#FF4500]' },
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api';

    const handleConnect = (platform: string) => { 
        const token = getCookie('accessToken');
        window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`; 
    };

    const disconnectMutation = useMutation({ 
        mutationFn: (id: string) => api.delete(`/social-accounts/${id}`), 
        onSuccess: () => { 
            toast.success("NODE_DISCONNECTED"); 
            refreshData(); 
        }, 
        onError: () => toast.error("ERR_DISCONNECT_FAIL") 
    });

    return (
        <div className="w-16 flex flex-col items-center gap-4 py-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] h-full overflow-y-auto scrollbar-hide transition-colors">
            {/* 🚀 FREEMIUM HOOK: ACCOUNT LIMIT ICON */}
            {accounts.length >= 2 && currentWorkspace?.owner?.planType === 'FREE' && (
                <button 
                    onClick={() => router.push('/pricing')}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-black dark:border-white bg-yellow-400 animate-pulse shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] mb-2"
                    title="Upgrade to add more nodes"
                >
                    <Crown size={18} className="text-black" />
                </button>
            )}
            
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-black dark:border-white bg-black mb-2">
                <LinkIcon size={16} className="text-white" />
            </div>

            {platforms.map((p) => { 
                const connected = accounts.find((a:any) => a.platform?.toLowerCase() === p.id.toLowerCase()); 
                
                return (
                    <div key={p.id} className="relative group flex-shrink-0">
                        {connected ? (
                            <>
                                <button className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 opacity-100 cursor-default transition-colors">
                                    <p.Icon size={18} className="text-gray-400 dark:text-zinc-500" />
                                </button>
                                <button 
                                    onClick={() => { if(confirm("CONFIRM_TERMINATION?")) disconnectMutation.mutate(connected.id) }} 
                                    className="absolute inset-0 w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                    title="Disconnect"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="absolute -top-1 -right-1 pointer-events-none z-20">
                                    <div className="w-4 h-4 bg-green-500 border-2 border-black dark:border-white flex items-center justify-center text-white">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={() => handleConnect(p.id)} 
                                className="group w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-black dark:hover:bg-white cursor-pointer shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                title={`Connect ${p.id}`}
                            >
                                <p.Icon 
                                    size={18} 
                                    className={cn(p.color, "transition-colors group-hover:text-white dark:group-hover:text-black")} 
                                />
                            </button>
                        )}
                    </div>
                ); 
            })}
        </div>
    );
};
