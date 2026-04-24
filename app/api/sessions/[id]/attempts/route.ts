import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

/** POST /api/sessions/:id/attempts — submit a game attempt */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json() as {
      questionId?: string;
      answer?: string;
      correct?: boolean;
      timeMs?: number;
    };

    if (!body.answer) {
      return NextResponse.json({ error: 'answer is required' }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const attempt = await prisma.gameAttempt.create({
      data: {
        sessionId,
        questionId: body.questionId ?? null,
        answer: String(body.answer),
        correct: body.correct ?? false,
        timeMs: body.timeMs ?? 0,
      },
    });

    return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
