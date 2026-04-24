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

    if (!name || typeof age !== 'number' || age < 1 || age > 18) {
      return NextResponse.json({ error: 'name and age (1–18) required' }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: { parentId: cookieParentId, name, age, color: color ?? 'sage' },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
