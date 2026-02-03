'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube 
} from 'react-icons/fa';
import { Check, Plus, Trash2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'; 
import { format } from 'date-fns';
import SpinningLoader from '../SpinningLoader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { id: 'twitter', label: 'Twitter (X)', icon: FaTwitter, color: '#000000' },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, color: '#0077B5' },
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
  { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
];

import { getCookie } from 'cookies-next';

// ... imports

export default function ConnectAccounts({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();

  // 🟢 1. FETCH ACCOUNTS (Consistent with Dashboard logic)
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', workspaceId],
    queryFn: async () => {
        // Handle unwrapped array or axios object
        const res: any = await api.get('/social-accounts');
        return Array.isArray(res) ? res : (res.data || []);
    },
  });

  // 🟢 2. DISCONNECT MUTATION
  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/social-accounts/${id}`),
    onSuccess: () => {
      toast.success("CONNECTION_TERMINATED");
      queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }); 
    },
    onError: () => toast.error("ERR_DISCONNECT_FAILED")
  });

  const handleConnect = (platform: string) => {
    const token = getCookie('accessToken'); // ➤ FIX: Use cookie instead of localStorage
    // Redirect to backend OAuth initiation
    window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`;
  };

  if (isLoading) return <SpinningLoader fullScreen={false} />;

  return (
    <div className="space-y-8 font-sans text-black dark:text-white transition-colors">
      {/* Header */}
      <div className="border-b-4 border-black dark:border-white pb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Network Nodes</h2>
        <p className="font-mono text-xs mt-2 text-gray-500 dark:text-zinc-400 font-bold uppercase">
          STATUS: {accounts.filter((a: any) => a.isActive).length} ACTIVE / {accounts.length} TOTAL
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const connectedAccount = accounts.find((a: any) => a.platform.toLowerCase() === platform.id);
          const isConnected = !!connectedAccount;
          const isExpired = isConnected && !connectedAccount.isActive; // ➤ Check Expiry

          return (
            <div 
              key={platform.id}
              className={`
                relative p-6 border-4 border-black dark:border-white transition-all
                ${isExpired 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-600 dark:border-red-500' // ➤ Red state for expired
                    : isConnected 
                        ? 'bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]' 
                        : 'bg-gray-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#fff]'
                }
              `}
            >
              {/* Status Badge */}
              <div className="absolute top-0 right-0 p-2">
                {isExpired ? (
                   // ➤ EXPIRED BADGE
                   <div className="bg-red-600 text-white border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                     <AlertTriangle size={10} strokeWidth={4} /> BROKEN LINK
                   </div>
                ) : isConnected ? (
                  <div className="bg-green-400 text-black border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1">
                    <Check size={10} strokeWidth={4} /> LINKED
                  </div>
                ) : (
                  <div className="bg-gray-200 dark:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400">
                    OFFLINE
                  </div>
                )}
              </div>

              {/* Icon */}
              <div 
                className={`w-12 h-12 flex items-center justify-center border-2 mb-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all ${isExpired ? 'border-red-600 dark:border-red-500' : 'border-black dark:border-white'}`}
                style={{ backgroundColor: isConnected ? platform.color : 'transparent' }}
              >
                <platform.icon size={24} className={isConnected ? "text-white" : "text-black dark:text-white"} />
              </div>

              {/* Info */}
              <h3 className={`font-black text-lg uppercase mb-1 ${isExpired ? 'text-red-700 dark:text-red-400' : 'text-black dark:text-white'}`}>
                  {platform.label}
              </h3>
              
              {isConnected ? (
                <div className="space-y-1 mb-6">
                  <p className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 inline-block px-1 border border-black dark:border-white truncate max-w-full">
                    @{connectedAccount.username}
                  </p>
                  <p className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 uppercase">
                    LINKED: {format(new Date(connectedAccount.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              ) : (
                <p className="font-mono text-xs text-gray-400 dark:text-zinc-500 mb-6 uppercase">
                  NO_SIGNAL
                </p>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                
                {/* ➤ RECONNECT BUTTON (Only if expired) */}
                {isExpired && (
                    <button 
                        onClick={() => handleConnect(platform.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white border-2 border-black dark:border-white font-black text-xs uppercase hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <RefreshCw size={14} strokeWidth={3} /> RECONNECT NOW
                    </button>
                )}

                {/* DISCONNECT / CONNECT BUTTON */}
                {isConnected ? (
                  <div className="flex flex-col gap-2">
                    {process.env.NEXT_PUBLIC_ENV !== 'production' && (
                        <button 
                            onClick={async () => {
                                const token = localStorage.getItem('accessToken');
                                await fetch(`${API_URL}/social-accounts/${connectedAccount.id}/expire`, {
                                    method: 'PATCH',
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
                                toast.warning("TOKEN_EXPIRED_BY_TESTER");
                            }}
                            className="w-full py-1 text-[8px] font-bold border border-dashed border-red-300 dark:border-red-800 text-red-400 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 uppercase transition-colors"
                        >
                            Force Expire (Debug)
                        </button>
                    )}
                    <button 
                        onClick={() => { if(confirm("ABORT CONNECTION?")) disconnectMutation.mutate(connectedAccount.id) }}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black dark:border-white font-black text-xs uppercase hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors text-black dark:text-white"
                    >
                        <Trash2 size={14} /> {isExpired ? 'REMOVE NODE' : 'Disconnect'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnect(platform.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black text-xs uppercase hover:bg-white dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <Plus size={14} strokeWidth={3} /> Initialize
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}