'use client';

import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { FaTiktok, FaYoutube, FaDiscord, FaTelegram, FaWhatsapp, FaSnapchatGhost, FaPinterestP, FaRedditAlien } from 'react-icons/fa';

export function PlatformIcon({ platform, size = 14 }: { platform?: string; size?: number }) {
  switch (platform?.toLowerCase()) {
    case 'facebook':  return <Facebook size={size} className="text-blue-600 fill-blue-600" />;
    case 'instagram': return <Instagram size={size} className="text-pink-600" />;
    case 'linkedin':  return <Linkedin size={size} className="text-blue-700 fill-blue-700" />;
    case 'twitter':   return <Twitter size={size} className="text-black dark:text-white fill-black dark:fill-white" />;
    case 'tiktok':    return <FaTiktok size={size} className="text-black dark:text-white" />;
    case 'youtube':   return <FaYoutube size={size} className="text-red-600" />;
    case 'discord':   return <FaDiscord size={size} className="text-[#5865F2]" />;
    case 'telegram':  return <FaTelegram size={size} className="text-[#26A5E4]" />;
    case 'whatsapp':  return <FaWhatsapp size={size} className="text-[#25D366]" />;
    case 'snapchat':  return <FaSnapchatGhost size={size} className="text-yellow-400" />;
    case 'pinterest': return <FaPinterestP size={size} className="text-[#BD081C]" />;
    case 'reddit':    return <FaRedditAlien size={size} className="text-[#FF4500]" />;
    default:          return <div style={{ width: size, height: size }} className="bg-gray-400 rounded-full" />;
  }
}
