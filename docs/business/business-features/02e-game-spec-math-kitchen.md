# Mini-Game Spec: Math Kitchen / Add & Take Away (Early Arithmetic)

## Primary Learning Goal
- Introduction to addition and subtraction
- Visual and story-based arithmetic learning
- Build intuitive number sense in context

## Game Flow
1. Cozy kitchen or food-themed scene
2. Equation shown visually: `3 apples + 2 apples = ?`
   - OR narrative: "There are 3 cookies. You add 2 more. How many now?"
3. Visual quantity support (objects shown, optional counting aid)
4. Four answer choices displayed as large buttons or themed objects
5. Child taps the correct answer
6. Feedback:
   - **Correct:** Cooking animation (mixing bowl, plate appearing), ding, mascot celebration
   - **Incorrect:** Gentle shake, "Try again! Think about it..."
7. Progresses through 5 questions

## Interaction Variants
1. **Visual Counting:** Show objects, ask result
2. **Drag to Build:** Add more objects into a bowl (interactive)
3. **Remove & Count:** Show removal, count what remains
4. **Story Context:** Narrative + equation (food theme, cooking metaphor)

## Theme & Context (Cozy, Warm)
- Kitchen / cooking metaphor (recipe-style)
- Picnic or snack time
- Feeding a character or animal
- Food items (apples, cookies, carrots, etc.)
- Simple, warm illustrations

## Difficulty Progression
| Level | Operation | Operands | Max Result |
|-------|-----------|---------|------------|
| Easy | Addition only | 1–5 | 10 |
| Medium | Addition | 1–10 | 20 |
| Hard | Mixed add + subtract | 1–20 | More complex |

## UI Requirements
- Large central illustration area (recipe scene)
- Simple, clear equation display (or story prompt)
- Highly visual quantity support
- Large answer choice buttons (48×48px+ minimum)
- Warm, food-themed color palette
- Optional audio prompt: "How many apples are there altogether?"

## Interaction Specifics
- Answer buttons as large, tappable tiles
- Visual counting support (tallies, grouping)
- Optional hint: "Let's count together..."
- Encouraging tone throughout

**Design Reference:** `Math Kitchen Game UI.html`

## Config Schema
```typescript
{
  type: "math-kitchen",
  operation: "add" | "subtract" | "mixed",
  operandRange: [1, 10],        // easy: 1-5, hard: 1-20
  maxResult: 20,
  numChoices: 4,
  questionsPerRound: 5,
  showVisualSupport: true,
  difficulty: "easy" | "medium" | "hard"
}
```
