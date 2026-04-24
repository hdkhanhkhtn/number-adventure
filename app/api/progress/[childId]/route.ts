import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WORLDS } from '@/src/data/game-config/worlds';
import { getLessonsForWorld } from '@/src/data/game-config/lesson-templates';

type Params = { params: Promise<{ childId: string }> };

/** GET /api/progress/:childId — world-level progress summary */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;

    // Get all completed sessions for this child
    const sessions = await prisma.gameSession.findMany({
      where: { childId, status: 'completed' },
      include: { lesson: true },
    });

    // Build per-world progress
    const worldProgress = WORLDS.map((world, idx) => {
      const worldLessons = getLessonsForWorld(world.id as Parameters<typeof getLessonsForWorld>[0]);
      const lessonIds = new Set(worldLessons.map((l) => l.id));

      // Best stars per lesson
      const starsByLesson: Record<string, number> = {};
      for (const session of sessions) {
        if (lessonIds.has(session.lessonId)) {
          const prev = starsByLesson[session.lessonId] ?? 0;
          if (session.stars > prev) starsByLesson[session.lessonId] = session.stars;
        }
      }

      const completedLessons = Object.keys(starsByLesson).length;
      const totalStars = Object.values(starsByLesson).reduce((s, n) => s + n, 0);
      const maxStars = worldLessons.length * 3;

      // Unlock rule: first world always unlocked; subsequent worlds unlock when prev has >= 5 completed lessons
      const unlocked = idx === 0 || (() => {
        const prevWorld = WORLDS[idx - 1];
        const prevLessons = getLessonsForWorld(prevWorld.id as Parameters<typeof getLessonsForWorld>[0]);
        const prevIds = new Set(prevLessons.map((l) => l.id));
        const prevCompleted = sessions.filter(
          (s) => prevIds.has(s.lessonId) && s.stars > 0,
        );
        const uniquePrev = new Set(prevCompleted.map((s) => s.lessonId));
        return uniquePrev.size >= 5;
      })();

      return {
        worldId: world.id,
        name: world.name,
        color: world.color,
        bg: world.bg,
        emoji: world.emoji,
        unlocked,
        completedLessons,
        totalLessons: worldLessons.length,
        totalStars,
        maxStars,
        starsByLesson,
      };
    });

    // Weekly activity (past 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter((s) => s.completedAt && s.completedAt >= weekAgo);
    const activeDays = new Set(
      recentSessions
        .filter((s) => s.completedAt)
        .map((s) => s.completedAt!.toISOString().slice(0, 10)),
    );

    const weekDays: boolean[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return activeDays.has(d.toISOString().slice(0, 10));
    });

    return NextResponse.json({ worldProgress, weekDays });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
