'use client';

import dynamic from 'next/dynamic';

const AgentationWrapper = dynamic(
  () => import('./AgentationWrapper'),
  { ssr: false }
);

export default function AgentationLoader() {
  // Page-feedback toolbar is a local development tool only — never render it on deployed builds.
  if (process.env.NODE_ENV !== 'development') return null;
  return <AgentationWrapper />;
}
