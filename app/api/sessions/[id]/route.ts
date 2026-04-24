import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { params: Promise<{ id: string }> };

/** GET /api/sessions/:id — get session details */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // TODO Phase B: verify session belongs to authenticated child (IDOR guard)
    void request; void params;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/sessions/:id — complete or abandon a session */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // TODO Phase B: verify session belongs to authenticated child, compute stars
    void request; void params;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
