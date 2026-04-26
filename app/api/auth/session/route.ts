import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/** GET /api/auth/session — current session info for the authenticated parent */
export async function GET(request: NextRequest) {
  try {
    void request;
    const cookieStore = await cookies();
    const parentId = cookieStore.get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const gateUnlocked = !!cookieStore.get('parent-gate')?.value;

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { id: true, name: true, email: true, pinHash: true },
    });
    if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      parentId: parent.id,
      name: parent.name,
      email: parent.email,
      gateUnlocked,
      pinRequired: !!parent.pinHash,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
