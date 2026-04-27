import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** POST /api/parent/encouragement — send encouragement message to a child */
export async function POST(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { childId?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { childId, message } = body;
  if (!childId || !message || typeof message !== 'string') {
    return NextResponse.json({ error: 'childId and message required' }, { status: 400 });
  }
  if (message.trim().length === 0 || message.length > 200) {
    return NextResponse.json({ error: 'message must be 1–200 chars' }, { status: 400 });
  }

  // Verify parent owns child
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.parentId !== parentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const msg = await prisma.encouragementMessage.create({
    data: { parentId, childId, message: message.trim() },
    select: { id: true, message: true, createdAt: true },
  });
  return NextResponse.json(msg, { status: 201 });
}

/** GET /api/parent/encouragement?childId=... — fetch latest unread message for child */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get('childId');
  if (!childId) {
    return NextResponse.json({ error: 'childId required' }, { status: 400 });
  }

  const msg = await prisma.encouragementMessage.findFirst({
    where: { childId, read: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, message: true, createdAt: true },
  });
  return NextResponse.json(msg ?? null);
}

/** PATCH /api/parent/encouragement — mark a message as read */
export async function PATCH(request: NextRequest) {
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await prisma.encouragementMessage.update({
    where: { id: body.id },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
