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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { id: 'twitter', label: 'Twitter (X)', icon: FaTwitter, color: '#000000' },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, color: '#0077B5' },
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
  { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
];

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
    const token = localStorage.getItem('accessToken');
    // Redirect to backend OAuth initiation
    window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${token}&workspaceId=${workspaceId}`;
  };

  if (isLoading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
      <p className="font-mono text-xs font-bold uppercase">SCANNING_CONNECTIONS...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Network Nodes</h2>
        <p className="font-mono text-xs mt-2 text-gray-500 font-bold">
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
                relative p-6 border-4 border-black transition-all
                ${isExpired 
                    ? 'bg-red-50 border-red-600' // ➤ Red state for expired
                    : isConnected 
                        ? 'bg-white shadow-[8px_8px_0px_0px_#000]' 
                        : 'bg-gray-50 hover:bg-white hover:shadow-[8px_8px_0px_0px_#000]'
                }
              `}
            >
              {/* Status Badge */}
              <div className="absolute top-0 right-0 p-2">
                {isExpired ? (
                   // ➤ EXPIRED BADGE
                   <div className="bg-red-600 text-white border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                     <AlertTriangle size={10} strokeWidth={4} /> BROKEN LINK
                   </div>
                ) : isConnected ? (
                  <div className="bg-green-400 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1">
                    <Check size={10} strokeWidth={4} /> LINKED
                  </div>
                ) : (
                  <div className="bg-gray-200 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase text-gray-500">
                    OFFLINE
                  </div>
                )}
              </div>

              {/* Icon */}
              <div 
                className={`w-12 h-12 flex items-center justify-center border-2 mb-4 shadow-[4px_4px_0px_0px_#000] ${isExpired ? 'border-red-600' : 'border-black'}`}
                style={{ backgroundColor: isConnected ? platform.color : '#fff', color: isConnected ? '#fff' : '#000' }}
              >
                <platform.icon size={24} />
              </div>

              {/* Info */}
              <h3 className={`font-black text-lg uppercase mb-1 ${isExpired ? 'text-red-700' : 'text-black'}`}>
                  {platform.label}
              </h3>
              
              {isConnected ? (
                <div className="space-y-1 mb-6">
                  <p className="font-mono text-xs bg-yellow-300 inline-block px-1 border border-black truncate max-w-full">
                    @{connectedAccount.username}
                  </p>
                  <p className="text-[9px] font-mono text-gray-400 uppercase">
                    LINKED: {format(new Date(connectedAccount.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              ) : (
                <p className="font-mono text-xs text-gray-400 mb-6">
                  NO_SIGNAL
                </p>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                
                {/* ➤ RECONNECT BUTTON (Only if expired) */}
                {isExpired && (
                    <button 
                        onClick={() => handleConnect(platform.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white border-2 border-black font-black text-xs uppercase hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
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
                            className="w-full py-1 text-[8px] font-bold border border-dashed border-red-300 text-red-400 hover:bg-red-50 uppercase"
                        >
                            Force Expire (Debug)
                        </button>
                    )}
                    <button 
                        onClick={() => { if(confirm("ABORT CONNECTION?")) disconnectMutation.mutate(connectedAccount.id) }}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <Trash2 size={14} /> {isExpired ? 'REMOVE NODE' : 'Disconnect'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnect(platform.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white border-2 border-black font-black text-xs uppercase hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
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