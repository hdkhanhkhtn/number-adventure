import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** POST /api/children/migrate — create a DB child for an authenticated parent
 *  from a guest session. Copies all guest session data (GameSession, ChildSticker,
 *  Streak) to the new child record via a Prisma transaction. */
export async function POST(request: NextRequest) {
  try {
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Explicit parent existence guard (independent of FK constraint)
    const parent = await prisma.parent.findUnique({
      where: { id: cookieParentId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: unknown;
      age?: unknown;
      color?: unknown;
      guestId?: unknown;
    };
    const { name, age, color, guestId } = body;

    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
      return NextResponse.json({ error: 'name must be 1–50 characters' }, { status: 400 });
    }
    if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 18) {
      return NextResponse.json({ error: 'age must be an integer between 1 and 18' }, { status: 400 });
    }

    // Allowlist color to MascotColor values — reject arbitrary strings
    const VALID_COLORS = ['sun', 'sage', 'coral', 'lavender', 'sky'] as const;
    const resolvedColor = VALID_COLORS.includes(color as typeof VALID_COLORS[number])
      ? (color as string)
      : 'sage';

    // Resolve guest ID — must be a non-empty string starting with guest_
    const resolvedGuestId = typeof guestId === 'string' && guestId.startsWith('guest_')
      ? guestId
      : null;

    // Create child and copy all guest data in a single transaction.
    // findFirst runs INSIDE the transaction to close the TOCTOU window under
    // PostgreSQL READ COMMITTED (R1+R2 must be together — neither alone is sufficient).
    const txResult = await prisma.$transaction(async (tx) => {
      // Idempotency: return existing child if same name was already migrated
      // TODO(phase-3a-02)[suggestion]: key on (parentId + name + age) to prevent sibling collision
      //  (two children named "Alice" at different ages returns wrong record) — see BACKLOG.md #7
      const existing = await tx.child.findFirst({
        where: { parentId: cookieParentId, name: name.trim() },
        select: { id: true, name: true, age: true, color: true },
      });
      if (existing) return { child: existing, isNew: false as const };

      // 1. Create new DB child under parent
      const child = await tx.child.create({
        data: {
          parentId: cookieParentId,
          name: name.trim(),
          age,
          color: resolvedColor,
        },
        select: { id: true, name: true, age: true, color: true },
      });

      if (resolvedGuestId) {
        // 2. Reassign sessions from guest child to new child
        //    (GameAttempt cascades via sessionId FK — no separate update needed)
        await tx.gameSession.updateMany({
          where: { childId: resolvedGuestId },
          data: { childId: child.id },
        });

        // 3. Reassign stickers
        await tx.childSticker.updateMany({
          where: { childId: resolvedGuestId },
          data: { childId: child.id },
        });

        // 4. Copy streak (if exists) then remove the guest streak
        const guestStreak = await tx.streak.findUnique({
          where: { childId: resolvedGuestId },
        });
        if (guestStreak) {
          await tx.streak.upsert({
            where: { childId: child.id },
            create: {
              childId: child.id,
              currentStreak: guestStreak.currentStreak,
              longestStreak: guestStreak.longestStreak,
              lastPlayDate: guestStreak.lastPlayDate,
            },
            update: {
              currentStreak: guestStreak.currentStreak,
              longestStreak: guestStreak.longestStreak,
              lastPlayDate: guestStreak.lastPlayDate,
            },
          });
          await tx.streak.delete({ where: { childId: resolvedGuestId } });
        }
      }

      return { child, isNew: true };
    });

    return NextResponse.json({ child: txResult.child }, { status: txResult.isNew ? 201 : 200 });
  } catch (e) {
    // P2002 = unique constraint violation — concurrent request already created the child
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Child already exists' }, { status: 409 });
    }
    console.error('[api/children/migrate POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
