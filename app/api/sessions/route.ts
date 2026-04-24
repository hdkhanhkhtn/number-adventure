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

    const session = await prisma.gameSession.create({
      data: { childId, lessonId, status: 'in_progress' },
    });

    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (e) {
    console.error('[api/sessions POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
