# Medium / Low / Info Issues

**PR #5 Phase C | 8 Medium + 6 Low/Info findings**

---

## MEDIUM

### F8 — upsert Creates Orphaned ChildSettings for Unknown childId

**Severity:** MEDIUM | **Category:** Security | **Effort:** Trivial

**Location:** `app/api/children/[id]/settings/route.ts:33-37`

**Issue:** If `id` doesn't reference a real child, `upsert` with `create` silently inserts a
`ChildSettings` record with a non-existent `childId`. DB integrity depends on FK constraint.
If FK not enforced, orphaned records accumulate.

**Fix — verify child exists before upsert (already needed for F3 ownership check):**
```typescript
// Ownership check (F3 fix) naturally covers this — if child not found, return 403.
// No additional code needed once F3 is implemented.
```

---

### F10 — Unbounded Session Query in Report Route

**Severity:** MEDIUM | **Category:** Performance | **Effort:** Small

**Location:** `app/api/report/[childId]/route.ts:57-60`

**Issue:** `findMany` on all completed sessions for per-game stats, no limit. Redundant with F29.
With the F29 fix (90-day filter on attempts), apply consistent date scoping to sessions query too.

**Fix — add date filter to sessions query (in Promise.all from F9 fix):**
```typescript
prisma.gameSession.findMany({
  where: {
    childId, status: 'completed',
    completedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  },
  include: { lesson: { select: { gameType: true } } },
}),
```

---

### F11 — Day-of-Week Aggregation Double-Counts Across Week Boundary

**Severity:** MEDIUM | **Category:** Correctness | **Effort:** Small

**Location:** `app/api/report/[childId]/route.ts:49-53`

**Issue:** 7-day window can span two calendar weeks. `getDay()` maps to Mon–Sun labels, but two
Mondays in the window both add to `dayCount[0]`. Dashboard shows inflated minutes for that day.

**Fix — aggregate by days-ago index instead:**
```typescript
const dayCount = Array(7).fill(0) as number[];
const now = Date.now();
for (const s of recentSessions) {
  if (s.completedAt) {
    const daysAgo = Math.floor((now - s.completedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) dayCount[6 - daysAgo] += 5; // index 6 = today, 0 = 6 days ago
  }
}
```

**Note:** `WeeklyChart` receives a 7-element array and labels Mon–Sun. If the index meaning changes,
the chart labels must also update to "6 days ago … Today" or similar.

---

### F12 — age Validation Accepts 0 and Negative Values

**Severity:** MEDIUM | **Category:** Correctness | **Effort:** Trivial

**Location:** `app/api/children/route.ts:32`

**Issue:** Guard `age === undefined` passes `age=0`, `age=-5`, `age=999`.

**Fix:**
```typescript
// app/api/children/route.ts:32 — replace guard
if (!parentId || !name || typeof age !== 'number' || age < 1 || age > 18) {
  return NextResponse.json({ error: 'parentId, name, and age (1–18) required' }, { status: 400 });
}
```

---

### F20 — Settings Patch Failure Has No Rollback

**Severity:** MEDIUM | **Category:** Correctness | **Effort:** Small

**Location:** `components/screens/parent-settings-content.tsx:45-63`

**Issue:** `handleChange` optimistically updates local state + context, then calls API. On failure,
only `console.error` — state stays updated but DB is stale. Silent data loss.

**Fix — rollback on failure:**
```typescript
const handleChange = async (patch: Partial<ChildSettings>) => {
  const prev = settings;                    // snapshot
  const next = { ...settings, ...patch };
  setSettings(next);
  updateSettings(next);

  if (!childId || childId.startsWith('guest_')) return;
  setSaving(true);
  try {
    const res = await fetch(`/api/children/${childId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Save failed');
  } catch (e) {
    console.error('Failed to save settings', e);
    setSettings(prev);                      // rollback
    updateSettings(prev);
  } finally {
    setSaving(false);
  }
};
```

---

### F26 — Coverage Config Excludes Critical Routes

**Severity:** MEDIUM | **Category:** Correctness | **Effort:** Trivial

**Location:** `jest.config.js:24-30`

**Issue:** `collectCoverageFrom` covers only sessions/attempts/streaks routes. Auth, children, and
report routes excluded — coverage gate doesn't protect most important code.

**Fix:**
```javascript
// jest.config.js:24 — expand collectCoverageFrom
collectCoverageFrom: [
  'lib/game-engine/**/*.ts',
  'app/api/**/*.ts',   // cover ALL API routes
  '!lib/game-engine/types.ts',
  '!app/api/**/__mocks__/**',
],
```

---

### F30 — Email Not Normalized Before DB Insert

**Severity:** MEDIUM | **Category:** Correctness | **Effort:** Trivial

**Location:** `app/api/auth/register/route.ts:22-24`

**Issue:** `User@Example.com` and `user@example.com` treated as separate accounts.

**Fix — covered by F6 fix:**
```typescript
const normalizedEmail = email.toLowerCase().trim();
// use normalizedEmail for findUnique and create
```

---

### F31 — Child Home: 3 Fetches Without Coordinated Loading State

**Severity:** MEDIUM | **Category:** Performance | **Effort:** Small

**Location:** `app/(child)/home/page.tsx:30-47`

**Issue:** Three independent `fetch` calls have no shared loading state. Partial data renders during
load — streak shows 0, weekDays all false, stickerCount 0 before each resolves.

**Fix — use Promise.allSettled:**
```typescript
useEffect(() => {
  if (!childId) return;
  const controller = new AbortController();
  const { signal } = controller;

  Promise.allSettled([
    fetch(`/api/streaks/${childId}`, { signal }).then(r => r.json()),
    fetch(`/api/progress/${childId}`, { signal }).then(r => r.json()),
    fetch(`/api/children/${childId}/stickers`, { signal }).then(r => r.json()),
  ]).then(([streakRes, progressRes, stickerRes]) => {
    if (streakRes.status === 'fulfilled') setStreak(streakRes.value.currentStreak ?? 0);
    if (progressRes.status === 'fulfilled' && progressRes.value.weekDays)
      setWeekDays(progressRes.value.weekDays);
    if (stickerRes.status === 'fulfilled') setStickerCount(stickerRes.value.collected ?? 0);
  });

  return () => controller.abort();
}, [childId]);
```

---

## LOW / INFO

### F13 — PUT Aliased to PATCH (Semantic Confusion)

**Severity:** LOW | **Category:** Quality

**Location:** `app/api/children/[id]/settings/route.ts:45-46`

PUT = replace resource; PATCH = partial update. Current impl is PATCH behavior. Either rename
the handler or implement true PUT (replace all fields with defaults for omitted ones).

---

### F22 — Parent Pages Missing `<title>` Metadata

**Severity:** LOW | **Category:** Quality

**Location:** `app/(parent)/dashboard/page.tsx`, `report/page.tsx`, `settings/page.tsx`

Add Next.js metadata exports for accessibility and browser tab clarity:
```typescript
export const metadata = { title: 'Bảng điều khiển — Bắp Number Adventure' };
```

---

### F23 — "Báo cáo chi tiết" MenuRow Points to /settings (Copy-Paste Bug)

**Severity:** LOW | **Category:** Correctness

**Location:** `components/screens/parent-dashboard-content.tsx:115`

```typescript
// line 115 — fix onClick target
<MenuRow icon="📊" label="Báo cáo chi tiết" sub="Xem tiến độ theo tuần"
  onClick={() => router.push('/report')} />   // was '/settings'
```

---

### F27 — Fragile Math.random Mock Sequence in number-order Tests

**Severity:** LOW | **Category:** Quality

**Location:** `__tests__/game-engine/number-order-engine.test.ts`

12-value mock sequence tightly coupled to internal call order. Any refactor of the engine silently
breaks test assumptions. Prefer testing invariants with real randomness over 50+ iterations
(as done in hear-tap tests) rather than mocking Math.random internals.

---

### F15 — target=0 in Subtraction (3-3=0) — INFO

**Severity:** INFO | **Category:** UX

**Location:** `lib/game-engine/add-take-engine.ts:5-8`

`3-3=0` is mathematically valid and appropriate for age 3-6. Not a bug. Consider whether "0 apples"
is a meaningful concept in the game's visual metaphor.

---

### F32 — ParentGate Answer Visible in DevTools — INFO / by Design

**Severity:** INFO | **Category:** Security (by design)

**Location:** `components/parent/parent-gate.tsx:15`

`target = a + b` computed client-side. Intentionally weak — gate is anti-toddler UX friction,
not real security. **Document this explicitly** in a comment so future developers don't mistake
it for an auth mechanism.

```typescript
// parent-gate.tsx:11 — add comment
/** Math-challenge modal — anti-toddler friction ONLY, not a security control.
 *  Answer is intentionally client-side; real auth is handled by session cookies + middleware. */
```
