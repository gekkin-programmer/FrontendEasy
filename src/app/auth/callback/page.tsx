"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      //  Save Tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      //  Redirect to Dashboard
      window.location.href = '/dashboard';
    } else {
      //  Failed
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Authenticating...</p>
    </div>
  );
}