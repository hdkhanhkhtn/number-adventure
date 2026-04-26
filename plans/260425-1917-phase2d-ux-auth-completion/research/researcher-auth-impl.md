# Research: PIN-based Parent Auth — Implementation Patterns

Date: 2026-04-26 | Project: Bap Number Adventure (Next.js 16, TypeScript, Prisma/PostgreSQL)

---

## Current State (from codebase read)

- `POST /api/auth/pin` and `GET /api/auth/session` — both 501, TODOs for Phase C
- `parent-gate.tsx` — **math challenge only** (anti-toddler friction, NOT real auth). Comment already states "Real auth handled via session cookies + middleware.ts"
- `prisma/schema.prisma` — `Parent.pinHash String?` (nullable, bcrypt field name correct)
- `app/api/auth/login/route.ts` — sets `parentId` cookie (httpOnly, secure, sameSite: strict, 30-day maxAge)
- `middleware.ts` — checks `bap-session` cookie for `/api/*`, checks `parentId` cookie for parent UI routes (`/dashboard`, `/report`, `/settings`). TODO: replace with JWT.
- **`bcryptjs@3.0.3`** already installed (pure-JS, no native bindings). `@types/bcryptjs` in devDeps.

---

## Q1: bcrypt in Next.js 16 API routes

**Use `bcryptjs`, not `bcrypt`** — already in package.json. `bcryptjs` is pure-JS, works in any Node.js runtime including Edge. No `export const runtime = 'nodejs'` needed.

`bcrypt` (native bindings) requires `runtime = 'nodejs'` but `bcryptjs` does not.

Pattern:
```typescript
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
const hash = await bcrypt.hash(pin, SALT_ROUNDS);       // store
const valid = await bcrypt.compare(inputPin, pinHash);   // verify
```

- Source: bcryptjs README — pure JS port, no native deps
- Confidence: High (already used in `login/route.ts` with same import)

---

## Q2: Session cookie approach

**Recommended: raw `cookies()` from `next/headers` + existing `parentId` cookie pattern.**

Rationale: Login already sets a `parentId` httpOnly cookie (see `login/route.ts`). The PIN gate is an **in-session gate** (parent already authenticated via login), not a separate auth layer. The PIN just adds a friction check before exposing sensitive settings.

The `GET /api/auth/session` endpoint should read the existing `parentId` cookie and return parent info — no new session mechanism needed.

For PIN gate:
- `POST /api/auth/pin` — verify PIN via bcrypt, set a short-lived `parent-gate` cookie (e.g., 30 min) to avoid re-prompting for the session
- `GET /api/auth/session` — return `{ parentId, name, email, gateUnlocked }` from existing cookies

No need for `iron-session`, `next-auth`, or JWT. The `parentId` cookie already IS the session.

```typescript
// GET /api/auth/session — read existing cookies
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const parentId = cookieStore.get('parentId')?.value;
const gateUnlocked = !!cookieStore.get('parent-gate')?.value;
```

- Source: Next.js 15+ docs — `cookies()` is async in App Router
- Confidence: High

---

## Q3: Rate limiting without Redis

**Recommended: `lru-cache` (already a Next.js transitive dep) with in-process sliding window.**

For a VPS single-instance Docker deploy, in-memory is sufficient. Redis adds ops overhead for a children's app.

Pattern (module-level singleton, survives across requests within one process):
```typescript
import { LRUCache } from 'lru-cache';

const rateLimitMap = new LRUCache<string, number[]>({
  max: 500,
  ttl: 15 * 60 * 1000, // 15 min TTL auto-eviction
});

function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < windowMs);
  if (attempts.length >= maxAttempts) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

// In route handler:
const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
if (!checkRateLimit(ip)) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
}
```

Get IP: `request.ip` is removed in Next.js 15+; use `x-forwarded-for` header.

- Source: lru-cache npm docs; Next.js App Router request headers
- Confidence: High
- Caveat: Resets on process restart / container redeploy (acceptable for PIN brute-force window)

---

## Q4: PIN hashing migration

Schema already uses `pinHash String?` (nullable). No plaintext `pin` field exists — no legacy data migration needed.

Safe initial setup pattern for PIN creation/update endpoint:
```typescript
// Check if parent already has a pinHash before overwriting
const parent = await prisma.parent.findUnique({ where: { id: parentId } });
if (parent?.pinHash) {
  // Existing PIN — require current PIN verification first
  const validCurrent = await bcrypt.compare(currentPin, parent.pinHash);
  if (!validCurrent) return NextResponse.json({ error: 'Wrong current PIN' }, { status: 403 });
}
const newHash = await bcrypt.hash(newPin, 10);
await prisma.parent.update({ where: { id: parentId }, data: { pinHash: newHash } });
```

For verification when `pinHash` is null (PIN not set): gate should auto-pass or prompt to set PIN, not fail.

- Confidence: High (schema already clean)

---

## Recommended Implementation Plan

1. **`POST /api/auth/pin`**
   - Get IP from headers → check rate limit (5 attempts / 15 min)
   - Parse `{ pin: string }` (validate 4-digit `/^\d{4}$/`)
   - Read `parentId` cookie → look up `Parent.pinHash`
   - `bcrypt.compare(pin, pinHash)` → on success, set `parent-gate` cookie (httpOnly, 30 min)
   - Return `{ unlocked: true }` or `{ error, attemptsRemaining }`

2. **`GET /api/auth/session`**
   - Read `parentId` cookie → query `prisma.parent.findUnique`
   - Return `{ parentId, name, email, gateUnlocked: !!parent-gate-cookie }`
   - Return 401 if no `parentId` cookie

3. **`parent-gate.tsx`** — no change needed; comment already correct. The math challenge is UI-only anti-toddler friction. The real gate is the PIN API.

4. **No new packages needed** — `bcryptjs` + `lru-cache` (transitive dep, check if available) + `next/headers`.

---

## Risks

| Risk | Mitigation |
|------|-----------|
| `lru-cache` not a direct dep | Add to `dependencies` if not found in `node_modules` |
| Multi-instance deploy (multiple containers) | Rate limit state not shared — acceptable for now, add Redis note in code |
| `parent-gate` cookie can be deleted by user | Acceptable: PIN re-prompt is UX, not hard security boundary |
| `cookies()` is async in Next.js 15+ | Always `await cookies()` |

---

## Unresolved Questions

1. Should `parent-gate` cookie duration be configurable (30 min vs session-only vs 24h)?
2. Is there a PIN setup endpoint or is PIN always pre-seeded? (Schema allows null — what happens for parents with no PIN set?)
3. `lru-cache` version in node_modules — confirm API is `new LRUCache({ max, ttl })` vs older `new LRUCache(max)`.
