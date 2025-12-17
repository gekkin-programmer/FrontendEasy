'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MetaCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 1. Get the auth code or error from Meta
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 2. Handle errors
        if (error) {
          toast.error(`Facebook Connection Failed: ${error}`, {
            description: errorDescription || 'Please try again',
          });
          // Redirect back to settings after showing error
          setTimeout(() => router.back(), 2000);
          return;
        }

        if (!code) {
          toast.error('No authorization code received from Facebook');
          setTimeout(() => router.back(), 2000);
          return;
        }

        // 3. In production: Exchange code for access token
        // This is typically done on your backend for security
        // For now, we'll show a success message and redirect
        // 
        // Example backend call:
        // const response = await fetch('/api/integrations/meta/exchange-token', {
        //   method: 'POST',
        //   body: JSON.stringify({ code }),
        // });
        // const { accessToken } = await response.json();

        toast.success('Facebook Connected! 🎉', {
          description: 'Your account is now linked to EasyPost',
        });

        // 4. Redirect back to settings/connections
        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (error) {
        console.error('Meta callback error:', error);
        toast.error('Something went wrong processing the connection');
        setTimeout(() => router.back(), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-6">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isProcessing ? 'Connecting to Facebook...' : 'Done!'}
        </h2>
        <p className="text-gray-600">
          {isProcessing
            ? 'Please wait while we securely connect your account'
            : 'Redirecting you back to settings...'}
        </p>
      </div>
    </div>
  );
}
