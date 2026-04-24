import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/** POST /api/auth/register — create new parent account */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body as { email?: string; password?: string; name?: string };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Valid email and password (min 8 chars) required' },
        { status: 400 }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.parent.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const parent = await prisma.parent.create({
      data: { email: normalizedEmail, passwordHash, name: name ?? null },
    });

    return NextResponse.json({ parentId: parent.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
