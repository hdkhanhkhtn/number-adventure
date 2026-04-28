# SCOUT — PR #33: fix(phase-3a) Settings Persistence, Migration Transaction, Play Guard

**Date**: 2026-04-28 | **Branch**: feature/fix-phase-3a-settings-migration → main
**Consensus**: ✅ reviewer ✓ | scouter ✓ | tech-lead ✓

---

## Changed Files (23 total)

### Primary Code Files (review focus)

| File | Change | Risk |
|------|--------|------|
| `prisma/schema.prisma` | +10 ChildSettings columns | LOW — additive, defaults match localStorage |
| `prisma/migrations/20260427191924_add_child_settings_app_prefs/migration.sql` | New migration | LOW — non-breaking ALTER TABLE |
| `app/api/children/[id]/settings/route.ts` | allowed[] 9→19 fields | MEDIUM |
| `app/api/children/migrate/route.ts` | $transaction + guest data copy | HIGH |
| `lib/hooks/use-settings.ts` | DB fetch on mount + debounced PATCH | HIGH — churn: 3 commits |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | Guard inside useEffect, `''` sentinel | HIGH — critical path |
| `__tests__/api/children-migrate.test.ts` | mockTx + $transaction wiring | LOW |

### Docs/Plans (13 files — lower priority, excluded from code review)

---

## Architecture Layers Touched

```
DB (schema + migration)
  └─ API (settings route, migrate route)
       └─ Hook (use-settings — new GameProgress dependency + dual-write)
            └─ UI/Child (play page — auth guard + childId sentinel)

Types layer: NOT updated (GAP)
Layout caller: NOT updated (GAP — data loss)
```

---

## Call Chain

```
useSettings() [lib/hooks/use-settings.ts]
  ← imports useGameProgress() [context/game-progress-context.tsx]
  ← consumed by: parent-settings-content, parent-settings-gameplay-tab,
                 parent-settings-time-tab, parent-settings-audio-tab
  → on mount: GET /api/children/${childId}/settings
  → on update (debounced): PATCH /api/children/${childId}/settings

PATCH /api/children/[id]/settings/route.ts
  ← also called directly by: parent-settings-content.tsx (its own fetch)
  ← race condition: two callers to same endpoint

POST /api/children/migrate/route.ts
  ← called by: app/(child)/layout.tsx (handleMigrate)
  → prisma.$transaction: Child.create + GameSession.updateMany
    + ChildSticker.updateMany + Streak.findUnique/upsert/delete

app/(child)/play/[gameType]/[lessonId]/page.tsx
  → useGameSession(childId='', lessonId)
    → use-game-session.ts line 38: guards `guest_` prefix only
```

---

## Confirmed Gaps (6) — Priority for Phase 2 Review

| # | File | Gap | Sev | Evidence |
|---|------|-----|-----|----------|
| G1 | `lib/types/common.ts:48–58` | `ChildSettings` interface missing 10 new fields | HIGH | Only 9 fields; 5 consumers use this as type contract |
| G2 | `lib/types/api.ts:32–42` | `UpdateChildSettingsRequest` missing 10 new fields | HIGH | Dead type but now stale; future consumers get wrong contract |
| G3 | `app/(child)/layout.tsx:134–139` | migrate POST body omits `guestId` → guest data silently dropped | HIGH | **Data loss bug** — $transaction copy never runs |
| G4 | `lib/hooks/use-game-session.ts:38` | Empty string `''` not guarded — only `guest_` prefix checked | HIGH | `childId=''` passes guard, reaches POST /api/sessions with empty FK |
| G5 | `components/screens/parent-settings-content.tsx:28–31` | `DEFAULTS` typed as `ChildSettings` — will break when G1 fixed | HIGH | Cascade compile error |
| G6 | `lib/hooks/use-settings.ts:26` | localStorage bedtime default `20:00` ≠ DB default `21:00` | MEDIUM | First-load flicker for new users |

---

## Phase 2 Review Focus Areas (priority order)

1. **migrate route** — $transaction correctness, guestId data-loss bug (G3)
2. **play page guard** — empty string sentinel + useEffect ordering (G4)
3. **use-settings hook** — dual-write race, DB merge logic, circular dependency on GameProgress context
4. **settings API route** — allowed list correctness, auth, IDOR
5. **type gaps** — G1, G2, G5 consistency
6. **schema/migration** — SQL correctness, rollback safety
