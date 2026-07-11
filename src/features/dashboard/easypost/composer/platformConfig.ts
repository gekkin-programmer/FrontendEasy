export type PlatformTaxonomy = 'feed' | 'video' | 'discovery' | 'broadcast' | 'shortform';

export interface PlatformConfig {
  id: string;
  label: string;
  taxonomy: PlatformTaxonomy;
  color: string;
  charLimit: number | null;
  charWarning: number | null;
  requiresVideo?: boolean;
  requiresTitle?: boolean;
  supportsMarkdown?: boolean;
  supportsScheduling: boolean;
}

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  twitter:   { id: 'twitter',   label: 'X/Twitter',    taxonomy: 'feed',      color: '#000000', charLimit: 280,   charWarning: 260,  supportsScheduling: true  },
  facebook:  { id: 'facebook',  label: 'Facebook',     taxonomy: 'feed',      color: '#1877F2', charLimit: 63206, charWarning: 60000, supportsScheduling: true  },
  linkedin:  { id: 'linkedin',  label: 'LinkedIn',     taxonomy: 'feed',      color: '#0077B5', charLimit: 3000,  charWarning: 2800, supportsScheduling: true  },
  instagram: { id: 'instagram', label: 'Instagram',    taxonomy: 'feed',      color: '#E4405F', charLimit: 2200,  charWarning: 2000, supportsScheduling: true  },
  threads:   { id: 'threads',   label: 'Threads',      taxonomy: 'feed',      color: '#000000', charLimit: 500,   charWarning: 450,  supportsScheduling: true  },
  tiktok:    { id: 'tiktok',    label: 'TikTok',       taxonomy: 'video',     color: '#000000', charLimit: 2200,  charWarning: 2000, requiresVideo: true,  supportsScheduling: true  },
  youtube:   { id: 'youtube',   label: 'YouTube',      taxonomy: 'video',     color: '#FF0000', charLimit: 5000,  charWarning: 4500, requiresVideo: true, requiresTitle: true, supportsScheduling: true  },
  pinterest: { id: 'pinterest', label: 'Pinterest',    taxonomy: 'discovery', color: '#BD081C', charLimit: 500,   charWarning: 450,  supportsScheduling: true  },
  telegram:  { id: 'telegram',  label: 'Telegram',     taxonomy: 'broadcast', color: '#26A5E4', charLimit: 4096,  charWarning: 3800, supportsMarkdown: true, supportsScheduling: false },
  discord:   { id: 'discord',   label: 'Discord',      taxonomy: 'broadcast', color: '#5865F2', charLimit: 2000,  charWarning: 1800, supportsMarkdown: true, supportsScheduling: false },
  whatsapp:  { id: 'whatsapp',  label: 'WhatsApp',     taxonomy: 'broadcast', color: '#25D366', charLimit: 65536, charWarning: null, supportsMarkdown: true, supportsScheduling: false },
  snapchat:  { id: 'snapchat',  label: 'Snapchat',     taxonomy: 'shortform', color: '#FFFC00', charLimit: null,  charWarning: null, supportsScheduling: true  },
  reddit:    { id: 'reddit',    label: 'Reddit',       taxonomy: 'shortform', color: '#FF4500', charLimit: 40000, charWarning: 35000, supportsScheduling: true  },
};

export const BROADCAST_IDS = new Set(['telegram', 'discord', 'whatsapp']);
export const VIDEO_IDS = new Set(['tiktok', 'youtube']);
export const DISCOVERY_IDS = new Set(['pinterest']);
