import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// SAME SECRET AS BACKEND
const JWT_SECRET = "c69bbe478100399727bc1257e61be3215b4655e9599b8150599410352228b2e6";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ONLY PROTECT /admin ROUTES
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

  return NextResponse.next();
}

// MATCH ONLY ADMIN ROUTES FOR PERFORMANCE
export const config = {
  matcher: ['/admin/:path*'],
};
