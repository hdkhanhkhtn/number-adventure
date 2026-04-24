import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStickersByWorld } from '@/src/data/game-config/sticker-defs';

type Params = { params: Promise<{ id: string }> };

/** GET /api/sessions/:id — get session details */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: { attempts: true, lesson: true },
    });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    return NextResponse.json({ session });
  } catch (e) {
    console.error('[api/sessions/id GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/sessions/:id — complete session, update streak, award sticker on 3 stars */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json() as { stars?: number };
    const stars = Math.min(3, Math.max(0, body.stars ?? 0));

    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: { lesson: true },
    });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Guard against completing an already-completed session (prevents double streak/sticker)
    if (session.status === 'completed') {
      return NextResponse.json({ session }, { status: 409 });
    }

    // Complete session
    const updated = await prisma.gameSession.update({
      where: { id },
      data: { status: 'completed', stars, completedAt: new Date() },
    });

    // Update streak
    const streak = await updateStreak(session.childId);

    // Award sticker on 3 stars (random from world's pool, skip if already owned)
    let sticker: { id: string; emoji: string; name: string } | null = null;
    if (stars === 3) {
      sticker = await awardSticker(session.childId, session.lesson.worldId);
    }

    return NextResponse.json({ session: updated, streak, sticker });
  } catch (e) {
    console.error('[api/sessions/id PATCH] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateStreak(childId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.streak.findUnique({ where: { childId } });

  if (!existing) {
    return prisma.streak.create({
      data: { childId, currentStreak: 1, longestStreak: 1, lastPlayDate: new Date() },
    });
  }

  const lastPlay = existing.lastPlayDate ? new Date(existing.lastPlayDate) : null;
  if (lastPlay) lastPlay.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let currentStreak = existing.currentStreak;
  if (!lastPlay) {
    currentStreak = 1;
  } else if (lastPlay.getTime() === today.getTime()) {
    // Already played today — no change
  } else if (lastPlay.getTime() === yesterday.getTime()) {
    // Consecutive day
    currentStreak += 1;
  } else {
    // Streak broken
    currentStreak = 1;
  }

  const longestStreak = Math.max(existing.longestStreak, currentStreak);
  return prisma.streak.update({
    where: { childId },
    data: { currentStreak, longestStreak, lastPlayDate: new Date() },
  });
}

async function awardSticker(childId: string, worldId: string) {
  const pool = getStickersByWorld(worldId);
  if (!pool.length) return null;

  // Get stickers already owned by child
  const owned = await prisma.childSticker.findMany({
    where: { childId },
    select: { stickerId: true },
  });
  const ownedIds = new Set(owned.map((s) => s.stickerId));

  // Filter unowned
  const available = pool.filter((s) => !ownedIds.has(s.id));
  if (!available.length) return null;

  // Pick random from available
  const def = available[Math.floor(Math.random() * available.length)];

  // Find or create the Sticker record in DB
  let stickerRecord = await prisma.sticker.findUnique({ where: { id: def.id } });
  if (!stickerRecord) {
    stickerRecord = await prisma.sticker.create({
      data: { id: def.id, emoji: def.emoji, name: def.name, worldId: def.worldId, rarity: def.rarity },
    });
  }

  try {
    await prisma.childSticker.create({ data: { childId, stickerId: stickerRecord.id } });
  } catch (e: unknown) {
    // P2002 = unique constraint violation — concurrent request already awarded this sticker
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return null;
    }
    throw e;
  }

  return { id: stickerRecord.id, emoji: stickerRecord.emoji, name: stickerRecord.name };
}

