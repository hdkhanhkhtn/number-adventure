# High Issues — SHOULD Fix

**PR #5 Phase C | 11 High findings**

---

## F7 — No Rate Limiting on Auth Endpoints

**Severity:** HIGH | **Category:** Security | **Effort:** Small

**Location:** `app/api/auth/login/route.ts` (entire file)

**Issue:** Unlimited password attempts. Attacker can brute-force parent credentials at thousands of
requests/second with no throttling.

**Fix (Next.js middleware or in-route):**
```typescript
// Simple in-memory approach (replace with Redis for production):
// app/api/auth/login/route.ts — add at top of POST handler
const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
// Track via upstash/ratelimit or next-rate-limit in production.
// Minimum: add to middleware.ts:
// import { RateLimit } from 'next-rate-limit';
// limit auth endpoints to 5 req/15min per IP
```

**Risk:** Account takeover via password brute-force.

---

## F5 — No Password Minimum Length Validation (Login)

**Severity:** HIGH | **Category:** Security | **Effort:** Trivial

**Location:** `app/api/auth/login/route.ts:12-13`

**Issue:** `!password` is falsy check only. Password `" "` (single space) passes and reaches bcrypt.

**Fix:**
```typescript
// app/api/auth/login/route.ts:12 — replace guard
if (!email || !password || password.trim().length < 8) {
  return NextResponse.json({ error: 'email and password required' }, { status: 400 });
}
```

---

## F6 — No Password Strength / Email Format Validation (Register)

**Severity:** HIGH | **Category:** Security | **Effort:** Small

**Location:** `app/api/auth/register/route.ts:12-13`

**Issue:** No minimum password length, no email format check. Accepts `email="notanemail"` and
`password="1"`.

**Fix:**
```typescript
// app/api/auth/register/route.ts:12 — replace guard
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email) || !password || password.length < 8) {
  return NextResponse.json(
    { error: 'Valid email and password (min 8 chars) required' },
    { status: 400 }
  );
}
// Also normalize email before DB operations:
const normalizedEmail = email.toLowerCase().trim();
```

**Also fixes F30 (email normalization).**

---

## F9 — 5 Sequential DB Queries in Report Route

**Severity:** HIGH | **Category:** Performance | **Effort:** Small

**Location:** `app/api/report/[childId]/route.ts:29-95`

**Issue:** Five `await prisma.*` calls execute sequentially. On a DB with 50ms latency, this is 250ms+
before response. First 3 (count, aggregate, recentSessions) are fully independent.

**Fix — parallelize independent queries:**
```typescript
// app/api/report/[childId]/route.ts — replace lines 29-95 preamble
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const [lessonsCompleted, starResult, recentSessions, sessions, attempts, streak] =
  await Promise.all([
    prisma.gameSession.count({ where: { childId, status: 'completed' } }),
    prisma.gameSession.aggregate({ where: { childId, status: 'completed' }, _sum: { stars: true } }),
    prisma.gameSession.findMany({
      where: { childId, status: 'completed', completedAt: { gte: sevenDaysAgo } },
      select: { completedAt: true },
    }),
    prisma.gameSession.findMany({
      where: { childId, status: 'completed' },
      include: { lesson: { select: { gameType: true } } },
    }),
    prisma.gameAttempt.findMany({
      where: { session: { childId } },
      select: { correct: true, session: { select: { lesson: { select: { gameType: true } } } } },
    }),
    prisma.streak.findUnique({ where: { childId } }),
  ]);
const totalStars = starResult._sum.stars ?? 0;
// rest of aggregation logic unchanged
```

**Performance impact:** ~5× reduction in DB wait time on cold paths.

---

## F29 — Unbounded gameAttempt Query (No Date Filter)

**Severity:** HIGH | **Category:** Performance | **Effort:** Small

**Location:** `app/api/report/[childId]/route.ts:70-73`

**Issue:** Loads ALL game attempts for a child with no limit. 1 year of play = ~50,000+ rows in memory.

**Fix — add date filter or reasonable limit:**
```typescript
// Add to the attempts query in Promise.all above:
prisma.gameAttempt.findMany({
  where: {
    session: { childId },
    createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // last 90 days
  },
  select: { correct: true, session: { select: { lesson: { select: { gameType: true } } } } },
}),
```

---

## F14 — Residual Loop Risk in number-order-engine (target=1 Edge Case)

**Severity:** HIGH | **Category:** Correctness | **Effort:** Trivial

**Location:** `lib/game-engine/number-order-engine.ts:10-13`

**Issue:** When `target=1` (~3% of questions), all negative offsets produce `Math.max(1, 1-k)=1`
(duplicate). Loop relies on 50% probability of positive offset to terminate. Can take many iterations.

**Fix — add loop guard + deterministic fallback:**
```typescript
// lib/game-engine/number-order-engine.ts:10-13 — replace while block
const opts = new Set([target]);
let guard = 0;
while (opts.size < 3 && guard++ < 50) {
  opts.add(Math.max(1, target + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 4))));
}
// Fallback: fill remaining slots deterministically
if (opts.size < 3) opts.add(target + 1);
if (opts.size < 3) opts.add(target + 2);
```

---

## F18 — ParentGate is UX-Only; No Session Established After Pass

**Severity:** HIGH | **Category:** Security | **Effort:** Medium

**Location:** `components/parent/parent-gate.tsx`, `app/(child)/home/page.tsx:65-68`

**Issue:** Solving the math puzzle calls `onPass()` → `router.push('/dashboard')`. No session cookie
is set. Direct navigation to `/dashboard` bypasses the gate entirely.

**Fix:** After ParentGate passes, call login API to establish a real session, OR:
1. Implement a lightweight "parent PIN" flow instead of math challenge
2. On `onPass`, call `POST /api/auth/login` with stored credentials
3. OR document clearly that security is NOT the intent — gate is anti-toddler, not auth

**Minimum acceptable fix:** Add comment and don't represent this as security in docs.

---

## F24 — add-take-engine Tests Don't Cover target=0 Edge Case

**Severity:** HIGH | **Category:** Correctness | **Effort:** Small

**Location:** `__tests__/game-engine/add-take-engine.test.ts`

**Issue:** Test mocks force `target=3` and `target=1`. The infinite-loop trigger (`target=0`) is
never tested. Regression protection is incomplete.

**Fix — add a dedicated regression test:**
```typescript
it('should not infinite-loop when target=0 (a===b subtraction)', () => {
  // Force a=3, b=3, op='-' → target=0 (after swap, a=3, b=3 unchanged)
  const mockValues = [
    0.6,  // op = '-'
    0.25, // a = 2 + floor(0.25*6) = 2+1 = 3
    0.5,  // b = 1 + floor(0.5*4) = 1+2 = 3 → swap → no-op (b===a already)
    // distractor attempts: force values in range to complete quickly
    0.8, 0.3, 0.1, 0.9,
  ];
  let idx = 0;
  jest.spyOn(Math, 'random').mockImplementation(() => mockValues[idx++ % mockValues.length]);
  expect(() => generateAddTakeQuestion()).not.toThrow();
  const q = generateAddTakeQuestion();
  expect(q.options).toHaveLength(4);
});
```

---

## F25 — Zero Test Coverage for Auth, Children, and Report Routes

**Severity:** HIGH | **Category:** Correctness | **Effort:** Large

**Location:** `app/api/auth/*, app/api/children/*, app/api/report/*`

**Issue:** The most security-critical routes have zero tests. No test for:
- Login success / wrong password / unknown email
- Register success / duplicate email
- Children list / create
- Settings get / patch
- Report aggregation

**Minimum fix — add auth route tests:**
```typescript
// __tests__/api/auth-login.test.ts
import { POST } from '@/app/api/auth/login/route';
// Mock prisma + bcrypt, test: success (200), wrong password (401), missing fields (400)
```

**Effort:** ~4 new test files, ~300 lines total.

---

## F19 — Empty Games Array Shows "0%" Not "—" in Dashboard

**Severity:** HIGH | **Category:** Correctness | **Effort:** Trivial

**Location:** `components/screens/parent-dashboard-content.tsx:80`

**Issue:** New child with no sessions shows `0%` accuracy instead of `—` like other metrics.

**Fix:**
```typescript
// parent-dashboard-content.tsx:80 — replace value prop
value={report && report.games.length > 0
  ? `${Math.round(report.games.reduce((s, g) => s + g.accuracy, 0) / report.games.length)}%`
  : '—'}
```

---

## F21 — Missing AbortController on Report Fetch (Memory Leak)

**Severity:** HIGH | **Category:** Performance | **Effort:** Small

**Location:** `components/screens/parent-dashboard-content.tsx:36-42`

**Issue:** `fetch` has no cleanup. If component unmounts before fetch completes (e.g., user navigates
away), `setReport` is called on an unmounted component → React warning + potential memory leak.

**Fix:**
```typescript
useEffect(() => {
  if (!childId || childId.startsWith('guest_')) return;
  const controller = new AbortController();
  fetch(`/api/report/${childId}`, { signal: controller.signal, credentials: 'include' })
    .then(r => r.json())
    .then(setReport)
    .catch(e => { if (e.name !== 'AbortError') console.error(e); });
  return () => controller.abort();
}, [childId]);
```

**Apply same pattern to `parent-settings-content.tsx:37-42`.**
