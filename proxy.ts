import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without a bap-session token (use parentId cookie for auth instead)
const PUBLIC_API_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/pin',
  '/api/auth/pin/setup',
  '/api/auth/session',
  '/api/auth/profile',
  '/api/children',
  '/api/report',
];

/**
 * Proxy (replaces deprecated middleware convention) — two responsibilities:
 * 1. Protects all /api/* routes (except public auth endpoints) via bap-session cookie.
 * 2. Redirects unauthenticated users away from parent UI routes (/dashboard, /report, /settings)
 *    by checking the parentId session cookie set at login.
 *
 * IDOR note: proxy validates session existence here; each route handler
 * must additionally validate that the requested resource belongs to the
 * authenticated parent (e.g. Child.parentId === session.parentId).
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Guard parent UI routes — redirect to /home if no parentId cookie
  const parentPaths = ['/dashboard', '/report', '/settings'];
  if (parentPaths.some(p => pathname.startsWith(p))) {
    const parentId = request.cookies.get('parentId')?.value;
    if (!parentId) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // Allow public auth API routes
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect all other /api/* routes via bap-session cookie
  // TODO Phase C: replace with JWT/NextAuth session validation
  const sessionToken = request.cookies.get('bap-session')?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Protect API routes and parent UI routes
  matcher: ['/api/:path*', '/dashboard/:path*', '/report/:path*', '/settings/:path*'],
};
