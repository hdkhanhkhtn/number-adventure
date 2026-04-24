# Mini-Game Spec: Even or Odd (Number Classification & Grouping)

## Primary Learning Goal
- Introduce the concept of even and odd numbers
- Develop intuitive understanding through pairing/grouping visuals
- Build number classification skills

## Game Flow (Two Pedagogical Modes)

### Mode 1: Visual Pairing Intro (Teaching Phase)
1. Objects displayed (apples, stars, socks, etc.)
2. Child sees pairing:
   - Even: Objects pair perfectly with none left over
   - Odd: One object left unpaired
3. "This is EVEN — see, they pair up perfectly!"
4. "This is ODD — one left by itself!"

### Mode 2: Number Sorting (Game Phase)
1. A large number appears in center
2. Two destination areas (cute houses, baskets, or gates)
   - Left: "Even House" (blue/cool color)
   - Right: "Odd House" (coral/warm color)
3. Child taps or drags number to correct destination
4. Feedback:
   - **Correct:** Number flies into house with celebration animation
   - **Incorrect:** Number bounces back, "Try again!"
5. Progresses through 5 questions

## Difficulty Progression
| Level | Range | Notes |
|-------|-------|-------|
| Easy | 1–10 | Clear even/odd divide |
| Medium | 1–20 | Slightly less obvious |
| Hard | 1–50 | Requires conceptual understanding |

## Visual Theme Options
- Two cute houses (even/odd neighborhoods)
- Bridge with two gates (sort as you cross)
- Two baskets or doors
- Two character homes (even character / odd character)

## UI Requirements
- Two large, visually distinct destination areas
- Clear color coding per category (cool vs. warm)
- Large number cards (draggable or tappable)
- Mascot explanation: "Sort numbers into Even or Odd"
- Low cognitive load; focus on sorting task

## Interaction
- Tap to sort (simpler, for younger children)
- OR Drag & drop (more interactive, older children)
- Both modes should be supported

**Design Reference:** `Even or Odd House Game UI.html`

## Config Schema
```typescript
{
  type: "even-odd",
  range: [1, 20],              // easy: 1-10, medium: 1-20, hard: 1-50
  numQuestions: 5,
  interactionMode: "tap" | "drag",
  showPairingIntro: true,
  difficulty: "easy" | "medium" | "hard"
}
```
