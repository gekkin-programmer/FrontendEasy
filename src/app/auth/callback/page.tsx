"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SpinningLoader from '@/components/common/SpinningLoader';
import { setCookie } from 'cookies-next';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = searchParams.get('accessToken');
      const code = searchParams.get('code');

      if (accessToken) {
        // Fallback for old flow
        setCookie('accessToken', accessToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        window.location.href = '/dashboard';
        return;
      }

      if (code) {
        try {
          const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com/api').replace(/\/$/, '').replace(/\/api$/, '') + '/api';
          
          const res = await fetch(`${API_URL}/auth/exchange-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });

          if (!res.ok) throw new Error('Failed to exchange code');

          const data = await res.json();
          if (data.accessToken) {
            setCookie('accessToken', data.accessToken, {
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
            window.location.href = '/dashboard';
            return;
          }
        } catch (error) {
          console.error('[Auth] Failed to exchange code:', error);
        }
      }

      // Failed
      router.push('/login?error=auth_failed');
    };

    handleAuth();
  }, [router, searchParams]);

  return <SpinningLoader fullScreen={true} />;
}