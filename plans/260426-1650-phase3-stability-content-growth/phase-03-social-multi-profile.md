# Phase 3: Social & Multi-Profile (3C)

## Context Links

- [Research: AI Pipeline & Social](research/researcher-phase3bc-ai-pipeline-social.md)
- [Scout: Codebase Analysis](scout/scout-phase3-codebase.md)
- [Plan Overview](plan.md)

## Overview

- **Priority:** Medium
- **Status:** Pending
- **Effort:** ~3 days
- **Description:** Multi-child profile switcher, parent encouragement messages, weekly email reports, progress export, opt-in family leaderboard.

## Key Insights

- Schema already supports `Parent.children[]` 1:N — no migration needed for multi-child
- Current gap: single `state.childId` in context; no switcher UI
- `activeChildId` persisted to localStorage; never exposed in URL (privacy)
- Resend: 3K free emails/month, React Email templates, Next.js-native
- Vercel Cron: `vercel.json` `crons` array; verify with `Authorization` header
- Existing endpoints: `/api/progress/[childId]`, `/api/report/[childId]` (partial)
- `emailReports` opt-in field needed on Parent model

## Requirements

### Functional

- FR-01: Parent can add/switch between multiple child profiles
- FR-02: Profile switcher accessible from child home screen header (avatar tap)
- FR-03: Parent can write encouragement message; child sees it on home screen
- FR-04: Weekly email sent every Monday 09:00 UTC with per-child progress summary
- FR-05: Parent can export child progress as PDF or CSV from dashboard
- FR-06: Opt-in family leaderboard (stars this week, among parent's children)
- FR-07: Email includes unsubscribe link; parent can toggle opt-in in settings

### Non-Functional

- NFR-01: Profile switch does not require page reload — context update only
- NFR-02: Email contains only aggregated stats, no raw gameplay logs (GDPR)
- NFR-03: Cron endpoint validates `Authorization: Bearer <CRON_SECRET>` header
- NFR-04: PDF generation runs client-side (no server-side PDF lib needed for MVP)

## Architecture

```
Multi-child:
  Parent login → GET /api/parent/children → populate ActiveChildContext
  Avatar tap → ChildSwitcherModal → setActiveChild(child) → context + localStorage update
  All game/progress fetches use activeChild.id

Weekly email:
  Vercel Cron (Monday 09:00 UTC)
    → GET /api/cron/weekly-report
    → query all parents WHERE emailReports=true
    → for each parent: aggregate child progress this week
    → Resend.send() with React Email template
```

## Related Code Files

### MODIFY

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add `emailReports` to Parent; add `EncouragementMessage` model |
| `context/game-progress-context.tsx` | Support `activeChildId` switching without full state reset |
| `components/screens/home-screen.tsx` | Add encouragement message display + switcher trigger |
| `app/(child)/home/page.tsx` | Fetch encouragement message for active child |
| `app/(parent)/dashboard/page.tsx` | Add export button (PDF/CSV) |
| `components/screens/parent-dashboard-content.tsx` | Add child selector dropdown, export UI |
| `components/screens/parent-settings-content.tsx` | Add email opt-in toggle |

### CREATE

| File | Purpose |
|------|---------|
| `components/screens/child-switcher-modal.tsx` | Bottom sheet: avatar list, tap to switch |
| `components/screens/encouragement-banner.tsx` | Child home banner showing parent message |
| `app/api/parent/children/route.ts` | GET list children; POST create child |
| `app/api/parent/children/[id]/route.ts` | PUT update child (name, avatar, age) |
| `app/api/parent/encouragement/route.ts` | POST create message; GET latest for child |
| `app/api/cron/weekly-report/route.ts` | Cron handler: aggregate + send email |
| `lib/email/weekly-report-template.tsx` | React Email template for weekly report |
| `lib/email/send-report.ts` | Resend integration wrapper |
| `lib/export/export-progress.ts` | Client-side PDF/CSV generation utils |
| `vercel.json` | Add cron schedule entry |

## Implementation Steps

### Task 3C-01: Multi-child profiles (High)

1. Add API routes for parent's children:
   - `app/api/parent/children/route.ts`:
     ```typescript
     // GET: prisma.child.findMany({ where: { parentId: session.parentId } })
     // POST: prisma.child.create({ data: { parentId, name, age, color } })
     ```
   - `app/api/parent/children/[id]/route.ts`:
     ```typescript
     // PUT: validate session.parentId === child.parentId before update
     ```
2. Update `context/game-progress-context.tsx`:
   - Add `switchChild(childId, profile)` action that updates `childId` + `profile` without clearing settings
   - Persist `activeChildId` to localStorage key `bap-active-child`
3. Create `components/screens/child-switcher-modal.tsx`:
   - Bottom sheet triggered by avatar tap in home screen header
   - Shows avatar + name for each child, highlight active
   - Tap to switch; "Add child" button at bottom (opens profile setup)
   - No keyboard input — tap only (child-safe)
4. Wire switcher into `components/screens/home-screen.tsx`:
   - Avatar in header becomes tappable
   - Opens `ChildSwitcherModal`
   - On select: call `switchChild()` from context
5. After switch: all `useEffect` hooks depending on `state.childId` re-fetch automatically

### Task 3C-02: Parent encouragement messages (Medium)

1. Add Prisma model:
   ```prisma
   model EncouragementMessage {
     id        String   @id @default(cuid())
     parentId  String
     childId   String
     message   String
     read      Boolean  @default(false)
     createdAt DateTime @default(now())
     @@index([childId, createdAt(sort: Desc)])
   }
   ```
2. Run migration: `npx prisma migrate dev --name add-encouragement-messages`
3. Create `app/api/parent/encouragement/route.ts`:
   - POST: `{ childId, message }` — validate parentId owns childId; max 200 chars
   - GET: `?childId=xxx` — return latest unread message
4. Create `components/screens/encouragement-banner.tsx`:
   - Soft card on home screen with parent message + mascot reaction
   - "Got it!" dismiss button marks message as read (PATCH)
5. In `app/(child)/home/page.tsx`: fetch latest encouragement on mount; show banner if exists

### Task 3C-03: Weekly progress email (Medium)

1. Install Resend: `npm install resend @react-email/components`
2. Add to `.env`: `RESEND_API_KEY=re_xxx`, `CRON_SECRET=xxx`
3. Add `emailReports` field to Parent model:
   ```prisma
   model Parent {
     // ... existing fields
     emailReports Boolean @default(true)
   }
   ```
4. Run migration: `npx prisma migrate dev --name add-email-reports-flag`
5. Create `lib/email/weekly-report-template.tsx`:
   - React Email component: child name, sessions count, accuracy %, stars earned, streak
   - Include unsubscribe link: `{baseUrl}/api/parent/unsubscribe?token={jwt}`
6. Create `lib/email/send-report.ts`:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   export async function sendWeeklyReport(parent, childSummaries) {
     await resend.emails.send({
       from: 'Bap Adventure <noreply@yourdomain.com>',
       to: parent.email,
       subject: `${parent.name}'s Weekly Progress Report`,
       react: WeeklyReportTemplate({ parent, children: childSummaries }),
     });
   }
   ```
7. Create `app/api/cron/weekly-report/route.ts`:
   ```typescript
   export async function GET(req: Request) {
     // Verify cron secret
     if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }
     const parents = await prisma.parent.findMany({
       where: { emailReports: true },
       include: { children: true },
     });
     for (const parent of parents) {
       // Aggregate: GameSession WHERE completedAt >= 7 days ago, group by childId
       // Send email with per-child summary
     }
     return Response.json({ sent: parents.length });
   }
   ```
8. Create/update `vercel.json`:
   ```json
   { "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 9 * * 1" }] }
   ```
9. Add email opt-in toggle to `components/screens/parent-settings-content.tsx`

### Task 3C-04: Export progress PDF/CSV (Low)

1. Create `lib/export/export-progress.ts`:
   - CSV: build string from progress data, trigger download via `Blob` + `URL.createObjectURL`
   - PDF: use `jsPDF` library (client-side): `npm install jspdf`
   - Content: child name, date range, lessons completed, stars, accuracy, streak
2. Add export button to `components/screens/parent-dashboard-content.tsx`:
   - Dropdown: "Export as PDF" / "Export as CSV"
   - Fetch `/api/report/[childId]` data, pass to export function

### Task 3C-05: Family leaderboard (Low)

1. Add leaderboard component to parent dashboard:
   - Query all children under parent
   - Rank by stars earned this week (from `GameSession` WHERE `completedAt >= Monday`)
   - Show avatar + name + stars count
   - Opt-in toggle in parent settings (localStorage-only for MVP)
2. Create `components/screens/family-leaderboard.tsx`:
   - Simple ranked list with crown icon for #1
   - Only shows when parent has 2+ children

## Todo List

- [ ] 3C-01: Multi-child API routes + context switcher + modal UI
- [ ] 3C-02: Encouragement message model + API + home banner
- [ ] 3C-03: Resend integration + cron route + email template + opt-in toggle
- [ ] 3C-04: Client-side PDF/CSV export from parent dashboard
- [ ] 3C-05: Family leaderboard (parent's children, opt-in)

## Success Criteria

- Parent with 2+ children can switch active child without page reload
- Switching child updates all progress fetches (streak, stickers, worlds)
- Parent can write message; child sees it on home screen and can dismiss
- Weekly email fires on Monday 09:00 UTC; contains per-child summary
- Email has working unsubscribe link; toggling opt-out stops emails
- PDF/CSV download contains accurate progress data for selected child
- Leaderboard shows correct ranking among parent's children

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Child switch leaves stale data in UI | Wrong progress shown | All progress fetches key on `state.childId` — re-fetch on change |
| Email delivery fails (SPF/DKIM) | Parent never receives report | Use Resend's verified domain; test with real inbox before launch |
| Cron fires multiple times | Duplicate emails | Idempotency: check `lastReportSentAt` on Parent before sending |
| PDF generation slow on mobile | Poor UX | Show loading spinner; limit data to last 30 days |

## Security Considerations

- All `/api/parent/*` routes validate `session.parentId` from cookie
- `POST /api/parent/encouragement`: validate parentId owns childId (prevent cross-parent)
- Cron endpoint: `Authorization: Bearer <CRON_SECRET>` header check
- Email unsubscribe: use JWT token (not raw parentId) to prevent unauthorized opt-out
- Export: client-side only; no sensitive data leaves browser beyond what's already fetched
- Leaderboard: family-only (parent's children); no cross-family data exposure

## Next Steps

- After multi-child works, consider shared sticker collections across siblings
- Email template can be extended with monthly summary (separate cron schedule)
- Leaderboard could expand to classroom mode in Phase 4 (teacher dashboard)
