'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-8 text-center">
      <p className="text-6xl font-black text-gray-200 dark:text-zinc-800 select-none">500</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Something went wrong</h1>
      <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-sm">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-3 bg-[#174CD2] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
