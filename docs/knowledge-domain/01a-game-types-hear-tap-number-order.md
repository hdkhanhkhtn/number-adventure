# Game Types: Hear & Tap and Number Order

## 1. Hear & Tap (Audio-Visual Matching)

**Learning Goal:** Develop number recognition via audio → visual matching. Build fluency with spoken numbers in English.

**Concept:** Audio plays a number in English → child taps the correct large number tile.

**Core Interaction:**
1. Screen shows 2–4 large number tiles (e.g., 32, 23, 30, 42)
2. Mascot speech bubble prompts: "Can you find thirty-two?"
3. Audio plays automatically; replay button always visible
4. Child taps tile → immediate feedback

**Difficulty Variants:**
- **Easy:** range 1–10, 2 choices, distinct numbers
- **Medium:** range 1–20, 3 choices
- **Hard:** range 1–100, 4 choices, visually similar numbers (e.g. 32 vs 23)

**Feedback States:**
- **Correct:** Green flash, celebratory sound, star animation, confetti
- **Incorrect:** Red shake animation, try-again buzz, encouragement message

**Design Notes:**
- Very large tappable number cards (min 48×48px touch target)
- Clear audio replay button (speaker icon)
- No visual clutter; minimal text
- Bright, clean interface
- Satisfying haptic feedback on correct answer

**Config:**
```typescript
{ 
  type: "hear-tap",
  range: [1, 10],      // easy: 1-10, medium: 1-20, hard: 1-100
  choices: 4,
  difficulty: "easy"
}
```

---

## 2. Number Order / Missing Number (Sequence Understanding)

**Learning Goal:** Develop counting sequence understanding, number order, and missing number pattern recognition.

**Concept:** A horizontal sequence with one blank → child taps or fills the correct missing number.

**Core Interaction:**
1. Sequence shown horizontally: `18  19  __  21` or `10  20  __  40`
2. Three answer choices displayed below
3. Optional visual metaphor (train cars, stepping stones, rainbow path)
4. Child taps the correct number
5. Correct → next question; Wrong → shake + encourage try again

**Game Variants:**
- **Type A (Missing Number):** Fill blank in sequence (e.g., 18, 19, __, 21)
- **Type B (Put in Order):** Drag number cards into correct sequence order

**Difficulty Variants:**
- **Easy:** Simple 1-step forward (e.g., 1, 2, __, 4)
- **Medium:** Counting by tens (e.g., 10, 20, __, 40)
- **Hard:** Counting by hundreds (e.g., 100, 200, __, 400), missing middle number

**Design Notes:**
- Clear sequence slots with visual spacing
- Very large colorful number cards
- Empty slot visually distinct (lighter color, outlined)
- Mascot guidance message
- Optional animated visual support (train moving, stones lighting)
- Satisfying completion celebration

**Config:**
```typescript
{ 
  type: "number-order",
  sequenceLength: 5,
  missingIndex: 2,
  step: 1,           // easy: 1, medium: 2, hard: skip patterns
  difficulty: "easy"
}
```
