import { NextResponse } from 'next/server';

/** POST /api/ai/generate-questions — generate questions via AI */
export async function POST() {
  try {
    // TODO: implement in Phase B/C
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

