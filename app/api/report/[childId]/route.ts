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
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;

    // Lessons completed
    const lessonsCompleted = await prisma.gameSession.count({
      where: { childId, status: 'completed' },
    });

    // Total stars
    const starResult = await prisma.gameSession.aggregate({
      where: { childId, status: 'completed' },
      _sum: { stars: true },
    });
    const totalStars = starResult._sum.stars ?? 0;

    // 7-day activity: minutes per day (approx: count sessions per day)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = await prisma.gameSession.findMany({
      where: { childId, status: 'completed', completedAt: { gte: sevenDaysAgo } },
      select: { completedAt: true },
    });

    // Build 7-day array (Mon=0 … Sun=6), count sessions as proxy for time
    const dayCount = Array(7).fill(0) as number[];
    for (const s of recentSessions) {
      if (s.completedAt) {
        const dow = (s.completedAt.getDay() + 6) % 7; // 0=Mon
        dayCount[dow] += 5; // ~5 min per session
      }
    }

    // Per-game stats via sessions + lesson join
    const sessions = await prisma.gameSession.findMany({
      where: { childId, status: 'completed' },
      include: { lesson: { select: { gameType: true } } },
    });

    const gameStats: Record<string, { count: number; correct: number; total: number }> = {};
    for (const s of sessions) {
      const gt = s.lesson.gameType;
      if (!gameStats[gt]) gameStats[gt] = { count: 0, correct: 0, total: 0 };
      gameStats[gt].count++;
    }

    // Accuracy per game type
    const attempts = await prisma.gameAttempt.findMany({
      where: { session: { childId } },
      select: { correct: true, session: { select: { lesson: { select: { gameType: true } } } } },
    });
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

    // Streak
    const streak = await prisma.streak.findUnique({ where: { childId } });

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
