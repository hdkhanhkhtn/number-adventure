/**
 * lesson-loader.ts
 * Feature-flagged lesson loader: reads from DB when NEXT_PUBLIC_USE_DB_LESSONS=true,
 * falls back to static LESSON_TEMPLATES if DB is empty or flag is off.
 */
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';

const USE_DB = process.env.NEXT_PUBLIC_USE_DB_LESSONS === 'true';

/** Cached DB lesson fetch — 1h TTL. Only called when USE_DB is true. */
const getDbLessons = unstable_cache(
  async () => prisma.lesson.findMany({
    where: { published: true },
    orderBy: [{ worldId: 'asc' }, { order: 'asc' }],
  }),
  ['db-lessons'],
  { revalidate: 3600 }
);

/** Load all lessons (or filtered by worldId) from DB or static source. */
export async function loadLessons(worldId?: string) {
  if (USE_DB) {
    const dbLessons = await getDbLessons();
    if (dbLessons.length > 0) {
      return worldId ? dbLessons.filter(l => l.worldId === worldId) : dbLessons;
    }
  }
  // Static fallback
  return worldId
    ? LESSON_TEMPLATES.filter(l => l.worldId === worldId)
    : LESSON_TEMPLATES;
}

/** Synchronous static lookup — used by client components (play page). */
export function loadLessonSync(lessonId: string) {
  return LESSON_TEMPLATES.find(l => l.id === lessonId) ?? null;
}
