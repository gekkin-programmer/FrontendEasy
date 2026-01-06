'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  FaTwitter, FaInstagram, FaLinkedin, FaFacebook, 
  FaTiktok, FaPinterest, FaYoutube, FaSlack, FaTelegram 
} from 'react-icons/fa6';
import { 
  FiCheck, FiPlus, FiTrash2, FiLoader, FiSettings 
} from 'react-icons/fi';

// --- CONFIGURATION ---
const PLATFORM_CONFIG: Record<string, any> = {
  facebook: { name: 'Facebook', icon: FaFacebook, color: 'text-[#1877F2]', desc: 'Groups & Pages.' },
  linkedin: { name: 'LinkedIn', icon: FaLinkedin, color: 'text-[#0077b5]', desc: 'Company pages & profiles.' },
  tiktok: { name: 'TikTok', icon: FaTiktok, color: 'text-black', desc: 'Video publishing.' },
  twitter: { name: 'X (Twitter)', icon: FaTwitter, color: 'text-black', desc: 'Post tweets & threads.' },
  instagram: { name: 'Instagram', icon: FaInstagram, color: 'text-[#E1306C]', desc: 'Photos & Reels.' },
  youtube: { name: 'YouTube', icon: FaYoutube, color: 'text-red-600', desc: 'Shorts & Videos.' },
};

export default function ConnectAccounts() {
  const params = useParams();
  const workspaceId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // --- 1. FETCH CONNECTED ACCOUNTS ---
  const fetchAccounts = async () => {
    const token = localStorage.getItem('accessToken');
    if(!token) return;

    try {
      const res = await fetch(`${API_URL}/social-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to load accounts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // --- 2. CONNECT HANDLER (Redirect) ---
  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    
    // Redirect to NestJS OAuth Endpoint
    // The backend handles the redirect to FB/LinkedIn and back to Dashboard
    window.location.href = `${API_URL}/social-accounts/connect/${platformId}`;
  };

  // --- 3. DISCONNECT HANDLER ---
  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this account? Scheduled posts may fail.')) return;

    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`${API_URL}/social-accounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success("Disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  if (loading) return (
    <div className="p-12 flex justify-center">
      <FiLoader className="animate-spin text-gray-400 w-6 h-6"/>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Connected Channels</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect your social media profiles to schedule posts and view analytics.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">
                {accounts.length} / 10 Channels Used
            </span>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(PLATFORM_CONFIG).map((key) => {
          const config = PLATFORM_CONFIG[key];
          // Find matching account (case insensitive check)
          const existingAccount = accounts.find(a => a.platform.toLowerCase() === key.toLowerCase());
          const isConnecting = connecting === key;

          return (
            <IntegrationCard 
              key={key}
              platformId={key}
              config={config}
              account={existingAccount}
              isConnecting={isConnecting}
              onConnect={() => handleConnect(key)}
              onDisconnect={() => existingAccount && handleDisconnect(existingAccount.id)}
            />
          )
        })}
      </div>
    </div>
  );
}

// --- SHARED COMPONENT ---

function IntegrationCard({ 
    platformId, config, account, isConnecting, onConnect, onDisconnect 
}: any) {
  const isConnected = !!account;
  const Icon = config.icon;

  return (
    <div className={`
        relative group flex flex-col justify-between p-5 rounded-lg border transition-all duration-200
        ${isConnected ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg border bg-white shadow-sm text-xl ${config.color} border-gray-100`}>
          <Icon />
        </div>
        {isConnected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                <FiCheck size={10} /> Connected
            </span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900">{config.name}</h3>
        {isConnected ? (
            <p className="text-xs font-mono text-gray-600 mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded truncate max-w-full">
                {account.username || account.platformUsername}
            </p>
        ) : (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {config.desc}
            </p>
        )}
      </div>

      <div className="mt-auto">
        {isConnected ? (
           <div className="flex gap-2">
               <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <FiSettings size={12} /> Configure
               </button>
               <button 
                  onClick={onDisconnect}
                  className="px-3 py-2 text-gray-400 hover:text-red-600 border border-transparent hover:bg-red-50 rounded-md transition-colors"
                >
                  <FiTrash2 size={14} />
               </button>
           </div>
        ) : (
            <button 
                onClick={onConnect}
                disabled={isConnecting}
                className="w-full px-3 py-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isConnecting ? <FiLoader className="animate-spin" /> : <FiPlus />}
                {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
        )}
      </div>
    </div>
  );
}