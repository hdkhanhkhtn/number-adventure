import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adjustDifficulty } from '@/lib/game-engine/difficulty-adjuster';
import type { Difficulty } from '@/lib/types/common';

/**
 * POST /api/sessions/complete
 * Body: { sessionId: string }
 * Finalizes a game session: marks completed, computes accuracy,
 * updates DifficultyProfile via SM-2 variant.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { sessionId?: string };
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // 1. Fetch session with attempts + lesson
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { attempts: true, lesson: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 409 });
    }

    // 2. Compute accuracy
    const totalAttempts = session.attempts.length;
    const correctAttempts = session.attempts.filter((a) => a.correct).length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

    // 3. Compute stars
    const stars = computeStars(accuracy);

    // 4. Mark session completed
    const updated = await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'completed', stars, completedAt: new Date() },
    });

    // 5. Get parent ceiling from ChildSettings
    const settings = await prisma.childSettings.findUnique({
      where: { childId: session.childId },
    });
    const parentCeiling = (settings?.difficulty ?? 'hard') as Difficulty;

    // 6. Get or create DifficultyProfile
    const gameType = session.lesson.gameType;
    const existing = await prisma.difficultyProfile.findUnique({
      where: { childId_gameType: { childId: session.childId, gameType } },
    });

    const currentState = existing
      ? {
          easeFactor: existing.easeFactor,
          interval: existing.interval,
          streak: existing.streak,
          consecutiveFails: existing.consecutiveFails,
          currentDifficulty: existing.currentDifficulty as Difficulty,
          totalSessions: existing.totalSessions,
        }
      : {
          easeFactor: 2.5,
          interval: 1,
          streak: 0,
          consecutiveFails: 0,
          currentDifficulty: 'easy' as Difficulty,
          totalSessions: 0,
        };

    // 7. Run SM-2 adjustment
    const result = adjustDifficulty(currentState, accuracy, parentCeiling);

    // 8. Upsert DifficultyProfile
    await prisma.difficultyProfile.upsert({
      where: { childId_gameType: { childId: session.childId, gameType } },
      create: {
        childId: session.childId,
        gameType,
        ...result.state,
      },
      update: {
        ...result.state,
      },
    });

    return NextResponse.json({
      session: updated,
      difficulty: {
        previous: result.previous,
        current: result.state.currentDifficulty,
        accuracy: Math.round(accuracy * 100),
        changed: result.changed,
      },
    });
  } catch (e) {
    console.error('[api/sessions/complete POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function computeStars(accuracy: number): number {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}
