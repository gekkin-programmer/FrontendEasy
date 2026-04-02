'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube 
} from 'react-icons/fa';
import { Check, Plus, Trash2, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'; 
import { format } from 'date-fns';
import SpinningLoader from '../SpinningLoader';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { cn } from "@/lib/utils";

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
  const token = getCookie('accessToken');
  let tokenStatus = "Unknown";
  let tokenExpiry = null;

  try {
    if (token) {
        const decoded: any = jwtDecode(token as string);
        tokenExpiry = new Date(decoded.exp * 1000);
        tokenStatus = tokenExpiry > new Date() ? "Valid" : "Expired";
    } else {
        tokenStatus = "Missing";
    }
  } catch (e) { tokenStatus = "Invalid"; }

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
      toast.success("NODE_DECOMMISSIONED");
      queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
    },
    onError: () => toast.error("ERR_TERMINATION_FAILED")
  });

  const handleConnect = (platform: string) => {
    const freshToken = getCookie('accessToken');
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = `${API_URL}/social-accounts/connect/${platform}?token=${freshToken}&workspaceId=${workspaceId}`;
  };

  const handleForceRefresh = () => {
      deleteCookie('accessToken');
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
      window.location.href = '/login';
  };

  if (isLoading) return <SpinningLoader fullScreen={false} />;

  return (
    <div className="space-y-12 font-sans text-black dark:text-white transition-colors pb-20">
      
      {/* 🟢 MINIMAL NEUBRUTALIST HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black dark:border-white pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3C48F5] border-4 border-black dark:border-white flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <ShieldCheck size={24} strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Network_Nodes</h2>
            </div>
            <p className="font-mono text-sm font-bold opacity-60 uppercase tracking-widest">
                Nodes active: {accounts.filter((a: any) => a.isActive).length} {'// Capacity:'} {accounts.length}/UNLIMITED
            </p>
        </div>
        
        {/* DISCRETE DEBUG PANEL */}
        <div className="bg-black dark:bg-white text-white dark:text-black p-4 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#3C48F5] flex flex-col gap-1 min-w-[180px]">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter border-b border-white/20 dark:border-black/20 pb-1 mb-1">
                <span>Session_Sync</span>
                <span className={cn(tokenStatus === 'Valid' ? 'text-green-400 dark:text-green-600' : 'text-red-400')}>● {tokenStatus}</span>
            </div>
            {tokenExpiry && <p className="text-[9px] font-mono font-bold">EXP: {format(tokenExpiry, 'HH:mm dd/MM')}</p>}
            {tokenStatus !== 'Valid' && (
                <button onClick={handleForceRefresh} className="text-[10px] font-black uppercase bg-red-500 text-white px-2 py-1 mt-1 hover:bg-white hover:text-red-500 transition-all">Emergency_Reset</button>
            )}
        </div>
      </div>

      {/* 🟢 NODE GRID */}
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
              <div className="absolute top-4 right-4">
                {isExpired ? (
                   <div className="bg-white text-red-600 border-2 border-black px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1 animate-bounce">
                     <AlertTriangle size={12} strokeWidth={4} /> Critical_Failure
                   </div>
                ) : isConnected ? (
                  <div className="bg-[#3C48F5] text-white border-2 border-black dark:border-white px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1">
                    <Zap size={12} fill="currentColor" /> Stream_Active
                  </div>
                ) : null}
              </div>

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
                      <p className="text-[10px] font-mono font-bold uppercase opacity-50 mt-1">Social_Node_v2</p>
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
                        Established: {format(new Date(connectedAccount.createdAt), 'yyyy.MM.dd // HH:mm')}
                      </p>
                    </div>
                  ) : (
                    <div className="h-16 flex items-center border-2 border-dashed border-black dark:border-white px-4">
                        <p className="text-[10px] font-mono font-black uppercase text-gray-400">Signal_Lost // No_Link_Detected</p>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col gap-3">
                {isExpired ? (
                    <button 
                        onClick={() => handleConnect(platform.id)}
                        className="w-full py-4 bg-white text-red-600 border-4 border-black font-black text-sm uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_#000]"
                    >
                        Force_Reboot
                    </button>
                ) : isConnected ? (
                    <button 
                        onClick={() => { if(confirm("Terminate stream connection?")) disconnectMutation.mutate(connectedAccount.id) }}
                        className="w-full py-3 border-4 border-black dark:border-white font-black text-xs uppercase hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors bg-white dark:bg-black text-black dark:text-white"
                    >
                        <Trash2 size={14} className="inline mr-2" /> Disconnect_Node
                    </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(platform.id)}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white font-black text-sm uppercase hover:bg-[#3C48F5] hover:text-white transition-all shadow-[6px_6px_0px_0px_#3C48F5] dark:shadow-[6px_6px_0px_0px_#3C48F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Plus size={16} className="inline mr-2" strokeWidth={4} /> Initialize_Stream
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