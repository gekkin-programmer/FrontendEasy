"use client";

import { api } from "@/src/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; //  Added useSearchParams
import SpinningLoader from "@/src/components/SpinningLoader";
import { getCookie } from 'cookies-next';

export default function DashboardRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); //  Hook to get URL params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eazypostv2.onrender.com/api';
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const routeUser = async () => {
      const token = getCookie('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const workspaces = await api.get<any[]>('/workspaces');

        if (Array.isArray(workspaces) && workspaces.length > 0) {
          const firstId = workspaces[0].id;
          
          //  CRITICAL FIX: FORWARD THE PARAMS (Facebook Token, etc.)
          const currentParams = searchParams.toString();
          const targetUrl = currentParams 
            ? `/dashboard/${firstId}?${currentParams}` 
            : `/dashboard/${firstId}`;

          console.log(`🔀 Forwarding to: ${targetUrl}`);
          router.replace(targetUrl); // Use replace to avoid back-button loops
        } else {
          router.push("/onboarding");
        }

      } catch (error) {
        console.error("Critical Router Error:", error);
        setStatus('error');
      }
    };

    routeUser();

  }, [router, searchParams, API_URL]); // 🟢 Add searchParams to dependency array

  if (status === 'error') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-[#F4F4F0] dark:bg-black text-black dark:text-white font-sans transition-colors p-4">
        <div className="bg-red-500 text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000] max-w-sm text-center">
            <h2 className="text-2xl font-black uppercase mb-2">Router_Malfunction</h2>
            <p className="font-mono text-xs opacity-90 uppercase">The connection to the social OS was interrupted.</p>
        </div>
        <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
            Retry_Connection
        </button>
      </div>
    );
  }

  return <SpinningLoader fullScreen={true} />;
}