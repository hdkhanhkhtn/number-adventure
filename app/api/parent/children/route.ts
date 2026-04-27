import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/parent/children — list children for the authenticated parent */
export async function GET(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: { parentId },
    select: { id: true, name: true, age: true, color: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(children);
}

/** POST /api/parent/children — create a new child profile for the authenticated parent */
export async function POST(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; age?: number; color?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ALLOWED_COLORS = ['sun', 'sage', 'coral', 'lavender', 'sky'] as const;
  const { name, age, color = 'sage' } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (typeof age !== 'number' || age < 2 || age > 12) {
    return NextResponse.json({ error: 'age must be 2–12' }, { status: 400 });
  }
  if (!ALLOWED_COLORS.includes(color as typeof ALLOWED_COLORS[number])) {
    return NextResponse.json({ error: `color must be one of: ${ALLOWED_COLORS.join(', ')}` }, { status: 400 });
  }

  // Cap at 10 children per parent to prevent storage abuse (W1)
  const existing = await prisma.child.count({ where: { parentId } });
  if (existing >= 10) {
    return NextResponse.json({ error: 'Maximum 10 child profiles per account' }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: { parentId, name: name.trim(), age, color },
    select: { id: true, name: true, age: true, color: true },
  });

  return NextResponse.json(child, { status: 201 });
}
