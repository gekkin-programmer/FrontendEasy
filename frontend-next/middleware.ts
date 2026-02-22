import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PROTECT /admin ROUTES (auth + role check)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      console.warn(`[SECURITY] Blocked unauthenticated access to ${pathname}`);
      return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
    }

    try {
      // VERIFY JWT SIGNATURE (jose works in Edge Runtime)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // CHECK ROLE
      if (payload.role !== 'ADMIN') {
        console.error(`[SECURITY] Blocked non-admin (${payload.email}) from ${pathname}`);
        return NextResponse.redirect(new URL('/dashboard?error=forbidden', request.url));
      }

      // SUCCESS: ALLOW ACCESS
      return NextResponse.next();
    } catch (err) {
      console.error(`[SECURITY] Invalid token attempt for ${pathname}`);
      return NextResponse.redirect(new URL('/login?reason=expired', request.url));
    }
  }

  // PROTECT /dashboard AND /workspaces ROUTES (auth only)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/workspaces')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login?reason=expired', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/workspaces/:path*'],
};
