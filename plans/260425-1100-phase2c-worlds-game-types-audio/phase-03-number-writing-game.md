# Phase 03 -- Number Writing Engine + UI

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
- **Description**: New game type `number-writing`. Child sees a large digit outline (SVG) with
  numbered dots overlaid. Tapping dots in sequence (1, 2, 3...) traces the digit shape. Pure
  React state machine -- no canvas, no ML, no external library.

## Key Insights

- Tap-sequence approach: each digit (0-9) has 5-8 pre-defined dot positions
- Dots are numbered circles (56px min) overlaid on a gray SVG digit outline
- Active next dot is highlighted (accent color); completed dots turn green
- Wrong tap (out of order): CSS shake on the tapped dot, no progression
- All dots green = success, trigger onComplete for that question
- Dot positions are static per digit -- stored in `dot-paths.ts` as percentage coordinates
- SVG digit outlines use simple stroke paths (no custom font rendering needed)
- Difficulty: easy (digits 0-4), medium (0-6), hard (0-9)
- New world `writing-workshop` hosts this game type

## Requirements

### Functional
- R1: `NumberWritingQuestion` + `DotPoint` interfaces
- R2: Pre-defined dot paths for all 10 digits (0-9) in `dot-paths.ts`
- R3: Engine generates questions with digit + dotPath from static lookup
- R4: SVG background shows digit outline in light gray
- R5: Numbered circle dots overlaid -- active dot highlighted, completed dots green
- R6: Correct tap order: dot turns green + SFX + next dot activates
- R7: Wrong tap: shake animation on tapped dot, no advancement
- R8: All dots complete: celebrate + advance to next question
- R9: New world `writing-workshop` with 9 lessons

### Non-Functional
- NF1: Touch targets >= 56px (larger than standard 48px for accuracy)
- NF2: `npx tsc --noEmit` passes
- NF3: No canvas, no external drawing library, no ML
- NF4: Works on mobile portrait viewport (320px min width)

## Architecture

```
NumberWritingQuestion (types.ts)
       |
DOT_PATHS (dot-paths.ts) -- static data for digits 0-9
       |
number-writing-engine.ts --> GAME_REGISTRY['number-writing']
       |
NumberWritingGame (play page) --> GAME_MAP['number-writing']
       |
       +-- DigitSvgBackground -- gray stroke SVG path of digit
       +-- DotSequence -- numbered circles, tap state machine
```

**State machine per question:**
```
WAITING (nextDot = 1)
  --> tap dot 1 --> dot 1 green, nextDot = 2
  --> tap dot 2 --> dot 2 green, nextDot = 3
  ...
  --> tap last dot --> all green --> COMPLETE --> onComplete
  --> tap wrong dot --> SHAKE --> stay in WAITING
```

## Related Code Files

### Files to CREATE
- `lib/game-engine/dot-paths.ts` -- static dot positions for digits 0-9
- `lib/game-engine/number-writing-engine.ts` -- engine + registry export
- `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx` -- main game component

### Files to MODIFY
- `lib/game-engine/types.ts` -- add DotPoint + NumberWritingQuestion to AnyQuestion
- `lib/game-engine/registry.ts` -- add number-writing engine
- `lib/types/common.ts` -- add `writing-workshop` to WorldId
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` -- add to GAME_MAP
- `app/api/ai/generate-questions/route.ts` -- add QUESTION_SCHEMA + isValidQuestion case
- `src/data/game-config/game-types.ts` -- add number-writing GameTypeConfig
- `src/data/game-config/worlds.ts` -- add writing-workshop WorldConfig
- `src/data/game-config/lesson-templates.ts` -- add 9 lesson templates

## Implementation Steps

### Step 1: Add types to `lib/game-engine/types.ts`

Add before the `AnyQuestion` union:

```typescript
export interface DotPoint {
  x: number;     // percentage (0-100) of SVG viewBox width
  y: number;     // percentage (0-100) of SVG viewBox height
  label: number; // tap order (1-based)
}

export interface NumberWritingQuestion {
  type: 'number-writing';
  digit: number;          // 0-9
  dotPath: DotPoint[];    // sequence of dots defining tap order
  totalDots: number;      // convenience: dotPath.length
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
  | CountObjectsQuestion
  | NumberWritingQuestion;
```

### Step 2: Create `lib/game-engine/dot-paths.ts`

Pre-defined dot positions for each digit. Coordinates are percentages of a 200x280 viewBox.
Each digit has 5-8 dots placed along the natural stroke path of the numeral.

```typescript
import type { DotPoint } from './types';

/**
 * Static dot positions for digits 0-9.
 * Coordinates: percentage of 200x280 SVG viewBox.
 * Labels: 1-based tap order following natural handwriting stroke.
 */
export const DOT_PATHS: Record<number, DotPoint[]> = {
  0: [
    { x: 50, y: 8,   label: 1 },  // top center
    { x: 85, y: 25,  label: 2 },  // upper right
    { x: 85, y: 65,  label: 3 },  // lower right
    { x: 50, y: 88,  label: 4 },  // bottom center
    { x: 15, y: 65,  label: 5 },  // lower left
    { x: 15, y: 25,  label: 6 },  // upper left
  ],
  1: [
    { x: 35, y: 20,  label: 1 },  // serif start (upper left)
    { x: 50, y: 8,   label: 2 },  // top
    { x: 50, y: 50,  label: 3 },  // middle
    { x: 50, y: 88,  label: 4 },  // bottom
  ],
  2: [
    { x: 20, y: 25,  label: 1 },  // upper left curve
    { x: 50, y: 8,   label: 2 },  // top center
    { x: 80, y: 25,  label: 3 },  // upper right curve
    { x: 50, y: 55,  label: 4 },  // middle
    { x: 20, y: 88,  label: 5 },  // bottom left
    { x: 80, y: 88,  label: 6 },  // bottom right
  ],
  3: [
    { x: 20, y: 15,  label: 1 },  // top left
    { x: 65, y: 8,   label: 2 },  // top center
    { x: 80, y: 30,  label: 3 },  // upper right
    { x: 45, y: 48,  label: 4 },  // middle
    { x: 80, y: 68,  label: 5 },  // lower right
    { x: 50, y: 88,  label: 6 },  // bottom center
    { x: 20, y: 80,  label: 7 },  // bottom left
  ],
  4: [
    { x: 65, y: 8,   label: 1 },  // top (vertical start)
    { x: 35, y: 40,  label: 2 },  // diagonal mid
    { x: 15, y: 60,  label: 3 },  // left corner
    { x: 85, y: 60,  label: 4 },  // horizontal end
    { x: 65, y: 40,  label: 5 },  // return to vertical
    { x: 65, y: 88,  label: 6 },  // bottom
  ],
  5: [
    { x: 75, y: 8,   label: 1 },  // top right
    { x: 25, y: 8,   label: 2 },  // top left
    { x: 20, y: 42,  label: 3 },  // mid left
    { x: 55, y: 38,  label: 4 },  // mid center
    { x: 82, y: 58,  label: 5 },  // right curve
    { x: 55, y: 88,  label: 6 },  // bottom center
    { x: 20, y: 78,  label: 7 },  // bottom left
  ],
  6: [
    { x: 70, y: 12,  label: 1 },  // top right
    { x: 40, y: 8,   label: 2 },  // top center
    { x: 15, y: 35,  label: 3 },  // upper left
    { x: 15, y: 68,  label: 4 },  // lower left
    { x: 50, y: 88,  label: 5 },  // bottom center
    { x: 82, y: 68,  label: 6 },  // lower right
    { x: 55, y: 48,  label: 7 },  // mid right (close loop)
  ],
  7: [
    { x: 15, y: 8,   label: 1 },  // top left
    { x: 80, y: 8,   label: 2 },  // top right
    { x: 60, y: 35,  label: 3 },  // upper diagonal
    { x: 45, y: 60,  label: 4 },  // mid diagonal
    { x: 35, y: 88,  label: 5 },  // bottom
  ],
  8: [
    { x: 50, y: 8,   label: 1 },  // top center
    { x: 80, y: 22,  label: 2 },  // upper right
    { x: 50, y: 45,  label: 3 },  // middle cross
    { x: 18, y: 22,  label: 4 },  // upper left
    { x: 18, y: 68,  label: 5 },  // lower left
    { x: 50, y: 88,  label: 6 },  // bottom center
    { x: 82, y: 68,  label: 7 },  // lower right
    { x: 50, y: 45,  label: 8 },  // middle cross (close)
  ],
  9: [
    { x: 50, y: 48,  label: 1 },  // mid left (loop start)
    { x: 18, y: 28,  label: 2 },  // upper left
    { x: 50, y: 8,   label: 3 },  // top center
    { x: 82, y: 28,  label: 4 },  // upper right
    { x: 82, y: 55,  label: 5 },  // mid right
    { x: 50, y: 88,  label: 6 },  // bottom center
    { x: 25, y: 82,  label: 7 },  // bottom left
  ],
};

/** SVG path data for digit outlines (simplified strokes) */
export const DIGIT_SVG_PATHS: Record<number, string> = {
  0: 'M100,22 C145,22 170,70 170,140 C170,210 145,258 100,258 C55,258 30,210 30,140 C30,70 55,22 100,22 Z',
  1: 'M70,56 L100,22 L100,258',
  2: 'M35,70 C35,35 65,22 100,22 C135,22 165,40 165,70 C165,110 100,154 35,246 L165,246',
  3: 'M40,42 L120,22 C155,22 170,50 170,78 C170,110 145,126 120,126 C155,126 175,150 175,186 C175,230 140,258 100,258 C65,258 40,240 40,224',
  4: 'M130,22 L30,168 L170,168 M130,22 L130,258',
  5: 'M150,22 L50,22 L40,118 C65,100 90,95 115,100 C155,110 170,145 170,186 C170,230 140,258 100,258 C65,258 40,240 40,218',
  6: 'M140,34 C120,22 100,22 80,28 C45,42 30,90 30,158 C30,220 55,258 100,258 C145,258 170,225 170,186 C170,148 145,126 110,126 C75,126 30,148 30,186',
  7: 'M30,22 L170,22 L90,258',
  8: 'M100,126 C60,126 40,105 40,78 C40,45 65,22 100,22 C135,22 160,45 160,78 C160,105 140,126 100,126 C55,126 30,155 30,196 C30,235 60,258 100,258 C140,258 170,235 170,196 C170,155 145,126 100,126',
  9: 'M170,100 C170,55 140,22 100,22 C60,22 30,55 30,100 C30,135 55,155 90,155 C125,155 170,135 170,100 L170,200 C170,235 145,258 110,258 C80,258 60,248 50,230',
};
```

### Step 3: Create `lib/game-engine/number-writing-engine.ts`

```typescript
import type { NumberWritingQuestion } from './types';
import type { GameEngine } from './registry';
import { DOT_PATHS } from './dot-paths';

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateNumberWritingQuestion(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): NumberWritingQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [0, 4],
    medium: [0, 6],
    hard: [0, 9],
  };
  const [min, max] = ranges[difficulty];
  const digit = randomInt(min, max);
  const dotPath = DOT_PATHS[digit];
  return {
    type: 'number-writing',
    digit,
    dotPath,
    totalDots: dotPath.length,
  };
}

export function generateNumberWritingQuestions(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): NumberWritingQuestion[] {
  return Array.from({ length: count }, () =>
    generateNumberWritingQuestion(difficulty),
  );
}

export const numberWritingEngine: GameEngine = {
  generateQuestions: (count, difficulty) =>
    generateNumberWritingQuestions(count, difficulty ?? 'easy'),
};
```

### Step 4: Register in `lib/game-engine/registry.ts`

Add import and registry entry:

```typescript
import { numberWritingEngine } from './number-writing-engine';
```

Add to `GAME_REGISTRY` object:

```typescript
'number-writing': numberWritingEngine,
```

### Step 5: Add `writing-workshop` to WorldId in `lib/types/common.ts`

```typescript
export type WorldId =
  | 'number-garden'
  | 'counting-castle'
  | 'even-odd-house'
  | 'number-sequence'
  | 'math-kitchen'
  | 'counting-meadow'
  | 'writing-workshop';
```

### Step 6: Add world config in `src/data/game-config/worlds.ts`

Append to `WORLDS` array:

```typescript
{
  id: 'writing-workshop',
  name: 'Writing Workshop',
  subtitle: 'Trace digits',
  color: 'lavender',
  bg: '#D9C7F0',
  emoji: '✏️',
  gameTypes: ['number-writing'],
  lessonCount: 9,
  unlockOrder: 6,
},
```

### Step 7: Add game type config in `src/data/game-config/game-types.ts`

Append to `GAME_TYPES` array:

```typescript
{
  id: 'number-writing',
  name: 'Number Writing',
  description: 'Tap the dots in order to trace each digit',
  emoji: '✏️',
  worlds: ['writing-workshop'],
  numberRange: { easy: [0, 4], medium: [0, 6], hard: [0, 9] },
},
```

### Step 8: Add 9 lesson templates in `src/data/game-config/lesson-templates.ts`

Append to `LESSON_TEMPLATES` array:

```typescript
// -- Writing Workshop (number-writing) ---------------------
{ id: 'ww-01', worldId: 'writing-workshop', gameType: 'number-writing', order: 1, title: 'Write 0 & 1',    difficulty: 'easy',   questionCount: 6,  passingStars: 1 },
{ id: 'ww-02', worldId: 'writing-workshop', gameType: 'number-writing', order: 2, title: 'Write 2 & 3',    difficulty: 'easy',   questionCount: 6,  passingStars: 1 },
{ id: 'ww-03', worldId: 'writing-workshop', gameType: 'number-writing', order: 3, title: 'Write 0–4',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
{ id: 'ww-04', worldId: 'writing-workshop', gameType: 'number-writing', order: 4, title: 'Write 5 & 6',    difficulty: 'medium', questionCount: 8,  passingStars: 2 },
{ id: 'ww-05', worldId: 'writing-workshop', gameType: 'number-writing', order: 5, title: 'Write 0–6',      difficulty: 'medium', questionCount: 10, passingStars: 2 },
{ id: 'ww-06', worldId: 'writing-workshop', gameType: 'number-writing', order: 6, title: 'Speed Write',    difficulty: 'medium', questionCount: 10, passingStars: 2 },
{ id: 'ww-07', worldId: 'writing-workshop', gameType: 'number-writing', order: 7, title: 'Write 7, 8, 9',  difficulty: 'hard',   questionCount: 10, passingStars: 2 },
{ id: 'ww-08', worldId: 'writing-workshop', gameType: 'number-writing', order: 8, title: 'Write All',      difficulty: 'hard',   questionCount: 12, passingStars: 2 },
{ id: 'ww-09', worldId: 'writing-workshop', gameType: 'number-writing', order: 9, title: 'Writing Master', difficulty: 'hard',   questionCount: 12, passingStars: 2 },
```

### Step 9: Create `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx`

```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { Sparkles } from '@/components/ui/sparkles';
import { useGame } from '@/lib/hooks/use-game';
import { useAudio } from '@/lib/hooks/use-audio';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { DIGIT_SVG_PATHS } from '@/lib/game-engine/dot-paths';
import type { NumberWritingQuestion, AnyQuestion, GameResult, DotPoint } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

const VIEWBOX_W = 200;
const VIEWBOX_H = 280;
const DOT_RADIUS = 28; // 56px diameter at 1:1 scale

export function NumberWritingGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [completedDots, setCompletedDots] = useState<Set<number>>(new Set());
  const [nextLabel, setNextLabel] = useState(1);
  const [shakingDot, setShakingDot] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { speakNumber } = useAudio();
  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();
  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } =
    useGame<AnyQuestion>(questions, onComplete);
  const q = question as NumberWritingQuestion | null;

  // Reset on new round
  useEffect(() => {
    setCompletedDots(new Set());
    setNextLabel(1);
    setShakingDot(null);
    setAllDone(false);
    if (q) speakNumber(q.digit);
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const onDotTap = useCallback((dot: DotPoint) => {
    if (!q || allDone) return;

    if (dot.label === nextLabel) {
      // Correct tap
      playCorrect();
      onAttempt(String(dot.label), true);
      const newCompleted = new Set(completedDots);
      newCompleted.add(dot.label);
      setCompletedDots(newCompleted);

      if (newCompleted.size === q.totalDots) {
        // All dots tapped -- digit complete
        setAllDone(true);
        timeoutRef.current = setTimeout(() => {
          playLevelComplete();
          handleCorrect();
        }, 1200);
      } else {
        setNextLabel(dot.label + 1);
      }
    } else {
      // Wrong tap -- shake
      setShakingDot(dot.label);
      playWrong();
      onAttempt(String(dot.label), false);
      handleWrong();
      timeoutRef.current = setTimeout(() => setShakingDot(null), 500);
    }
  }, [q, allDone, nextLabel, completedDots, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  const svgPath = DIGIT_SVG_PATHS[q.digit] ?? '';

  return (
    <GameContainer variant="lavender">
      <Sparkles count={4} color="#B9A4E0" />
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px', gap: 16,
      }}>
        {/* Instruction */}
        <div style={{ fontSize: 14, color: '#3D256D', fontWeight: 700, letterSpacing: 0.5 }}>
          TRACE THE NUMBER
        </div>

        {/* Digit display + dots */}
        <div style={{
          position: 'relative', width: 200, height: 280,
          background: 'rgba(255,255,255,0.6)', borderRadius: 24,
          border: '3px solid #2D3A2E',
        }}>
          {/* SVG digit outline */}
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <path
              d={svgPath}
              fill="none"
              stroke="#E0D6F0"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Draw connecting lines between completed dots */}
            {q.dotPath.map((dot, i) => {
              if (i === 0) return null;
              const prev = q.dotPath[i - 1];
              if (!completedDots.has(dot.label) || !completedDots.has(prev.label)) return null;
              return (
                <line
                  key={`line-${i}`}
                  x1={(prev.x / 100) * VIEWBOX_W}
                  y1={(prev.y / 100) * VIEWBOX_H}
                  x2={(dot.x / 100) * VIEWBOX_W}
                  y2={(dot.y / 100) * VIEWBOX_H}
                  stroke="#7FC089"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Dot buttons */}
          {q.dotPath.map((dot) => {
            const isCompleted = completedDots.has(dot.label);
            const isNext = dot.label === nextLabel;
            const isShaking = shakingDot === dot.label;
            const cx = (dot.x / 100) * 200;
            const cy = (dot.y / 100) * 280;

            return (
              <motion.button
                key={`${round}-dot-${dot.label}`}
                onClick={() => onDotTap(dot)}
                disabled={isCompleted}
                aria-label={`Dot ${dot.label}`}
                animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={isShaking ? { duration: 0.4 } : {}}
                style={{
                  position: 'absolute',
                  left: cx - DOT_RADIUS,
                  top: cy - DOT_RADIUS,
                  width: DOT_RADIUS * 2,
                  height: DOT_RADIUS * 2,
                  borderRadius: '50%',
                  border: '3px solid #2D3A2E',
                  background: isCompleted ? '#7FC089'
                    : isNext ? '#FFD36E'
                    : '#E8E0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-num)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: isCompleted ? '#1F4A28' : isNext ? '#5E3A00' : '#8872B4',
                  cursor: isCompleted ? 'default' : 'pointer',
                  boxShadow: isNext
                    ? '0 0 0 4px rgba(255,211,78,0.4), 0 4px 8px rgba(0,0,0,0.12)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  zIndex: 2,
                  padding: 0,
                }}
              >
                {isCompleted ? '✓' : dot.label}
              </motion.button>
            );
          })}

          {/* Success overlay */}
          {allDone && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)', borderRadius: 24, zIndex: 3,
              fontSize: 64,
            }}>
              🎉
            </div>
          )}
        </div>

        {/* Digit label */}
        <div style={{
          fontSize: 22, fontWeight: 700, color: '#3D256D',
          fontFamily: 'var(--font-kid)',
        }}>
          Write the number {q.digit}
        </div>
      </div>
    </GameContainer>
  );
}
```

### Step 10: Register component in play page

In `app/(child)/play/[gameType]/[lessonId]/page.tsx`, add import and GAME_MAP entry:

```typescript
import { NumberWritingGame } from './number-writing-game';
```

Add to `GAME_MAP`:
```typescript
'number-writing': NumberWritingGame as React.ComponentType<GameProps>,
```

### Step 11: Add AI schema + validation in `app/api/ai/generate-questions/route.ts`

Add to `QUESTION_SCHEMAS`:
```typescript
'number-writing': '{"type": "number-writing", "digit": number (0-9), "dotPath": [{x,y,label}], "totalDots": number}',
```

Add case to `isValidQuestion`:
```typescript
case 'number-writing':
  return typeof obj.type === 'string' && typeof obj.digit === 'number' && Array.isArray(obj.dotPath) && typeof obj.totalDots === 'number';
```

**Note:** AI-generated questions for number-writing are unlikely to be useful (dot paths are
static per digit), but the schema entry is needed for type completeness. The local engine
is the primary source for this game type.

## Todo List

- [ ] Add `DotPoint` + `NumberWritingQuestion` interfaces to `lib/game-engine/types.ts`
- [ ] Update `AnyQuestion` union in `lib/game-engine/types.ts`
- [ ] Create `lib/game-engine/dot-paths.ts` with DOT_PATHS + DIGIT_SVG_PATHS
- [ ] Create `lib/game-engine/number-writing-engine.ts`
- [ ] Register engine in `lib/game-engine/registry.ts`
- [ ] Add `writing-workshop` to `WorldId` in `lib/types/common.ts`
- [ ] Add world config to `src/data/game-config/worlds.ts`
- [ ] Add game type config to `src/data/game-config/game-types.ts`
- [ ] Add 9 lesson templates to `src/data/game-config/lesson-templates.ts`
- [ ] Create `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx`
- [ ] Register component in play page GAME_MAP
- [ ] Add AI schema + validation to route.ts
- [ ] Run `npx tsc --noEmit` -- must pass
- [ ] Manual test: tap dots in correct order, verify green progression + celebrate
- [ ] Manual test: tap wrong dot, verify shake + no advancement
- [ ] Visual check: dots align with digit outline on mobile viewport

## Success Criteria

1. `npx tsc --noEmit` passes
2. Navigating to `/play/number-writing/ww-01` shows digit outline + numbered dots
3. Tapping dots in correct order: each dot turns green, connecting line appears
4. Tapping wrong dot: shake animation, no advancement
5. All dots tapped: celebration emoji overlay + advance to next question
6. All 9 lessons appear in writing-workshop world
7. Existing 5 (or 6 with count-objects) game types unaffected

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SVG paths look wrong on some digits | Medium | Visual | Pre-test all 10 digits; paths use simple cubic curves |
| Dots overlap on small screens | Medium | Usability | Coordinates use percentages; 200x280 viewBox fits 320px+ |
| Dot tap area too small for young children | Low | Usability | 56px diameter exceeds WCAG minimum; add 4px glow ring on active |
| Digit outline not recognizable | Low | Pedagogy | Use thick stroke (12px) with visible color contrast |

## Security Considerations

- No user input stored beyond existing session tracking
- SVG paths are hardcoded strings (no injection risk)
- Dot positions are static data (no user-controllable input)

## Next Steps

- After Phase 02 + 03: integration test all 7 game types
- Future: add audio pronunciation of digit on round start (already using `speakNumber`)
- Future: animate connecting lines with Framer Motion for smoother experience
