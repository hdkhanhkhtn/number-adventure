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
    let body: Record<string, unknown>;
    try {
      body = await request.json();
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Numeric range validation — prevents DB corruption and logic crashes
    if (body.volume !== undefined && (typeof body.volume !== 'number' || body.volume < 0 || body.volume > 100)) {
      return NextResponse.json({ error: 'volume must be 0–100' }, { status: 400 });
    }
    if (body.dailyMin !== undefined && (typeof body.dailyMin !== 'number' || body.dailyMin < 1 || body.dailyMin > 240)) {
      return NextResponse.json({ error: 'dailyMin must be 1–240' }, { status: 400 });
    }
    if (body.bedtimeHour !== undefined && (typeof body.bedtimeHour !== 'number' || body.bedtimeHour < 0 || body.bedtimeHour > 23)) {
      return NextResponse.json({ error: 'bedtimeHour must be 0–23' }, { status: 400 });
    }
    if (body.bedtimeMinute !== undefined && (typeof body.bedtimeMinute !== 'number' || body.bedtimeMinute < 0 || body.bedtimeMinute > 59)) {
      return NextResponse.json({ error: 'bedtimeMinute must be 0–59' }, { status: 400 });
    }
    if (body.breakReminderIntervalMin !== undefined && (typeof body.breakReminderIntervalMin !== 'number' || body.breakReminderIntervalMin < 1 || body.breakReminderIntervalMin > 120)) {
      return NextResponse.json({ error: 'breakReminderIntervalMin must be 1–120' }, { status: 400 });
    }

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
