# Phase 01 — Auth Hardening

## Context Links

- [Parent plan](./plan.md)
- [Auth research](./research/researcher-auth-impl.md)
- Existing login route: `app/api/auth/login/route.ts`
- Existing PIN stub: `app/api/auth/pin/route.ts`
- Existing session stub: `app/api/auth/session/route.ts`
- Middleware: `middleware.ts`
- Schema: `prisma/schema.prisma` (Parent.pinHash String?)

## Overview

- **Priority**: P0
- **Status**: pending
- **Description**: Replace the two 501 auth stubs with real implementations. `POST /api/auth/pin` verifies a 4-digit PIN via bcryptjs with LRU-based rate limiting (5 attempts / 15 min / IP). `GET /api/auth/session` reads existing cookies and returns parent info. Create `lib/auth/pin-rate-limiter.ts` as a standalone module.

## Key Insights

- `bcryptjs@3.0.3` already installed (pure JS, no Edge runtime annotation needed)
- `login/route.ts` already sets `parentId` httpOnly cookie — PIN gate adds a second `parent-gate` cookie
- `Parent.pinHash` is `String?` — null means PIN not yet set; gate must auto-pass or prompt setup
- `lru-cache` is a transitive dep of Next.js; import `LRUCache` from `lru-cache`
- `cookies()` from `next/headers` must be `await`ed in Next.js 15+
- IP extraction: `x-forwarded-for` header (no `request.ip` in Next.js 15+)

## Requirements

### Functional
- FR1: `POST /api/auth/pin` accepts `{ pin: string }`, validates 4-digit format, compares against `Parent.pinHash`, returns `{ unlocked: true }` or `{ error, attemptsRemaining }`
- FR2: On success, sets `parent-gate` cookie (httpOnly, secure in prod, sameSite strict, 30 min maxAge)
- FR3: Rate limit: 5 attempts per 15 min per IP; return 429 with `retryAfterMs` when exceeded
- FR4: If `pinHash` is null (PIN never set), return `{ unlocked: true, pinRequired: false }` and set cookie
- FR5: `GET /api/auth/session` reads `parentId` cookie, queries `prisma.parent.findUnique`, returns `{ parentId, name, email, gateUnlocked, pinRequired }`
- FR6: `GET /api/auth/session` returns 401 if no `parentId` cookie

### Non-Functional
- NFR1: No new npm packages (use existing `bcryptjs` + `lru-cache`)
- NFR2: Rate limiter resets on process restart (acceptable for single-instance deploy)
- NFR3: PIN route must not leak timing info (bcrypt.compare is constant-time by design)

## Architecture

```
POST /api/auth/pin
  → extract IP from x-forwarded-for
  → checkRateLimit(ip) from lib/auth/pin-rate-limiter.ts
  → read parentId cookie → prisma.parent.findUnique
  → if pinHash null → auto-pass, set parent-gate cookie
  → bcrypt.compare(pin, pinHash) → set parent-gate cookie on success
  → return result

GET /api/auth/session
  → read parentId cookie + parent-gate cookie
  → prisma.parent.findUnique({ where: { id: parentId }, select: { id, name, email, pinHash } })
  → return { parentId, name, email, gateUnlocked: !!parentGateCookie, pinRequired: !!pinHash }
```

## Related Code Files

### CREATE
- `lib/auth/pin-rate-limiter.ts` — LRU-based sliding window rate limiter

### MODIFY
- `app/api/auth/pin/route.ts` — replace 501 stub with real implementation
- `app/api/auth/session/route.ts` — replace 501 stub with real implementation

### NO CHANGE
- `components/parent/parent-gate.tsx` — math challenge is anti-toddler friction, stays as-is
- `middleware.ts` — already checks `parentId` cookie for parent routes; add `/api/auth/pin` to `PUBLIC_API_PATHS`

## Implementation Steps

### Step 1: Create `lib/auth/pin-rate-limiter.ts`

Create a module exporting `checkRateLimit(ip: string): { allowed: boolean; attemptsRemaining: number; retryAfterMs: number }`.

```typescript
import { LRUCache } from 'lru-cache';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

const cache = new LRUCache<string, number[]>({ max: 500, ttl: WINDOW_MS });

export function checkRateLimit(ip: string): { allowed: boolean; attemptsRemaining: number; retryAfterMs: number } {
  const now = Date.now();
  const attempts = (cache.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (attempts.length >= MAX_ATTEMPTS) {
    const oldest = attempts[0];
    return { allowed: false, attemptsRemaining: 0, retryAfterMs: WINDOW_MS - (now - oldest) };
  }
  cache.set(ip, [...attempts, now]);
  return { allowed: true, attemptsRemaining: MAX_ATTEMPTS - attempts.length - 1, retryAfterMs: 0 };
}
```

### Step 2: Implement `POST /api/auth/pin`

Replace contents of `app/api/auth/pin/route.ts`:
- Import `bcrypt` from `bcryptjs`, `prisma` from `@/lib/prisma`, `cookies` from `next/headers`, `checkRateLimit` from `@/lib/auth/pin-rate-limiter`
- Extract IP from `request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'`
- Call `checkRateLimit(ip)` — return 429 if not allowed
- Parse body `{ pin }`, validate `/^\d{4}$/`
- Read `parentId` from `(await cookies()).get('parentId')?.value` — return 401 if missing
- Query `prisma.parent.findUnique({ where: { id: parentId }, select: { pinHash: true } })`
- If `pinHash` is null: set `parent-gate` cookie, return `{ unlocked: true, pinRequired: false }`
- `await bcrypt.compare(pin, parent.pinHash)` — on success set `parent-gate` cookie (httpOnly, secure, sameSite strict, maxAge 1800, path `/`), return `{ unlocked: true }`
- On failure return `{ error: 'Wrong PIN', attemptsRemaining }` with status 403

### Step 3: Implement `GET /api/auth/session`

Replace contents of `app/api/auth/session/route.ts`:
- Read `parentId` from `(await cookies()).get('parentId')?.value` — return 401 if missing
- Read `gateUnlocked` from `!!(await cookies()).get('parent-gate')?.value`
- Query `prisma.parent.findUnique({ where: { id: parentId }, select: { id: true, name: true, email: true, pinHash: true } })`
- Return 404 if parent not found
- Return `{ parentId: parent.id, name: parent.name, email: parent.email, gateUnlocked, pinRequired: !!parent.pinHash }`

### Step 4: Update middleware

In `middleware.ts`, add `/api/auth/pin` and `/api/auth/session` to `PUBLIC_API_PATHS` array (PIN verification must work without `bap-session` cookie since parent is authenticating).

## Todo List

- [ ] Create `lib/auth/pin-rate-limiter.ts` with LRU sliding window
- [ ] Implement `POST /api/auth/pin` with bcrypt compare + rate limiting + cookie
- [ ] Implement `GET /api/auth/session` reading cookies + DB lookup
- [ ] Add `/api/auth/pin` and `/api/auth/session` to `PUBLIC_API_PATHS` in `middleware.ts`
- [ ] Verify `lru-cache` is importable (check `node_modules/lru-cache`)
- [ ] Test: correct PIN → 200 + `parent-gate` cookie set
- [ ] Test: wrong PIN → 403 + attemptsRemaining decremented
- [ ] Test: 6th attempt → 429 with retryAfterMs
- [ ] Test: null pinHash → auto-pass with pinRequired: false
- [ ] Test: session endpoint returns parent info when parentId cookie present
- [ ] Test: session endpoint returns 401 when no parentId cookie

## Success Criteria

1. `POST /api/auth/pin` with correct PIN returns `{ unlocked: true }` and sets `parent-gate` httpOnly cookie
2. 6th wrong PIN attempt within 15 min returns 429
3. `GET /api/auth/session` with valid `parentId` cookie returns parent name/email/gateUnlocked
4. Parent with no pinHash auto-passes gate (no PIN prompt)
5. No new npm packages added

## Risk Assessment

- **lru-cache API version**: transitive dep version may differ. If `LRUCache` constructor differs, fall back to a plain `Map<string, number[]>` with manual TTL eviction.
- **Multi-instance deploy**: rate limit state not shared across containers. Acceptable now; document Redis migration path in code comment.

## Security Considerations

- PIN compared via bcrypt (constant-time, no timing attacks)
- `parent-gate` cookie: httpOnly (no XSS access), secure in production, sameSite strict (no CSRF)
- Rate limiting prevents brute-force (10,000 possible PINs / 5 attempts per 15 min = infeasible)
- `parentId` cookie validated against DB — no trust in client-only state

## Next Steps

- Phase 2 (guest persistence) depends on `parentId` cookie being set during registration
- Phase 4 (settings security tab) will use `POST /api/auth/pin` for PIN change flow
