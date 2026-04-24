import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** POST /api/ai/generate-questions — generate and cache AI questions for a lesson
 * Phase B: call AI_ENDPOINT, validate output, store in AIQuestion table.
 * Server-side: clamp count = Math.min(count ?? 10, 50) before forwarding.
 */
export async function POST(request: NextRequest) {
  try {
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
