"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const checkWorkspaces = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch Workspaces from NestJS
        const res = await fetch(`${API_URL}/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed');

        const workspaces = await res.json();

        // Logic: Where to go?
        if (workspaces.length === 0) {
          router.push("/onboarding"); // No workspace -> Create one
        } else {
          router.push(`/dashboard/${workspaces[0].id}`); // Found -> Go to first one
        }

      } catch (error) {
        console.error("Dashboard Redirect Error:", error);
        router.push('/login');
      }
    };

    checkWorkspaces();
  }, [router, API_URL]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500">Loading your workspace...</p>
    </div>
  );
}