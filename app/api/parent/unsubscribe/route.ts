import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token';

/**
 * GET /api/parent/unsubscribe?token=<hmac-signed-token>
 *
 * One-click email unsubscribe. Token is HMAC-SHA256 signed (see lib/email/unsubscribe-token.ts).
 * Raw parentId is never accepted — prevents unauthorised opt-out of any parent.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const parentId = verifyUnsubscribeToken(token);
  if (!parentId) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  await prisma.parent.update({
    where: { id: parentId },
    data: { emailReports: false },
  });

  return NextResponse.redirect(new URL('/?unsubscribed=1', request.url));
}
