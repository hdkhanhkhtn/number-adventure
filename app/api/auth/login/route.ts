import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** POST /api/auth/login — authenticate parent and issue session */
export async function POST(request: NextRequest) {
  try {
    // TODO: implement in Phase C
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
