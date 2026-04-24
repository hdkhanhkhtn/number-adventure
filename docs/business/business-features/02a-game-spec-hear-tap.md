# Mini-Game Spec: Hear & Tap (Audio-Visual Number Matching)

## Primary Learning Goal
- Develop number recognition via audio cues
- Build fluency with spoken English numbers
- Strengthen audio → visual matching skills

## Game Flow
1. Screen shows 2–4 large number tiles (colorful, tappable)
2. Mascot speech bubble: "Can you find thirty-two?"
3. Audio plays the number automatically
4. Replay button always visible for child to re-listen
5. Child taps a tile
6. Feedback:
   - **Correct:** Green flash, celebratory sound, confetti, advance
   - **Incorrect:** Red shake, try-again buzz, stay on same question
7. Max 3 attempts; after that, show hint or auto-advance

## Difficulty Progression
| Level | Range | Choices | Notes |
|-------|-------|---------|-------|
| Easy | 1–10 | 2 | Distinct numbers (e.g., 3 vs 8) |
| Medium | 1–20 | 3 | Some similarity (e.g., 12 vs 21) |
| Hard | 1–100 | 4 | Very similar (e.g., 32 vs 23 vs 30 vs 42) |

## UI Requirements
- Very large number tiles (56×56px+ minimum touch target)
- Clear audio replay button (speaker icon, always visible)
- Mascot speech bubble with question
- Minimal text; rely on audio guidance
- Clean, bright layout with no visual clutter

**Design Reference:** `Hear & Tap Game UI.html`

## Config Schema
```typescript
{
  type: "hear-tap",
  range: [1, 100],       // range of possible numbers
  numChoices: 4,         // 2-4 choices
  questionsPerRound: 5,
  difficulty: "easy" | "medium" | "hard"
}
```
