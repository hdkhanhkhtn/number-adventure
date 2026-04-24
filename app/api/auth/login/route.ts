import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/** POST /api/auth/login — validate parent credentials */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password || password.trim().length < 8) {
      return NextResponse.json({ error: 'email and password (min 8 chars) required' }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({ where: { email } });
    if (!parent) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, parent.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ parentId: parent.id, name: parent.name, email: parent.email });
    response.cookies.set('parentId', parent.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
