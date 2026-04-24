import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STICKER_DEFS } from '@/src/data/game-config/sticker-defs';

type Params = { params: Promise<{ id: string }> };

/** GET /api/children/:id/stickers — all stickers with earned flag for child */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id: childId } = await params;

    const earned = await prisma.childSticker.findMany({
      where: { childId },
      select: { stickerId: true, earnedAt: true },
    });
    const earnedMap = new Map(earned.map((e) => [e.stickerId, e.earnedAt.toISOString()]));

    const stickers = STICKER_DEFS.map((def) => ({
      ...def,
      earned: earnedMap.has(def.id),
      earnedAt: earnedMap.get(def.id) ?? null,
    }));

    return NextResponse.json({
      stickers,
      total: STICKER_DEFS.length,
      collected: earnedMap.size,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
