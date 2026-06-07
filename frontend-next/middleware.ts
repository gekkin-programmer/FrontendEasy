import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Decode JWT payload without signature verification (Edge Runtime compatible).
// Real security is enforced by the backend on every API call.
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  if (!exp) return true;
  return exp < Math.floor(Date.now() / 1000);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // ── /dashboard and /workspaces: require a valid, non-expired token ──────
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/workspaces')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
    }
    const payload = decodeToken(token);
    if (!payload || isExpired(payload)) {
      return NextResponse.redirect(new URL('/login?reason=expired', request.url));
    }
    return NextResponse.next();
  }

  // ── /admin: require valid token + ADMIN role ────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
    }
    const payload = decodeToken(token);
    if (!payload || isExpired(payload)) {
      return NextResponse.redirect(new URL('/login?reason=expired', request.url));
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard?error=forbidden', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/workspaces/:path*'],
};
