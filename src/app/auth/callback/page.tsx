"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SpinningLoader from '@/components/common/SpinningLoader';
import { setCookie } from 'cookies-next';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      //  Save Tokens in Cookies (accessible by Middleware)
      setCookie('accessToken', accessToken, {
        maxAge: 60 * 60 * 24 * 7, // 7 days (matches backend)
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      //  Redirect to Dashboard
      window.location.href = '/dashboard';
    } else {
      //  Failed
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return <SpinningLoader fullScreen={true} />;
}