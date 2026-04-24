import { NextResponse } from 'next/server';

/** GET /api/sessions/:id — get session details */
export async function GET() {
  try {
    // TODO: implement in Phase B
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/sessions/:id — complete or abandon a session */
export async function PATCH() {
  try {
    // TODO: implement in Phase B
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
