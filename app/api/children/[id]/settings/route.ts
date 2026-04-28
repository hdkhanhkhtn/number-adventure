import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

/** GET /api/children/:id/settings — fetch child settings */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const child = await prisma.child.findUnique({ where: { id }, select: { parentId: true } });
    if (!child || child.parentId !== cookieParentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const settings = await prisma.childSettings.findUnique({ where: { childId: id } });
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/children/:id/settings — upsert child settings */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const child = await prisma.child.findUnique({ where: { id }, select: { parentId: true } });
    if (!child || child.parentId !== cookieParentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();

    // Strip unknown keys — only allow known ChildSettings fields
    const allowed = [
      'dailyMin', 'difficulty', 'kidLang', 'parentLang',
      'sfx', 'music', 'voice', 'voiceStyle', 'quietHours',
      'volume', 'highContrast', 'reduceMotion',
      'bedtimeEnabled', 'bedtimeHour', 'bedtimeMinute',
      'breakReminderEnabled', 'breakReminderIntervalMin',
      'gameHints', 'gameRotation',
    ];
    const data = Object.fromEntries(
      Object.entries(body as Record<string, unknown>).filter(([k]) => allowed.includes(k))
    );

    const settings = await prisma.childSettings.upsert({
      where: { childId: id },
      update: data,
      create: { childId: id, ...data },
    });

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PUT /api/children/:id/settings — alias for PATCH */
export { PATCH as PUT };
