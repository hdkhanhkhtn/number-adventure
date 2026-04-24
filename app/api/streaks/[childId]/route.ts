import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { params: Promise<{ childId: string }> };

/** GET /api/streaks/:childId — get streak data for a child */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // TODO Phase B: verify child.parentId === session.parentId (IDOR guard)
    void request; void params;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
