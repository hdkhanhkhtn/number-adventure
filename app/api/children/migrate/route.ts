import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** POST /api/children/migrate — create a DB child for an authenticated parent
 *  from a guest session. Guest data is local-only (no DB rows exist for guest_xxx
 *  child IDs because use-game-session.ts skips all DB writes for guest users).
 *  Migration only needs to CREATE a new child record; no data copy is required.
 *
 * TODO(phase-3c)[important]: Spec ambiguity — plan.md Validation Summary (line 74) confirms
 *  guest sessions ARE written to DB under a guest child record and MUST be copied via Prisma
 *  transaction. Audit use-game-session.ts for guest_* write paths and resolve before Phase 3C.
 *  See BACKLOG.md #5. */
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

    const body = await request.json() as { name?: unknown; age?: unknown; color?: unknown };
    const { name, age, color } = body;

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

    // Idempotency: return existing child if same name was already migrated
    // TODO(phase-3a-02)[suggestion]: key on (parentId + name + age) to prevent sibling collision
    //  (two children named "Alice" at different ages returns wrong record) — see BACKLOG.md #7
    const existing = await prisma.child.findFirst({
      where: { parentId: cookieParentId, name: name.trim() },
      select: { id: true, name: true, age: true, color: true },
    });
    if (existing) {
      return NextResponse.json({ child: existing }, { status: 200 });
    }

    const child = await prisma.child.create({
      data: { parentId: cookieParentId, name: name.trim(), age, color: resolvedColor },
      select: { id: true, name: true, age: true, color: true },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
