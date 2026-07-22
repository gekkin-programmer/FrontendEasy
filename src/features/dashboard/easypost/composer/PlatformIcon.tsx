'use client';

import React from 'react';
import { FaSnapchat, FaMedium, FaThreads } from 'react-icons/fa6';
import {
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon,
  TiktokIcon, YoutubeIcon, PinterestIcon, WhatsappIcon,
  TelegramIcon, DiscordIcon, TwitchIcon, RedditIcon,
} from '@/components/icons/PlatformIcons';

export function PlatformIcon({ platform, size = 14 }: { platform?: string; size?: number }) {
  switch (platform?.toLowerCase()) {
    case 'facebook':  return <FacebookIcon size={size} />;
    case 'instagram': return <InstagramIcon size={size} />;
    case 'linkedin':  return <LinkedinIcon size={size} />;
    case 'twitter':
    case 'x':         return <TwitterIcon size={size} />;
    case 'tiktok':    return <TiktokIcon size={size} />;
    case 'youtube':
    case 'google':    return <YoutubeIcon size={size} />;
    case 'discord':   return <DiscordIcon size={size} />;
    case 'telegram':  return <TelegramIcon size={size} />;
    case 'whatsapp':  return <WhatsappIcon size={size} />;
    case 'pinterest': return <PinterestIcon size={size} />;
    case 'twitch':    return <TwitchIcon size={size} />;
    case 'reddit':    return <RedditIcon size={size} />;
    case 'medium':    return <FaMedium size={size} className="text-black dark:text-white" />;
    case 'threads':   return <FaThreads size={size} className="text-black dark:text-white" />;
    case 'snapchat':  return <FaSnapchat size={size} className="text-yellow-400" />;
    default:          return <div style={{ width: size, height: size }} className="bg-gray-400 rounded-full" />;
  }
}
