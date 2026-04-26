import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/** DELETE /api/children/:id/progress — wipe all game progress for a child */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const parentId = cookieStore.get('parentId')?.value;
    if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // IDOR check: verify child belongs to authenticated parent
    const child = await prisma.child.findUnique({ where: { id }, select: { parentId: true } });
    if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (child.parentId !== parentId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.$transaction([
      prisma.gameSession.deleteMany({ where: { childId: id } }),
      prisma.childSticker.deleteMany({ where: { childId: id } }),
      prisma.streak.deleteMany({ where: { childId: id } }),
      prisma.difficultyProfile.deleteMany({ where: { childId: id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
