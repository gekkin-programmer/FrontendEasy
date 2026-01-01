import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/onboarding(.*)',
]);

// Routes where logged-in users shouldn't be (Login, Signup, Home)
const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. IF LOGGED IN: Redirect away from Login/Home -> Dashboard
  if (userId && isAuthRoute(req)) {
    const dashboard = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboard);
  }

  // 2. IF NOT LOGGED IN: Protect Dashboard -> Login
  if (!userId && isProtectedRoute(req)) {
    const login = new URL('/login', req.url);
    return NextResponse.redirect(login);
  }

  // 3. Allow everything else (sso-callback, assets, etc)
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};