# Phase B: Child Screens + Game Engine + 5 Games + API Integration

## Context Links

- Prototype intro screens: `src/screens-intro.jsx` (251 lines -- Splash, Welcome, ProfileSetup, ParentGate)
- Prototype home screens: `src/screens-home.jsx` (352 lines -- Home, WorldMap, LevelList, StickerBook, QuickTile, WorldCard, LevelNode)
- Prototype games: `src/games.jsx` (463 lines -- GameHud, HearTap, BuildNumber, EvenOdd, NumberOrder, AddTake + helpers)
- Prototype rewards: `src/screens-reward-parent.jsx` lines 1-102 (RewardScreen, Stat)
- Prototype app router: `src/app.jsx` (204 lines -- route mapping, STICKERS data, finishGame logic)
- Static config: `src/data/game-config/worlds.ts` (from Phase A)
- Architecture spec: `docs/prompts/28_define_docs_planning_architecture.md`

## Overview

- **Priority:** P0 -- core user experience
- **Status:** ✅ Complete
- **Description:** Port all child-facing screens, build the game engine, port all 5 mini-games, implement API endpoints for sessions/attempts/AI question generation, and port the reward screen. Routes use `/worlds/[worldId]` and `/play/[gameType]/[lessonId]` pattern. Math Kitchen is a World; AddTake is a game type within it.

## Key Insights

- Prototype uses flat `route` string state -- Next.js uses file-based routing
- **New routes:** `/worlds/[worldId]` for world drill-in, `/play/[gameType]/[lessonId]` for gameplay
- **Math Kitchen = World** (the themed environment), **AddTake = game type** (the mechanic inside it)
- Each game has identical state pattern: `round`, `hearts`, question generation -- extract to `useGame` hook
- AI generates 5-10 questions per lesson start via `POST /api/ai/generate-questions`, stored in `AIQuestion` table, served during gameplay
- Game sessions tracked in DB: `POST /api/sessions` on start, `POST /api/sessions/:id/attempts` per answer, `PATCH /api/sessions/:id` on complete
- **StreakCard** component (not StreakScreen route) -- reused in HomeScreen and RewardScreen
- `finishGame()` logic: calculate stars from hearts, random sticker on 3-star, navigate to reward

## Requirements

### Functional
- Splash screen with 2.2s auto-advance
- Welcome screen with language toggle (EN/VI/BI)
- Profile setup 3-step wizard (name, age, mascot color)
- Home screen with daily mission card, quick tiles (map, stickers), StreakCard, weekly progress
- World map with 5 worlds (unlocked based on DB progress)
- Level list with winding path layout, 9 levels per world
- Sticker book grid (4 columns, collected vs locked -- from DB)
- Game engine: AI question loading, answer validation, hearts/progress tracking
- 5 mini-games: HearTap, BuildNumber, EvenOdd, NumberOrder, AddTake
- Reward screen with confetti, stars, sticker earned
- API: session lifecycle, attempt tracking, AI question generation
- Onboarding flow: first visit creates Parent + Child in DB via `POST /api/auth/register` + `POST /api/children`

### Non-functional
- All game logic extracted to `lib/game-engine/` (testable without UI)
- Touch targets minimum 48x48px
- Smooth transitions between game rounds
- Each file under 200 lines
- API responses < 500ms (AI generation excluded)

## Architecture

### Route Structure
```
app/
  (child)/
    layout.tsx                          -- Child layout (no header, full-screen)
    home/
      page.tsx                          -- HomeScreen
    worlds/
      page.tsx                          -- WorldMap (all worlds)
      [worldId]/
        page.tsx                        -- LevelList for specific world
    play/
      [gameType]/
        [lessonId]/
          page.tsx                      -- Game renderer (dynamic)
    stickers/
      page.tsx                          -- StickerBook
    reward/
      page.tsx                          -- RewardScreen
```

### Game Engine
```
lib/
  game-engine/
    types.ts                            -- GameConfig, Question, GameState types
    hear-tap-engine.ts                  -- Generate HearTap questions (fallback)
    build-number-engine.ts              -- Generate BuildNumber questions (fallback)
    even-odd-engine.ts                  -- Generate EvenOdd questions (fallback)
    number-order-engine.ts              -- Generate NumberOrder questions (fallback)
    add-take-engine.ts                  -- Generate AddTake questions (fallback)
    score-calculator.ts                 -- Stars calculation from hearts
    question-loader.ts                  -- Load questions from API or fallback to local engine

  hooks/
    use-game.ts                         -- Generic game state hook
    use-game-session.ts                 -- API session lifecycle hook
```

### API Endpoints (implement in this phase)
```
app/api/
  sessions/
    route.ts                            -- POST: create GameSession
    [id]/
      route.ts                          -- PATCH: complete GameSession
      attempts/route.ts                 -- POST: submit GameAttempt
  ai/
    generate-questions/route.ts         -- POST: generate via AI, store in DB
  lessons/
    [lessonId]/route.ts                 -- GET: lesson details + questions
  stickers/
    [childId]/route.ts                  -- GET: child's collected stickers
  streaks/
    [childId]/route.ts                  -- GET/POST: streak data
  progress/
    [childId]/route.ts                  -- GET: overall progress (worlds, stars)
```

### Components
```
components/
  game/
    game-hud.tsx                        -- Close button + hearts + progress bar
    game-container.tsx                  -- Wrapper: GardenBg + z-index layering
    slot-column.tsx                     -- BuildNumber tens/ones column
    basket.tsx                          -- EvenOdd basket button
    ten-stick.tsx                       -- Visual stick for BuildNumber
    one-dot.tsx                         -- Visual dot for BuildNumber

  screens/
    splash-screen.tsx                   -- From screens-intro.jsx
    welcome-screen.tsx                  -- From screens-intro.jsx
    profile-setup.tsx                   -- From screens-intro.jsx
    home-screen.tsx                     -- From screens-home.jsx
    quick-tile.tsx                      -- From screens-home.jsx
    world-card.tsx                      -- From screens-home.jsx
    level-node.tsx                      -- From screens-home.jsx
    reward-content.tsx                  -- From screens-reward-parent.jsx
    stat-display.tsx                    -- From screens-reward-parent.jsx
```

## Related Code Files

### Files to Create

| File | Source | Lines Est. |
|------|--------|-----------|
| `app/(child)/layout.tsx` | new | 30 |
| `app/(child)/home/page.tsx` | new | 30 |
| `app/(child)/worlds/page.tsx` | new | 25 |
| `app/(child)/worlds/[worldId]/page.tsx` | new | 40 |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | new | 80 |
| `app/(child)/stickers/page.tsx` | new | 20 |
| `app/(child)/reward/page.tsx` | new | 30 |
| `lib/game-engine/types.ts` | new | 60 |
| `lib/game-engine/hear-tap-engine.ts` | `src/games.jsx` L33-37 | 35 |
| `lib/game-engine/build-number-engine.ts` | `src/games.jsx` L117 | 25 |
| `lib/game-engine/even-odd-engine.ts` | `src/games.jsx` L223 | 20 |
| `lib/game-engine/number-order-engine.ts` | `src/games.jsx` L311-319 | 35 |
| `lib/game-engine/add-take-engine.ts` | `src/games.jsx` L386-394 | 35 |
| `lib/game-engine/score-calculator.ts` | scoring pattern | 20 |
| `lib/game-engine/question-loader.ts` | new | 50 |
| `lib/hooks/use-game.ts` | extracted from all 5 games | 80 |
| `lib/hooks/use-game-session.ts` | new | 60 |
| `components/game/game-hud.tsx` | `src/games.jsx` L4-20 | 40 |
| `components/game/game-container.tsx` | new | 30 |
| `components/game/slot-column.tsx` | `src/games.jsx` L188-212 | 55 |
| `components/game/basket.tsx` | `src/games.jsx` L276-299 | 45 |
| `components/game/ten-stick.tsx` | `src/games.jsx` L182-184 | 15 |
| `components/game/one-dot.tsx` | `src/games.jsx` L185-187 | 15 |
| `components/screens/splash-screen.tsx` | `src/screens-intro.jsx` L3-41 | 55 |
| `components/screens/welcome-screen.tsx` | `src/screens-intro.jsx` L43-98 | 80 |
| `components/screens/profile-setup.tsx` | `src/screens-intro.jsx` L100-188 | 120 |
| `components/screens/home-screen.tsx` | `src/screens-home.jsx` L3-106 | 130 |
| `components/screens/quick-tile.tsx` | `src/screens-home.jsx` L108-129 | 40 |
| `components/screens/world-card.tsx` | `src/screens-home.jsx` L163-203 | 55 |
| `components/screens/level-node.tsx` | `src/screens-home.jsx` L260-303 | 55 |
| `components/screens/reward-content.tsx` | `src/screens-reward-parent.jsx` L3-57 | 70 |
| `components/screens/stat-display.tsx` | `src/screens-reward-parent.jsx` L58-65 | 20 |
| Game page components (5 files in play dir) | `src/games.jsx` | ~100 each |

## Implementation Steps

### Step 1: Game Engine Types + Engines

1. Create `lib/game-engine/types.ts`:
   ```typescript
   export interface HearTapQuestion {
     target: number;
     options: number[];
   }
   export interface BuildNumberTarget {
     target: number;
   }
   export interface EvenOddQuestion {
     number: number;
     isEven: boolean;
   }
   export interface NumberOrderQuestion {
     seq: number[];
     hideIdx: number;
     target: number;
     options: number[];
   }
   export interface AddTakeQuestion {
     a: number;
     b: number;
     op: '+' | '-';
     target: number;
     options: number[];
   }
   export interface GameState {
     round: number;
     hearts: number;
     totalRounds: number;
   }
   export type AnyQuestion = HearTapQuestion | BuildNumberTarget | EvenOddQuestion | NumberOrderQuestion | AddTakeQuestion;
   ```

2. Create each engine file (local fallback generators):
   - `hear-tap-engine.ts`: port from `src/games.jsx` L33-37
   - `build-number-engine.ts`: port from `src/games.jsx` L117
   - `even-odd-engine.ts`: port from `src/games.jsx` L223
   - `number-order-engine.ts`: port from `src/games.jsx` L311-319
   - `add-take-engine.ts`: port from `src/games.jsx` L386-394 (NOT "math-kitchen-engine" -- AddTake is the game type)

3. Create `lib/game-engine/score-calculator.ts`:
   ```typescript
   export function calculateStars(hearts: number): number {
     return hearts >= 3 ? 3 : hearts === 2 ? 2 : 1;
   }
   ```

### Step 2: Question Loader (AI + Fallback)

Create `lib/game-engine/question-loader.ts`:
```typescript
import type { AnyQuestion } from './types';

export async function loadQuestions(
  lessonId: string,
  gameType: string,
  count: number = 5
): Promise<AnyQuestion[]> {
  try {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, gameType, count }),
    });
    if (!res.ok) throw new Error('AI generation failed');
    const data = await res.json();
    return data.questions.map((q: { payload: AnyQuestion }) => q.payload);
  } catch {
    // Fallback to local engine
    return generateLocalQuestions(gameType, count);
  }
}

function generateLocalQuestions(gameType: string, count: number): AnyQuestion[] {
  // Import and use local engine based on gameType
  // ... switch on gameType, call respective engine
}
```

### Step 3: API Endpoints -- Sessions + Attempts + AI

1. **POST /api/sessions** (`app/api/sessions/route.ts`):
   - Body: `{ childId, lessonId }`
   - Creates `GameSession` record with status `in_progress`
   - Returns `{ sessionId }`

2. **PATCH /api/sessions/[id]** (`app/api/sessions/[id]/route.ts`):
   - Body: `{ stars }`
   - Updates session: `status: 'completed'`, `completedAt: now()`, `stars`
   - Updates Streak (increment or reset based on lastPlayDate)
   - Awards sticker if 3 stars (random from world's sticker pool)
   - Returns `{ session, streak, sticker? }`

3. **POST /api/sessions/[id]/attempts** (`app/api/sessions/[id]/attempts/route.ts`):
   - Body: `{ questionId?, answer, correct, timeMs? }`
   - Creates `GameAttempt` record
   - Returns `{ attemptId }`

4. **POST /api/ai/generate-questions** (`app/api/ai/generate-questions/route.ts`):
   - Body: `{ lessonId, gameType, difficulty?, count? }`
   - Calls AI endpoint: `process.env.AI_ENDPOINT` with model `process.env.AI_MODEL`
   - Prompt asks for structured JSON matching the game type's question schema
   - Validates AI response against expected schema
   - Stores validated questions in `AIQuestion` table
   - Returns `{ questions: [{ id, payload }] }`
   - On AI failure: falls back to local engine generation, still stores in DB

   AI request format:
   ```typescript
   const aiResponse = await fetch(process.env.AI_ENDPOINT + '/chat/completions', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${process.env.AI_API_KEY}`,
     },
     body: JSON.stringify({
       model: process.env.AI_MODEL,
       messages: [{
         role: 'system',
         content: 'You generate math game questions for children. Output ONLY valid JSON array.',
       }, {
         role: 'user',
         content: `Generate ${count} ${gameType} questions at ${difficulty} difficulty. Output JSON array matching this schema: ${schemaForGameType}`,
       }],
       response_format: { type: 'json_object' },
     }),
   });
   ```

5. **GET /api/lessons/[lessonId]** (`app/api/lessons/[lessonId]/route.ts`):
   - Returns lesson metadata + cached questions from DB (if any)
   - If no cached questions, trigger generation

6. **GET /api/progress/[childId]** (`app/api/progress/[childId]/route.ts`):
   - Aggregates: sessions per world, total stars, lessons completed
   - Returns per-world progress for WorldMap display

7. **GET /api/stickers/[childId]** (`app/api/stickers/[childId]/route.ts`):
   - Returns all stickers with `earned: boolean` flag per child

8. **GET/POST /api/streaks/[childId]** (`app/api/streaks/[childId]/route.ts`):
   - GET: current streak, longest streak, last play date
   - POST: update streak (called on session complete)

### Step 4: Game Hooks

1. Create `lib/hooks/use-game.ts`:
   ```typescript
   export function useGame<Q>(
     questions: Q[],
     onComplete: (hearts: number) => void
   ) {
     const [round, setRound] = useState(0);
     const [hearts, setHearts] = useState(3);
     const question = questions[round] ?? null;

     const handleCorrect = useCallback(() => {
       if (round + 1 >= questions.length) {
         onComplete(hearts);
       } else {
         setRound(r => r + 1);
       }
     }, [round, hearts, questions.length, onComplete]);

     const handleWrong = useCallback(() => {
       setHearts(h => Math.max(0, h - 1));
     }, []);

     return { round, hearts, question, totalRounds: questions.length, handleCorrect, handleWrong };
   }
   ```

2. Create `lib/hooks/use-game-session.ts`:
   ```typescript
   export function useGameSession(childId: string, lessonId: string) {
     const [sessionId, setSessionId] = useState<string | null>(null);

     const startSession = useCallback(async () => {
       const res = await fetch('/api/sessions', {
         method: 'POST',
         body: JSON.stringify({ childId, lessonId }),
       });
       const { sessionId } = await res.json();
       setSessionId(sessionId);
       return sessionId;
     }, [childId, lessonId]);

     const submitAttempt = useCallback(async (attempt: SubmitAttemptRequest) => {
       if (!sessionId) return;
       await fetch(`/api/sessions/${sessionId}/attempts`, {
         method: 'POST',
         body: JSON.stringify(attempt),
       });
     }, [sessionId]);

     const completeSession = useCallback(async (stars: number) => {
       if (!sessionId) return;
       const res = await fetch(`/api/sessions/${sessionId}`, {
         method: 'PATCH',
         body: JSON.stringify({ stars }),
       });
       return res.json();
     }, [sessionId]);

     return { sessionId, startSession, submitAttempt, completeSession };
   }
   ```

### Step 5: Game Components

1. Port `GameHud` from `src/games.jsx` L4-20 to `components/game/game-hud.tsx`
2. Create `components/game/game-container.tsx`
3. Port helper components: SlotColumn, Basket, TenStick, OneDot

### Step 6: Game Pages

Create `app/(child)/play/[gameType]/[lessonId]/page.tsx`:
- Read `gameType` and `lessonId` from `params`
- On mount: call `startSession()`, then `loadQuestions(lessonId, gameType)`
- Show loading state while AI generates questions
- Map to game component: `hear-tap` -> HearTapGame, `build-number` -> BuildNumberGame, `even-odd` -> EvenOddGame, `number-order` -> NumberOrderGame, `add-take` -> AddTakeGame
- Each game is a client component (`'use client'`)
- On each answer: call `submitAttempt()` with result
- On game end: call `completeSession(stars)`, navigate to `/reward?sessionId=X`

Create 5 game client components within `app/(child)/play/[gameType]/[lessonId]/`:
- `hear-tap-game.tsx` -- port from `src/games.jsx` L25-105
- `build-number-game.tsx` -- port from `src/games.jsx` L110-181
- `even-odd-game.tsx` -- port from `src/games.jsx` L217-274
- `number-order-game.tsx` -- port from `src/games.jsx` L305-375
- `add-take-game.tsx` -- port from `src/games.jsx` L380-461

Each game:
1. Receives `questions` array and `session` hooks as props
2. Uses `useGame` hook for state management
3. Uses GameHud for top bar
4. Uses GameContainer for background
5. Calls `submitAttempt` on each answer
6. On finish: calls `completeSession`, stores result, navigates to reward

### Step 7: Screen Components

1. **SplashScreen** from `src/screens-intro.jsx` L3-41:
   - `useEffect` with 2200ms timeout -> navigate to home
   - Uses BapMascot (bobble), Sparkles, GardenBg

2. **WelcomeScreen** from `src/screens-intro.jsx` L43-98:
   - Language toggle: 3 buttons (EN/VI/BI)
   - "Start" -> navigate to profile setup or home

3. **ProfileSetup** from `src/screens-intro.jsx` L100-188:
   - 3-step wizard: name input, age selection (NumTile), mascot color (BapMini)
   - On done: `POST /api/auth/register` to create Parent, `POST /api/children` to create Child
   - Save childId to GameProgressContext + localStorage

4. **HomeScreen** from `src/screens-home.jsx` L3-106:
   - Top bar: avatar (BapMini) + name + parent button (IconBtn)
   - **StreakCard** component (not StreakScreen) showing current streak
   - Daily mission card: gradient background, Tag, BigButton
   - Quick tiles: WorldMap + Stickers (QuickTile)
   - Weekly progress: 7-day grid
   - Data fetched from `GET /api/progress/:childId` and `GET /api/streaks/:childId`

5. **WorldMap** (`app/(child)/worlds/page.tsx`):
   - Scrollable list of WorldCard components
   - Data: merge static `WORLDS` config with DB progress from `GET /api/progress/:childId`
   - World unlock logic: world N unlocks when world N-1 has >= 5 lessons completed

6. **LevelList** (`app/(child)/worlds/[worldId]/page.tsx`):
   - Winding path with LevelNode components
   - 9 levels per world from static config
   - Stars per level from DB sessions
   - Level click -> navigate to `/play/[gameType]/[lessonId]`

7. **StickerBook** (`app/(child)/stickers/page.tsx`):
   - 4-column grid, collected stickers (emoji) vs locked ("?")
   - Data from `GET /api/stickers/:childId`
   - Progress bar at top

8. **RewardContent** from `src/screens-reward-parent.jsx` L3-65:
   - Read sessionId from searchParams
   - Fetch session result from API (or read from context cache)
   - Confetti + Sparkles + celebration
   - Star rating, correct/total stats
   - Optional new sticker earned
   - "Next" button -> navigate back to world's level list

### Step 8: Child Layout + Onboarding Flow

1. Create `app/(child)/layout.tsx`:
   - Check if childId exists in GameProgressContext (localStorage cache)
   - If no childId: show splash -> welcome -> profile setup flow
   - If childId exists: verify with API, render children
   - Simple layout, no header (games are full-screen)

2. Wire onboarding:
   - First visit: splash (auto 2.2s) -> welcome -> profile setup -> home
   - Returning visit: directly to home

### Step 9: Verify Build + Flow

```bash
npm run build
npm run dev
```
Navigate through: splash -> welcome -> profile setup -> home -> world map -> level -> game (AI questions loaded) -> reward -> sticker book

## Todo List

- [x]Create `lib/game-engine/types.ts`
- [x]Create `lib/game-engine/hear-tap-engine.ts`
- [x]Create `lib/game-engine/build-number-engine.ts`
- [x]Create `lib/game-engine/even-odd-engine.ts`
- [x]Create `lib/game-engine/number-order-engine.ts`
- [x]Create `lib/game-engine/add-take-engine.ts`
- [x]Create `lib/game-engine/score-calculator.ts`
- [x]Create `lib/game-engine/question-loader.ts`
- [x]Create `lib/hooks/use-game.ts`
- [x]Create `lib/hooks/use-game-session.ts`
- [x]Implement `POST /api/sessions`
- [x]Implement `PATCH /api/sessions/[id]`
- [x]Implement `POST /api/sessions/[id]/attempts`
- [x]Implement `POST /api/ai/generate-questions` (AI + fallback + DB storage)
- [x]Implement `GET /api/lessons/[lessonId]`
- [x]Implement `GET /api/progress/[childId]`
- [x]Implement `GET /api/stickers/[childId]`
- [x]Implement `GET/POST /api/streaks/[childId]`
- [x]Port GameHud to `components/game/game-hud.tsx`
- [x]Create `components/game/game-container.tsx`
- [x]Port SlotColumn, Basket, TenStick, OneDot
- [x]Port SplashScreen to `components/screens/splash-screen.tsx`
- [x]Port WelcomeScreen to `components/screens/welcome-screen.tsx`
- [x]Port ProfileSetup to `components/screens/profile-setup.tsx` (with API registration)
- [x]Port HomeScreen to `components/screens/home-screen.tsx` (with StreakCard, API data)
- [x]Port QuickTile, WorldCard, LevelNode
- [x]Port RewardContent + StatDisplay
- [x]Create 5 game page components (hear-tap, build-number, even-odd, number-order, add-take)
- [x]Create `app/(child)/play/[gameType]/[lessonId]/page.tsx` router
- [x]Create `app/(child)/layout.tsx` with onboarding flow
- [x]Create all route pages (home, worlds, worlds/[worldId], stickers, reward)
- [x]Build compiles with zero errors
- [x]Manual test: full flow splash -> home -> game (with AI questions) -> reward

## Acceptance Criteria

1. `npm run build` passes with zero errors
2. Splash -> Welcome -> Profile Setup creates Parent + Child in DB
3. Home screen renders with profile name from DB, StreakCard with streak from DB
4. World Map shows 5 worlds, unlock state derived from DB progress
5. Level List shows 9 levels with stars from completed sessions
6. `POST /api/ai/generate-questions` calls AI endpoint, validates JSON, stores in AIQuestion table
7. Each of 5 games: loads AI-generated questions, plays through rounds, submits attempts to API
8. On game complete: session marked completed in DB, streak updated, sticker awarded if 3 stars
9. Reward screen shows stars, stats from completed session
10. StickerBook displays collected vs locked from DB
11. All game engine functions are pure (no React dependencies) and importable independently
12. Fallback to local engine if AI endpoint is unavailable
13. Every file under 200 lines

## Dependencies

- Phase A must be complete (UI components, Prisma schema, DB connection, API scaffold, static game config, contexts)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI endpoint latency > 3s on question generation | Medium | High | Show loading spinner, generate 5-10 questions upfront per lesson, cache in DB for reuse |
| AI returns malformed JSON | High | High | Strict schema validation + fallback to local engine |
| Session state lost on page refresh during game | Medium | Medium | Store sessionId in localStorage + GameProgressContext |
| Dynamic route `[gameType]` not matching all 5 types | Low | High | Validate gameType against whitelist, show 404 for unknown |
| Profile setup fails to create DB records | Low | High | Try/catch with user-friendly error, retry logic |
| Large game files exceeding 200 lines | High | Low | Extract sub-components (visual elements) into separate files |

## Security Considerations

- API endpoints validate request bodies (check required fields, types)
- AI API key stored in `.env` (server-side only, never exposed to client)
- childId validated against parent ownership (future: JWT auth)
- No sensitive data in game screens
- AI responses validated before storage (prevent prompt injection in payloads)

## Next Steps

- Phase D depends on this phase for audio integration into games
- Game engine functions tested in Phase D
