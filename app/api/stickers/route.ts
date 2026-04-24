import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** GET /api/stickers — list all available sticker definitions */
export async function GET(request: NextRequest) {
  try {
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
