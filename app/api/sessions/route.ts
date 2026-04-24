import { NextResponse } from 'next/server';

/** POST /api/sessions — start a new game session */
export async function POST() {
  try {
    // TODO: implement in Phase B
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
