import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { params: Promise<{ lessonId: string }> };

/** GET /api/lessons/:lessonId — get lesson details with completion status */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // TODO Phase B: return lesson config + child completion/stars from DB
    void request; void params;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
