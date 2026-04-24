import { NextResponse } from 'next/server';

/** GET /api/report/:childId — get detailed child progress report */
export async function GET() {
  try {
    // TODO: implement in Phase B/C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

