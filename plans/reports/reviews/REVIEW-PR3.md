# Code Review: PR #3 — Phase A Foundation
**Date**: 2026-04-24 | **Reviewed by**: Golden Triangle (4 phases)
**Detail report**: `REVIEW-REPORT-PR3.md`

---

## Verdict: ❌ CHANGES REQUIRED

5 critical blockers must be resolved before merge. Foundation-level defects that compound into Phase B/C if left in.

## Executive Summary

Phase A delivers a solid structural skeleton: Tailwind v4 CSS-first tokens, 10-table Prisma schema, 14 UI components, 3 contexts, and 14 API stubs — all compiling cleanly. However, five foundation-layer defects discovered in review would propagate severe damage into every Phase B/C implementation built on top: all API routes are publicly exposed (no auth middleware), child data has no ownership enforcement (IDOR), score validity is delegated to the client, all box shadows are silently broken (CSS self-reference cycle), and Prisma cascades are missing (child deletion blocked). These are architecture and security decisions that must be locked correct before Phase B scaffolds on top.

## Risk Assessment

| Risk | Severity | Business Impact |
|------|----------|-----------------|
| No auth middleware | CRITICAL | Total data breach — any user accesses any parent/child data |
| IDOR on child routes | CRITICAL | COPPA violation risk; cross-parent child data leakage |
| Client-supplied `correct` field | CRITICAL | Game integrity zero; all progress/stars/stickers gameable |
| CSS shadow self-reference | CRITICAL | App looks flat/broken — core tactile UX identity broken |
| No Prisma cascade | CRITICAL | Child deletion blocked once any session exists |

## Critical Issues (5) — MUST fix before merge

| # | ID | File | Description | Fix | Effort |
|---|-----|------|-------------|-----|--------|
| 1 | S1 | `middleware.ts` (missing) | All 14 routes publicly accessible | Create `middleware.ts` with JWT/session check, 401 on unauth | M |
| 2 | S2 | `app/api/*/[childId\|id]` | IDOR — URL params never checked against session | `where: { id: params.childId, parentId: session.parentId }` on all child-scoped queries | M |
| 3 | S3 | `lib/types/api.ts:57` | `SubmitAttemptRequest.correct` is client-supplied | Remove `correct` from type; server computes from `AIQuestion.payload` vs `answer` | L |
| 4 | A5 | `app/globals.css:131-133` | `--shadow-card: var(--shadow-card)` self-reference cycle | Use raw values directly or rename source vars with `--_` private prefix | S |
| 5 | C8 | `prisma/schema.prisma` all relations | No `onDelete: Cascade` — child deletion blocked by FK Restrict | Add `onDelete: Cascade` to Child's ChildSettings, GameSession, ChildSticker, Streak FKs | S |

## Warnings (10) — Fix in Phase B/C/D

| # | ID | Issue | Effort |
|---|-----|-------|--------|
| 6 | A1 | Route handlers missing `request: NextRequest` param — Phase B blocked | S |
| 7 | A2 | 3 stub routes missing: `/api/worlds`, `/api/lessons/[id]`, `/api/streaks/[id]` | XS |
| 8 | P1 | No `@@index` on `Child.parentId`, `GameSession.childId`, `GameAttempt.sessionId` | XS |
| 9 | A10 | No `prisma/migrations/` — `migrate deploy` fails; DB never created | XS |
| 10 | S7 | `next.config.ts` has zero HTTP security headers | S |
| 11 | C3 | `bap-mascot.tsx` wink mood: both eyes close (asleep, not winking) | S |
| 12 | C4/C5 | `num-tile` + `big-button` missing HTML `disabled` attr — keyboard a11y | XS |
| 13 | C1 | `AudioContext` `speak()` hardcodes `en-US` — Vietnamese language setting broken | S |
| 14 | A6 | Font vars: `globals.css` uses literal `'Fredoka'` instead of `var(--font-fredoka)` | XS |
| 15 | A10 | `Child.color` default `"sun"` vs plan spec `"sage"` — pick one source of truth | XS |

## Security Summary

**Auth/AuthZ**: No middleware (S1), IDOR (S2), PIN brute-force unmitigated (S4), session token design undefined (S6)
**Input validation**: `correct` field client-trust (S3), `count` has no upper bound (P11), AI output unsanitized before serving children
**Child safety**: COPPA risk via IDOR; parent gate not architecturally enforced via middleware

## Plan Compliance

| Plan Phase | Status | Notes |
|------------|--------|-------|
| Project setup | ✅ | Next.js 16, Tailwind v4, Prisma 5 — correct |
| Docker/env | ⚠️ | Dockerfile exists, compose correct; BUT migrations missing |
| Prisma schema | ⚠️ | Schema complete, no cascades, no indexes, no migrations |
| UI components | ✅ | 14/14 components created |
| Contexts | ✅ | 3 contexts + providers |
| API stubs | ⚠️ | 14/17 stubs (3 missing), all missing `request` param |
| Static config | ✅ | 5/5 config files |

## Recommended Actions

| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|
| P0 | Fix CSS shadow self-reference (A5) | Dev | S |
| P0 | Add Prisma cascade + generate migrations (C8 + A10) | Dev | S |
| P0 | Add `request` param to all route handlers (A1) | Dev | S |
| P0 | Create `middleware.ts` (S1) | Dev | M |
| P0 | Fix IDOR on child routes (S2) | Dev | M |
| P0 | Remove `correct` from SubmitAttemptRequest (S3) | Dev | L |
| P1 | Add 3 missing route stubs + Prisma indexes | Dev | XS |
| P1 | Add HTTP security headers to next.config.ts | Dev | S |
| P1 | Fix accessibility on num-tile + big-button | Dev | XS |

**Estimated fix time**: Critical ~2d | High ~1.5d | Total ~4.5d

---

✅ CONSENSUS: tech-lead ✓ | planner ✓ | reviewer ✓ | security-engineer ✓
