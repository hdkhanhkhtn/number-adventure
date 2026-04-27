# Code Review: PR #17 — Phase 3A-02 Guest-to-DB Migration

**Branch:** `feature/phase-3a-02-guest-migration` → `main`
**Reviewer:** Golden Triangle (Tech Lead + Executor + Reviewer)
**Date:** 2026-04-27

---

## Verdict: APPROVED WITH CONDITIONS

Two Important findings that do not block merge today but must be tracked and resolved before Phase 3C (multi-profile). No Critical security holes. All six Round-1 fixes confirmed present.

---

## Executive Summary

The guest-to-DB migration endpoint is correctly guarded, idempotent, and well-tested. The layout integration wires the banner, ParentGate, and migration handler cleanly with proper hook ordering. The primary deviation from the plan — not copying GameSession/Streak rows — is documented in the route comment and is intentional because guest data is local-only, but the plan's Validation Summary (plan.md line 74) explicitly confirmed these rows *do* exist in DB under guest child records, creating a specification ambiguity that needs formal resolution before Phase 3C migration work begins.

---

## Phase Compliance

| Task | Spec | Implemented | Status |
|------|------|-------------|--------|
| `POST /api/children/migrate` exists | 3A-02 step 1 | `app/api/children/migrate/route.ts` | PASS |
| Validates parent session from cookie | 3A-02 step 1 | `cookieParentId` check + `parent.findUnique` | PASS |
| Creates DB Child under parent | 3A-02 step 1 | `prisma.child.create` | PASS |
| Returns `{ child: { id, name, age, color } }` | 3A-02 | `select: { id, name, age, color }` on both paths | PASS |
| Banner shown when guest + parent logged in | 3A-02 step 2 | `showMigrateBanner` + `SaveProgressBanner` | PASS |
| ParentGate interposed before migration | 3A-02 step 2 | `showMigrateGate` → `ParentGate` → `handleMigrate` | PASS |
| `setChild(newChildId)` called on success | 3A-02 step 2 | `setChild(child.id, { ...state.profile, id: child.id })` | PASS |
| Copies GameSession/Streak from guest | 3A-02 step 1 | NOT IMPLEMENTED — documented as intentional in route comment | DEVIATION (see Finding #1) |
| Banner re-shows after 3 sessions | 3A-02 step 2 | NOT IMPLEMENTED — permanent dismiss | DEVIATION (see Finding #2) |
| isHydrated exposed in context | 3A-01 | `isHydrated` in `GameProgressContextValue` | PASS |
| SkeletonScreen component | 3A-01 | `components/ui/skeleton-screen.tsx` | PASS |

---

## Findings

| # | Dim | Severity | File:Line | Description | Fix |
|---|-----|----------|-----------|-------------|-----|
| 1 | ARCH | Important | `app/api/children/migrate/route.ts:8` + `plans/260426-1650-phase3-stability-content-growth/plan.md:74` | **Spec ambiguity on data copy.** The route comment says "no data copy required" because guest data is local-only. But `plan.md` Validation Summary (line 74) explicitly confirmed: "Guest session storage: Written to DB under guest child record — migration must copy GameSession, GameAttempt, ChildSticker rows." These two claims are mutually contradictory. If `use-game-session.ts` truly skips all DB writes for guest IDs, the plan.md confirmation is obsolete. If it doesn't skip (or if future code writes guest rows), migration will silently drop data. | Audit `use-game-session.ts` and all DB write paths for `guest_*` childIds. Document the definitive decision in plan.md and/or an ADR. Mark the route comment as the authoritative source if confirmed. |
| 2 | CORRECTNESS | Important | `app/(child)/layout.tsx:141` | **Banner re-show after 3 sessions not implemented.** Plan step 3A-02 states "re-shows after 3 sessions." Current implementation dismisses permanently (in-memory only — resets on page reload, so it re-shows every session, but 3-session threshold is missing entirely). The UX result is the banner will reappear on every fresh load for a guest user who dismissed it, creating annoyance. | Add session-count logic using `sessionStorage` (survives navigation, resets on tab close): increment a counter on each `step === 'ready'` transition; show banner only when `count % 3 === 0` after the first dismiss. |
| 3 | CORRECTNESS | Suggestion | `app/(child)/layout.tsx:102` | **`handleMigrate` uses `state.profile` without null guard before individual field access at line 99.** The `if (!state.profile \|\| migrating) return` guard at line 91 catches the null case, so it is technically safe. However, TypeScript non-null assertion would be cleaner than relying on the early-return guard across a multi-line async function. | Add `const profile = state.profile` destructuring after the guard to narrow type and make the intent explicit: `const profile = state.profile; const res = await fetch(..., { body: JSON.stringify({ name: profile.name, age: profile.age, color: profile.color }) });` |
| 4 | PERFORMANCE | Suggestion | `app/api/children/migrate/route.ts:42` | **Idempotency check keyed on name only, not on (parentId + name + age).** A parent migrating a second guest child with the same name but different age will silently receive the existing child record. For a children's app with siblings ("Alice age 5" vs "Alice age 8"), this produces incorrect data. The current idempotency key `{ parentId, name }` is too coarse. | Include `age` in the idempotency `findFirst` where clause: `where: { parentId: cookieParentId, name: name.trim(), age }`. |
| 5 | SECURITY | Suggestion | `app/api/children/migrate/route.ts:11` | **Cookie-based auth without CSRF protection.** The endpoint mutates state (creates a child record) using only a cookie for auth, with no CSRF token, `SameSite` verification, or `Origin`/`Referer` header check. On same-domain deployments this is acceptable since `SameSite=Lax` cookies are standard in Next.js, but it should be documented. | Confirm `parentId` cookie is set with `SameSite=Lax` or `Strict` at the auth layer. Add a comment noting this reliance. Consider adding `Origin` header check for defense-in-depth. |
| 6 | ARCH | Suggestion | `components/ui/skeleton-screen.tsx:17` | **`pulse` CSS keyframe assumed global.** Existing BACKLOG #3 captures this. Confirmed still open. Animation silently no-ops if global CSS is absent. | Replace with Tailwind `animate-pulse` class, or inject keyframe inline via `<style>` JSX tag. |
| 7 | CORRECTNESS | Suggestion | `app/(child)/layout.tsx:51` | **`/api/auth/session` response body is not validated.** The effect only checks `r.ok` before setting `showMigrateBanner(true)`, which is correct for this use case. However, a stale 200 from a CDN edge cache (if ever added) would show the banner incorrectly. | Low-risk for current stack. Document assumption that the session endpoint is never cached. |

---

## Security Summary

| OWASP Category | Status |
|----------------|--------|
| A01 Broken Access Control | PASS — explicit `parent.findUnique` guard prevents IDOR |
| A03 Injection | PASS — Prisma parameterized queries; no raw SQL |
| A04 Insecure Design | PASS — color allowlist prevents arbitrary string storage |
| A05 Security Misconfiguration | PARTIAL — CSRF relies on implicit `SameSite` (see Finding #5) |
| A07 Identification/Auth Failures | PASS — cookie check + DB existence check; 401 on both fail paths |
| A09 Security Logging and Monitoring | NOTE — no logging on 401/403 events (acceptable for MVP) |

---

## Test Coverage Assessment

| File | Coverage | Gaps |
|------|----------|------|
| `__tests__/api/children-migrate.test.ts` | Comprehensive — 28 cases covering auth, name/age/color validation, idempotency, DB error paths, JSON parse failure | Missing: test for idempotency key collision when same name + different age (Finding #4) |
| `__tests__/components/screens/save-progress-banner.test.tsx` | Comprehensive — rendering, interactions, a11y, error display, props | Missing: loading/disabled state during migration (banner visible while `migrating=true` is suppressed by parent, but no test for the suppression condition) |
| `__tests__/components/ui/skeleton-screen.test.tsx` | Adequate for a simple visual component | Missing: `role="status"` or `aria-label` assertion — SkeletonScreen has no ARIA role for screen readers (acceptable if decorative, but worth documenting) |
| `context/game-progress-context.tsx` | Covered by prior phases | No new tests added for 3A-02-specific paths (`isHydrated` flag already verified in prior review) |
| `app/(child)/layout.tsx` | No direct tests | Layout integration is complex — `sessionChecked` ref logic, `handleMigrate` async flow, and banner suppression during `migrating=true` are untested at unit level. Integration/E2E coverage is the right level here. |

**Test quality note:** The API tests are well-structured with isolated `beforeEach` resets, proper mock assertions on call arguments (not just return values), and boundary value coverage (age 0, 1, 18, 19; name 50 vs 51 chars). This is above average for the codebase.

**Duplicate test note:** `save-progress-banner.test.tsx` lines 104-115 ("error message is rendered when error prop is provided") is functionally identical to the test at lines 80-90. Minor redundancy, no functional impact.

---

## Backlog Actions Taken

| # | Severity | Description | Action |
|---|----------|-------------|--------|
| 1 | Important | Spec ambiguity on data copy — plan.md vs route comment contradiction | Added to BACKLOG.md #5 + TODO comment in route.ts |
| 2 | Important | Banner re-show after 3 sessions not implemented | Added to BACKLOG.md #6 + TODO comment in layout.tsx |
| 4 | Suggestion | Idempotency key too coarse — name only, not name+age | Added to BACKLOG.md #7 + TODO comment in route.ts |
| 5 | Suggestion | CSRF reliance on implicit SameSite — undocumented | Added to BACKLOG.md #8 |
| 3,6,7 | Suggestion | Inline style issues, missing validation note | Code comments added (no BACKLOG entry — captured by existing #3 or too low risk) |

---

## Recommended Actions

1. **Resolve data-copy ambiguity (Finding #1)** — Priority: P1. Before Phase 3C starts, confirm whether `use-game-session.ts` writes any rows for `guest_*` IDs. Update either the plan confirmation or the route comment to be the single source of truth. If guest rows do exist in DB, the migration endpoint must be extended with a Prisma transaction before multi-profile work begins.

2. **Implement 3-session re-show threshold (Finding #2)** — Priority: P2. The plan spec is not met. Add `sessionStorage`-based counter so dismissed banners only re-appear after 3 sessions, matching the specified UX. This is a small addition.

3. **Narrow idempotency key to include age (Finding #4)** — Priority: P2. Change `findFirst` where clause to `{ parentId, name: name.trim(), age }` to prevent sibling name collisions producing wrong child records.

---

## CONSENSUS

Tech Lead: APPROVED WITH CONDITIONS | Executor: APPROVED | Reviewer: APPROVED WITH CONDITIONS

Merge is safe. Findings #1 and #2 must be resolved before Phase 3C. Findings #3–#7 are tracked in BACKLOG.
