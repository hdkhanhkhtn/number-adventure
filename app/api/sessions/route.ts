import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** POST /api/sessions — start a new game session */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { childId?: string; lessonId?: string };
    const { childId, lessonId } = body;

    if (!childId || !lessonId) {
      return NextResponse.json({ error: 'childId and lessonId are required' }, { status: 400 });
    }

    // Auth: guest_ prefix allowed only when no real Child record exists (prevents guest_ ID spoofing)
    if (childId.startsWith('guest_')) {
      const realChild = await prisma.child.findUnique({ where: { id: childId }, select: { id: true } });
      if (realChild) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      const cookieParentId = request.cookies.get('parentId')?.value;
      if (!cookieParentId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
      if (!child || child.parentId !== cookieParentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const session = await prisma.gameSession.create({
      data: { childId, lessonId, status: 'in_progress' },
    });

    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (e) {
    console.error('[api/sessions POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
