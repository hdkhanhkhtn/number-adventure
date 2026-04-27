import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/parent/unsubscribe?parentId=xxx — one-click unsubscribe from weekly email reports */
export async function GET(request: NextRequest) {
  const parentId = request.nextUrl.searchParams.get('parentId');
  if (!parentId) {
    return NextResponse.json({ error: 'Missing parentId' }, { status: 400 });
  }

  await prisma.parent.update({
    where: { id: parentId },
    data: { emailReports: false },
  });

  // Redirect to a confirmation page (or app root if page doesn't exist yet)
  return NextResponse.redirect(new URL('/?unsubscribed=1', request.url));
}
