# Scout Report — Phase 3 Codebase Analysis

## Phase 3A: Navigation & Onboarding

**`app/(child)/layout.tsx`** — onboarding state machine:
- 4-step state: `splash → welcome → setup → ready`
- Hydrates from localStorage `bap-progress-cache` on mount
- Guest IDs: `guest_<uuid>` created when DB registration fails
- TODO comment marks "Save your progress" guest→registered upgrade point
- `setStep('ready')` renders `{children}` — correct pattern (no router.push)
- Gap: no partial-state persistence mid-wizard; no isHydrated flag exposed to pages

**`context/game-progress-context.tsx`** — client state:
- Persists `childId`, `profile`, `settings`, `currentWorldId` to localStorage
- Gap: pages use `if (!profile) return null` → blank screen risk

**Blank screen fixes needed:**
- `home/page.tsx`, `worlds/page.tsx` — no loading skeleton, no redirect on null profile
- Pattern: `if (!isHydrated) return <Skeleton />; if (!childId) { router.replace('/'); return null; }`

---

## Phase 3B: Lesson Data & AI Integration

**Static lesson config:**
- `src/data/game-config/worlds.ts` — 7 worlds (Number Garden → Writing Workshop)
- `lesson-templates.ts` — 63 lessons, 9 per world
- `game-types.ts` — 7 game types with number ranges per difficulty

**AI question pipeline** (`/api/ai/generate-questions/route.ts`):
- Tries external 9router API → fallback to local `generateLocalQuestions()`
- Caches in `AIQuestion` table (lessonId, gameType, difficulty, payload JSON)
- Gap: no content quality audit, no A/B testing

**GameRegistry** (`lib/game-engine/registry.ts`):
- Config-driven registration of all 7 game engines

**`Lesson` table (Prisma):** worldId, gameType, order, title, difficulty — static seed data

---

## Phase 3C: Multi-Child & Reporting

**Multi-child schema ready:** `Parent.children[]` 1:N via parentId FK  
**Current gap:** No profile switcher UI; child sessions use single `state.childId`

**ChildSettings fields already in schema:**
- `dailyMin`, `difficulty`, `kidLang`, `parentLang`, `sfx`, `music`, `voice`, `voiceStyle`, `quietHours`

**Reporting endpoints:**
- `/api/progress/[childId]` — weekDays bool[7], worldProgress  
- `/api/report/[childId]` — detailed (partially implemented)
- `Streak` table: currentStreak, longestStreak, lastPlayDate

**Missing for Phase 3C:**
- Multi-child switcher modal in child layout
- `emailReports` field on Parent model
- `/api/cron/weekly-report` route
- Email provider integration (Resend recommended)

---

## Key Files by Phase

| Phase | Key Files |
|-------|-----------|
| 3A | `app/(child)/layout.tsx`, `context/game-progress-context.tsx`, `app/(child)/home/page.tsx` |
| 3B | `src/data/game-config/lesson-templates.ts`, `lib/game-engine/registry.ts`, `app/api/ai/generate-questions/route.ts` |
| 3C | `app/api/children/`, `prisma/schema.prisma`, `components/parent/parent-gate.tsx` |
