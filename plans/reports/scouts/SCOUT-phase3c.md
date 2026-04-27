# SCOUT — Phase 3C: Social & Multi-Profile
**Date**: 2026-04-28 | **Branch**: feature/phase-3c-social-multi-profile | **PR**: #32

---

## Changed Files (23 total)

### API Routes — HIGH RISK
| File | Type | Lines | Risk |
|------|------|-------|------|
| `app/api/parent/children/route.ts` | NEW | +50 | HIGH — auth + data creation |
| `app/api/parent/children/[id]/route.ts` | NEW | +55 | HIGH — IDOR vector |
| `app/api/parent/encouragement/route.ts` | NEW | +74 | HIGH — IDOR + unauth GET |
| `app/api/parent/settings/route.ts` | NEW | +53 | MEDIUM — auth OK |
| `app/api/parent/unsubscribe/route.ts` | NEW | +19 | CRITICAL — no auth, bare parentId in URL |
| `app/api/cron/weekly-report/route.ts` | NEW | +66 | HIGH — cron auth + data volume |

### DB / Infra — HIGH RISK
| File | Type | Lines | Risk |
|------|------|-------|------|
| `prisma/schema.prisma` | MODIFIED | +31 | HIGH — new model |
| `prisma/migrations/…/migration.sql` | NEW | +23 | MEDIUM — additive migration |
| `vercel.json` | NEW | +8 | MEDIUM — cron schedule |

### Context / State — MEDIUM RISK
| File | Type | Lines | Risk |
|------|------|-------|------|
| `context/game-progress-context.tsx` | MODIFIED | +24 | MEDIUM — localStorage persistence |
| `app/(child)/home/page.tsx` | MODIFIED | +35 | MEDIUM — wiring |

### UI Components — LOWER RISK
| File | Type | Lines | Risk |
|------|------|-------|------|
| `components/screens/child-switcher-modal.tsx` | NEW | +110 | LOW |
| `components/screens/encouragement-banner.tsx` | NEW | +45 | LOW |
| `components/screens/family-leaderboard.tsx` | NEW | +45 | LOW |
| `components/screens/home-screen.tsx` | MODIFIED | +20 | LOW |
| `components/screens/parent-dashboard-content.tsx` | MODIFIED | +90 | MEDIUM — N+1 query |
| `components/screens/parent-settings-content.tsx` | MODIFIED | +45 | LOW |

### Lib / Email / Export — MEDIUM RISK
| File | Type | Lines | Risk |
|------|------|-------|------|
| `lib/email/send-weekly-report.ts` | NEW | +29 | MEDIUM — email injection |
| `lib/email/weekly-report-template.tsx` | NEW | +66 | LOW |
| `lib/export/export-progress.ts` | NEW | +74 | LOW |

### Package Files
| File | Change |
|------|--------|
| `package.json` | +resend, @react-email/components, jspdf |
| `package-lock.json` | updated |

---

## Dependency & Blast Radius Map

```
EncouragementMessage model
  → encouragement/route.ts (POST/GET/PATCH)
  → encouragement-banner.tsx
  → home/page.tsx (fetch + dismiss)

Parent.emailReports field
  → settings/route.ts (GET/PATCH)
  → unsubscribe/route.ts (PATCH via URL)
  → cron/weekly-report/route.ts (filter)
  → parent-settings-content.tsx (toggle)

Child model (no schema change)
  → children/route.ts (GET/POST)
  → children/[id]/route.ts (PUT)
  → child-switcher-modal.tsx (fetch + select)
  → game-progress-context.tsx (switchChild action)
  → home/page.tsx (showSwitcher state)

Weekly email pipeline
  → vercel.json cron → weekly-report/route.ts → send-weekly-report.ts → weekly-report-template.tsx
  → unsubscribe/route.ts (linked from email)

Family leaderboard
  → parent-dashboard-content.tsx (N calls to /api/report/:id)
  → family-leaderboard.tsx (render only)

Export
  → parent-dashboard-content.tsx (handleExport)
  → export-progress.ts (CSV + jsPDF)
```

---

## External Dependencies Added
- `resend` — email sending SDK
- `@react-email/components` — email template components
- `jspdf` — client-side PDF generation (dynamic import)

---

## Pre-existing Auth Pattern
Cookie-based: `request.cookies.get('parentId')?.value`. All `/api/parent/*` routes use this, **except** `/api/parent/unsubscribe` which uses a URL query param `?parentId=` with no verification.

---

## Key Risks Flagged for Phase 2
1. `unsubscribe` route: no token/HMAC, any guessed parentId can unsubscribe any parent
2. `encouragement` GET: no auth check, any caller with a valid childId can read messages
3. `encouragement` PATCH: no auth check and no ownership verification — any caller can mark any message as read
4. `children/route.ts` POST: no cap on number of children per parent
5. Dashboard leaderboard: N+1 HTTP calls (`/api/report/:id` × N children), no debounce
6. cron route: `!process.env.CRON_SECRET` check inverts logic when env var unset (passes when secret missing)
7. `color` field in PUT children: `String(body.color)` — no allowlist validation
8. `SWITCH_CHILD` reducer: does not clear session-dependent state; may display stale world/session data
9. Export PDF: user data (`childName`, `lessonTitle`) passed directly to `doc.text()` — benign in PDF context but worth noting
10. Cron handler fetches ALL opted-in parents with all children + sessions in a single DB query — could be slow at scale
