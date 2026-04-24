# Code Review: PR #5 — Phase C Parent Area

**PR:** feat(phase-c): parent area — dashboard, settings, reports + game engine bug fixes
**Branch:** `feature/phase-c-parent-area` → `main`
**Files:** 49 changed | +10,201 / -2,428
**Reviewer:** Golden Triangle (reviewer / security-engineer / performance-engineer)
**Date:** 2026-04-25

---

## Verdict: ❌ CHANGES REQUIRED

6 critical security issues must be resolved before merge. The parent area ships with no authentication
middleware and no authorization on data routes — any user can access any child's data by URL.
Game engine fixes are correct. UI implementation quality is good. Test coverage needs expansion.

---

## Executive Summary

Phase C successfully delivers the parent dashboard, settings, and report UI, plus correct fixes for
the game engine infinite-loop bugs. The implementation quality of the UI layer is clean and
well-structured. However, the API layer ships without a fundamental security control: there is no
session mechanism. The login route returns a `parentId` in the response body but sets no cookie,
meaning no downstream route can verify who is calling. As a result, all parent data routes
(`/api/children`, `/api/children/:id/settings`, `/api/report/:childId`) are publicly accessible to
anyone who guesses a UUID. This is a blocking issue for production and must be resolved before merge.
The game engine infinite-loop fixes are effective for hear-tap and add-take. Number-order has a
residual low-probability slow-loop case (~3% of questions) that needs a loop guard added.

---

## Risk Assessment

| Risk | Severity | Likelihood | Business Impact | Mitigation |
|------|----------|------------|-----------------|------------|
| No session cookie set on login — all routes unprotected | CRITICAL | Certain | Child data leak, settings tampering | Set HttpOnly cookie + add middleware |
| No auth on `/api/report/:childId` | CRITICAL | High | Child behavioral data exposed | Add ownership check (requires session) |
| No auth on PATCH `/api/children/:id/settings` | CRITICAL | High | Cross-account settings tampering | Add ownership check |
| No rate limiting on `/api/auth/login` | HIGH | Medium | Brute-force credential theft | Add rate limiting middleware |
| number-order-engine residual slow-loop | HIGH | Low (~3%) | Game freeze on 1 in 33 questions | Add loop guard + fallback |
| Unbounded DB queries in report route | HIGH | Low (scale) | 500 error / timeout at scale | Paginate + parallelize with Promise.all |
| Zero tests for auth/children/report routes | HIGH | — | Regressions undetected | Add test files for each route |
| Settings PATCH has no rollback on failure | MEDIUM | Low | Silent data loss in UI | Rollback optimistic update on error |

---

## Critical Issues (6) — MUST Fix Before Merge

| # | File:Line | Issue | Fix Reference |
|---|-----------|-------|---------------|
| F28 | `middleware.ts` (missing) | No auth middleware — parent routes publicly accessible | [01-critical.md § F28](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |
| F1 | `api/auth/login/route.ts:26` | Login sets no session cookie — no downstream auth possible | [01-critical.md § F1](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |
| F2 | `api/children/route.ts:8` | GET children uses query-string parentId, no session check | [01-critical.md § F2](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |
| F3 | `api/children/[id]/settings/route.ts:22` | PATCH settings — no ownership check | [01-critical.md § F3](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |
| F4 | `api/report/[childId]/route.ts:24` | GET report — no auth, child data fully exposed | [01-critical.md § F4](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |
| F17 | `screens/parent-dashboard-content.tsx:37` | Client fetches without 401 redirect guard | [01-critical.md § F17](REVIEW-REPORT-PR5-phase-c/01-critical-issues.md) |

**Fix order:** F28 → F1 → F2, F3, F4 (parallel) → F17

---

## High Issues (11) — SHOULD Fix

| # | File:Line | Issue | Effort |
|---|-----------|-------|--------|
| F7 | `api/auth/login/route.ts` | No rate limiting — brute-force risk | Small |
| F5 | `api/auth/login/route.ts:12` | No password min-length check | Trivial |
| F6 | `api/auth/register/route.ts:12` | No email format / password strength validation | Small |
| F30 | `api/auth/register/route.ts:22` | Email not normalized (case-sensitive duplicates) | Trivial |
| F9 | `api/report/[childId]/route.ts:29` | 5 sequential DB queries — parallelize with Promise.all | Small |
| F29 | `api/report/[childId]/route.ts:70` | Unbounded gameAttempt query — no date filter | Small |
| F14 | `lib/game-engine/number-order-engine.ts:10` | Residual slow-loop when target=1 | Trivial |
| F18 | `components/parent/parent-gate.tsx` | Gate passes but sets no session — direct nav bypasses | Medium |
| F24 | `__tests__/game-engine/add-take-engine.test.ts` | No regression test for target=0 infinite-loop | Small |
| F25 | `app/api/auth/*, children/*, report/*` | Zero test coverage on all critical API routes | Large |
| F21 | `screens/parent-dashboard-content.tsx:36` | No AbortController — memory leak on unmount | Small |

---

## Medium Issues (8) — Address in Follow-up

| # | File:Line | Issue | Effort |
|---|-----------|-------|--------|
| F8 | `api/children/[id]/settings/route.ts:33` | upsert creates orphaned records (fixed by F3) | Trivial |
| F10 | `api/report/[childId]/route.ts:57` | Unbounded session query (fix alongside F29) | Small |
| F11 | `api/report/[childId]/route.ts:49` | Day-of-week double-counts across week boundary | Small |
| F12 | `api/children/route.ts:32` | age accepts 0 / negative / 999 | Trivial |
| F20 | `screens/parent-settings-content.tsx:45` | No rollback on settings PATCH failure | Small |
| F26 | `jest.config.js:24` | Coverage config excludes auth/children/report routes | Trivial |
| F31 | `app/(child)/home/page.tsx:30` | 3 fetches without coordinated loading / abort | Small |
| F19 | `screens/parent-dashboard-content.tsx:80` | New child shows "0%" accuracy instead of "—" | Trivial |

---

## Low / Info Issues (6) — Opportunistic

| # | File:Line | Issue |
|---|-----------|-------|
| F23 | `screens/parent-dashboard-content.tsx:115` | "Báo cáo chi tiết" navigates to /settings, should be /report |
| F13 | `api/children/[id]/settings/route.ts:45` | PUT aliased to PATCH — semantic mismatch |
| F22 | `app/(parent)/*/page.tsx` | Missing `<title>` metadata on parent pages |
| F27 | `__tests__/game-engine/number-order-engine.test.ts` | Fragile Math.random mock sequence |
| F15 | `lib/game-engine/add-take-engine.ts:8` | target=0 (3-3=0) — valid math, UX consideration only |
| F32 | `components/parent/parent-gate.tsx:15` | Gate answer client-side — document as intentional |

---

## Security Summary

**Vulnerabilities found: 9**

| OWASP Category | Count | Severity |
|----------------|-------|----------|
| A01 Broken Access Control | 4 | CRITICAL |
| A07 Auth Failures (no session) | 1 | CRITICAL |
| A07 Auth Failures (brute-force) | 1 | HIGH |
| A03 Injection (input validation) | 2 | HIGH |
| A05 Security Misconfiguration (CSRF) | 1 | MEDIUM |

**Immediate action:** Implement session cookie on login + middleware guard. This single change
gates all other auth fixes.

---

## Performance Summary

**Bottlenecks: 3**

| Bottleneck | File | Impact | Fix |
|------------|------|--------|-----|
| 5 sequential DB queries | `api/report/:childId` | ~250ms added latency | Promise.all |
| Unbounded attempt query | `api/report/:childId` | OOM risk at scale | Date filter + 90-day window |
| 3 uncoordinated fetches | `(child)/home/page.tsx` | Jank on load | Promise.allSettled |

---

## Positive Notes

- Game engine infinite-loop fixes for **hear-tap** and **add-take** are correct and complete
- Parent UI components are clean, well-decomposed, under 200 lines each
- Settings whitelist approach (allowed keys) is a good defensive pattern
- bcryptjs usage with salt=10 is correct
- Generic "Invalid credentials" message correctly avoids email enumeration
- `eslint.config.mjs` flat config is modern and well-structured
- Jest configuration with coverage thresholds (80%) is a good quality gate
- hear-tap test suite (50+ iteration invariant checks) is exemplary

---

## Recommended Actions

| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|
| P0 | Create `middleware.ts` — guard `/dashboard`, `/report`, `/settings` | Backend | 1h |
| P0 | Set HttpOnly session cookie in `POST /api/auth/login` | Backend | 30min |
| P0 | Add ownership checks to children, settings, report routes (F2–F4) | Backend | 2h |
| P1 | Add rate limiting to auth endpoints | Backend | 1h |
| P1 | Add input validation: email format, password min-length (F5, F6) | Backend | 30min |
| P1 | Parallelize report route queries with Promise.all + date filter (F9, F29) | Backend | 1h |
| P1 | Add loop guard to number-order-engine (F14) | Engine | 15min |
| P1 | Fix "Báo cáo chi tiết" nav bug — /settings → /report (F23) | Frontend | 5min |
| P1 | Add AbortController to dashboard + settings fetches (F21) | Frontend | 30min |
| P2 | Write tests for auth, children, report routes (F25) | QA | 4h |
| P2 | Expand jest coverage config to include all API routes (F26) | QA | 15min |
| P2 | Add rollback to settings PATCH failure (F20) | Frontend | 30min |
| P2 | Fix day-of-week double-count in report aggregation (F11) | Backend | 30min |
| P2 | Add loop guard regression test for add-take target=0 (F24) | QA | 30min |

---

## Plan Compliance

Plan file: `plans/260424-1457-phase1-mvp-implementation/phase-C-parent-area.md`

| Phase C Requirement | Status | Notes |
|--------------------|--------|-------|
| Parent Dashboard screen | ✅ Implemented | Clean, well-structured |
| Parent Settings (3 tabs) | ✅ Implemented | Time, Lang, Audio tabs complete |
| Parent Report screen | ✅ Implemented | Weekly chart, per-game breakdown |
| Parent API routes | ✅ Implemented | All routes present — auth missing |
| Parent Gate (anti-toddler) | ✅ Implemented | UX-only, documented as such needed |
| Game engine bug fixes | ✅ Implemented | hear-tap + add-take confirmed; number-order needs guard |
| Test suite | ⚠️ Partial | Engines tested; auth/report/children routes untested |

---

## Phase Results

| Phase | Triangle | Consensus | Rounds |
|-------|----------|-----------|--------|
| P1: Scope & Context | reviewer / scouter / tech-lead | ✅ | 1 |
| P2: Code Quality | reviewer / reviewer / security+perf | ✅ | 1 (2 findings downgraded) |
| P3: Improvement Plan | tech-lead / planner / reviewer | ✅ | 1 |
| P4: Summary | tech-lead / reporter / business-analyst | ✅ | 1 |

**Debate summary:** 31 total findings | 29 first-pass confirmed | 2 downgraded (F15, F16 → INFO) | 0 arbitrations needed

**Mailbox:** `plans/reports/MAILBOX-260424.md`
**Scout:** `plans/reports/scouts/SCOUT-PR5-phase-c.md`
**Detail:** `plans/reports/reviews/REVIEW-REPORT-PR5-phase-c/`

✅ **CONSENSUS P4: tech-lead ✓ | reporter ✓ | business-analyst ✓**
