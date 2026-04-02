'use client';

import dynamic from 'next/dynamic';

const AgentationWrapper = dynamic(
  () => import('./AgentationWrapper'),
  { ssr: false }
);

export default function AgentationLoader() {
  return <AgentationWrapper />;
}
