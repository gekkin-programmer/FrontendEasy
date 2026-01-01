// src/app/integrations/callback/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const workspaceId = searchParams.get('state'); // This is the ID we passed in getAuthUrl

  if (code && workspaceId) {
    try {
      // IMPORTANT: We cast the string workspaceId to any so Convex 
      // can validate it as an Id<"workspaces"> inside the action.
      await convex.action(api.auth.exchangeFacebookCode, { 
        code, 
        workspaceId: workspaceId as any 
      });
    } catch (error) {
      console.error("Failed to exchange code:", error);
    }
  }

  // Redirect back to the dashboard. 
  // Your DashboardRootPage logic will handle finding the right workspace.
  return NextResponse.redirect(new URL('/dashboard', request.url));
}