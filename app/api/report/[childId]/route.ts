import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ childId: string }> };

const GAME_LABELS: Record<string, string> = {
  'hear-tap':     'Hear & Tap',
  'build-number': 'Build the Number',
  'number-order': 'Number Order',
  'even-odd':     'Even / Odd',
  'add-take':     'Add / Take Away',
};

const GAME_COLORS: Record<string, string> = {
  'hear-tap':     '#5FB36A',
  'build-number': '#FFC94A',
  'number-order': '#8AC4DE',
  'even-odd':     '#D9C7F0',
  'add-take':     '#FFA48C',
};

/** GET /api/report/:childId — aggregate child progress report */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
    if (!child || child.parentId !== cookieParentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Parallelize all DB queries for performance
    const [lessonsCompleted, starResult, recentSessions, sessions, attempts, streak] =
      await Promise.all([
        prisma.gameSession.count({ where: { childId, status: 'completed' } }),
        prisma.gameSession.aggregate({
          where: { childId, status: 'completed' },
          _sum: { stars: true },
        }),
        prisma.gameSession.findMany({
          where: { childId, status: 'completed', completedAt: { gte: sevenDaysAgo } },
          select: { completedAt: true },
        }),
        prisma.gameSession.findMany({
          where: { childId, status: 'completed', completedAt: { gte: ninetyDaysAgo } },
          include: { lesson: { select: { gameType: true } } },
        }),
        prisma.gameAttempt.findMany({
          where: { session: { childId }, createdAt: { gte: ninetyDaysAgo } },
          select: { correct: true, session: { select: { lesson: { select: { gameType: true } } } } },
        }),
        prisma.streak.findUnique({ where: { childId } }),
      ]);
    const totalStars = starResult._sum.stars ?? 0;

    // Build 7-day array indexed by days-ago (index 6 = today, index 0 = 6 days ago)
    const dayCount = Array(7).fill(0) as number[];
    const now = Date.now();
    for (const s of recentSessions) {
      if (s.completedAt) {
        const daysAgo = Math.floor((now - s.completedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) dayCount[6 - daysAgo] += 5;
      }
    }

    // Per-game stats via sessions + lesson join
    const gameStats: Record<string, { count: number; correct: number; total: number }> = {};
    for (const s of sessions) {
      const gt = s.lesson.gameType;
      if (!gameStats[gt]) gameStats[gt] = { count: 0, correct: 0, total: 0 };
      gameStats[gt].count++;
    }

    // Accuracy per game type
    for (const a of attempts) {
      const gt = a.session.lesson.gameType;
      if (!gameStats[gt]) gameStats[gt] = { count: 0, correct: 0, total: 0 };
      gameStats[gt].total++;
      if (a.correct) gameStats[gt].correct++;
    }

    // Build per-game array
    const games = Object.entries(gameStats).map(([type, s]) => ({
      type,
      label: GAME_LABELS[type] ?? type,
      color: GAME_COLORS[type] ?? '#9AA69A',
      playCount: s.count,
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));

    // Weakest skill = lowest accuracy with ≥1 session
    const withSessions = games.filter(g => g.playCount > 0);
    const weakest = withSessions.sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;

    return NextResponse.json({
      lessonsCompleted,
      totalStars,
      recentActivity: dayCount,
      games,
      streak: streak
        ? { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak }
        : { currentStreak: 0, longestStreak: 0 },
      recommendedNext: weakest ? weakest.label : null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
