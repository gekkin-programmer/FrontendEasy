"use client";

import { api } from "@/src/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 🟢 Added useSearchParams
import SpinningLoader from "@/src/components/SpinningLoader";
import { getCookie } from 'cookies-next';

export default function DashboardRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🟢 Hook to get URL params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api';
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
          
          // 🟢 CRITICAL FIX: FORWARD THE PARAMS (Facebook Token, etc.)
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
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-red-500 font-mono">
        <p>ROUTER_MALFUNCTION. CHECK_LOGS.</p>
        <button onClick={() => window.location.reload()} className="underline font-bold">RETRY_CONNECTION</button>
      </div>
    );
  }

  return <SpinningLoader fullScreen={true} />;
}