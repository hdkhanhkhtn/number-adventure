import { NextResponse } from 'next/server';

/** GET /api/auth/session — get current session info */
export async function GET() {
  try {
    // TODO: implement in Phase C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
