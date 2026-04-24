import { NextResponse } from 'next/server';

/** POST /api/auth/logout — clear parent session cookie */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('parentId');
  return response;
}
