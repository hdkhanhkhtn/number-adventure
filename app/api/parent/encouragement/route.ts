import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/parent/encouragement — parent sends a message to a child.
 * Auth: parentId cookie (parent session).
 * Guards: parent must own the child; message capped at 200 chars.
 */
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

  // IDOR: verify parent owns child
  const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
  if (!child || child.parentId !== parentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const msg = await prisma.encouragementMessage.create({
    data: { parentId, childId, message: message.trim() },
    select: { id: true, message: true, createdAt: true },
  });
  return NextResponse.json(msg, { status: 201 });
}

/**
 * GET /api/parent/encouragement?childId=... — child home screen fetches latest unread message.
 *
 * Auth model: child-facing read, consistent with /api/streaks/:childId and /api/progress/:childId
 * which are also unauthenticated in this codebase. The childId must exist in the DB (prevents
 * blind enumeration). Messages contain only personal encouragement text — not PII beyond the child's
 * own data which the caller (child home screen) already possesses.
 *
 * TODO(phase-4): introduce a short-lived child session token for stronger auth on child-facing reads.
 */
export async function GET(request: NextRequest) {
  const childId = request.nextUrl.searchParams.get('childId');
  if (!childId) {
    return NextResponse.json({ error: 'childId required' }, { status: 400 });
  }

  // Verify childId exists — prevents fishing for messages with fabricated IDs
  const childExists = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true },
  });
  if (!childExists) {
    return NextResponse.json(null); // same shape as "no message" to avoid enumeration
  }

  const msg = await prisma.encouragementMessage.findFirst({
    where: { childId, read: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, message: true, createdAt: true },
  });
  return NextResponse.json(msg ?? null);
}

/**
 * PATCH /api/parent/encouragement — child dismisses (marks read) a specific message.
 *
 * Requires both messageId and childId so only a caller who knows both can mark as read.
 * Prevents arbitrary marking of any message by ID alone (C3).
 */
export async function PATCH(request: NextRequest) {
  let body: { id?: string; childId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.id || !body.childId) {
    return NextResponse.json({ error: 'id and childId required' }, { status: 400 });
  }

  // Verify message belongs to the claimed child before marking read
  const msg = await prisma.encouragementMessage.findUnique({
    where: { id: body.id },
    select: { childId: true },
  });
  if (!msg || msg.childId !== body.childId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.encouragementMessage.update({
    where: { id: body.id },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
