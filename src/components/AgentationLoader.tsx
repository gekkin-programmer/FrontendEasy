'use client';

import dynamic from 'next/dynamic';

const AgentationWrapper = dynamic(
  () => import('./AgentationWrapper'),
  { ssr: false }
);

export default function AgentationLoader() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <AgentationWrapper />;
}
