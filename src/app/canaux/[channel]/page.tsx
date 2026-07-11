import { notFound } from 'next/navigation';
import ChannelLanding from '@/features/canaux/ChannelLanding';

// Slug → display name for every channel linked from the Navbar "Canaux" menu.
const CHANNELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  twitch: 'Twitch',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  messenger: 'Messenger',
  snapchat: 'Snapchat',
  canva: 'Canva',
  dropbox: 'Dropbox',
  'google-drive': 'Google Drive',
};

export function generateStaticParams() {
  return Object.keys(CHANNELS).map((channel) => ({ channel }));
}

export default async function ChannelPage({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params;
  const name = CHANNELS[channel.toLowerCase()];
  if (!name) notFound();
  return <ChannelLanding channelName={name} />;
}
