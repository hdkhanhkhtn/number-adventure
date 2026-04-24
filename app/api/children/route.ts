import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** GET /api/children — list children for authenticated parent */
export async function GET(request: NextRequest) {
  try {
    // TODO Phase C: prisma.child.findMany({ where: { parentId: session.parentId } })
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/children — create a new child profile */
export async function POST(request: NextRequest) {
  try {
    // TODO Phase C: validate body, prisma.child.create({ data: { ...body, parentId: session.parentId } })
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
