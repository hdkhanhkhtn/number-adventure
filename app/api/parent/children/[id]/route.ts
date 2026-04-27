import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** PUT /api/parent/children/:id — update a child profile owned by the authenticated parent */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // IDOR check: verify child belongs to authenticated parent
  const child = await prisma.child.findUnique({ where: { id }, select: { parentId: true } });
  if (!child || child.parentId !== parentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: { name?: string; age?: number; color?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: { name?: string; age?: number; color?: string } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'name must be non-empty string' }, { status: 400 });
    }
    updates.name = body.name.trim();
  }
  if (body.age !== undefined) {
    if (typeof body.age !== 'number' || body.age < 2 || body.age > 12) {
      return NextResponse.json({ error: 'age must be 2–12' }, { status: 400 });
    }
    updates.age = body.age;
  }
  if (body.color !== undefined) {
    updates.color = String(body.color);
  }

  const updated = await prisma.child.update({
    where: { id },
    data: updates,
    select: { id: true, name: true, age: true, color: true },
  });

  return NextResponse.json(updated);
}
