import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** GET /api/worlds — list worlds with unlock status for authenticated child */
export async function GET(request: NextRequest) {
  try {
    // TODO Phase B: return worlds from static config + unlock status from DB
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
