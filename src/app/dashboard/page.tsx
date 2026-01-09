"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const [status, setStatus] = useState('loading'); // 'loading', 'error', 'success'

  useEffect(() => {
    const routeUser = async () => {
      // 1. Check Token Existence
      const token = localStorage.getItem('accessToken');
      console.log(" Checking Token:", token ? "Found" : "Missing");

      if (!token) {
        console.warn(" No token. Redirecting to Login.");
        router.push('/login');
        return;
      }

      try {
        // 2. Fetch Workspaces
        console.log(" Fetching workspaces...");
        const res = await fetch(`${API_URL}/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(" API Status:", res.status);

        if (res.status === 401) {
          console.error(" Unauthorized (401). Token invalid.");
          localStorage.clear(); // Clear bad token
          router.push('/login');
          return;
        }

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

        const workspaces = await res.json();
        console.log(" Workspaces Data:", workspaces);

        // 3. Routing Logic
        if (Array.isArray(workspaces) && workspaces.length > 0) {
          console.log(` Redirecting to workspace: ${workspaces[0].id}`);
          router.push(`/dashboard/${workspaces[0].id}`);
        } else {
          console.log(" No workspaces. Redirecting to Onboarding.");
          router.push("/onboarding");
        }

      } catch (error) {
        console.error(" Critical Error in Dashboard Router:", error);
        // Do NOT redirect to login immediately on network error.
        // Show error state instead so you can debug.
        setStatus('error');
      }
    };

    // Small delay to ensure localStorage is hydrated
    setTimeout(routeUser, 500); 

  }, [router, API_URL]);

  if (status === 'error') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-red-500">
        <p>Failed to load dashboard. Check console logs (F12).</p>
        <button onClick={() => window.location.reload()} className="underline">Retry</button>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-gray-500 text-sm">Logout</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500">Connecting to your workspace...</p>
    </div>
  );
}