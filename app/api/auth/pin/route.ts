import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** POST /api/auth/pin — verify parent PIN (4-digit gate)
 * Phase C: add rate limiting (5 attempts/min) and PIN length validation
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: implement in Phase C (with rate limiting + bcrypt compare)
    void request;
    return NextResponse.json({ error: 'Not implemented', status: 501 }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
