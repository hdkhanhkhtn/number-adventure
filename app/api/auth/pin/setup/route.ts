import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const PIN_REGEX = /^\d{4}$/;
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 1800,
  path: '/',
};

/** POST /api/auth/pin/setup — first-time PIN creation */
export async function POST(request: NextRequest) {
  try {
    void request;
    const cookieStore = await cookies();
    const parentId = cookieStore.get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { pin?: unknown };
    if (!PIN_REGEX.test(String(body.pin ?? ''))) {
      return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { pinHash: true },
    });
    if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (parent.pinHash !== null) {
      return NextResponse.json({ error: 'PIN already configured' }, { status: 409 });
    }

    const hash = await bcrypt.hash(String(body.pin), 12);
    await prisma.parent.update({ where: { id: parentId }, data: { pinHash: hash } });

    cookieStore.set('parent-gate', '1', COOKIE_OPTS);
    return NextResponse.json({ created: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
