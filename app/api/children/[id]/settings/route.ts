import { NextResponse } from 'next/server';

/** GET /api/children/:id/settings */
export async function GET() {
  try {
    // TODO: implement in Phase C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PUT /api/children/:id/settings — update child settings */
export async function PUT() {
  try {
    // TODO: implement in Phase C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
