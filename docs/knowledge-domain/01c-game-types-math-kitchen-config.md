# Game Types: Math Kitchen, Common Config & Feedback Patterns

## 5. Math Kitchen / Add & Take Away (Early Arithmetic)

**Learning Goal:** Introduction to addition and subtraction through visual and story-based interactions.

**Concept:** Objects being added or taken away → child answers the result.
- Examples: 3 apples + 2 apples = ?
- Examples: 5 cookies - 1 cookie = ?

**Interaction Styles:**
1. **Visual Counting:** Show objects, ask result; answer via buttons
2. **Drag to Build:** Add more objects into a bowl/plate
3. **Remove & Count:** Take away objects, count what remains
4. **Story Prompt:** Large illustration + simple equation display

**Theme (Cozy Context):**
- Kitchen / cooking metaphor
- Picnic or snack time
- Feeding a character
- Simple recipe-style presentation: "3 + 4 = ?"

**Core Interaction:**
1. Equation shown: `3 + 4 = ?` (or visual equivalent)
2. Four answer choices displayed as large buttons (or themed objects)
3. Child taps correct answer
4. Correct → cooking animation + ding sound
5. Wrong → shake + encouragement

**Difficulty Variants:**
- **Easy:** Addition only, operands 1–5, sum ≤ 10
- **Medium:** Addition operands 1–10
- **Hard:** Addition + subtraction mixed, range 1–20

**Design Notes:**
- Large central illustration area
- Simple, clear equation display
- Highly engaging but calm (not overstimulating)
- Visual quantity support (objects, tallies)
- Optional audio prompt
- Answer choices as large tappable buttons
- Warm, food-themed visual language

**Config:**
```typescript
{ 
  type: "math-kitchen",
  operation: "add",      // "add" or "subtract"
  operands: [3, 4],
  choices: 4,
  difficulty: "easy"
}
```

---

## Common Game Config Fields

```typescript
type GameConfig = {
  type: GameType
  difficulty: "easy" | "medium" | "hard"
  questionsPerRound: number    // default: 5, typical range 3-7
  timeLimit?: number           // seconds, optional (no hard limit for preschool)
  audioEnabled: boolean        // default: true
  showHints: boolean           // default: true
  showMascot: boolean          // default: true
}
```

---

## Feedback & Encouragement Patterns

### Correct Answer
- Green flash + celebratory sound (ding, chime)
- Framer Motion scale animation: 1 → 1.2 → 1 (200ms ease-out)
- Optional confetti or star burst
- Short encouraging message: "Great job!", "You did it!"
- Immediate progression to next question (no delay)

### Incorrect Answer
- Red shake animation (±8px, 300ms)
- Try-again buzz sound (gentle, not punishing)
- Encouraging message: "Try again!", "Almost there!"
- Tiles/cards remain visible for retry
- Never show: "Wrong!", shame, or penalty scoring
- Max 3 retries before showing hint or auto-advancing

### Session Structure
- Typical session: 5 questions per round
- Short game loops: 30 seconds to 2 minutes per question
- No fixed time pressure (preschool children work at own pace)
- Break between rounds with reward/progress feedback
