# Critical Issues — MUST Fix Before Merge

**PR #5 Phase C | 6 Critical findings**

---

## F28 — No Next.js Middleware (Auth Guard Missing)

**Severity:** CRITICAL | **Category:** Security | **Effort:** Medium

**Location:** `/` (root — file does not exist)

**Issue:** No `middleware.ts` at the project root. Routes `/dashboard`, `/report`, `/settings` are publicly
accessible via direct URL navigation. Server-side rendering runs with zero auth check.

**Fix:**
```typescript
// middleware.ts (create at project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const parentId = request.cookies.get('parentId')?.value;
  const { pathname } = request.nextUrl;

  const parentPaths = ['/dashboard', '/report', '/settings'];
  if (parentPaths.some(p => pathname.startsWith(p)) && !parentId) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/report/:path*', '/settings/:path*'],
};
```

**Risk of not fixing:** Any user can visit `/dashboard` and access parent features without authentication.

---

## F1 — Login Returns parentId Without Setting a Session Cookie

**Severity:** CRITICAL | **Category:** Security | **Effort:** Medium

**Location:** `app/api/auth/login/route.ts:26`

**Issue:** `POST /api/auth/login` returns `{ parentId, name, email }` in response body. No session cookie
is set. Client has nowhere secure to store parentId; API routes cannot verify who the caller is.

**Fix — set HttpOnly cookie on login:**
```typescript
// app/api/auth/login/route.ts:26 — replace the return statement
const response = NextResponse.json({ parentId: parent.id, name: parent.name, email: parent.email });
response.cookies.set('parentId', parent.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
});
return response;
```

**Also add logout route:**
```typescript
// app/api/auth/logout/route.ts (new file)
import { NextResponse } from 'next/server';
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('parentId');
  return response;
}
```

**Risk of not fixing:** Sessions cannot be validated server-side; all auth is theatre.

---

## F2 — GET /api/children Leaks All Children for Any parentId

**Severity:** CRITICAL | **Category:** Security | **Effort:** Small

**Location:** `app/api/children/route.ts:8-11`

**Issue:** `parentId` comes from query string with no session check. Any caller who knows a UUID can
list any parent's children.

**Fix — verify parentId matches session cookie:**
```typescript
// app/api/children/route.ts — GET handler, after line 8
export async function GET(request: NextRequest) {
  try {
    const cookieParentId = request.cookies.get('parentId')?.value;
    if (!cookieParentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const parentId = cookieParentId; // use cookie, not query param
    // ... rest unchanged
```

**Risk of not fixing:** Cross-account enumeration of all children's profiles.

---

## F3 — PATCH /api/children/:id/settings Has No Ownership Check

**Severity:** CRITICAL | **Category:** Security | **Effort:** Small

**Location:** `app/api/children/[id]/settings/route.ts:22-43`

**Issue:** Any caller with a `childId` can modify that child's settings (difficulty, language, quiet hours,
audio). No check that the caller owns the child.

**Fix:**
```typescript
// app/api/children/[id]/settings/route.ts — PATCH handler, add after line 24
const { id } = await params;
const cookieParentId = request.cookies.get('parentId')?.value;
if (!cookieParentId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// Verify ownership
const child = await prisma.child.findUnique({ where: { id }, select: { parentId: true } });
if (!child || child.parentId !== cookieParentId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
// ... rest unchanged
```

**Same pattern required for GET handler on line 8.**

**Risk of not fixing:** Settings tampering; child's learning parameters altered by unauthorized users.

---

## F4 — GET /api/report/:childId Exposes Child Data Without Auth

**Severity:** CRITICAL | **Category:** Security | **Effort:** Small

**Location:** `app/api/report/[childId]/route.ts:24-26`

**Issue:** Full progress report (lessons, stars, accuracy, play habits, streak) accessible to any caller
with a `childId`. No session validation.

**Fix:**
```typescript
// app/api/report/[childId]/route.ts — GET handler, add after line 26
const { childId } = await params;
const cookieParentId = request.cookies.get('parentId')?.value;
if (!cookieParentId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
if (!child || child.parentId !== cookieParentId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Risk of not fixing:** Child behavioral and performance data leaked to any user who guesses a UUID.

---

## F17 — Parent Dashboard Fetches Data Without Client-Side Auth Check

**Severity:** CRITICAL | **Category:** Security | **Effort:** Small

**Location:** `components/screens/parent-dashboard-content.tsx:37`

**Issue:** Dashboard renders and fetches `/api/report/{childId}` with only a `guest_` prefix check —
no verification that a parent is authenticated. Once API routes are secured (F1–F4), this becomes
a secondary issue, but a client-side guard should also exist.

**Fix — add auth check before fetch:**
```typescript
// parent-dashboard-content.tsx useEffect, replace line 37
useEffect(() => {
  if (!childId || childId.startsWith('guest_')) return;
  fetch(`/api/report/${childId}`, { credentials: 'include' })
    .then(r => {
      if (r.status === 401) { router.push('/home'); return null; }
      return r.json();
    })
    .then(data => { if (data) setReport(data); })
    .catch(console.error);
}, [childId, router]);
```

**Apply same pattern to `parent-settings-content.tsx:37-42` and `parent-report-content.tsx`.**

**Risk of not fixing:** After API auth is added, unauthenticated clients silently show empty dashboards
instead of redirecting users to login.
