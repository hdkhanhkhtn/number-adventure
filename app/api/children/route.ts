import { NextResponse } from 'next/server';

/** GET /api/children — list children for authenticated parent */
export async function GET() {
  try {
    // TODO: implement in Phase C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/children — create a new child profile */
export async function POST() {
  try {
    // TODO: implement in Phase C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
