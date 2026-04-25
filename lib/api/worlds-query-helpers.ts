import { prisma } from '@/lib/prisma';

export interface LessonStarRecord {
  lessonId: string;
  bestStars: number;
}

/**
 * Fetch best star rating per lesson for a given child.
 * Returns map: lessonId -> bestStars (max stars across all sessions).
 * Single DB query using groupBy.
 */
export async function getBestStarsForChild(
  childId: string,
  lessonIds?: string[],
): Promise<Map<string, number>> {
  const where: Record<string, unknown> = {
    childId,
    status: 'completed',
  };
  if (lessonIds && lessonIds.length > 0) {
    where.lessonId = { in: lessonIds };
  }

  const grouped = await prisma.gameSession.groupBy({
    by: ['lessonId'],
    where,
    _max: { stars: true },
  });

  const map = new Map<string, number>();
  for (const row of grouped) {
    map.set(row.lessonId, row._max.stars ?? 0);
  }
  return map;
}

/**
 * Check if a world is unlocked for a child.
 * World 0 always unlocked. World N unlocked if world N-1 has any lesson with bestStars >= 1.
 */
export function isWorldUnlocked(
  worldUnlockOrder: number,
  completedLessonsByWorld: Map<string, number>,
  worldIdByOrder: Map<number, string>,
): boolean {
  if (worldUnlockOrder === 0) return true;
  const prevWorldId = worldIdByOrder.get(worldUnlockOrder - 1);
  if (!prevWorldId) return false;
  return (completedLessonsByWorld.get(prevWorldId) ?? 0) >= 1;
}
