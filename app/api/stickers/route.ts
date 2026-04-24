import { NextResponse } from 'next/server';
import { STICKER_DEFS } from '@/src/data/game-config/sticker-defs';

/** GET /api/stickers — list all available sticker definitions */
export async function GET() {
  return NextResponse.json({ stickers: STICKER_DEFS });
}
