import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { WORLDS } from '@/src/data/game-config/worlds';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';
import { getBestStarsForChild, isWorldUnlocked } from '@/lib/api/worlds-query-helpers';

interface WorldResponse {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  bg: string;
  emoji: string;
  unlockOrder: number;
  unlocked: boolean;
  lessonCount: number;
  completedLessons: number;
  totalStars: number;
}

/** GET /api/worlds?childId=X — list worlds with unlock status + progress */
export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json({ error: 'childId query param is required' }, { status: 400 });
    }

    // Fetch best stars for all lessons for this child (single query)
    const allLessonIds = LESSON_TEMPLATES.map((l) => l.id);
    const starMap = await getBestStarsForChild(childId, allLessonIds);

    // Build world-order lookup
    const worldIdByOrder = new Map<number, string>();
    for (const w of WORLDS) {
      worldIdByOrder.set(w.unlockOrder, w.id);
    }

    // Compute per-world stats
    const completedByWorld = new Map<string, number>();
    const starsByWorld = new Map<string, number>();

    for (const lesson of LESSON_TEMPLATES) {
      const best = starMap.get(lesson.id) ?? 0;
      if (best >= 1) {
        completedByWorld.set(lesson.worldId, (completedByWorld.get(lesson.worldId) ?? 0) + 1);
      }
      starsByWorld.set(lesson.worldId, (starsByWorld.get(lesson.worldId) ?? 0) + best);
    }

    const worlds: WorldResponse[] = WORLDS.map((w) => ({
      id: w.id,
      name: w.name,
      subtitle: w.subtitle,
      color: w.color,
      bg: w.bg,
      emoji: w.emoji,
      unlockOrder: w.unlockOrder,
      unlocked: isWorldUnlocked(w.unlockOrder, completedByWorld, worldIdByOrder),
      lessonCount: w.lessonCount,
      completedLessons: completedByWorld.get(w.id) ?? 0,
      totalStars: starsByWorld.get(w.id) ?? 0,
    }));

    return NextResponse.json({ worlds });
  } catch (e) {
    console.error('[api/worlds GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
