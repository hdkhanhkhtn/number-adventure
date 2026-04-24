# Testing Standards

## Stack

- **Jest** — test runner
- **@testing-library/react** — component testing
- **@testing-library/user-event** — simulating user interactions

## What to Test

### Must test (unit)

| Module | What |
|---|---|
| `lib/game-engine/question-generator.ts` | Generates correct question types, range bounds, no duplicate answers |
| `lib/game-engine/answer-validator.ts` | Correct/wrong detection for each game type |
| `lib/game-engine/difficulty-calculator.ts` | Difficulty advances/drops based on history |
| `lib/utils/number-helpers.ts` | `isEven`, `randomInRange`, `shuffle`, `generateSequence` |
| `lib/utils/storage.ts` | Load/save/validate ProgressStore |

### Should test (component)

| Component | What |
|---|---|
| `NumberTile` | Renders value, fires onTap, shows correct/wrong state |
| `AnswerGrid` | Renders choices, calls onAnswer with correct value |
| `ProgressBar` | Correct width calculation |
| `GameContainer` | Renders all 3 zones (progress, prompt, answers) |

### Skip (too coupled to browser/audio)

- Audio playback (mock `useAudio`)
- Drag & drop (test logic separately, not browser DnD)
- Animations (Framer Motion mocked)

## File Naming

```
lib/game-engine/__tests__/question-generator.test.ts
components/ui/__tests__/NumberTile.test.tsx
```

## Coverage Targets

| Area | Target |
|---|---|
| `lib/game-engine/` | ≥ 90% |
| `lib/utils/` | ≥ 90% |
| `components/ui/` | ≥ 70% |
| `components/game/` | ≥ 60% |

## Running Tests

```bash
npm test                    # watch mode
npm test -- --coverage      # with coverage report
npm test -- --testPathPattern=game-engine  # filter
```

## Test Data Builders

Create factory functions in `__tests__/factories.ts`:

```typescript
export const makeQuestion = (overrides = {}): Question => ({
  id: "q1",
  prompt: 5,
  correctAnswer: 5,
  choices: [3, 5, 7, 9],
  ...overrides
})
```
