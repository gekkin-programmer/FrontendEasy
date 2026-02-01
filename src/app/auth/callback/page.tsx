"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SpinningLoader from '@/src/components/SpinningLoader';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      //  Save Tokens
      localStorage.setItem('accessToken', accessToken);

      //  Redirect to Dashboard
      window.location.href = '/dashboard';
    } else {
      //  Failed
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return <SpinningLoader fullScreen={true} />;
}