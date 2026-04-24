import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/children?parentId=xxx — list children for a parent */
export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get('parentId');
    if (!parentId) {
      return NextResponse.json({ error: 'parentId required' }, { status: 400 });
    }

    const children = await prisma.child.findMany({
      where: { parentId },
      include: { settings: true, streak: true },
    });

    return NextResponse.json({ children });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/children — create a new child profile */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentId, name, age, color } = body as {
      parentId?: string; name?: string; age?: number; color?: string;
    };

    if (!parentId || !name || age === undefined) {
      return NextResponse.json({ error: 'parentId, name, age required' }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: { parentId, name, age, color: color ?? 'sage' },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
