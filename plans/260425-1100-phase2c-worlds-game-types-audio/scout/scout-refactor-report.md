# Scout: Game Engine Registry Refactor + New Game Types

## 1. GameType Union (lib/types/common.ts:21-26)

```typescript
export type GameType =
  | 'hear-tap' | 'build-number' | 'even-odd' | 'number-order' | 'add-take';
```

## 2. Question Payload Types (lib/game-engine/types.ts:3-37)

```typescript
HearTapQuestion:      { target: number; options: number[] }
BuildNumberQuestion:  { target: number }
EvenOddQuestion:      { number: number; isEven: boolean }
NumberOrderQuestion:  { seq: number[]; hideIdx: number; target: number; options: number[] }
AddTakeQuestion:      { a: number; b: number; op: '+' | '-'; target: number; options: number[] }

type AnyQuestion = HearTapQuestion | BuildNumberQuestion | EvenOddQuestion | NumberOrderQuestion | AddTakeQuestion
```

## 3. Question Loader Switch (lib/game-engine/question-loader.ts:9-18)

```typescript
switch (gameType) {
  case 'hear-tap':     return generateHearTapQuestions(count);
  case 'build-number': return generateBuildNumberQuestions(count);
  case 'even-odd':     return generateEvenOddQuestions(count);
  case 'number-order': return generateNumberOrderQuestions(count);
  case 'add-take':     return generateAddTakeQuestions(count);
  default:             return generateHearTapQuestions(count);
}
```

## 4. Engine Function Signatures

| Engine | Function | Signature |
|--------|----------|-----------|
| hear-tap | generateHearTapQuestion(s) | `(count?: number, max?: 20) => HearTapQuestion[]` |
| build-number | generateBuildNumberQuestion(s) | `(count?: number) => BuildNumberQuestion[]` |
| even-odd | generateEvenOddQuestion(s) | `(count?: number) => EvenOddQuestion[]` |
| number-order | generateNumberOrderQuestion(s) | `(count?: number) => NumberOrderQuestion[]` |
| add-take | generateAddTakeQuestion(s) | `(count?: number) => AddTakeQuestion[]` |

## 5. Game Routing (app/(child)/play/[gameType]/[lessonId]/page.tsx:26-32)

```typescript
const GAME_MAP: Record<GameType, React.ComponentType<GameProps>> = {
  'hear-tap': HearTapGame, 'build-number': BuildNumberGame, 'even-odd': EvenOddGame,
  'number-order': NumberOrderGame, 'add-take': AddTakeGame,
};
// Rendered: const GameComponent = GAME_MAP[validGameType];
```

## 6. AI Endpoint Handling (app/api/ai/generate-questions/route.ts:8-18)

```typescript
VALID_GAME_TYPES: ['hear-tap', 'build-number', 'even-odd', 'number-order', 'add-take']

QUESTION_SCHEMAS: Record<GameType, string> = {
  'hear-tap': '{"target": number, "options": number[4]}',
  'build-number': '{"target": number (11-70)}',
  'even-odd': '{"number": number (2-19), "isEven": boolean}',
  'number-order': '{"seq": number[5], "hideIdx": number (1-3), "target": number, "options": number[3]}',
  'add-take': '{"a": number, "b": number, "op": "+" | "-", "target": number, "options": number[4]}',
}

// AI prompt: `Generate ${count} ${gameType} questions at ${difficulty} difficulty...`
```

## 7. Design Files Available

**Directory:** `handoff/number-adventure/project/` (24 HTML files)

**Existing game UI files:**
- Build the Number Game UI.html
- Even or Odd House Game UI.html
- Hear & Tap Game UI.html
- Math Kitchen Game UI.html
- Number Order Game UI.html

**Missing:** count-objects, number-writing design files

## 8. Registry Refactor Changes (8 files)

### Files to Update (6):
1. `lib/types/common.ts` — Add `'count-objects' | 'number-writing'` to GameType union
2. `lib/game-engine/types.ts` — Add `CountObjectsQuestion` & `NumberWritingQuestion` interfaces, extend `AnyQuestion`
3. `lib/game-engine/question-loader.ts` — Add 2 switch cases + 2 imports
4. `app/(child)/play/[gameType]/[lessonId]/page.tsx` — Update `VALID_GAME_TYPES`, `GAME_MAP`, import 2 components
5. `app/api/ai/generate-questions/route.ts` — Add 2 types to `VALID_GAME_TYPES`, `QUESTION_SCHEMAS`, `isValidQuestion()` logic
6. `src/data/game-config/game-types.ts` — Add 2 `GameTypeConfig` entries

### Files to Create (4):
1. `lib/game-engine/count-objects-engine.ts` — export `generateCountObjectsQuestion(s)` & `generateCountObjectsQuestions(count)`
2. `lib/game-engine/number-writing-engine.ts` — export `generateNumberWritingQuestion(s)` & `generateNumberWritingQuestions(count)`
3. `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx` — React component accepting `GameProps`
4. `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx` — React component accepting `GameProps`

## 9. Open Questions

**CountObjects:**
- Visual representation? (images, emojis, SVG?)
- Interaction: tap-count, drag, or input?
- Payload structure? (e.g., `{ items: string[]; target: number; options: number[] }`)
- Number range per difficulty?

**NumberWriting:**
- Input mechanism? (handwriting, keypad, buttons?)
- Auto-validate or submit button?
- Payload structure? (e.g., `{ prompt: string; target: number; hint?: string }`)
- Number range per difficulty?

## Summary

**Current:** 5 hardcoded game types, no registry abstraction.  
**Refactor scope:** 8 files (6 updates + 2 engine files + 2 component files).  
**Blockers:** Design specs needed for count-objects & number-writing.  
**Pattern:** Add type → add question interface → add question payload schema → add engine → add component → add routing → add AI schema.
