# Phase 3A Test Strategy — Settings Migration Fixes

**Branch:** `feature/fix-phase-3a-settings-migration`
**Date:** 2026-04-28
**Test Framework:** Jest (node + jsdom)
**Coverage Target:** 80% (current threshold in jest.config.js)

---

## Executive Summary

5 fixes were made across schema, API routes, hooks, and page logic:
1. **Schema**: 10 new ChildSettings columns (accessibility, bedtime, break reminders, game prefs)
2. **Settings API PATCH**: Expanded allowed fields from 9 to 19
3. **useSettings hook**: Added DB fetch + debounced PATCH for non-guest children
4. **Migrate route**: Atomic transaction for guest→DB child conversion + guestId validation
5. **Play page**: Guard moved inside startSession effect; childId fallback changed from `'guest'` to `''`

Test priority: **atomic transaction** (FIX 4) → **childId guard** (FIX 5) → **settings sync** (FIX 3) → **API allowlist** (FIX 2) → **migration** (FIX 1)

---

## Test Infrastructure Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Test Runner** | Jest 29.7.0 | 4 projects: api, components, game-engine, pwa |
| **Test Coverage** | 80% threshold | Lines + functions only; branches excluded |
| **Existing API Tests** | 8 files | children-migrate.test.ts (560 lines, comprehensive); no settings-specific tests |
| **Mock Strategy** | Prisma-only | Real Next.js request/response; no database isolation |
| **Setup Files** | jest.setup.js | Only @testing-library/jest-dom; no custom fixtures |

**Key Finding:** No existing tests for settings API or useSettings hook. Migrate route has **comprehensive mocking** — good template for new tests.

---

## Test Commands

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# API tests only (most relevant to fixes)
npm test -- __tests__/api

# Settings-specific (once created)
npm test -- __tests__/api/children-settings

# Migrate endpoint (already exists)
npm test -- __tests__/api/children-migrate

# Play page (once created for FIX 5)
npm test -- __tests__/app
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (during development)
```bash
npm test -- --watch
```

---

## Existing Relevant Tests

### 1. **`__tests__/api/children-migrate.test.ts`** (560 lines)
**Relevance:** HIGH — Template for transaction + guestId validation
- **Coverage**: Auth (401 unauthorized), authorization (parent exists), validation (name, age, color)
- **Idempotency check**: findFirst + create pattern ✓
- **Error handling**: DB errors → 500 ✓
- **Mock setup**: Well-structured Prisma mocking pattern
- **Gaps for FIX 4**: No tests for `$transaction()` atomic copy, no guestId validation, no session/sticker/streak reassignment

### 2. **`__tests__/api/children-difficulty.test.ts`** (partial, ~60 lines read)
**Relevance:** MEDIUM — IDOR ownership check pattern
- **Coverage**: 401 (missing parentId), 403 (wrong parent)
- **Pattern**: Child ownership verification before returning sensitive data
- **Applicable to**: Settings GET/PATCH endpoints (share same auth structure)

### 3. **`__tests__/api/sessions-post.test.ts`** (80 lines)
**Relevance:** LOW — Basic POST structure only
- **Pattern**: Request builder, Prisma mocking
- **Gap**: No multi-step transaction, no FK validation

---

## Coverage Gaps & New Tests Required

### PRIORITY 1: Migrate Route — Transaction & Data Copy (FIX 4)

**File:** `__tests__/api/children-migrate-transaction.test.ts` (NEW)
**Critical Gaps:** Current test mocks only `child.create`, skips entire transaction logic

| What to Test | Current Status | Required |
|---|---|---|
| `$transaction()` atomic copy | NOT TESTED | Unit test transaction success path |
| GameSession reassignment | NOT MOCKED | Mock + assert updateMany called with correct childId |
| ChildSticker reassignment | NOT MOCKED | Mock + assert updateMany called |
| Streak copy → delete cycle | NOT MOCKED | Mock upsert + delete; assert streak merged |
| guestId validation | PARTIALLY — 1 test says it exists but NOT ENFORCED IN MOCK | Test guestId must start with `guest_`; test null guestId (no copy) |
| Transaction rollback on error | NOT TESTED | Mock one tx operation to throw; assert all skip |

**Test Count:** 8–10 tests
**Mock Scope:** Expand to mock `$transaction` itself, not child.create only

---

### PRIORITY 2: Play Page Guard — childId Fallback (FIX 5)

**File:** `__tests__/app/play-page.test.tsx` (NEW)
**Critical Gaps:** No E2E or component tests for play page; page logic relies on useGameSession + guard ordering

| What to Test | Current Status | Required |
|---|---|---|
| Guard fires before startSession | LOGIC CHANGE | Test: if !childId, router.replace('/') fires BEFORE useGameSession hook |
| childId = '' (not 'guest') | LOGIC CHANGE | Integration: empty string childId → startSession returns null (from hook) → no FK violation |
| isHydrated required | LOGIC CHANGE | Test: if !isHydrated, useEffect skips (guard blocks) |
| !state.profile guard | EXISTING | Test already present in code, verify it works with '' childId |
| React Strict Mode double-invocation | LOGIC EXISTING | Test hasStarted ref prevents duplicate session creation |

**Test Count:** 5–6 tests
**Mock Scope:** React context, useRouter, useGameSession, useSessionTimer
**Type:** Component (jsdom) + integration

---

### PRIORITY 3: useSettings Hook — DB Fetch + Debounced PATCH (FIX 3)

**File:** `__tests__/lib/hooks/use-settings.test.ts` (NEW)
**Critical Gaps:** Hook has 4 side effects; none tested

| What to Test | Current Status | Required |
|---|---|---|
| localStorage load on mount | NOT TESTED | Test: JSON.parse → merge with defaults |
| DB fetch after hydration | NEW CODE | Test: GET /api/children/[id]/settings called ONLY if hydrated + non-guest |
| Guest detection (childId starts with 'guest_') | NEW CODE | Test: guest childId skips DB fetch |
| DB values merge correctly | NEW CODE | Test: DB volume=50 overrides localStorage default 80 |
| Bedtime/breakReminder nesting | NEW CODE | Complex nesting; test each field path |
| Debounced PATCH send | NEW CODE | Test: PATCH queued → delay → sent once |
| Error handling (failed fetch) | NEW CODE | Test: failed GET doesn't crash; reverts to localStorage |

**Test Count:** 7–8 tests
**Mock Scope:** localStorage, fetch, useGameProgress context
**Type:** Unit (node) + integration via fetch mocking

---

### PRIORITY 4: Settings API PATCH — Allowlist Validation (FIX 2)

**File:** `__tests__/api/children-settings.test.ts` (NEW)
**Critical Gaps:** No tests for settings endpoint exist at all

| What to Test | Current Status | Required |
|---|---|---|
| Auth: missing parentId → 401 | NOT TESTED | Copy pattern from children-difficulty |
| Auth: wrong parent → 403 | NOT TESTED | IDOR check: child.parentId !== parentId |
| Allowlist: only 19 fields accepted | NOT TESTED | Test: POST {volume: 50, extraField: 'x'} → only volume saved, extraField dropped |
| Allowlist validation: all 19 fields accepted | NOT TESTED | Parametrized test: each field accepted individually |
| GET endpoint: returns 404 if no settings | PARTIALLY | Route code has check; test it |
| PATCH upsert: create if not exists | NOT TESTED | Test: first PATCH creates ChildSettings |
| PATCH upsert: update if exists | NOT TESTED | Test: second PATCH updates same record |
| Error: DB error → 500 | NOT TESTED | Mock prisma to throw |

**Test Count:** 10–12 tests
**Mock Scope:** Prisma childSettings + child
**Type:** Unit (node)

---

### PRIORITY 5: Schema Migration (FIX 1)

**File:** `prisma/migrations/20260427191924_add_child_settings_app_prefs/migration.sql`
**Status:** Already applied
**Testing:** Manual verification only (no unit tests for migrations in Jest)

| Verification | Method |
|---|---|
| Migration runs without error | `npx prisma migrate status` |
| All 10 columns exist in ChildSettings | `npx prisma studio` → inspect schema |
| Backward compatibility | No breaking changes; defaults nullable |

---

## Test Strategy by Type

### Unit Tests (node environment)

**API Routes** (4–5 files)
- Settings GET/PATCH: allowlist, auth, IDOR, upsert logic
- Migrate POST: $transaction, guestId validation, data copy
- Mock Prisma completely; test request→response contract
- Pattern: `makeRequest()` helper + mocked prisma

**Hooks** (1 file)
- useSettings: localStorage → DB → merge logic, debounce, guest detection
- Mock fetch, localStorage, context
- Pattern: renderHook + act() for state updates

---

### Integration Tests (jsdom environment)

**Play Page Component** (1 file)
- Guard ordering: isHydrated → childId → profile → startSession
- childId = '' prevents startSession from running if guards fail
- Mock useRouter, useGameSession, context
- Pattern: render component + verify router.replace called (or not)

---

### E2E / Manual Tests (out of scope for Jest)

- Database: verify migration applies cleanly
- Multi-page flow: guest session → migrate → settings sync
- Offline: settings changes queue locally, patch when back online

---

## Test Execution Checklist

### Before Testing
- [ ] Branch checked out: `feature/fix-phase-3a-settings-migration`
- [ ] Dependencies installed: `npm install` (Prisma already generated)
- [ ] No syntax errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`

### Run Tests
- [ ] `npm test` — all tests pass
- [ ] `npm run test:coverage` — coverage ≥ 80% (lines + functions)
- [ ] No flaky tests: run twice, same results

### Validate Behavior (manual)
- [ ] Migrate endpoint: guest session → DB child → data copied (check stickers, streaks, sessions)
- [ ] Settings sync: localStorage → DB on non-guest child load
- [ ] Play page: empty childId doesn't create ghost sessions
- [ ] Allowlist: POST extra fields → silently dropped

---

## Mock Strategy

### Prisma (Node Tests)

Use the **children-migrate.test.ts pattern**:

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    child: { findUnique: jest.fn(), findFirst: jest.fn() },
    childSettings: { findUnique: jest.fn(), upsert: jest.fn() },
    gameSession: { updateMany: jest.fn() },
    $transaction: jest.fn((cb) => cb({
      child: { create: jest.fn() },
      gameSession: { updateMany: jest.fn() },
      // ... other tx methods
    })),
  },
}));
```

**Key:** Mock `$transaction` as a callback receiver, not just `.create()`.

### Fetch (Hook Tests)

```typescript
global.fetch = jest.fn((url) => {
  if (url.includes('/api/children/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        settings: { volume: 50, highContrast: false, /* ... */ }
      }),
    });
  }
  return Promise.reject(new Error('Not mocked'));
});
```

### React Context (Component Tests)

```typescript
jest.mock('@/context/game-progress-context', () => ({
  useGameProgress: () => ({
    state: { childId: 'child-123', profile: { name: 'Alice' }, isHydrated: true },
    isHydrated: true,
  }),
}));
```

---

## Red Flags to Watch

| Issue | Detection | Mitigation |
|---|---|---|
| **Flaky setTimeout in debounce** | Test passes locally, fails in CI | Use Jest fake timers: `jest.useFakeTimers()` + `jest.runAllTimers()` |
| **Hydration mismatch** | Tests assume hydrated=true, but real code waits | Always test both hydrated=false (early return) and true (runs logic) |
| **localStorage null** | Private browsing / node env has no localStorage | Mock completely; test try-catch in hook |
| **Double-invocation** | React Strict Mode in test + real production | Test hasStarted.current ref guards against createSession double-call |
| **Missing FK in mock** | Test passes with mocks, fails with real DB | Verify guestId validation with non-null guestId in tests |

---

## Coverage Target Breakdown

### Current Coverage (jest.config.js)

```javascript
collectCoverageFrom: [
  'lib/game-engine/**/*.ts',
  'app/api/sessions/route.ts',
  'app/api/sessions/[id]/attempts/route.ts',
  'app/api/streaks/[childId]/route.ts',
  // NOTE: settings & migrate endpoints NOT included
],
coverageThreshold: { global: { lines: 80, functions: 80 } }
```

### Recommended Coverage Scope (Add)

```javascript
collectCoverageFrom: [
  // ... existing
  'app/api/children/[id]/settings/route.ts',      // NEW
  'app/api/children/migrate/route.ts',             // NEW
  'lib/hooks/use-settings.ts',                     // NEW
  'app/(child)/play/[gameType]/[lessonId]/page.tsx', // NEW (guard logic only)
],
```

**Why:** These files were modified in Phase 3A; they need explicit coverage tracking.

---

## Test File Organization

```
__tests__/
├── api/
│   ├── children-migrate.test.ts                   (existing, 560 lines)
│   ├── children-settings.test.ts                  (NEW, ~200 lines)
│   └── [other existing API tests]
├── lib/
│   └── hooks/
│       └── use-settings.test.ts                   (NEW, ~150 lines)
├── app/
│   └── play-page.test.tsx                         (NEW, ~120 lines)
└── [other existing tests]
```

---

## Unresolved Questions

1. **Transaction isolation level:** Should `$transaction()` use SERIALIZABLE for guestId→childId reassignment, or is default OK? (Not testable in unit tests; requires integration test with real DB)

2. **Debounce timing:** What's the ideal debounce interval for settings PATCH? (Currently not specified in FIX 3; should be 500ms or configurable?)

3. **Streaks merge strategy:** If guest has streak currentStreak=5 and DB child already has 3, should we max() or replace? (Code does replace; should test both scenarios)

4. **Bedtime/breakReminder null handling:** If DB returns bedtimeHour=null, should fallback to DEFAULT (21) or keep user's localStorage value? (Code does fallback; test confirms)

5. **Guest session cleanup:** After migration, should guest_* child records be deleted or kept? (Code keeps them; may cause data bloat)

---

## Next Steps

1. **Create tests in priority order:**
   - PRIORITY 1: `__tests__/api/children-settings.test.ts` (simplest, no transactions)
   - PRIORITY 2: Expand `__tests__/api/children-migrate.test.ts` with transaction tests
   - PRIORITY 3: `__tests__/lib/hooks/use-settings.test.ts`
   - PRIORITY 4: `__tests__/app/play-page.test.tsx`

2. **Run full suite:** `npm test` (should pass with existing + new tests)

3. **Check coverage:** `npm run test:coverage` (verify ≥80% for new files)

4. **Validate behavior** (manual checks after automated tests pass)

5. **Document findings:** Update BACKLOG.md with any gaps (e.g., guestId cleanup, bedtime merge strategy)
