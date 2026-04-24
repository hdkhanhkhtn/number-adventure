import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';

type Params = { params: Promise<{ lessonId: string }> };

/** GET /api/lessons/:lessonId — lesson details + cached AI questions */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { lessonId } = await params;
    const childId = request.nextUrl.searchParams.get('childId');

    const template = LESSON_TEMPLATES.find((l) => l.id === lessonId);
    if (!template) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    // Get cached questions for this lesson
    const questions = await prisma.aIQuestion.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
      take: template.questionCount,
    });

    // Get best stars for this child on this lesson (if childId provided)
    let bestStars = 0;
    if (childId) {
      const bestSession = await prisma.gameSession.findFirst({
        where: { lessonId, childId, status: 'completed' },
        orderBy: { stars: 'desc' },
      });
      bestStars = bestSession?.stars ?? 0;
    }

    return NextResponse.json({
      lesson: { ...template, bestStars },
      questions: questions.map((q) => ({ id: q.id, payload: q.payload })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
