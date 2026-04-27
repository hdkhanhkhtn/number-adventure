# CODE REVIEW — Phase 3C: Social & Multi-Profile
**Date**: 2026-04-28 | **PR**: #32 | **Branch**: feature/phase-3c-social-multi-profile
**Reviewer**: Golden Triangle (Tech Lead / Code Reviewer / Security Reviewer)
**Scout report**: `plans/reports/scouts/SCOUT-phase3c.md`
**Detail report**: `plans/reports/reviews/REVIEW-REPORT-phase3c.md`

---

## Phase Triangle Summary

| Phase | Roles | Consensus | Debate Rounds |
|-------|-------|-----------|---------------|
| P1 — Scope & Context | scouter / tech-lead | PASS | 0 |
| P2 — Code Quality | code-reviewer / security-reviewer / tech-lead | PASS | 0 |
| P3 — Improvement Plan | tech-lead / code-reviewer / security-reviewer | PASS | 0 |
| P4 — Summary | tech-lead / reporter / business-analyst | PASS | 0 |

---

## Plan Alignment: PASS

All five Phase 3C features are implemented and present:
- Multi-child profile switcher: `child-switcher-modal.tsx` + context `SWITCH_CHILD` + home wiring
- Parent encouragement messages: schema + migration + API (POST/GET/PATCH) + banner UI
- Weekly email cron: `vercel.json` + cron route + Resend integration + React Email template
- Progress export: CSV + PDF (jsPDF dynamic import) + dashboard export buttons
- Family leaderboard: leaderboard component + dashboard data fetch

---

## Issues Found

| # | Severity | File:Line | Description | Recommendation |
|---|----------|-----------|-------------|----------------|
| C1 | **CRITICAL** | `app/api/parent/unsubscribe/route.ts:1` | No auth — bare `parentId` in URL lets anyone unsubscribe any parent | Sign URL with HMAC-SHA256 using `UNSUBSCRIBE_SECRET`; verify with `timingSafeEqual` |
| C2 | **CRITICAL** | `app/api/parent/encouragement/route.ts:43` | GET handler has no auth — any caller who knows a `childId` reads private family messages | Add `parentId` cookie auth + verify child belongs to parent |
| C3 | **CRITICAL** | `app/api/parent/encouragement/route.ts:60` | PATCH handler has no auth/ownership — anyone can silently mark any message as read | Add auth cookie + fetch message to confirm ownership before update |
| W1 | **WARNING** | `app/api/parent/children/route.ts:28` | No child profile cap — unlimited creation enables storage abuse | Add `count` guard, max 10 children per parent |
| W2 | **WARNING** | `app/api/parent/children/[id]/route.ts:43` | `color` field accepts arbitrary string — no allowlist, renders in CSS `var()` | Validate against `MascotColor` union allowlist |
| W3 | **WARNING** | `app/api/cron/weekly-report/route.ts:52` | Raw `parentId` embedded in email unsubscribe URL (compounds C1) | Use opaque HMAC token only; remove parentId from URL |
| W4 | **WARNING** | `lib/email/send-weekly-report.ts:21` | `parent.name` unescaped in email subject — CRLF header injection possible | Strip `\r\n`, truncate to 50 chars |
| I1 | **IMPORTANT** | `context/game-progress-context.tsx:45` | `SWITCH_CHILD` preserves `sessionActive` + `currentWorldId` — stale state on switch | Reset both fields in `SWITCH_CHILD` case |
| I2 | **IMPORTANT** | `components/screens/parent-dashboard-content.tsx:82` | Leaderboard ranks by all-time `totalStars`, UI says "This Week" — misleading | Use week-scoped query or correct the label |
| I3 | **IMPORTANT** | `components/screens/parent-dashboard-content.tsx:75` | N+1 HTTP: one `/api/report/:id` call per child on every dashboard mount | Add `/api/parent/leaderboard` server-side aggregation endpoint |
| I4 | **IMPORTANT** | `app/api/cron/weekly-report/route.ts:18` | Single unbounded `findMany` loads all parents + children + sessions into memory | Batch with `take`/`skip` or aggregate in DB |
| S1 | Suggestion | `lib/export/export-progress.ts:30` | No UTF-8 BOM — Excel garbles multibyte child names | Prepend `'\uFEFF'` to CSV blob |
| S2 | Suggestion | `lib/export/export-progress.ts:62` | Inner `break` after `slice(0,30)` is unreachable dead code | Remove the inner `if (y > 270) break` |
| S3 | Suggestion | `components/screens/parent-dashboard-content.tsx:75` | Leaderboard effect has no AbortController cleanup | Add cleanup to avoid state update on unmounted component |
| S4 | Suggestion | `lib/email/weekly-report-template.tsx:44` | `key={i}` (array index) in email template list | Use `key={child.name}` |
| S5 | Suggestion | `lib/email/send-weekly-report.ts:3` | `Resend` initialized at module load with no guard for missing `RESEND_API_KEY` | Lazy init or startup assertion |
| S6 | Suggestion | `components/screens/child-switcher-modal.tsx:27` | Re-fetches `/api/parent/children` on every modal open | Cache response or lift fetch to parent |
| S7 | Suggestion | `app/(child)/home/page.tsx:18` | `EncouragementMsg` interface duplicates server-side API shape | Move to shared types file |

---

## Security Checklist

- [x] Cron endpoint protected by `CRON_SECRET` — logic correct
- [x] `/api/parent/children` GET/POST — auth cookie verified
- [x] `/api/parent/children/[id]` PUT — IDOR check present (child.parentId === parentId)
- [x] `/api/parent/settings` GET/PATCH — auth cookie verified
- [x] `/api/parent/encouragement` POST — auth + child ownership verified
- [ ] `/api/parent/encouragement` GET — **NO AUTH** (C2)
- [ ] `/api/parent/encouragement` PATCH — **NO AUTH, NO OWNERSHIP** (C3)
- [ ] `/api/parent/unsubscribe` — **NO AUTH, IDOR via URL** (C1)
- [ ] `color` field — no allowlist (W2)
- [ ] Email subject — unsanitized name (W4)
- [ ] parentId in email URL — information disclosure (W3)

---

## What Was Done Well

- IDOR protection is correctly implemented in `children/[id]/route.ts` and `encouragement` POST — ownership verified before mutations.
- Cron auth (`CRON_SECRET`) pattern is correct and follows Vercel's recommended approach.
- Prisma migration is additive-only (no destructive changes), cascade deletes are appropriate.
- `jsPDF` is dynamically imported to avoid SSR issues — good practice.
- Optimistic update with rollback in `parent-settings-content.tsx` email toggle is correct.
- `EncouragementBanner` disables the dismiss button while in-flight — prevents double-submit.
- `SWITCH_CHILD` action is correctly non-destructive for the profile/childId fields.
- `child-switcher-modal.tsx` shows active child state visually — good UX.
- File sizes are reasonable; most new files are under 120 lines.

---

## Verdict

**SECURITY BLOCK**

Three unauthenticated API endpoints (C1, C2, C3) must be fixed before merge. These are not theoretical — they are directly exploitable by any user who learns a `childId` or `parentId` CUID. Both values can be inferred from other authenticated API responses.

**Required before merge (CRITICAL)**:
- C1: Add HMAC token to unsubscribe flow
- C2: Add parentId auth + child ownership to encouragement GET
- C3: Add parentId auth + message ownership to encouragement PATCH

**Required in next phase (WARNING/IMPORTANT)**:
- W1, W2, W4: Input validation gaps
- W3: Remove parentId from email URL after C1 is fixed
- I1: SWITCH_CHILD state reset
- I2: Leaderboard data accuracy (label vs. data scope)
- I3, I4: Performance — N+1 HTTP calls and unbounded cron query

**Suggestions (S1–S7)**: Backlog items, no merge blocker.

---

## Unresolved Questions

1. Is `parentId` in `EncouragementMessage` redundant given `childId → child.parentId`? Storing both is denormalized — was this intentional for query performance or an oversight?
2. The cron is scheduled `0 9 * * 1` (Monday 9am UTC). Should this be configurable per parent timezone? Currently all users receive reports at the same UTC moment regardless of locale.
3. The leaderboard is client-side computed from existing `/api/report/:id` calls. Is there a plan for a proper `/api/parent/leaderboard` endpoint, or is this intended as a temporary approach?
4. `emailReports` defaults to `true` (opt-out model). Is this compliant with applicable email regulations (CAN-SPAM, GDPR) for the target market? GDPR typically requires opt-in.
