import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, clearRateLimit } from '@/lib/auth/pin-rate-limiter';

const PIN_REGEX = /^\d{4}$/;
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 1800,
  path: '/',
};

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

/** POST /api/auth/pin — verify parent PIN */
export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts', retryAfterMs: rateCheck.retryAfterMs },
        { status: 429 }
      );
    }

    const body = await request.json() as { pin?: unknown };
    if (!PIN_REGEX.test(String(body.pin ?? ''))) {
      return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 });
    }

    const parentId = (await cookies()).get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { pinHash: true },
    });
    if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // First-time setup: no PIN configured yet
    if (parent.pinHash === null) {
      return NextResponse.json({ pinSetupRequired: true }, { status: 200 });
    }

    const match = await bcrypt.compare(String(body.pin), parent.pinHash);
    if (!match) {
      return NextResponse.json(
        { error: 'Wrong PIN', attemptsRemaining: rateCheck.attemptsRemaining },
        { status: 403 }
      );
    }

    clearRateLimit(ip);
    const cookieStore = await cookies();
    cookieStore.set('parent-gate', '1', COOKIE_OPTS);
    return NextResponse.json({ unlocked: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PUT /api/auth/pin — change existing PIN */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('parent-gate')?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { currentPin?: unknown; newPin?: unknown };
    const currentPin = String(body.currentPin ?? '');
    const newPin = String(body.newPin ?? '');
    if (!PIN_REGEX.test(currentPin) || !PIN_REGEX.test(newPin)) {
      return NextResponse.json({ error: 'PINs must be 4 digits' }, { status: 400 });
    }

    const parentId = cookieStore.get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { pinHash: true },
    });
    if (!parent?.pinHash) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const match = await bcrypt.compare(currentPin, parent.pinHash);
    if (!match) return NextResponse.json({ error: 'Wrong PIN' }, { status: 403 });

    const newHash = await bcrypt.hash(newPin, 12);
    await prisma.parent.update({ where: { id: parentId }, data: { pinHash: newHash } });
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
