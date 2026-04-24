# Mini-Game Spec: Number Order / Missing Number (Sequence & Counting)

## Primary Learning Goal
- Develop understanding of number sequences and counting patterns
- Recognize missing numbers in a sequence
- Build fluency with counting by 1s, 10s, 100s

## Game Flow
1. Horizontal sequence displayed: `18  19  __  21` or `10  20  __  40`
2. Three answer choices shown below
3. Optional visual metaphor: number train, stepping stones, bridge tiles
4. Child taps the correct missing number
5. Feedback:
   - **Correct:** Tile lights up, number "flies" into place, celebratory sound
   - **Incorrect:** Bounce back animation, encouragement
6. Progresses through 5 questions per round

## Game Variants

### Variant A: Missing Number (Blank Fill)
- Sequence with one blank slot
- Child identifies what goes in the gap
- Example: 18, 19, __, 21 → answer 20

### Variant B: Put in Order (Reordering)
- Cards show out of sequence
- Child drags cards to arrange in correct order
- More advanced interaction (drag & drop)

## Difficulty Progression
| Level | Description | Example |
|-------|-------------|---------|
| Easy | Simple forward sequence, missing at beginning/end | 1, 2, __, 4 |
| Medium | Counting by tens, missing in middle | 10, 20, __, 40 |
| Hard | Counting by hundreds, larger gaps | 100, 200, __, 400 |

## UI Requirements
- Clear sequence slots with distinct spacing
- Large, colorful number cards (draggable or tappable)
- Empty slot visually distinct (outlined, lighter color)
- Optional animated sequence metaphor (train, path, etc.)
- Mascot guidance message

## Visual Polish
- Animated feedback when correct (tile slides in, satisfying sound)
- Encouraging hint messages after wrong attempts
- Progress through sequence (visual progress line)

**Design Reference:** `Number Order Game UI.html`

## Config Schema
```typescript
{
  type: "number-order",
  variant: "missing" | "reorder",
  sequenceLength: 5,
  step: 1 | 2 | 5 | 10 | 100,  // counting step
  missingPosition: "start" | "middle" | "end",
  questionsPerRound: 5,
  difficulty: "easy" | "medium" | "hard"
}
```
