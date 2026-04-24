import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ childId: string }> };

/** GET /api/streaks/:childId — current streak data */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;
    const streak = await prisma.streak.findUnique({ where: { childId } });
    return NextResponse.json({
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastPlayDate: streak?.lastPlayDate?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
