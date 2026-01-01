import { FaTwitter, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaFacebookF, FaPinterestP, FaGoogle } from 'react-icons/fa';

// Added new platforms
export type ChannelType = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | 'google';

export type Channel = {
  id: string;
  type: ChannelType;
  name: string;
  avatar: string;
};

export type PostStatus = 'queued' | 'draft' | 'published' | 'failed' | 'review';

export type Post = {
  id: number;
  content: string;
  channels: string[];
  status: PostStatus;
  scheduledTime: string;
  media?: string;
  mediaType?: 'image' | 'video';
};

// --- MOCK CHANNELS (Expanded) ---
export const CHANNELS: Channel[] = [
  { id: 'c1', type: 'twitter', name: '@StartupHype', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'c2', type: 'linkedin', name: 'Founder Inc.', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'c3', type: 'instagram', name: 'Visuals_Co', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'c4', type: 'tiktok', name: 'DailyTok', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 'c5', type: 'facebook', name: 'Brand Page', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 'c6', type: 'youtube', name: 'Tech Shorts', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 'c7', type: 'pinterest', name: 'Inspo Board', avatar: 'https://i.pravatar.cc/150?u=7' },
];

export const INITIAL_POSTS: Post[] = [
  { id: 1, content: "🚀 We just launched v2.0! #SaaS", channels: ['c1', 'c2'], status: 'queued', scheduledTime: '2023-10-25T14:00:00' },
  { id: 2, content: "Behind the scenes 🎥", channels: ['c3', 'c4'], status: 'draft', scheduledTime: '', media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80', mediaType: 'image' },
  { id: 3, content: "Failed to sync...", channels: ['c4'], status: 'failed', scheduledTime: '2023-10-24T09:00:00' },
  { id: 4, content: "Q4 Strategy Review", channels: ['c2'], status: 'review', scheduledTime: '2023-10-28T10:00:00' },
  { id: 5, content: "Published successfully!", channels: ['c1'], status: 'published', scheduledTime: '2023-10-20T10:00:00' },
];

// Helper for Icons
export const getChannelIcon = (type: string) => {
  switch(type) {
    case 'twitter': return FaTwitter;
    case 'instagram': return FaInstagram;
    case 'linkedin': return FaLinkedinIn;
    case 'tiktok': return FaTiktok;
    case 'youtube': return FaYoutube;
    case 'facebook': return FaFacebookF;
    case 'pinterest': return FaPinterestP;
    case 'google': return FaGoogle;
    default: return FaTwitter;
  }
};