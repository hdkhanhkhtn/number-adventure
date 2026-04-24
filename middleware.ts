import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without a session token
const PUBLIC_API_PATHS = ['/api/auth/register', '/api/auth/login'];

/**
 * Auth middleware — protects all /api/* routes.
 * Phase A: skeleton with session-cookie check.
 * Phase C: replace cookie check with full JWT/NextAuth validation.
 *
 * IDOR note: middleware validates session existence here; each route handler
 * must additionally validate that the requested resource belongs to the
 * authenticated parent (e.g. Child.parentId === session.parentId).
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

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
  // Protect all API routes
  matcher: '/api/:path*',
};
