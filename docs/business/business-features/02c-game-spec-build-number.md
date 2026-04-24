# Mini-Game Spec: Build the Number (Place Value & Multi-Digit Understanding)

## Primary Learning Goal
- Understand place value (tens and ones, later hundreds)
- Build multi-digit numbers using place value blocks
- Develop intuitive sense of number structure

## Game Flow
1. Target number shown prominently at top: `24`
2. Below: draggable digit or block tiles: `[2] [5] [3] [1]` (or tens/ones blocks)
3. Child drags correct digits/blocks into drop zones (2 slots for tens/ones)
4. Once correctly placed:
   - Check button to submit (or auto-validate)
   - **Correct:** Celebration animation, "You built 24! 2 tens and 4 ones!"
   - **Incorrect:** Feedback, encourage re-arrange
5. Progresses through varied target numbers

## Montessori-Inspired Approach
- Visual tens/ones distinction via block color and size
- Soft color coding for each place value (e.g., blue = tens, coral = ones)
- Visual representation: 2 long bars (tens) + 4 small cubes (ones)
- Counting support to help verify

## Difficulty Progression
| Level | Range | Place Values |
|-------|-------|-------------|
| Easy | 1-digit | Intro to tens/ones concept |
| Medium | 10–99 | Clear tens/ones structure |
| Hard | 100–999 | Add hundreds place value |

## Game Variants
1. **Visual blocks:** Drag physical tens/ones blocks (visual Montessori style)
2. **Digit cards:** Drag digit tiles into slots (more abstract, slightly harder)
3. **Audio prompt:** "Build the number forty-seven" → child constructs
4. **Match to target:** Built representation matches written number

## UI Requirements
- Target number large and clear (48px+ font)
- Draggable tiles/blocks clearly distinct by place value
- Drop zones outlined, receptive (highlight on drag-over)
- Satisfying snap-to-zone animation
- No clutter; focus on the building task

## Interaction Specifics
- Drag & drop (HTML5 or @dnd-kit)
- Visual snap feedback (hover states on drop zones)
- Auto-check or manual check button
- Hint option: "Try 2 tens and 4 ones" with visual guide

**Design Reference:** `Build the Number Game UI.html`

## Config Schema
```typescript
{
  type: "build-number",
  targetRange: [10, 99],          // range of target numbers
  placeValues: ["tens", "ones"],  // easy: ones only, hard: hundreds
  numSlots: 2,
  questionsPerRound: 5,
  difficulty: "easy" | "medium" | "hard",
  showHint: boolean
}
```
