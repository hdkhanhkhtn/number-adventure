import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/** PATCH /api/auth/profile — update parent display name */
export async function PATCH(request: NextRequest) {
  void request;
  try {
    const cookieStore = await cookies();
    const parentId = cookieStore.get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { name?: string };
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    await prisma.parent.update({ where: { id: parentId }, data: { name: body.name.trim() } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
