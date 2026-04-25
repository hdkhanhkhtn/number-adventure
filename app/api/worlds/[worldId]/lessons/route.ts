import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWorld } from '@/src/data/game-config/worlds';
import { getLessonsForWorld } from '@/src/data/game-config/lesson-templates';
import { getBestStarsForChild } from '@/lib/api/worlds-query-helpers';
import type { WorldId } from '@/lib/types/common';

type Params = { params: Promise<{ worldId: string }> };

interface LessonResponse {
  id: string;
  worldId: string;
  gameType: string;
  order: number;
  title: string;
  difficulty: string;
  questionCount: number;
  passingStars: number;
  bestStars: number;
  completed: boolean;
}

/** GET /api/worlds/[worldId]/lessons?childId=X — lessons with child progress */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { worldId } = await params;
    const childId = request.nextUrl.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'childId query param is required' }, { status: 400 });
    }

    // Validate worldId
    const world = getWorld(worldId as WorldId);
    if (!world) {
      return NextResponse.json({ error: `World '${worldId}' not found` }, { status: 404 });
    }

    // Get lesson templates for this world (sorted by order)
    const templates = getLessonsForWorld(worldId as WorldId);
    const lessonIds = templates.map((l) => l.id);

    // Fetch best stars for these lessons (single query)
    const starMap = await getBestStarsForChild(childId, lessonIds);

    const lessons: LessonResponse[] = templates.map((l) => {
      const bestStars = starMap.get(l.id) ?? 0;
      return {
        id: l.id,
        worldId: l.worldId,
        gameType: l.gameType,
        order: l.order,
        title: l.title,
        difficulty: l.difficulty,
        questionCount: l.questionCount,
        passingStars: l.passingStars,
        bestStars,
        completed: bestStars >= l.passingStars,
      };
    });

    return NextResponse.json({ worldId, worldName: world.name, lessons });
  } catch (e) {
    console.error('[api/worlds/[worldId]/lessons GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
