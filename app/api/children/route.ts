import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/children — list children for the authenticated parent (session cookie) */
export async function GET(request: NextRequest) {
  try {
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const children = await prisma.child.findMany({
      where: { parentId: cookieParentId },
      include: { settings: true, streak: true },
    });

    return NextResponse.json({ children });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/children — create a new child profile for the authenticated parent */
export async function POST(request: NextRequest) {
  try {
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, age, color } = body as { name?: string; age?: number; color?: string };

    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
      return NextResponse.json({ error: 'name must be 1–50 characters' }, { status: 400 });
    }
    if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 18) {
      return NextResponse.json({ error: 'age must be an integer between 1 and 18' }, { status: 400 });
    }

    const VALID_COLORS = ['sun', 'sage', 'coral', 'lavender', 'sky'] as const;
    const resolvedColor = VALID_COLORS.includes(color as typeof VALID_COLORS[number]) ? color! : 'sage';

    const child = await prisma.child.create({
      data: { parentId: cookieParentId, name: name.trim(), age, color: resolvedColor },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
