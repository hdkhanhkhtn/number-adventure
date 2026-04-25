import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ childId: string }> };

/**
 * GET /api/children/:childId/difficulty
 * Returns current difficulty band per gameType from DifficultyProfile.
 * Falls back to ChildSettings.difficulty for game types with no profile yet.
 *
 * IDOR protection: verifies the authenticated parent owns the requested child.
 * Pattern matches children/[id]/settings and report/[childId] routes.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;

    // Guest users: ephemeral IDs, no DB records — return safe defaults without auth
    if (childId.startsWith('guest_')) {
      return NextResponse.json({ profiles: [], defaultDifficulty: 'easy' });
    }

    // Verify authenticated parent owns this child (IDOR guard)
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { parentId: true },
    });
    if (!child || child.parentId !== cookieParentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [profiles, settings] = await Promise.all([
      prisma.difficultyProfile.findMany({
        where: { childId },
        select: {
          gameType: true,
          currentBand: true,
          currentDifficulty: true,
          windowAccuracy: true,
          easeFactor: true,
          consecutiveTriggers: true,
          totalSessions: true,
        },
      }),
      prisma.childSettings.findUnique({
        where: { childId },
        select: { difficulty: true },
      }),
    ]);

    const defaultDifficulty = settings?.difficulty ?? 'easy';

    return NextResponse.json({
      profiles: profiles.map((p) => ({
        gameType: p.gameType,
        // currentBand = sliding-window result; fall back to SM-2 currentDifficulty if not yet set
        currentBand: p.currentBand ?? p.currentDifficulty,
        windowAccuracy: p.windowAccuracy ?? 0,
        easeFactor: p.easeFactor,
        consecutiveTriggers: p.consecutiveTriggers ?? 0,
        totalSessions: p.totalSessions,
      })),
      defaultDifficulty,
    });
  } catch (e) {
    console.error('[api/children/childId/difficulty GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
