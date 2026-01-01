"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
  const router = useRouter();
  
  // Fetch user's workspaces
  const workspaces = useQuery(api.workspaces.getMyWorkspaces);

  useEffect(() => {
    // 1. Still loading? Do nothing.
    if (workspaces === undefined) return;

    // 2. No workspaces? Send to Onboarding to create one.
    if (workspaces.length === 0) {
      router.push("/onboarding");
    } 
    // 3. Has workspaces? Send to the first one.
    else {
      router.push(`/dashboard/${workspaces[0]._id}`);
    }
  }, [workspaces, router]);

  // Show a loading spinner while we decide where to go
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500">Loading your workspace...</p>
    </div>
  );
}