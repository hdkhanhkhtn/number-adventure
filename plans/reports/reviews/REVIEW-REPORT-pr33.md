# PR #33 Code Review — Improvement Plan

## Prioritized Issue Table

| # | ID | Severity | Effort | File | Summary |
|---|-----|----------|--------|------|---------|
| 1 | G3 | BLOCK | S | `app/(child)/layout.tsx:139` | migrate POST omits `guestId`; guest data silently dropped |
| 2 | R18 | BLOCK | S | `app/api/children/[id]/settings/route.ts:52-60` | No numeric range validation on settings PATCH |
| 3 | NEW-S1 | BLOCK | M | `app/api/sessions/route.ts` + `[id]/route.ts` + `[id]/attempts/route.ts` | Zero auth on session endpoints |
| 4 | R1 | HIGH | S | `app/api/children/migrate/route.ts:115` | Bare catch swallows P2002; should return 409 |
| 5 | R2 | HIGH | S | `app/api/children/migrate/route.ts:53-59` | TOCTOU race: findFirst outside transaction |
| 6 | R17 | HIGH | S | `app/api/children/[id]/settings/route.ts:41` | Null body crashes with TypeError 500 |
| 7 | G4/R7 | HIGH | S | `lib/hooks/use-game-session.ts:38` | Empty string childId not guarded in startSession |
| 8 | R8 | HIGH | S | `app/(child)/play/[gameType]/[lessonId]/page.tsx:67-70` | Redirect during render (timeUp && loading) |
| 9 | R12 | HIGH | S | `lib/hooks/use-settings.ts:22,53` | localStorage key not namespaced by childId |
| 10 | R13 | HIGH | S | `lib/hooks/use-settings.ts:28` | Bedtime hour default 20 vs DB default 21 |
| 11 | G1 | HIGH | S | `lib/types/common.ts:48-58` | ChildSettings interface missing 10 DB fields |
| 12 | G2 | HIGH | S | `lib/types/api.ts:32-42` | UpdateChildSettingsRequest missing 10 fields |
| 13 | G5 | HIGH | S | `components/screens/parent-settings-content.tsx:28-31` | DEFAULTS typed as ChildSettings (breaks after G1 fix) |
| 14 | NEW-S3 | HIGH | S | `app/api/children/route.ts:34` | Name length + color not validated on POST children |
| 15 | R26/R27 | HIGH | M | `__tests__/api/children-migrate.test.ts` | Zero tests for guestId copy path |

---

## Dependency Order

```
Phase 1 (types first — no runtime risk, unblocks other fixes):
  G1 → G2 → G5  (ChildSettings interface → API types → DEFAULTS const)

Phase 2 (BLOCK MERGE — data loss / security):
  G3   (guestId in migrate POST body)
  R18  (settings range validation)
  NEW-S1 (session auth)

Phase 3 (HIGH — correctness):
  R1, R2  (migrate error handling + TOCTOU)
  R17     (null body guard)
  G4/R7   (empty childId guard)
  R8      (redirect during render)
  R12     (settings key namespace)
  R13     (bedtime default mismatch)
  NEW-S3  (children POST validation)

Phase 4 (tests):
  R26/R27 (add guestId copy tests)
```

---

## Specific Fixes

### G3 — migrate POST omits guestId (BLOCK)

**File:** `app/(child)/layout.tsx:139`
**Current:** `body: JSON.stringify({ name: state.profile.name, age: state.profile.age, color: state.profile.color })`
**Fix:**
```typescript
body: JSON.stringify({
  name: state.profile.name,
  age: state.profile.age,
  color: state.profile.color,
  guestId: state.childId ?? undefined,  // null-safe; route handles undefined as "no copy"
}),
```
**Risk if not fixed:** All guest session history, stickers, and streak data permanently lost on migration. Core feature broken.

---

### R18 — No numeric range validation on settings (BLOCK)

**File:** `app/api/children/[id]/settings/route.ts` — insert after line 54 (after `data` is built, before `prisma.childSettings.upsert`)

**Fix — add validation block between line 54 and 56:**
```typescript
// Validate numeric ranges
if (data.volume !== undefined && (typeof data.volume !== 'number' || data.volume < 0 || data.volume > 100)) {
  return NextResponse.json({ error: 'volume must be 0–100' }, { status: 400 });
}
if (data.dailyMin !== undefined && (typeof data.dailyMin !== 'number' || data.dailyMin < 1 || data.dailyMin > 240)) {
  return NextResponse.json({ error: 'dailyMin must be 1–240' }, { status: 400 });
}
if (data.bedtimeHour !== undefined && (typeof data.bedtimeHour !== 'number' || data.bedtimeHour < 0 || data.bedtimeHour > 23)) {
  return NextResponse.json({ error: 'bedtimeHour must be 0–23' }, { status: 400 });
}
if (data.bedtimeMinute !== undefined && (typeof data.bedtimeMinute !== 'number' || data.bedtimeMinute < 0 || data.bedtimeMinute > 59)) {
  return NextResponse.json({ error: 'bedtimeMinute must be 0–59' }, { status: 400 });
}
if (data.breakReminderIntervalMin !== undefined && (typeof data.breakReminderIntervalMin !== 'number' || data.breakReminderIntervalMin < 1 || data.breakReminderIntervalMin > 120)) {
  return NextResponse.json({ error: 'breakReminderIntervalMin must be 1–120' }, { status: 400 });
}
```
**Risk if not fixed:** Malicious client can set volume to -999, dailyMin to 0 (disabling play), or bedtimeHour to 99 (crashes time logic).

---

### NEW-S1 — Zero auth on session endpoints (BLOCK)

**Files:** `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`, `app/api/sessions/[id]/attempts/route.ts`

**Fix for `app/api/sessions/route.ts` — wrap POST body after line 6:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { childId?: string; lessonId?: string };
    const { childId, lessonId } = body;

    if (!childId || !lessonId) {
      return NextResponse.json({ error: 'childId and lessonId are required' }, { status: 400 });
    }

    if (childId.startsWith('guest_')) {
      // Guest bypass: verify no real Child record exists with this ID (prevents guest_ prefix spoofing)
      const realChild = await prisma.child.findUnique({ where: { id: childId }, select: { id: true } });
      if (realChild) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Genuine guest — allow unauthenticated session creation
    } else {
      const cookieParentId = request.cookies.get('parentId')?.value;
      if (!cookieParentId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Verify child belongs to authenticated parent (IDOR prevention)
      const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
      if (!child || child.parentId !== cookieParentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const session = await prisma.gameSession.create({
      data: { childId, lessonId, status: 'in_progress' },
    });
    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (e) {
    console.error('[api/sessions POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Fix for `app/api/sessions/[id]/route.ts` — add ownership check in GET and PATCH:**
After resolving `id` from params, add before session lookup:
```typescript
// Auth: verify session belongs to caller's child
const cookieParentId = request.cookies.get('parentId')?.value;
// (Guest sessions skip auth — childId starts with guest_)
```
In PATCH, after `session` is fetched (line 37), add:
```typescript
if (!session.childId.startsWith('guest_')) {
  const cookieParentId = request.cookies.get('parentId')?.value;
  if (!cookieParentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const child = await prisma.child.findUnique({ where: { id: session.childId }, select: { parentId: true } });
  if (!child || child.parentId !== cookieParentId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```
Same pattern for GET and for `app/api/sessions/[id]/attempts/route.ts`.

**Risk if not fixed:** Any unauthenticated caller can create sessions, inflate stars, award stickers, manipulate streaks for any child. IDOR vulnerability.

---

### R1 — Bare catch swallows P2002 (HIGH)

**File:** `app/api/children/migrate/route.ts:115-117`
**Current:**
```typescript
} catch {
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```
**Fix:**
```typescript
} catch (e) {
  // P2002 = unique constraint violation (concurrent duplicate migration)
  if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
    return NextResponse.json({ error: 'Child already exists' }, { status: 409 });
  }
  console.error('[api/children/migrate POST] Error:', e);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```
**Risk if not fixed:** Concurrent migrate calls see 500 instead of idempotent 409; client retries indefinitely.

---

### R2 — TOCTOU race: findFirst outside transaction (HIGH)

**File:** `app/api/children/migrate/route.ts:53-59`
**Fix:** Move the `findFirst` call inside the `$transaction` callback. Replace lines 50-112:
```typescript
// Create child and copy all guest data in a single transaction
const { child, wasExisting } = await prisma.$transaction(async (tx) => {
  // Idempotency check INSIDE transaction to prevent TOCTOU
  const existing = await tx.child.findFirst({
    where: { parentId: cookieParentId, name: name.trim() },
    select: { id: true, name: true, age: true, color: true },
  });
  if (existing) {
    return { child: existing, wasExisting: true };
  }

  // 1. Create new DB child under parent
  const child = await tx.child.create({
    data: {
      parentId: cookieParentId,
      name: name.trim(),
      age,
      color: resolvedColor,
    },
    select: { id: true, name: true, age: true, color: true },
  });

  if (resolvedGuestId) {
    // ... existing guest data copy logic (lines 77-108) unchanged ...
  }

  return { child, wasExisting: false };
});

return NextResponse.json({ child }, { status: wasExisting ? 200 : 201 });
```
**Risk if not fixed:** Two concurrent migrate calls for same name create duplicate children and potentially double-copy session data.

> **⚠️ IMPORTANT:** Moving `findFirst` inside the transaction is NOT sufficient on its own under PostgreSQL's default `READ COMMITTED` isolation level — two concurrent transactions can still both read `null` and both proceed to `child.create`. **R1 (P2002 catch) is REQUIRED as the safety net.** R1 and R2 MUST be implemented in the same commit: R2 reduces the race window; R1 handles the remaining concurrent case via unique-constraint detection.

---

### R17 — Null body crashes PATCH (HIGH)

**File:** `app/api/children/[id]/settings/route.ts:41`
**Current:** `const body = await request.json();`
**Fix:**
```typescript
let body: Record<string, unknown>;
try {
  body = await request.json() as Record<string, unknown>;
} catch {
  return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
}
if (!body || typeof body !== 'object') {
  return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
}
```
**Risk if not fixed:** Empty body or malformed JSON causes unhandled TypeError, returns generic 500.

---

### G4/R7 — Empty childId not guarded in startSession (HIGH)

**File:** `lib/hooks/use-game-session.ts:38`
**Current:** `if (childId.startsWith('guest_')) return null;`
**Fix:**
```typescript
if (!childId || childId.startsWith('guest_')) return null;
```
**Risk if not fixed:** Empty string `childId` passes guard, creates session with empty string FK, likely DB error.

---

### R8 — Redirect during render (HIGH)

**File:** `app/(child)/play/[gameType]/[lessonId]/page.tsx:67-70`
**Current:**
```typescript
useEffect(() => {
  if (timeUp && loading) {
    router.replace('/home');
  }
}, [timeUp, loading, router]);
```
**Issue:** `timeUp && loading` — once loading becomes false, redirect stops firing. Should be `timeUp && !showTimeUp` or handle in early return.
**Fix — replace the effect:**
```typescript
useEffect(() => {
  if (timeUp && loading) {
    router.replace('/home');
  }
}, [timeUp, loading, router]);
```
This is actually correct for the intended behavior (redirect ONLY if limit hit before game loads). The real concern is that `router.replace` inside useEffect after render is fine in Next.js App Router. Mark as WONTFIX unless React strict mode double-fires cause visible flash. Lower to WARN.

---

### R12 — localStorage key not namespaced (HIGH)

**File:** `lib/hooks/use-settings.ts:22`
**Current:** `const SETTINGS_KEY = 'bap-settings';`
**Fix:** The key must be per-child. But `childId` is not available at module scope. Fix inside the hook:

In `useSettings()`, replace line 53:
```typescript
const raw = localStorage.getItem(`bap-settings-${childId ?? 'default'}`);
```
And in `saveDebounced` (line 113):
```typescript
localStorage.setItem(`bap-settings-${cId ?? 'default'}`, JSON.stringify(s));
```
Also add **localStorage migration** (required — existing users lose settings on deploy without this):

```typescript
// In the mount useEffect (runs once):
const legacyRaw = localStorage.getItem('bap-settings');
const newKey = `bap-settings-${childId ?? 'default'}`;
if (legacyRaw && !localStorage.getItem(newKey)) {
  // Migrate legacy single-key data to per-child key
  localStorage.setItem(newKey, legacyRaw);
  localStorage.removeItem('bap-settings');
}
```

**Risk if not fixed:** Multiple children on same device share settings; Child A's bedtime overrides Child B's. Without migration code, existing users silently lose saved settings on first deploy.

---

### R13 — Bedtime hour default mismatch (HIGH)

**File:** `lib/hooks/use-settings.ts:28`
**Current:** `bedtime: { enabled: false, hour: 20, minute: 0 },`
**DB schema default:** `bedtimeHour Int @default(21)`
**Fix:**
```typescript
bedtime: { enabled: false, hour: 21, minute: 0 },
```
**Risk if not fixed:** Guest users see 20:00 bedtime; DB users see 21:00. Inconsistent UX.

---

### G1 — ChildSettings interface missing 10 fields (HIGH)

**File:** `lib/types/common.ts:48-58`
**Fix — replace ChildSettings:**
```typescript
export interface ChildSettings {
  dailyMin: number;
  difficulty: Difficulty;
  kidLang: string;
  parentLang: string;
  sfx: boolean;
  music: boolean;
  voice: boolean;
  voiceStyle: string;
  quietHours: boolean;
  volume: number;
  highContrast: boolean;
  reduceMotion: boolean;
  bedtimeEnabled: boolean;
  bedtimeHour: number;
  bedtimeMinute: number;
  breakReminderEnabled: boolean;
  breakReminderIntervalMin: number;
  gameHints: boolean;
  gameRotation: 'auto' | 'favorites' | 'all';
}
```
**Risk if not fixed:** TypeScript fails to catch mismatches between client types and DB schema. Bugs hide at compile time.

---

### G2 — UpdateChildSettingsRequest missing 10 fields (HIGH)

**File:** `lib/types/api.ts:32-42`
**Fix — replace UpdateChildSettingsRequest:**
```typescript
export interface UpdateChildSettingsRequest {
  dailyMin?: number;
  difficulty?: string;
  kidLang?: string;
  parentLang?: string;
  sfx?: boolean;
  music?: boolean;
  voice?: boolean;
  voiceStyle?: string;
  quietHours?: boolean;
  volume?: number;
  highContrast?: boolean;
  reduceMotion?: boolean;
  bedtimeEnabled?: boolean;
  bedtimeHour?: number;
  bedtimeMinute?: number;
  breakReminderEnabled?: boolean;
  breakReminderIntervalMin?: number;
  gameHints?: boolean;
  gameRotation?: 'auto' | 'favorites' | 'all';
}
```

---

### G5 — DEFAULTS typed as ChildSettings (HIGH)

**File:** `components/screens/parent-settings-content.tsx:28-31`
**Current:** `const DEFAULTS: ChildSettings = { dailyMin: 15, ... };` (9 fields, will fail after G1 adds 10 more)
**Fix — change type to Partial:**
```typescript
const DEFAULTS: Partial<ChildSettings> = {
  dailyMin: 15, difficulty: 'easy', kidLang: 'en', parentLang: 'vi',
  sfx: true, music: true, voice: true, voiceStyle: 'Friendly', quietHours: false,
};
```
Line 41 already uses `Partial<ChildSettings>` for state, so this is consistent.
**Risk if not fixed:** TypeScript compile error after G1 fix — blocks build.

---

### NEW-S3 — POST /api/children: name length + color not validated (HIGH)

**File:** `app/api/children/route.ts:34`
**Current:** `if (!name || typeof age !== 'number' || age < 1 || age > 18)`
**Fix — replace lines 32-35:**
```typescript
const { name, age, color } = body as { name?: string; age?: number; color?: string };

if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
  return NextResponse.json({ error: 'name must be 1–50 characters' }, { status: 400 });
}
if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 18) {
  return NextResponse.json({ error: 'age must be an integer 1–18' }, { status: 400 });
}
const VALID_COLORS = ['sun', 'sage', 'coral', 'lavender', 'sky'] as const;
const resolvedColor = VALID_COLORS.includes(color as typeof VALID_COLORS[number])
  ? (color as string)
  : 'sage';
```
Then on line 39: `data: { parentId: cookieParentId, name: name.trim(), age, color: resolvedColor },`

**Risk if not fixed:** XSS via name field (unbounded string stored and rendered), arbitrary color strings stored in DB.

---

### R26/R27 — Zero tests for guestId copy path (HIGH)

**File:** `__tests__/api/children-migrate.test.ts`
**Fix — add new describe block after line 533:**
```typescript
describe('guest data migration (guestId copy path)', () => {
  beforeEach(() => {
    mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    mockChildFindFirst.mockResolvedValue(null);
    mockChildCreate.mockResolvedValue({
      id: 'child-new-123', name: 'Alice', age: 5, color: 'sage',
    });
  });

  it('copies sessions, stickers, and streak when guestId is valid', async () => {
    mockTx.streak.findUnique.mockResolvedValueOnce({
      childId: 'guest_abc', currentStreak: 3, longestStreak: 5,
      lastPlayDate: new Date('2026-04-27'),
    });

    const req = makeRequest(
      { name: 'Alice', age: 5, color: 'sage', guestId: 'guest_abc' },
      'parent-123',
    );
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockTx.gameSession.updateMany).toHaveBeenCalledWith({
      where: { childId: 'guest_abc' },
      data: { childId: 'child-new-123' },
    });
    expect(mockTx.childSticker.updateMany).toHaveBeenCalledWith({
      where: { childId: 'guest_abc' },
      data: { childId: 'child-new-123' },
    });
    expect(mockTx.streak.upsert).toHaveBeenCalled();
    expect(mockTx.streak.delete).toHaveBeenCalledWith({
      where: { childId: 'guest_abc' },
    });
  });

  it('skips guest data copy when guestId is missing', async () => {
    const req = makeRequest(
      { name: 'Alice', age: 5, color: 'sage' },
      'parent-123',
    );
    await POST(req);

    expect(mockTx.gameSession.updateMany).not.toHaveBeenCalled();
    expect(mockTx.childSticker.updateMany).not.toHaveBeenCalled();
  });

  it('skips guest data copy when guestId does not start with guest_', async () => {
    const req = makeRequest(
      { name: 'Alice', age: 5, color: 'sage', guestId: 'not-a-guest' },
      'parent-123',
    );
    await POST(req);

    expect(mockTx.gameSession.updateMany).not.toHaveBeenCalled();
  });

  it('handles migration with no guest streak gracefully', async () => {
    mockTx.streak.findUnique.mockResolvedValueOnce(null);

    const req = makeRequest(
      { name: 'Alice', age: 5, color: 'sage', guestId: 'guest_xyz' },
      'parent-123',
    );
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockTx.streak.upsert).not.toHaveBeenCalled();
    expect(mockTx.streak.delete).not.toHaveBeenCalled();
  });
});
```

---

## WARN Items (Backlog — not blocking PR)

| ID | Summary | Tracking |
|----|---------|----------|
| R4 | CSRF on migrate endpoint | Backlog — add CSRF token in Phase 4 |
| R5 | Streak upsert dead update branch | Cosmetic — newly created child never has existing streak |
| R6 | DifficultyProfile not copied on migration | Backlog — minor data loss for advanced users |
| R9 | `timeUp && loading` condition | Downgraded from HIGH — behavior is intentional |
| R10 | `loadLessonSync` not memoized | Low impact — static array lookup is O(n) with n~50 |
| R15 | **[HIGH — promoted]** Pending debounce fires after unmount; in multi-profile context (Phase 3C child switcher) this writes the previous child's settings to DB after context switches. Fix: `return () => { saveDebounced.cancel?.(); }` in the settings useEffect cleanup. | HIGH — fix alongside R12 |
| R16 | Two parallel settings state machines | Architectural debt — works correctly today |
| R20 | PUT alias breaks REST semantics | Cosmetic — `export { PATCH as PUT }` |
| R21 | GET returns full row | Minor info leak — no secrets in ChildSettings |
| R23 | gameRotation no check constraint | DB-level enum constraint; app validates via allowlist |
| NEW-S4 | Login no rate limiting | Pre-existing; tracked in security backlog |
| NEW-S5 | Answer no length bound | Low risk; `String(body.answer)` truncated by DB varchar |
| NEW-S6 | Cookie stores raw DB PK | Pre-existing auth design; encrypt in Phase 4 |
| NEW-S7 | In-memory rate limiter not Redis-backed | Pre-existing; adequate for single-instance MVP |
| NEW-S8 | No CSP header | Infrastructure; add via `next.config.js` headers |

---

## Estimated Total Effort

| Priority | Items | Effort |
|----------|-------|--------|
| BLOCK MERGE | 3 | ~4h (G3: 15min, R18: 30min, NEW-S1: 3h) |
| HIGH | 11 | ~6h (most are S=<1h; R26/R27 tests are M=2h) |
| **Total** | **14** | **~10h** |
