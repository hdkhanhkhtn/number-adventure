# Phase C: Parent Area -- Gate + Dashboard + Settings + Report + API

## Context Links

- Prototype ParentGate: `src/screens-intro.jsx` lines 190-249
- Prototype ParentDashboard: `src/screens-reward-parent.jsx` lines 107-193
- Prototype ParentSettings: `src/screens-reward-parent.jsx` lines 235-327
- Prototype ParentReport: `src/screens-reward-parent.jsx` lines 388-452
- Helper components: MetricCard (L194-202), SkillRow (L203-215), MenuRow (L216-232), Panel (L328-338), Toggle (Phase A), LangOpt (L351-374), SettingRow (L375-385)
- Architecture spec: `docs/prompts/28_define_docs_planning_architecture.md` -- Decision #6 (ParentReport IN SCOPE)

## Overview

- **Priority:** P1 -- secondary to child experience, required for MVP
- **Status:** ✅ Complete
- **Description:** Port parent-facing area: parent gate (math challenge overlay), dashboard with real metrics from DB, settings (time/language/audio tabs persisted to DB), and ParentReport (simple report: lessons completed, stars earned, skills practiced, recent activity, recommended next step). All parent data flows through API endpoints backed by PostgreSQL.

## Key Insights

- Parent area uses different visual style: white bg, subtle shadows, no game-like borders -- "iOS Settings" feel
- All parent screen text is in Vietnamese (Tieng Viet)
- ParentGate is a modal overlay, NOT a route -- covers the current screen
- ParentDashboard/Settings/Report are full routes under `app/(parent)/`
- **ParentReport is IN SCOPE for MVP** (Decision #6) -- simple, not heavy analytics
- All metrics come from DB aggregation (GameSession, GameAttempt, Streak tables)
- Settings changes write to DB via `PATCH /api/children/:childId/settings`
- StreakCard (from Phase A) reused in Dashboard -- no StreakScreen route
- Toggle component already created in Phase A

## Requirements

### Functional
- ParentGate: math challenge modal (e.g., "3 + 5 = ?"), blocks access until correct answer
- ParentDashboard: child profile card, 4 metric cards (from DB), weekly activity chart (from DB), skills breakdown, action menu
- ParentSettings: 3 tabs (time limits, language, audio) with controls -- persist to ChildSettings table
- ParentReport (simple): lessons completed count, total stars earned, skills practiced list, recent 7-day activity, recommended next step based on weakest skill
- API endpoints for parent data: login, child settings CRUD, report aggregation

### Non-functional
- Parent screens use `font-parent` (Be Vietnam Pro)
- Background: `#F5F3ED` (warm gray) instead of garden/game backgrounds
- Clean, professional feel -- no game-like 3D shadows or thick borders
- Each file under 200 lines
- Report queries execute < 1s

## Architecture

### Route Structure
```
app/(parent)/
  layout.tsx                                -- Parent layout (font-parent, parent bg)
  dashboard/
    page.tsx                                -- ParentDashboard
  settings/
    page.tsx                                -- ParentSettings
  report/
    page.tsx                                -- ParentReport
```

### API Endpoints (implement in this phase)
```
app/api/
  auth/
    login/route.ts                          -- POST: parent login
    register/route.ts                       -- POST: parent registration (may already be scaffolded by Phase B onboarding)
  children/
    route.ts                                -- GET: list children for parent
    [childId]/
      settings/route.ts                     -- GET/PATCH: child settings
  report/
    [childId]/route.ts                      -- GET: parent report data
```

### Components
```
components/
  parent/
    parent-gate.tsx                         -- Modal overlay (math challenge)
    metric-card.tsx                         -- Dashboard metric card
    skill-row.tsx                           -- Skill progress row
    menu-row.tsx                            -- Action menu row (icon + label + chevron)
    panel.tsx                               -- Settings panel container
    lang-option.tsx                         -- Language radio option
    setting-row.tsx                         -- Setting row (label + control)
    weekly-chart.tsx                        -- Bar chart (reused in dashboard + report)

  screens/
    parent-dashboard-content.tsx            -- Dashboard screen content
    parent-settings-content.tsx             -- Settings screen content (3 tabs)
    parent-report-content.tsx               -- Report screen content
```

## Related Code Files

### Files to Create

| File | Source | Lines Est. |
|------|--------|-----------|
| `app/(parent)/layout.tsx` | new | 30 |
| `app/(parent)/dashboard/page.tsx` | new | 20 |
| `app/(parent)/settings/page.tsx` | new | 20 |
| `app/(parent)/report/page.tsx` | new | 20 |
| `app/api/auth/login/route.ts` | new | 60 |
| `app/api/auth/register/route.ts` | new (or update scaffold) | 60 |
| `app/api/children/route.ts` | new (or update scaffold) | 40 |
| `app/api/children/[childId]/settings/route.ts` | new | 50 |
| `app/api/report/[childId]/route.ts` | new | 80 |
| `components/parent/parent-gate.tsx` | `src/screens-intro.jsx` L190-249 | 80 |
| `components/parent/metric-card.tsx` | `src/screens-reward-parent.jsx` L194-202 | 30 |
| `components/parent/skill-row.tsx` | `src/screens-reward-parent.jsx` L203-215 | 35 |
| `components/parent/menu-row.tsx` | `src/screens-reward-parent.jsx` L216-232 | 35 |
| `components/parent/panel.tsx` | `src/screens-reward-parent.jsx` L328-338 | 25 |
| `components/parent/lang-option.tsx` | `src/screens-reward-parent.jsx` L351-374 | 40 |
| `components/parent/setting-row.tsx` | `src/screens-reward-parent.jsx` L375-385 | 25 |
| `components/parent/weekly-chart.tsx` | extracted from dashboard + report | 45 |
| `components/screens/parent-dashboard-content.tsx` | `src/screens-reward-parent.jsx` L107-193 | 130 |
| `components/screens/parent-settings-content.tsx` | `src/screens-reward-parent.jsx` L235-327 | 150 |
| `components/screens/parent-report-content.tsx` | `src/screens-reward-parent.jsx` L388-452 | 100 |

## Implementation Steps

### Step 1: Parent Layout

Create `app/(parent)/layout.tsx`:
```typescript
'use client';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F3ED] font-parent text-[#1F2A1F]">
      {children}
    </div>
  );
}
```

### Step 2: API -- Auth Endpoints

1. **POST /api/auth/login** (`app/api/auth/login/route.ts`):
   - Body: `{ email, password }`
   - Validate credentials against Parent table (bcrypt compare)
   - Return `{ parentId, name, email }` (MVP: simple session via cookie or returned ID)
   - For MVP: no JWT -- store parentId in httpOnly cookie or localStorage
   ```typescript
   import { prisma } from '@/lib/prisma';
   import bcrypt from 'bcryptjs';
   import { NextRequest, NextResponse } from 'next/server';

   export async function POST(req: NextRequest) {
     const { email, password } = await req.json();
     const parent = await prisma.parent.findUnique({ where: { email } });
     if (!parent || !(await bcrypt.compare(password, parent.password))) {
       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
     }
     return NextResponse.json({ parentId: parent.id, name: parent.name, email: parent.email });
   }
   ```

2. **POST /api/auth/register** (`app/api/auth/register/route.ts`):
   - Body: `{ email, password, name }`
   - Hash password with bcrypt, create Parent record
   - Return `{ parentId }`
   - Install: `npm install bcryptjs && npm install -D @types/bcryptjs`

### Step 3: API -- Children + Settings

1. **GET /api/children** (`app/api/children/route.ts`):
   - Query param: `parentId`
   - Returns all children for parent with their settings
   ```typescript
   export async function GET(req: NextRequest) {
     const parentId = req.nextUrl.searchParams.get('parentId');
     if (!parentId) return NextResponse.json({ error: 'parentId required' }, { status: 400 });
     const children = await prisma.child.findMany({
       where: { parentId },
       include: { settings: true, streak: true },
     });
     return NextResponse.json({ children });
   }
   ```

2. **GET/PATCH /api/children/[childId]/settings** (`app/api/children/[childId]/settings/route.ts`):
   - GET: Return ChildSettings for child
   - PATCH: Update ChildSettings fields
   ```typescript
   export async function PATCH(req: NextRequest, { params }: { params: { childId: string } }) {
     const body = await req.json();
     const settings = await prisma.childSettings.upsert({
       where: { childId: params.childId },
       update: body,
       create: { childId: params.childId, ...body },
     });
     return NextResponse.json({ settings });
   }
   ```

### Step 4: API -- Parent Report

**GET /api/report/[childId]** (`app/api/report/[childId]/route.ts`):

Aggregates data from GameSession, GameAttempt, Streak tables:

```typescript
export async function GET(req: NextRequest, { params }: { params: { childId: string } }) {
  const { childId } = params;

  // Lessons completed (unique completed sessions)
  const completedSessions = await prisma.gameSession.count({
    where: { childId, status: 'completed' },
  });

  // Total stars
  const starResult = await prisma.gameSession.aggregate({
    where: { childId, status: 'completed' },
    _sum: { stars: true },
  });

  // Recent 7-day activity (sessions per day)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSessions = await prisma.gameSession.findMany({
    where: { childId, status: 'completed', completedAt: { gte: sevenDaysAgo } },
    select: { completedAt: true, stars: true },
  });

  // Skills practiced (group by gameType via lesson)
  const skillsRaw = await prisma.gameSession.findMany({
    where: { childId, status: 'completed' },
    include: { lesson: { select: { gameType: true } } },
  });
  // ... aggregate per gameType

  // Per-game accuracy
  const attempts = await prisma.gameAttempt.findMany({
    where: { session: { childId } },
    select: { correct: true, session: { select: { lesson: { select: { gameType: true } } } } },
  });
  // ... calculate accuracy per gameType

  // Streak
  const streak = await prisma.streak.findUnique({ where: { childId } });

  // Recommended next step: game type with lowest accuracy
  // ... determine weakest skill

  return NextResponse.json({
    lessonsCompleted: completedSessions,
    totalStars: starResult._sum.stars ?? 0,
    recentActivity: /* 7-day array */,
    skills: /* per gameType stats */,
    accuracy: /* per gameType accuracy */,
    streak: streak ?? { currentStreak: 0, longestStreak: 0 },
    recommendedNext: /* weakest gameType */,
  });
}
```

### Step 5: Parent Gate Modal

Port `ParentGate` from `src/screens-intro.jsx` L190-249 to `components/parent/parent-gate.tsx`.

Key behavior:
- Generates random math problem: `a` (3-6) + `b` (2-4) = ?
- Shows 4 answer options (one correct, 3 random)
- Correct answer -> `onPass()` callback -> navigate to `/dashboard`
- Wrong answer -> shake animation, reset after 600ms
- Cancel button -> `onCancel()` callback
- Renders as fixed overlay with backdrop blur

Props:
```typescript
interface ParentGateProps {
  onPass: () => void;
  onCancel: () => void;
}
```

Integration: ParentGate triggered from HomeScreen's parent icon button. On pass, `router.push('/dashboard')`.

### Step 6: Parent Helper Components

Port each helper from `src/screens-reward-parent.jsx`:

1. **MetricCard** (L194-202): `{ label, value, sub, accent }` -- white card with colored accent
2. **SkillRow** (L203-215): `{ label, value, color, badge }` -- label + badge + progress bar
3. **MenuRow** (L216-232): `{ icon, label, sub, onClick, last? }` -- icon + text + chevron
4. **Panel** (L328-338): `{ title, sub?, children }` -- white rounded container
5. **LangOption** (L351-374): `{ active, label, sub?, onClick }` -- radio-style selector
6. **SettingRow** (L375-385): `{ label, right, last? }` -- label + right-side control
7. **WeeklyChart** (extracted/shared): `{ data, labels, goal?, height? }` -- bar chart, color-coded

### Step 7: Parent Dashboard

Port `ParentDashboard` from `src/screens-reward-parent.jsx` L107-193 to `components/screens/parent-dashboard-content.tsx`.

**Data flow:** On mount, fetch from multiple API endpoints:
```typescript
const [data, setData] = useState(null);
useEffect(() => {
  Promise.all([
    fetch(`/api/report/${childId}`).then(r => r.json()),
    fetch(`/api/streaks/${childId}`).then(r => r.json()),
    fetch(`/api/children?parentId=${parentId}`).then(r => r.json()),
  ]).then(([report, streak, children]) => {
    setData({ report, streak, child: children.children[0] });
  });
}, [childId, parentId]);
```

Structure:
- Header: close button (-> `/home`), "CHA ME / Bang dieu khien", avatar
- Child profile card: BapMini, name, age, status badge
- 4 MetricCards: play time (from sessions), streak (from DB), accuracy (from attempts), stars (from sessions)
- Weekly activity bar chart (WeeklyChart) -- data from report API
- Skills breakdown: SkillRows -- data from report API per gameType
- StreakCard component (from Phase A)
- Action menu: report, time limit, language, settings (MenuRow)

### Step 8: Parent Settings

Port `ParentSettings` from `src/screens-reward-parent.jsx` L235-327 to `components/screens/parent-settings-content.tsx`.

**Data flow:** On mount, fetch `GET /api/children/:childId/settings`. On change, call `PATCH /api/children/:childId/settings` and update local state.

Split into sub-components if exceeding 200 lines:
- `parent-settings-time-tab.tsx` -- time limits + quiet hours + difficulty
- `parent-settings-lang-tab.tsx` -- kid language + parent language
- `parent-settings-audio-tab.tsx` -- sfx, music, voice toggles + voice style

Structure:
- Header: back button (-> `/dashboard`), "Cai dat"
- 3 tab buttons: "Thoi gian", "Ngon ngu", "Am thanh"
- Tab content based on active tab
- All setting changes persist to DB via API

### Step 9: Parent Report

Port `ParentReport` from `src/screens-reward-parent.jsx` L388-452 to `components/screens/parent-report-content.tsx`.

**Data flow:** Fetch `GET /api/report/:childId` on mount.

Structure:
- Header: back button (-> `/dashboard`), "Bao cao cua {name}"
- Weekly summary card (green gradient): "{name} da hoan thanh X bai hoc tuan nay!"
- Lessons completed count + total stars earned
- 7-day play time chart (WeeklyChart)
- Per-game breakdown: 5 rows with game name, play count, accuracy %
- Skills practiced: list of gameTypes with session counts
- Recommended next step: "Con nen luyen tap them: {weakest skill}"
- Tips section: yellow card with bullet points

### Step 10: Wire ParentGate into Child Layout

In `app/(child)/layout.tsx`:
- Add state: `const [showParentGate, setShowParentGate] = useState(false)`
- Pass `onParent={() => setShowParentGate(true)}` to HomeScreen via context or prop
- Render `{showParentGate && <ParentGate onPass={...} onCancel={...} />}`
- On pass: `router.push('/dashboard'); setShowParentGate(false)`

### Step 11: Verify Build + Flow

```bash
npm run build
npm run dev
```
Navigate: Home -> Parent icon -> Parent Gate -> solve -> Dashboard (real data from DB) -> Settings (persist to DB) -> Report (aggregated from DB) -> back

## Todo List

- [x] Create `app/(parent)/layout.tsx`
- [x] Create `app/(parent)/dashboard/page.tsx`
- [x] Create `app/(parent)/settings/page.tsx`
- [x] Create `app/(parent)/report/page.tsx`
- [x] Implement `POST /api/auth/login`
- [x] Implement `POST /api/auth/register`
- [x] Implement `GET /api/children`
- [x] Implement `GET/PATCH /api/children/[childId]/settings`
- [x] Implement `GET /api/report/[childId]` (aggregation queries)
- [x] Port ParentGate to `components/parent/parent-gate.tsx`
- [x] Port MetricCard to `components/parent/metric-card.tsx`
- [x] Port SkillRow to `components/parent/skill-row.tsx`
- [x] Port MenuRow to `components/parent/menu-row.tsx`
- [x] Port Panel to `components/parent/panel.tsx`
- [x] Port LangOption to `components/parent/lang-option.tsx`
- [x] Port SettingRow to `components/parent/setting-row.tsx`
- [x] Create WeeklyChart at `components/parent/weekly-chart.tsx`
- [x] Port ParentDashboard to `components/screens/parent-dashboard-content.tsx`
- [x] Port ParentSettings to `components/screens/parent-settings-content.tsx` (split if > 200 lines)
- [x] Port ParentReport to `components/screens/parent-report-content.tsx`
- [x] Wire ParentGate into child layout
- [x] Install bcryptjs for password hashing
- [x] Build compiles with zero errors
- [x] Manual test: gate -> dashboard (DB data) -> settings (persist) -> report (aggregated)

## Acceptance Criteria

1. `npm run build` passes with zero errors
2. ParentGate modal appears on tapping parent icon from HomeScreen
3. Correct math answer opens parent dashboard; wrong answer shakes + resets
4. `POST /api/auth/login` validates credentials against DB
5. `POST /api/auth/register` creates Parent record with hashed password
6. ParentDashboard displays child profile, 4 metrics from DB, weekly chart from DB, skills from DB
7. ParentSettings has 3 working tabs; changes persist to ChildSettings table via `PATCH /api/children/:childId/settings`
8. ParentReport shows: lessons completed, stars earned, skills practiced, 7-day activity, per-game accuracy, recommended next step -- all from DB aggregation
9. All navigation: dashboard <-> settings, dashboard <-> report, dashboard -> child home
10. Parent screens use `font-parent` and `#F5F3ED` background
11. StreakCard displayed in dashboard (component, not screen)
12. Every file under 200 lines

## Dependencies

- Phase A must be complete (UI components: IconBtn, NumTile, BapMini, Toggle, ProgressBar, StreakCard)
- Phase A Prisma schema (Parent, Child, ChildSettings, GameSession, GameAttempt, Streak tables)
- Does NOT depend on Phase B (can run in parallel with B)
- Report API accuracy data improves after Phase B populates GameSession/GameAttempt records

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ParentSettings content exceeds 200 lines | High | Low | Split into 3 tab components |
| Report aggregation queries slow on large datasets | Low (MVP scale small) | Medium | Add DB indexes on childId + status + completedAt |
| Parent gate navigation: back button returns to parent not child | Medium | Medium | Use `router.push('/home')` on exit, not `router.back()` |
| Auth without JWT is insecure | Medium | Medium | MVP scope: simple session. JWT added in Phase 2 |
| Empty dashboard when no game sessions exist yet | High (first use) | Low | Show empty state with "Start playing!" message |

## Security Considerations

- ParentGate is a simple math challenge -- deters children, not secure auth
- Passwords hashed with bcrypt (cost factor 10+)
- API routes validate required fields in request body
- No sensitive data beyond email/password (hashed) in DB
- Settings changes require knowing childId (future: JWT validates parentId owns childId)
- SQL injection prevented by Prisma parameterized queries

## Next Steps

- Phase D: audio settings integration (sfx/music/voice toggles wired to AudioContext from DB settings)
- Phase 2: JWT-based authentication, multi-child support, advanced analytics
