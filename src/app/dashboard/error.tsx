'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-8 text-center">
      <p className="text-6xl font-black text-gray-200 dark:text-zinc-800 select-none">Oops</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Dashboard error</h1>
      <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-sm">
        Something failed while loading your dashboard.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#174CD2] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/workspaces')}
          className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Back to workspaces
        </button>
      </div>
    </div>
  );
}
