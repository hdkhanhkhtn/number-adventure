# REVIEW REPORT — Phase 3C: Social & Multi-Profile
**Date**: 2026-04-28 | **Branch**: feature/phase-3c-social-multi-profile | **PR**: #32
**Reviewer**: Golden Triangle (Tech Lead / Code Reviewer / Security Reviewer)

---

## Phase 2 — Code Quality Review

### ROLE: Tech Lead — Task Decomposition
Five review dimensions applied to 19 substantive files:
1. CORRECTNESS — logic, edge cases, error paths
2. SECURITY — OWASP: injection, auth, IDOR, input validation
3. PERFORMANCE — N+1, memory, complexity
4. ARCHITECTURE — patterns, layer boundaries, separation of concerns
5. CODE QUALITY — naming, DRY, readability, file size

---

## ROLE: Security Reviewer — Pass 1

### CRITICAL — C1: Unsubscribe route has no authentication or HMAC token

**File**: `app/api/parent/unsubscribe/route.ts`

```
GET /api/parent/unsubscribe?parentId=xxx
```

The route accepts a raw `parentId` (a CUID) and immediately updates the DB with no verification that the caller is entitled to unsubscribe that parentId. Any actor who learns or guesses a parentId can unsubscribe any parent. CUIDs are not secret — they appear in logs, referrer headers, and error messages.

**OWASP**: A01 (Broken Access Control) / A07 (Identification and Authentication Failures)

**Fix**: Issue a signed time-limited token. Standard practice:
```typescript
// On email send:
const token = createHmac('sha256', process.env.UNSUBSCRIBE_SECRET!)
  .update(parentId)
  .digest('hex');
const unsubUrl = `${baseUrl}/api/parent/unsubscribe?token=${token}`;

// On route:
const expected = createHmac('sha256', process.env.UNSUBSCRIBE_SECRET!)
  .update(parentId)
  .digest('hex');
if (!timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
}
```

---

### CRITICAL — C2: Encouragement GET endpoint has no authentication

**File**: `app/api/parent/encouragement/route.ts` (GET handler, lines 43–58)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get('childId');
  // NO parentId check — any caller who knows a childId reads the message
```

The GET fetches `{ id, message, createdAt }` for any `childId` with no auth. An attacker who knows any child's CUID (leaked via other API responses) can enumerate encouragement messages written by parents. This is a data leak of private family communications.

**OWASP**: A01 (Broken Access Control)

**Fix**: Add parentId cookie auth and verify that `childId` belongs to the authenticated parent before returning the message.

---

### CRITICAL — C3: Encouragement PATCH endpoint has no authentication and no ownership check

**File**: `app/api/parent/encouragement/route.ts` (PATCH handler, lines 60–74)

```typescript
export async function PATCH(request: NextRequest) {
  // No cookie check, no parentId, no childId ownership verification
  await prisma.encouragementMessage.update({
    where: { id: body.id },
    data: { read: true },
  });
```

Any unauthenticated HTTP client that knows (or guesses) a message CUID can mark any parent's encouragement message as read, silently suppressing it on the child's screen. Denial-of-service against the encouragement feature.

**OWASP**: A01 (Broken Access Control)

**Fix**: Add auth cookie, fetch message to confirm `parentId` matches, then update.

---

### CRITICAL — C4: Cron secret check inverts when env var is missing

**File**: `app/api/cron/weekly-report/route.ts`, line 10

```typescript
if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
```

This logic is: "if CRON_SECRET is falsy (empty/missing) → block". That part looks correct. But `!process.env.CRON_SECRET` short-circuits — when CRON_SECRET is an empty string `""`, the first operand is `true` and the request is blocked, which is fine. However, the intent comment says "Unauthorized" but the semantic danger is the opposite: in a misconfigured environment where CRON_SECRET exists but is wrong, it still correctly rejects. The actual logic is sound but the short-circuit documentation is misleading.

**Re-assessment**: Upon careful re-reading: `!process.env.CRON_SECRET` returns `true` when secret is missing/empty → returns 401. `authHeader !== Bearer ...` catches wrong token. Logic is actually CORRECT. **Downgrade to WARNING.**

---

### WARNING — W1: No child count cap in POST /api/parent/children

**File**: `app/api/parent/children/route.ts`, POST handler

A parent can create unlimited child profiles. No `MAX_CHILDREN` guard. This enables storage abuse (spam child creation) and makes the cron handler's `prisma.parent.findMany({ include: { children: { include: { sessions: ... } } } })` unbounded in depth.

**Fix**: Add a count check before creation:
```typescript
const count = await prisma.child.count({ where: { parentId } });
if (count >= 10) return NextResponse.json({ error: 'Max 10 profiles' }, { status: 400 });
```

---

### WARNING — W2: `color` field not validated against allowlist

**File**: `app/api/parent/children/[id]/route.ts`, line 43

```typescript
if (body.color !== undefined) {
  updates.color = String(body.color);
}
```

`color` is coerced to string with no allowlist. A parent can store arbitrary strings (e.g. `<script>`, CSS injection, very long strings). The field is rendered via `var(--color-${entry.color})` in `family-leaderboard.tsx` — CSS variable injection could produce unexpected visual behavior.

**Fix**: Validate against the known `MascotColor` union:
```typescript
const VALID_COLORS = ['sage', 'cream', 'terracotta', 'sky', 'lavender'] as const;
if (!VALID_COLORS.includes(body.color)) {
  return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
}
```

---

### WARNING — W3: Unsubscribe URL embeds raw parentId in email body

**File**: `app/api/cron/weekly-report/route.ts`, line 52

```typescript
const unsubscribeUrl = `${baseUrl}/api/parent/unsubscribe?parentId=${parent.id}`;
```

This is compounded by C1 — the parentId is exposed in email clients, forwarded mail, referrer headers on click. Even after fixing C1 with HMAC, the parentId should not be in the URL at all; only the opaque token should be.

---

### WARNING — W4: Email subject line uses parent name without sanitization

**File**: `lib/email/send-weekly-report.ts`, line 21

```typescript
subject: `${parent.name ?? 'Your'}'s family weekly progress report`,
```

`parent.name` comes from DB unescaped. If a malicious name contains special characters (newlines `\r\n`, CRLF sequences), this is an email header injection vector. Most modern email SDKs (Resend) sanitize headers, but this is not guaranteed.

**Fix**: Sanitize or truncate: `parent.name?.replace(/[\r\n]/g, '').slice(0, 50) ?? 'Your'`

---

## ROLE: Code Reviewer — Pass 2

### CORRECTNESS

**C-COR-1 (Important)**: `SWITCH_CHILD` reducer preserves `currentWorldId` and `sessionActive` state across child switches. If child A is mid-session and you switch to child B, `sessionActive: true` and child A's worldId remain in state. This can cause the UI to behave as if child B is in an active session.

```typescript
case 'SWITCH_CHILD':
  return { ...state, childId: action.childId, profile: action.profile };
  // sessionActive and currentWorldId NOT reset
```

**Fix**: Reset session-dependent fields on switch:
```typescript
case 'SWITCH_CHILD':
  return { ...state, childId: action.childId, profile: action.profile,
           sessionActive: false, currentWorldId: null };
```

**C-COR-2 (Important)**: The leaderboard in `parent-dashboard-content.tsx` uses `report.totalStars` as `starsThisWeek`. But `totalStars` from `/api/report/:id` is the all-time total, not the weekly total. The leaderboard heading says "This Week" but ranks by lifetime stars.

```typescript
const data: ReportData = r.ok ? await r.json() : { totalStars: 0 };
return { ..., starsThisWeek: data.totalStars ?? 0, ... };
// totalStars = all-time, not this week
```

**Fix**: Either use a week-scoped API parameter or rename the leaderboard title to "All-Time Leaderboard."

**C-COR-3 (Suggestion)**: `exportAsCSV` does not append a UTF-8 BOM. Excel on Windows will misinterpret multi-byte characters in child names.

**Fix**: Prepend `'\uFEFF'` to the csv string: `const csv = '\uFEFF' + rows.map(...).join('\n')`.

**C-COR-4 (Suggestion)**: `exportAsPDF` hard-limits session rows at 30 with a `break` on `y > 270`, but `doc.save()` is called once at the end. The `break` is redundant with the `slice(0, 30)` above it — dead code in the loop body (the inner break will never fire given slice).

**C-COR-5 (Suggestion)**: `encouragement` GET returns the message with `{ id, message, createdAt }`. The `createdAt` is typed as `DateTime` (Prisma) but the `home/page.tsx` interface types it as `string`. This is only safe because JSON serialization converts Date → ISO string, but it is a type mismatch that should be made explicit.

---

### PERFORMANCE

**C-PERF-1 (Important)**: Family leaderboard makes N+1 HTTP calls from the browser.

```typescript
const entries = await Promise.all(
  children.map(async (c) => {
    const r = await fetch(`/api/report/${c.id}`, ...)
  })
);
```

For a parent with 5 children, this triggers 1 (children list) + 5 (reports) = 6 concurrent API calls on every dashboard mount. No caching, no abort controller, and the effect has no cleanup.

**Fix**: Add a dedicated `/api/parent/leaderboard` endpoint that performs a single aggregated DB query server-side. Or add an AbortController cleanup.

**C-PERF-2 (Important)**: The cron job loads ALL opted-in parents with ALL children with ALL sessions in a single Prisma `findMany` with deep `include`. For a production dataset of 1000 parents × 2 children × 50 sessions × 5 attempts, this is a single query returning ~500,000 records into Node.js memory.

```typescript
const parents = await prisma.parent.findMany({
  where: { emailReports: true },
  include: {
    children: {
      include: {
        sessions: {
          where: { completedAt: { gte: weekAgo }, status: 'completed' },
          include: { attempts: { select: { correct: true } } },
        },
        streak: { select: { currentStreak: true } },
      },
    },
  },
});
```

**Fix**: Process parents in batches (`take`/`skip` pagination), or use a raw aggregation query to compute summaries in the DB rather than in JS.

**C-PERF-3 (Suggestion)**: `child-switcher-modal.tsx` fetches `/api/parent/children` on every mount (every time the modal opens). There is no caching or SWR. For a fast multi-tap scenario, this creates duplicate requests.

---

### ARCHITECTURE

**C-ARCH-1 (Suggestion)**: `parent-dashboard-content.tsx` now has three `useEffect` hooks for data fetching (report, leaderboard, onboarding check) and a local `handleExport` function. The file is growing beyond the 200-line limit (diff adds ~90 lines to an already large file). The leaderboard fetch logic should move to a custom hook `useLeaderboard()`.

**C-ARCH-2 (Suggestion)**: The `EncouragementBanner` component mixes UI concern (display) with API mutation (PATCH on dismiss). A more separated approach would lift the dismiss handler to `home/page.tsx` and pass it as a prop. Currently `messageId` and the fetch are both in the child component, making it harder to test.

**C-ARCH-3 (Suggestion)**: `vercel.json` cron uses a fixed `0 9 * * 1` (Monday 9am UTC). For a child education app with a global audience, a UTC timezone annotation in comments would reduce operational confusion. Not a code defect.

---

### CODE QUALITY

**C-QA-1 (Suggestion)**: `weekly-report-template.tsx` uses `key={i}` (array index) for React list items. Since the email template is rendered server-side (non-interactive), this is technically harmless but violates React key best practices. Use `key={child.name}`.

**C-QA-2 (Suggestion)**: `home/page.tsx` defines `EncouragementMsg` interface locally. This duplicates the shape defined in the API. Should be colocated with the API type or a shared types file.

**C-QA-3 (Suggestion)**: `send-weekly-report.ts` initializes `const resend = new Resend(...)` at module load time. If `RESEND_API_KEY` is missing at build time, this silently creates an SDK instance that will fail at send time rather than at startup. Consider a lazy initialization or startup guard.

---

## ROLE: Tech Lead — Arbitration & Consensus

No disputes between Reviewer and Security Reviewer. All findings agree. No debate rounds needed.

**CONSENSUS**: Tech Lead OK | Code Reviewer OK | Security Reviewer OK

---

## Issue Register

| # | Severity | File | Line | Description |
|---|----------|------|------|-------------|
| C1 | CRITICAL | `app/api/parent/unsubscribe/route.ts` | 1-19 | No HMAC token — any parentId in URL unsubscribes any parent |
| C2 | CRITICAL | `app/api/parent/encouragement/route.ts` | 43-58 | GET has no auth — any caller reads private family messages |
| C3 | CRITICAL | `app/api/parent/encouragement/route.ts` | 60-74 | PATCH has no auth/ownership — any caller silences messages |
| W1 | WARNING | `app/api/parent/children/route.ts` | 28-49 | No child count cap — storage abuse vector |
| W2 | WARNING | `app/api/parent/children/[id]/route.ts` | 43 | `color` not validated against allowlist — CSS injection |
| W3 | WARNING | `app/api/cron/weekly-report/route.ts` | 52 | parentId exposed in email URL (tied to C1) |
| W4 | WARNING | `lib/email/send-weekly-report.ts` | 21 | Unsanitized parent.name in email subject — header injection |
| I1 | IMPORTANT | `context/game-progress-context.tsx` | 45 | SWITCH_CHILD keeps sessionActive + worldId — stale state |
| I2 | IMPORTANT | `components/screens/parent-dashboard-content.tsx` | 82-101 | Leaderboard ranks by all-time stars, label says "This Week" |
| I3 | IMPORTANT | `components/screens/parent-dashboard-content.tsx` | 75-101 | N+1 HTTP calls on dashboard mount — no server aggregation |
| I4 | IMPORTANT | `app/api/cron/weekly-report/route.ts` | 18-33 | Unbounded DB query loads all data into memory |
| S1 | SUGGESTION | `lib/export/export-progress.ts` | 30 | No UTF-8 BOM — Excel on Windows garbles multibyte names |
| S2 | SUGGESTION | `lib/export/export-progress.ts` | 62 | Inner `break` unreachable — dead code after `slice(0,30)` |
| S3 | SUGGESTION | `components/screens/parent-dashboard-content.tsx` | 75+ | Leaderboard fetch has no AbortController cleanup |
| S4 | SUGGESTION | `lib/email/weekly-report-template.tsx` | 44 | `key={i}` array index in list |
| S5 | SUGGESTION | `lib/email/send-weekly-report.ts` | 3 | Resend initialized at module load, no startup guard for missing key |
| S6 | SUGGESTION | `components/screens/child-switcher-modal.tsx` | 27 | Modal re-fetches on every open, no caching |
| S7 | SUGGESTION | `app/(child)/home/page.tsx` | 18 | Local `EncouragementMsg` interface duplicates API shape |
