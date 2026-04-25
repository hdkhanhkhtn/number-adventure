# Phase 02 -- Counting Objects Engine + UI

## Context Links

- Parent plan: `plans/260425-1100-phase2c-worlds-game-types-audio/plan.md`
- Phase 01 (prerequisite): `phase-01-game-registry-refactor.md`
- Existing game pattern: `app/(child)/play/[gameType]/[lessonId]/hear-tap-game.tsx`
- UI components: `components/ui/num-tile.tsx`, `components/ui/big-button.tsx`
- Game container: `components/game/game-container.tsx`, `components/game/game-hud.tsx`
- Hooks: `lib/hooks/use-game.ts`, `lib/hooks/use-sound-effects.ts`
- Game config: `src/data/game-config/game-types.ts`, `src/data/game-config/worlds.ts`
- Lesson templates: `src/data/game-config/lesson-templates.ts`
- AI endpoint: `app/api/ai/generate-questions/route.ts`

## Overview

- **Priority**: P2
- **Status**: pending
- **Description**: New game type `count-objects`. Screen shows a grid of emoji items; child
  counts them and taps the correct number from 4 choices. Engine generates random emoji sets
  with close-distractor answer choices.

## Key Insights

- Difficulty ranges: easy 1-5 items, medium 1-10, hard 1-20
- 4 answer choices with +/-1 and +/-2 distractors (not random) to test true counting
- Emoji rendered as plain text spans in a flex-wrap grid -- zero dependencies
- Wrong answer: shake animation on choice + shuffle choices, allow retry (do not eliminate)
- New world `counting-meadow` hosts this game type
- Follow `hear-tap-game.tsx` pattern exactly: Props interface, useGame hook, GameContainer

## Requirements

### Functional
- R1: `CountObjectsQuestion` interface with `type`, `items`, `answer`, `choices`
- R2: Engine generates questions per difficulty with close distractors
- R3: Game UI shows emoji grid + 4 number choice buttons
- R4: Correct tap: green flash + SFX + advance to next question
- R5: Wrong tap: shake animation + shuffle choices + stay on question
- R6: New world `counting-meadow` in WorldId union, WORLDS array, and lesson templates
- R7: 9 lessons (3 easy, 3 medium, 3 hard) seeded for `counting-meadow`

### Non-Functional
- NF1: Touch targets >= 48x48px
- NF2: `npx tsc --noEmit` passes
- NF3: Works on mobile portrait viewport

## Architecture

```
CountObjectsQuestion (types.ts)
       |
count-objects-engine.ts --> GAME_REGISTRY['count-objects']
       |
CountObjectsGame (play page) --> GAME_MAP['count-objects']
       |
       +-- EmojiGrid (inline) -- flex-wrap grid of emoji spans
       +-- ChoiceButtons -- 4 NumTile buttons
```

## Related Code Files

### Files to CREATE
- `lib/game-engine/count-objects-engine.ts`
- `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx`

### Files to MODIFY
- `lib/game-engine/types.ts` -- add CountObjectsQuestion to AnyQuestion
- `lib/game-engine/registry.ts` -- add count-objects engine
- `lib/types/common.ts` -- add `counting-meadow` to WorldId
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` -- add to GAME_MAP
- `app/api/ai/generate-questions/route.ts` -- add QUESTION_SCHEMA + isValidQuestion case
- `src/data/game-config/game-types.ts` -- add count-objects GameTypeConfig
- `src/data/game-config/worlds.ts` -- add counting-meadow WorldConfig
- `src/data/game-config/lesson-templates.ts` -- add 9 lesson templates

## Implementation Steps

### Step 1: Add `CountObjectsQuestion` to `lib/game-engine/types.ts`

Add interface before the `AnyQuestion` union:

```typescript
export interface CountObjectsQuestion {
  type: 'count-objects';
  items: string[];      // emoji array, length = correct answer
  answer: number;       // correct count
  choices: number[];    // 4 choices including answer
}
```

Update `AnyQuestion` union -- append new member:

```typescript
export type AnyQuestion =
  | HearTapQuestion
  | BuildNumberQuestion
  | EvenOddQuestion
  | NumberOrderQuestion
  | AddTakeQuestion
  | CountObjectsQuestion;
```

### Step 2: Create `lib/game-engine/count-objects-engine.ts`

```typescript
import type { CountObjectsQuestion } from './types';
import type { GameEngine } from './registry';

const EMOJI_SETS = ['apple', 'star', 'dog', 'flower', 'balloon'];
const EMOJI_MAP: Record<string, string> = {
  apple: '🍎', star: '⭐', dog: '🐶', flower: '🌸', balloon: '🎈',
};

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateChoices(answer: number, min: number, max: number): number[] {
  const choices = new Set<number>([answer]);

  // Close distractors: +/-1, +/-2
  const candidates = [answer - 2, answer - 1, answer + 1, answer + 2]
    .filter((n) => n >= min && n <= max && n !== answer);

  // Shuffle candidates and pick up to 3
  for (const c of candidates.sort(() => Math.random() - 0.5)) {
    if (choices.size >= 4) break;
    choices.add(c);
  }

  // Fill remaining with wider range if needed
  let guard = 0;
  while (choices.size < 4 && guard++ < 20) {
    const n = randomInt(Math.max(min, answer - 5), Math.min(max, answer + 5));
    if (n !== answer) choices.add(n);
  }

  // Deterministic fallback
  let fill = 1;
  while (choices.size < 4) {
    const n = answer + fill;
    if (n >= min && n <= max) choices.add(n);
    fill = fill > 0 ? -fill : -fill + 1;
  }

  return [...choices].sort(() => Math.random() - 0.5);
}

export function generateCountObjectsQuestion(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): CountObjectsQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [1, 5],
    medium: [1, 10],
    hard: [1, 20],
  };
  const [min, max] = ranges[difficulty];
  const answer = randomInt(min, max);
  const emojiKey = EMOJI_SETS[randomInt(0, EMOJI_SETS.length - 1)];
  const emoji = EMOJI_MAP[emojiKey];
  const items = Array(answer).fill(emoji);
  const choices = generateChoices(answer, min, max);
  return { type: 'count-objects', items, answer, choices };
}

export function generateCountObjectsQuestions(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): CountObjectsQuestion[] {
  return Array.from({ length: count }, () =>
    generateCountObjectsQuestion(difficulty),
  );
}

export const countObjectsEngine: GameEngine = {
  generateQuestions: (count, difficulty) =>
    generateCountObjectsQuestions(count, difficulty ?? 'easy'),
};
```

### Step 3: Register in `lib/game-engine/registry.ts`

Add import and registry entry:

```typescript
import { countObjectsEngine } from './count-objects-engine';
```

Add to `GAME_REGISTRY` object:

```typescript
'count-objects': countObjectsEngine,
```

### Step 4: Add `counting-meadow` to WorldId in `lib/types/common.ts`

```typescript
export type WorldId =
  | 'number-garden'
  | 'counting-castle'
  | 'even-odd-house'
  | 'number-sequence'
  | 'math-kitchen'
  | 'counting-meadow';
```

### Step 5: Add world config in `src/data/game-config/worlds.ts`

Append to `WORLDS` array:

```typescript
{
  id: 'counting-meadow',
  name: 'Counting Meadow',
  subtitle: 'Count objects',
  color: 'sun',
  bg: '#FFE6A8',
  emoji: '🌼',
  gameTypes: ['count-objects'],
  lessonCount: 9,
  unlockOrder: 5,
},
```

### Step 6: Add game type config in `src/data/game-config/game-types.ts`

Append to `GAME_TYPES` array:

```typescript
{
  id: 'count-objects',
  name: 'Counting Objects',
  description: 'Count the objects and tap the right number',
  emoji: '🔢',
  worlds: ['counting-meadow'],
  numberRange: { easy: [1, 5], medium: [1, 10], hard: [1, 20] },
},
```

### Step 7: Add 9 lesson templates in `src/data/game-config/lesson-templates.ts`

Append to `LESSON_TEMPLATES` array:

```typescript
// -- Counting Meadow (count-objects) -----------------------
{ id: 'cm-01', worldId: 'counting-meadow', gameType: 'count-objects', order: 1, title: 'Count to 3',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
{ id: 'cm-02', worldId: 'counting-meadow', gameType: 'count-objects', order: 2, title: 'Count to 5',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
{ id: 'cm-03', worldId: 'counting-meadow', gameType: 'count-objects', order: 3, title: 'How Many?',       difficulty: 'easy',   questionCount: 10, passingStars: 1 },
{ id: 'cm-04', worldId: 'counting-meadow', gameType: 'count-objects', order: 4, title: 'Count to 7',      difficulty: 'medium', questionCount: 10, passingStars: 2 },
{ id: 'cm-05', worldId: 'counting-meadow', gameType: 'count-objects', order: 5, title: 'Count to 10',     difficulty: 'medium', questionCount: 10, passingStars: 2 },
{ id: 'cm-06', worldId: 'counting-meadow', gameType: 'count-objects', order: 6, title: 'Quick Count',     difficulty: 'medium', questionCount: 12, passingStars: 2 },
{ id: 'cm-07', worldId: 'counting-meadow', gameType: 'count-objects', order: 7, title: 'Count to 15',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
{ id: 'cm-08', worldId: 'counting-meadow', gameType: 'count-objects', order: 8, title: 'Count to 20',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
{ id: 'cm-09', worldId: 'counting-meadow', gameType: 'count-objects', order: 9, title: 'Counting Master', difficulty: 'hard',   questionCount: 15, passingStars: 2 },
```

### Step 8: Create `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx`

```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { NumTile } from '@/components/ui/num-tile';
import { Sparkles } from '@/components/ui/sparkles';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import type { CountObjectsQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function CountObjectsGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [correctPicked, setCorrectPicked] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();
  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } =
    useGame<AnyQuestion>(questions, onComplete);
  const q = question as CountObjectsQuestion | null;

  // Reset state + shuffle choices on new round
  useEffect(() => {
    setCorrectPicked(false);
    setWrongPick(null);
    if (q) setShuffledChoices([...q.choices].sort(() => Math.random() - 0.5));
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const onPick = useCallback((n: number) => {
    if (!q || correctPicked) return;
    if (n === q.answer) {
      setCorrectPicked(true);
      playCorrect();
      onAttempt(String(n), true);
      timeoutRef.current = setTimeout(() => { playLevelComplete(); handleCorrect(); }, 900);
    } else {
      setWrongPick(n);
      playWrong();
      onAttempt(String(n), false);
      handleWrong();
      // Shuffle choices after short delay
      timeoutRef.current = setTimeout(() => {
        setWrongPick(null);
        setShuffledChoices((prev) => [...prev].sort(() => Math.random() - 0.5));
      }, 500);
    }
  }, [q, correctPicked, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  return (
    <GameContainer variant="sun">
      <Sparkles count={6} color="#FFD36E" />
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px', gap: 24,
      }}>
        {/* Instruction */}
        <div style={{ fontSize: 14, color: '#5E3A00', fontWeight: 700, letterSpacing: 0.5 }}>
          HOW MANY DO YOU SEE?
        </div>

        {/* Emoji grid */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 8, maxWidth: 280, padding: 16,
          background: 'rgba(255,255,255,0.6)', borderRadius: 20,
          border: '3px solid #2D3A2E',
        }}>
          {q.items.map((emoji, i) => (
            <span key={i} style={{
              fontSize: 36, width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {emoji}
            </span>
          ))}
        </div>

        {/* Choice buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {shuffledChoices.map((n) => (
            <NumTile
              key={`${round}-${n}`}
              n={n}
              size="lg"
              color={n === q.answer && correctPicked ? 'sage' : 'cream'}
              state={
                correctPicked && n === q.answer ? 'correct'
                : wrongPick === n ? 'wrong'
                : 'idle'
              }
              onClick={() => onPick(n)}
            />
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
```

### Step 9: Register component in play page

In `app/(child)/play/[gameType]/[lessonId]/page.tsx`, add import and GAME_MAP entry:

```typescript
import { CountObjectsGame } from './count-objects-game';
```

Add to `GAME_MAP`:
```typescript
'count-objects': CountObjectsGame as React.ComponentType<GameProps>,
```

### Step 10: Add AI schema + validation in `app/api/ai/generate-questions/route.ts`

Add to `QUESTION_SCHEMAS`:
```typescript
'count-objects': '{"type": "count-objects", "items": string[] (emoji array), "answer": number, "choices": number[4]}',
```

Add case to `isValidQuestion`:
```typescript
case 'count-objects':
  return typeof obj.type === 'string' && Array.isArray(obj.items) && typeof obj.answer === 'number' && Array.isArray(obj.choices);
```

## Todo List

- [ ] Add `CountObjectsQuestion` interface to `lib/game-engine/types.ts`
- [ ] Update `AnyQuestion` union in `lib/game-engine/types.ts`
- [ ] Create `lib/game-engine/count-objects-engine.ts`
- [ ] Register engine in `lib/game-engine/registry.ts`
- [ ] Add `counting-meadow` to `WorldId` in `lib/types/common.ts`
- [ ] Add world config to `src/data/game-config/worlds.ts`
- [ ] Add game type config to `src/data/game-config/game-types.ts`
- [ ] Add 9 lesson templates to `src/data/game-config/lesson-templates.ts`
- [ ] Create `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx`
- [ ] Register component in play page GAME_MAP
- [ ] Add AI schema + validation to route.ts
- [ ] Run `npx tsc --noEmit` -- must pass
- [ ] Manual test: navigate to count-objects game, verify emoji grid + choices render

## Success Criteria

1. `npx tsc --noEmit` passes
2. Navigating to `/play/count-objects/cm-01` shows emoji grid + 4 number choices
3. Correct tap: green flash + sound + advances
4. Wrong tap: shake animation + choices reshuffle + stays on question
5. All 9 lessons appear in counting-meadow world
6. Existing 5 game types unaffected

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Emoji rendering inconsistent across devices | Low | Visual | Use common emoji (apple, star, dog) -- universal support |
| Too many items overflow on small screens | Medium | Layout break | Max 20 items, 5 per row, max-width 280px container |
| Distractor choices identical to answer | Low | Broken game | `generateChoices` uses Set to guarantee uniqueness |

## Security Considerations

- No user input stored beyond existing session tracking
- Emoji are hardcoded strings (no injection risk)
- AI validation prevents malformed payloads

## Next Steps

- Phase 03 can run in parallel (independent game type)
- After both Phase 02 + 03: integration test all 7 game types
