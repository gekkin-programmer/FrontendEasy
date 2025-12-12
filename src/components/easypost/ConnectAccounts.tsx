// src/components/easypost/ConnectAccounts.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTwitter, FaInstagram, FaLinkedin, FaFacebook, 
  FaTiktok, FaPinterest, FaYoutube, FaSlack 
} from 'react-icons/fa';
import { 
  FiCheck, FiPlus, FiMoreHorizontal, FiAlertCircle, 
  FiTrash2, FiExternalLink, FiRefreshCw, FiLoader 
} from 'react-icons/fi';

// --- TYPES ---
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: ConnectionStatus;
  handle?: string;
  brandColor: string;
}

// --- MOCK DATA ---
const INITIAL_PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: <FaTwitter />,
    description: 'Post tweets and threads.',
    status: 'connected',
    handle: '@johndoe_dev',
    brandColor: 'text-gray-900',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <FaInstagram />,
    description: 'Post photos, carousels, and Reels.',
    status: 'disconnected',
    brandColor: 'text-pink-600',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <FaLinkedin />,
    description: 'Company pages and personal profiles.',
    status: 'connected',
    handle: 'John Doe',
    brandColor: 'text-blue-700',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FaFacebook />,
    description: 'Groups and Pages.',
    status: 'error', // Simulating an expired token
    handle: 'Tech Startups Group',
    brandColor: 'text-blue-600',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <FaTiktok />,
    description: 'Video publishing and analytics.',
    status: 'disconnected',
    brandColor: 'text-black',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <FaYoutube />,
    description: 'Shorts and long-form video.',
    status: 'disconnected',
    brandColor: 'text-red-600',
  },
];

export default function ConnectAccounts() {
  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);

  // Simulate the OAuth connection process
  const handleConnect = (id: string) => {
    // Set to connecting state
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, status: 'connecting' } : p));

    // Simulate API delay
    setTimeout(() => {
      setPlatforms(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'connected', handle: '@new_connection' } : p
      ));
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    if (confirm('Are you sure? This will remove scheduled posts for this channel.')) {
      setPlatforms(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'disconnected', handle: undefined } : p
      ));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Connected Channels</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect your social media profiles to schedule posts and view analytics.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-600">
                {platforms.filter(p => p.status === 'connected').length} / 10 Channels Used
            </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <IntegrationCard 
            key={platform.id} 
            platform={platform} 
            onConnect={() => handleConnect(platform.id)}
            onDisconnect={() => handleDisconnect(platform.id)}
          />
        ))}
      </div>

      {/* Other Integrations (Slack, etc) - "Vercel Style" List */}
      <div className="pt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Workflow Integrations</h3>
          <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
              <WorkflowRow 
                name="Slack" 
                desc="Receive notifications in your team channel." 
                icon={<FaSlack />} 
                connected={false} 
              />
              <WorkflowRow 
                name="Bitly" 
                desc="Automatically shorten links in your posts." 
                icon={<span className="font-bold text-orange-600">b</span>} 
                connected={true} 
              />
          </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function IntegrationCard({ 
    platform, 
    onConnect, 
    onDisconnect 
}: { 
    platform: Platform; 
    onConnect: () => void; 
    onDisconnect: () => void; 
}) {
  const isConnected = platform.status === 'connected';
  const isError = platform.status === 'error';
  const isConnecting = platform.status === 'connecting';

  return (
    <div className={`
        relative group flex flex-col justify-between p-5 rounded-lg border transition-all duration-200
        ${isConnected ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'}
        ${isError ? 'border-red-200 bg-red-50/30' : ''}
    `}>
      
      {/* Top: Icon & Status */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg border bg-white shadow-sm text-xl ${platform.brandColor} border-gray-100`}>
          {platform.icon}
        </div>
        
        {/* Status Badge */}
        {isConnected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                <FiCheck size={10} /> Connected
            </span>
        )}
        {isError && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
                <FiAlertCircle size={10} /> Re-auth needed
            </span>
        )}
      </div>

      {/* Middle: Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900">{platform.name}</h3>
        {isConnected || isError ? (
            <p className="text-xs font-mono text-gray-600 mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                {platform.handle}
            </p>
        ) : (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {platform.description}
            </p>
        )}
      </div>

      {/* Bottom: Actions */}
      <div className="mt-auto">
        {isConnected ? (
           <div className="flex gap-2">
               <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                  Configure
               </button>
               <button 
                  onClick={onDisconnect}
                  className="px-3 py-2 text-gray-400 hover:text-red-600 border border-transparent hover:bg-red-50 rounded-md transition-colors"
                  title="Disconnect"
                >
                  <FiTrash2 size={14} />
               </button>
           </div>
        ) : isError ? (
            <button 
                onClick={onConnect}
                className="w-full px-3 py-2 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <FiRefreshCw /> Reconnect
            </button>
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

function WorkflowRow({ name, desc, icon, connected }: any) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-lg">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-900">{name}</h4>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
            </div>
            <button className={`px-3 py-1.5 text-xs font-medium rounded-md border shadow-sm transition-colors ${
                connected 
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-900 border-transparent text-white hover:bg-black'
            }`}>
                {connected ? 'Manage' : 'Install'}
            </button>
        </div>
    )
}