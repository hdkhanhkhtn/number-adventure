import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { params: Promise<{ id: string }> };

/** POST /api/sessions/:id/attempts — submit a game attempt
 * NOTE: `correct` must NOT come from the client — server loads AIQuestion.payload
 * by questionId and computes correctness server-side.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // TODO Phase B: load AIQuestion by questionId, compare answer, set correct server-side
    void request; void params;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
