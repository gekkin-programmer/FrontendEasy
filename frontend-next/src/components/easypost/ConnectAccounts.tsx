'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api"; 
import { Id } from "@/convex/_generated/dataModel";
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
  twitter: { name: 'X (Twitter)', icon: FaTwitter, color: 'text-black', desc: 'Post tweets & threads.' },
  linkedin: { name: 'LinkedIn', icon: FaLinkedin, color: 'text-[#0077b5]', desc: 'Company pages & profiles.' },
  instagram: { name: 'Instagram', icon: FaInstagram, color: 'text-[#E1306C]', desc: 'Photos & Reels.' },
  facebook: { name: 'Facebook', icon: FaFacebook, color: 'text-[#1877F2]', desc: 'Groups & Pages.' },
  telegram: { name: 'Telegram', icon: FaTelegram, color: 'text-[#229ED9]', desc: 'Channels & Groups.' },
  tiktok: { name: 'TikTok', icon: FaTiktok, color: 'text-black', desc: 'Video publishing.' },
  youtube: { name: 'YouTube', icon: FaYoutube, color: 'text-red-600', desc: 'Shorts & Videos.' },
};

const BOT_USERNAME = "EasyPost_Dev_Bot"; 

// Declare FB for TypeScript
declare global {
  interface Window {
    FB: any;
  }
}

export default function ConnectAccounts() {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  // --- CONVEX HOOKS ---
  const accounts = useQuery(api.accounts.getByWorkspace, { workspaceId });
  const disconnect = useMutation(api.accounts.disconnect);
  const saveAccount = useMutation(api.accounts.saveAccount); 
  const getAuthUrl = useAction(api.auth.getAuthUrl);
  const connectMock = useMutation(api.accounts.mockConnect);

  const [connecting, setConnecting] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleFacebookConnect = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded. Refreshing...");
      return;
    }

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const userToken = response.authResponse.accessToken;

        // Fetch pages managed by the user
        window.FB.api('/me/accounts', { access_token: userToken }, (res: any) => {
          if (res.data && res.data.length > 0) {
            // Auto-select the first page (EasyPost)
            const page = res.data[0]; 

            saveAccount({
              workspaceId,
              platform: "facebook",
              platformAccountId: page.id,        // REAL API ID: 8428...
              platformUsername: page.name,       // "EasyPost"
              accessToken: page.access_token,    // PERMANENT PAGE TOKEN
              avatarUrl: `https://graph.facebook.com/${page.id}/picture?type=normal`
            }).then(() => {
              toast.success(`Connected to ${page.name}!`);
              setConnecting(null);
            }).catch((err) => {
              toast.error("Failed to save account to database.");
              console.error(err);
              setConnecting(null);
            });
          } else {
            toast.error("No Facebook Pages found. Make sure you are an Admin.");
            setConnecting(null);
          }
        });
      } else {
        setConnecting(null);
        toast.error("Facebook login cancelled.");
      }
    }, { 
      scope: 'pages_read_engagement,pages_manage_posts,pages_show_list,publish_video' 
    });
  };

  const handleConnect = async (platformId: string) => {
    try {
      setConnecting(platformId);

      // 1. FACEBOOK (Real SDK Flow)
      if (platformId === 'facebook') {
        handleFacebookConnect();
        return;
      }

      // 2. LINKEDIN (OAuth Redirect)
      if (platformId === 'linkedin') {
        const url = await getAuthUrl({ platform: 'linkedin', workspaceId });
        if (url) window.location.href = url;
        return;
      }

      // 3. TELEGRAM (Deep Link)
      if (platformId === 'telegram') {
        const magicLink = `https://t.me/${BOT_USERNAME}?start=${workspaceId}`;
        window.open(magicLink, '_blank');
        toast.info("Opening Telegram...");
        setConnecting(null);
        return;
      }

      // 4. MOCK (Others)
      await new Promise(r => setTimeout(r, 1000)); 
      await connectMock({
        workspaceId,
        platform: platformId as any,
        username: `@${platformId}_user`,
        platformAccountId: `mock_${Date.now()}`
      });
      toast.success(`Connected ${PLATFORM_CONFIG[platformId].name}`);

    } catch (e: any) {
      toast.error(e.message || "Failed to connect");
    } finally {
      if (platformId !== 'facebook' && platformId !== 'linkedin') {
        setConnecting(null);
      }
    }
  };

  const handleDisconnect = async (id: Id<"accounts">) => {
    if (confirm('Disconnect this account? Scheduled posts may fail.')) {
      await disconnect({ accountId: id });
      toast.success("Disconnected");
    }
  };

  if (accounts === undefined) return (
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
          const existingAccount = accounts.find(a => a.platform === key);
          const isConnecting = connecting === key;

          return (
            <IntegrationCard 
              key={key}
              platformId={key}
              config={config}
              account={existingAccount}
              isConnecting={isConnecting}
              onConnect={() => handleConnect(key)}
              onDisconnect={() => existingAccount && handleDisconnect(existingAccount._id)}
            />
          )
        })}
      </div>
    </div>
  );
}

// --- SHARED COMPONENTS (Design preserved) ---

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
                {account.platformUsername}
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