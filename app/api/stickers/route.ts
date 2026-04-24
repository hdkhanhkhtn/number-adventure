import { NextResponse } from 'next/server';

/** GET /api/stickers — list all available sticker definitions */
export async function GET() {
  try {
    // TODO: implement in Phase B/C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

