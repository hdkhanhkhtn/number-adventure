# Phase 04 — Parent Dashboard Empty State & Settings Security Tab

## Context Links

- [Parent plan](./plan.md)
- Dashboard content: `components/screens/parent-dashboard-content.tsx`
- Settings content: `components/screens/parent-settings-content.tsx` (line 12: `type Tab = 'time' | 'lang' | 'audio'`)
- Settings tabs: `components/screens/parent-settings-time-tab.tsx`, `parent-settings-lang-tab.tsx`, `parent-settings-audio-tab.tsx`
- Auth PIN route: `app/api/auth/pin/route.ts` (Phase 01 delivers this)
- Schema: `prisma/schema.prisma` — `Parent.pinHash String?`, `Parent.name String?`

## Overview

- **Priority**: P0
- **Status**: pending
- **Description**: Two items grouped because both are parent-facing UI. (A) Add an empty state to `ParentDashboardContent` when the parent has no children or sessions — show guidance instead of blank metrics. (B) Add a 4th "Security" tab to `ParentSettingsContent` with PIN change, profile name edit, and reset progress (with confirmation modal).

## Key Insights

- Dashboard currently renders metrics grid even with null `report` — shows "—" values but no guidance
- `report` is null until API responds; for new parents with no children/sessions, API returns zeroed data
- Settings uses a `Tab` union type — adding `'security'` requires updating the type and TABS array
- PIN change requires old PIN verification first (use `POST /api/auth/pin` from Phase 01 for verification)
- PIN update endpoint: can add `PUT /api/auth/pin` to the existing `app/api/auth/pin/route.ts` file
- Reset progress requires a confirmation modal — pattern: `useState<boolean>` local toggle + fixed overlay

## Requirements

### Functional — Dashboard Empty State
- FR1: When `report` is null and child has no completed sessions, show an empty-state card
- FR2: Empty state shows BapMascot (encouraging mood), headline "No activity yet", and guidance text
- FR3: Include a "Start Playing" button that navigates to `/home`
- FR4: Hide metrics grid, weekly chart, and skills section when empty

### Functional — Security Tab
- FR5: Add 4th tab `'security'` with label "🔒 Bảo mật" to settings tab bar
- FR6: **PIN Change section**: three input fields (current PIN, new PIN, confirm new PIN), submit button
- FR7: If parent has no PIN set (`pinRequired: false` from session API), show "Set PIN" mode (skip current PIN field)
- FR8: PIN change calls `PUT /api/auth/pin` with `{ currentPin?, newPin }`
- FR9: **Profile Name section**: text input pre-filled with parent name, save button
- FR10: Profile name change calls `PATCH /api/auth/profile` with `{ name }`
- FR11: **Reset Progress section**: "Reset All Progress" danger button → opens confirmation modal
- FR12: Confirmation modal: "This will delete all sessions, stars, and stickers. This cannot be undone." with Cancel and "Reset" (red) buttons
- FR13: Reset calls `DELETE /api/children/{childId}/progress` (new endpoint)

### Non-Functional
- NFR1: PIN inputs use `type="password"` with `inputMode="numeric"` and `maxLength={4}`
- NFR2: All API errors show inline error text (not alert/toast)
- NFR3: Security tab accessible even without PIN gate unlocked (it IS the PIN management screen)

## Architecture

```
ParentDashboardContent
  → report === null && no sessions → render EmptyDashboardCard
  → report has data → render existing metrics (no change)

ParentSettingsContent
  → Tab type: 'time' | 'lang' | 'audio' | 'security'
  → TABS array: add { key: 'security', label: '🔒 Bảo mật' }
  → tab === 'security' → render ParentSettingsSecurityTab

ParentSettingsSecurityTab
  → PIN Change form (3 inputs + submit)
  → Profile Name form (1 input + submit)
  → Reset Progress button + ResetConfirmModal
```

## Related Code Files

### CREATE
- `components/screens/parent-settings-security-tab.tsx` — Security tab component
- `components/parent/reset-confirm-modal.tsx` — Confirmation modal for progress reset
- `app/api/auth/pin/route.ts` — add `PUT` handler for PIN change (same file as Phase 01)
- `app/api/auth/profile/route.ts` — new endpoint for parent name update
- `app/api/children/[id]/progress/route.ts` — new endpoint for progress reset

### MODIFY
- `components/screens/parent-settings-content.tsx` — add `'security'` to Tab type and TABS array, render new tab
- `components/screens/parent-dashboard-content.tsx` — add empty state rendering

## Implementation Steps

### Step 1: Add empty state to dashboard

In `components/screens/parent-dashboard-content.tsx`:

1. Detect empty state: after `report` loads, check if `report.lessonsCompleted === 0 && report.totalStars === 0`
2. Also handle case where `childId` is null or starts with `guest_` — show "Log in to track progress"
3. Render an empty-state card instead of metrics grid:

```tsx
const isEmpty = !report || (report.lessonsCompleted === 0 && report.totalStars === 0);

// Inside JSX, after profile card:
{isEmpty ? (
  <div style={{ background: '#fff', borderRadius: 20, padding: 24, textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
    <BapMascot size={64} color={profile?.color ?? 'sage'} mood="encouraging" />
    <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2A1F', marginTop: 12 }}>Chưa có hoạt động</div>
    <div style={{ fontSize: 14, color: '#6B7A6C', marginTop: 6 }}>Bé chưa chơi trò nào. Hãy bắt đầu khám phá!</div>
    <button onClick={() => router.push('/home')} style={{
      marginTop: 16, padding: '12px 24px', borderRadius: 999, background: '#2E5A3A', color: '#fff',
      fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
    }}>Bắt đầu chơi</button>
  </div>
) : (
  <>{/* existing metrics grid, weekly chart, skills */}</>
)}
```

### Step 2: Add security tab to settings

In `components/screens/parent-settings-content.tsx`:

1. Change `type Tab = 'time' | 'lang' | 'audio' | 'security'`
2. Add to TABS array: `{ key: 'security', label: '🔒 Bảo mật' }`
3. Import and render: `{tab === 'security' && <ParentSettingsSecurityTab childId={childId} />}`

### Step 3: Create `components/screens/parent-settings-security-tab.tsx`

Component receives `childId: string | null`. Three sections:

**PIN Change**: Form with `currentPin`, `newPin`, `confirmPin` state. On submit:
- Validate newPin === confirmPin, both are 4 digits
- Call `PUT /api/auth/pin` with `{ currentPin, newPin }`
- Show success/error inline

**Profile Name**: Input with `parentName` state, pre-filled via `GET /api/auth/session`. On submit:
- Call `PATCH /api/auth/profile` with `{ name }`
- Show success/error inline

**Reset Progress**: Red "Reset All Progress" button. On click → set `showResetModal = true`.

Keep file under 150 lines by extracting the modal.

### Step 4: Create `components/parent/reset-confirm-modal.tsx`

Props: `onConfirm: () => void`, `onCancel: () => void`.

Fixed fullscreen overlay (z-50, bg-black/40), centered card:
- Warning icon or emoji
- "Reset all progress?" heading
- "This will delete all sessions, stars, and stickers. This cannot be undone."
- Two buttons: "Cancel" (neutral) and "Reset" (red background)

### Step 5: Create `PUT` handler in `app/api/auth/pin/route.ts`

Add to the same file (Phase 01 creates the POST handler):

```typescript
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const parentId = cookieStore.get('parentId')?.value;
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPin, newPin } = await request.json();
  if (!newPin || !/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: 'New PIN must be 4 digits' }, { status: 400 });
  }

  const parent = await prisma.parent.findUnique({ where: { id: parentId }, select: { pinHash: true } });
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If PIN already set, require current PIN verification
  if (parent.pinHash) {
    if (!currentPin) return NextResponse.json({ error: 'Current PIN required' }, { status: 400 });
    const valid = await bcrypt.compare(currentPin, parent.pinHash);
    if (!valid) return NextResponse.json({ error: 'Wrong current PIN' }, { status: 403 });
  }

  const newHash = await bcrypt.hash(newPin, 10);
  await prisma.parent.update({ where: { id: parentId }, data: { pinHash: newHash } });
  return NextResponse.json({ success: true });
}
```

### Step 6: Create `app/api/auth/profile/route.ts`

Single `PATCH` handler: reads `parentId` cookie, validates `{ name }` body, updates `prisma.parent.update({ data: { name } })`.

### Step 7: Create `app/api/children/[id]/progress/route.ts`

Single `DELETE` handler: reads `parentId` cookie, verifies child belongs to parent, then:
```typescript
await prisma.$transaction([
  prisma.gameSession.deleteMany({ where: { childId: id } }),
  prisma.childSticker.deleteMany({ where: { childId: id } }),
  prisma.streak.deleteMany({ where: { childId: id } }),
  prisma.difficultyProfile.deleteMany({ where: { childId: id } }),
]);
```

## Todo List

- [ ] Add empty state card to `parent-dashboard-content.tsx`
- [ ] Add `'security'` tab to `parent-settings-content.tsx`
- [ ] Create `parent-settings-security-tab.tsx` with PIN change + name edit + reset button
- [ ] Create `reset-confirm-modal.tsx` with confirmation dialog
- [ ] Add `PUT` handler to `app/api/auth/pin/route.ts` for PIN change
- [ ] Create `app/api/auth/profile/route.ts` for name update
- [ ] Create `app/api/children/[id]/progress/route.ts` for progress reset
- [ ] Add `/api/auth/profile` and `/api/auth/pin` PUT to middleware PUBLIC_API_PATHS or ensure parentId cookie suffices
- [ ] Test: empty dashboard shows guidance card
- [ ] Test: PIN change works (old PIN required when PIN exists)
- [ ] Test: PIN set works (no old PIN required when pinHash is null)
- [ ] Test: profile name update persists
- [ ] Test: reset progress deletes sessions, stickers, streaks, difficulty profiles
- [ ] Test: reset confirmation modal blocks accidental resets

## Success Criteria

1. New parent with no child sessions sees guidance card (not blank metrics)
2. Security tab visible as 4th tab in settings
3. PIN change requires old PIN, validates 4-digit format, persists via bcrypt
4. Profile name editable and persists to DB
5. Reset progress deletes all child data with confirmation gate
6. All API endpoints return proper error responses (401, 400, 403)

## Risk Assessment

- **PIN change without old PIN**: If parent forgets PIN, they are locked out of change. Acceptable — email-based reset is Phase 3.
- **Progress reset cascade**: Transaction ensures atomicity. FK constraints handled by explicit delete order.
- **Empty state false positive**: New user has report API returning zeroed data, not null. Check `lessonsCompleted === 0` specifically.

## Security Considerations

- PIN change requires current PIN verification (prevents unauthorized changes)
- Progress reset requires parentId cookie (IDOR check: child.parentId === cookieParentId)
- `DELETE` endpoint must verify child belongs to authenticated parent before wiping data
- PIN inputs masked (`type="password"`) — no screen-shoulder risk

## Next Steps

- Phase 2E: Parent onboarding first-run flow (guided tour of dashboard features)
- Phase 3: Email-based PIN recovery flow
