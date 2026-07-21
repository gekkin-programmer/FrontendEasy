'use client';

import dynamic from 'next/dynamic';

const AgentationWrapper = dynamic(
  () => import('./AgentationWrapper'),
  { ssr: false }
);

export default function AgentationLoader() {
  // TEMP: page-feedback toolbar enabled on prod for live tweaking. Re-enable the
  // dev-only gate (`if (process.env.NODE_ENV !== 'development') return null;`) once done.
  return <AgentationWrapper />;
}
