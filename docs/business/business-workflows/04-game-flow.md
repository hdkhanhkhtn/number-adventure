# In-Game Flow

## Universal Game Loop

```
GamePage mounts
  │
  ├── useGame(gameId, levelId) initializes
  │     ├── Load GameConfig from data/game-config/
  │     ├── Load Level from data/levels/
  │     └── question-generator.generate(config) → Question[5]
  │
  ├── Round state: { currentQ: 0, correct: 0, results: [] }
  │
  └── LOOP (5 questions):
        │
        ├── QuestionDisplay renders Question[currentQ]
        │     └── Audio plays prompt (Hear & Tap only)
        │
        ├── Child interacts (tap / drag)
        │     │
        │     ├── answer-validator.check(answer, question)
        │     │
        │     ├── CORRECT
        │     │     ├── FeedbackOverlay: green flash
        │     │     ├── AudioContext.play("correct")
        │     │     ├── state.correct++
        │     │     └── advance to next question
        │     │
        │     └── WRONG
        │           ├── FeedbackOverlay: red shake
        │           ├── AudioContext.play("wrong")
        │           └── same question repeats (no penalty to score)
        │
        └── [currentQ === 5] → Round Complete
```

## Round Complete → Reward Flow

```
Round complete
  │
  ├── Calculate stars: correct/5 → accuracy% → star rating
  ├── Calculate sticker: first completion OR first 3-star?
  │
  ├── CelebrationScreen mounts
  │     ├── AudioContext.play("celebrate")
  │     ├── Stars animate in (1 → 2 → 3 with delays)
  │     └── If sticker: reveal animation + AudioContext.play("sticker")
  │
  ├── ProgressContext.save(levelId, { stars, score, completedAt })
  │     └── localStorage updated
  │
  └── Child chooses:
        ├── [Play Again] → reset round state, new Question[] generated
        └── [Back to Map] → navigate to /child/world
```

## Audio Replay (Hear & Tap only)

```
AudioReplayButton visible during question
  └── [Tap] → AudioContext.speak(promptNumber)
        └── Debounced 500ms (prevent spam)
```

## Drag Interaction (Build the Number only)

```
DraggableDigit onDragStart → sets dragging state
DropSlot onDrop(digit) → fills slot
  └── All slots filled? → Show confirm button
        └── [Confirm] → validate digit sequence → correct/wrong feedback
```
