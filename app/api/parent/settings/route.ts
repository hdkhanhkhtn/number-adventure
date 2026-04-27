import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** PATCH /api/parent/settings — update parent-level settings (e.g. emailReports) */
export async function PATCH(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { emailReports?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: { emailReports?: boolean } = {};
  if (typeof body.emailReports === 'boolean') {
    updates.emailReports = body.emailReports;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  await prisma.parent.update({
    where: { id: parentId },
    data: updates,
  });

  return NextResponse.json({ ok: true });
}

/** GET /api/parent/settings — fetch parent-level settings */
export async function GET(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: { emailReports: true },
  });

  if (!parent) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(parent);
}
