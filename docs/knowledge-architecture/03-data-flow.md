# Data Flow

## State Architecture

```
localStorage ──► ProgressContext (React Context)
                      │
                 useProgress hook
                      │
              GamePage ──► useGame hook
                                │
                         game-engine/
                           question-generator
                           answer-validator
                           difficulty-calculator
                                │
                         GameContainer + children
```

## Game Round Flow

```
1. Page load
   → useGame(gameId, levelId)
   → game-engine generates Question[]
   → QuestionDisplay renders Q[0]

2. Child taps answer
   → AnswerGrid.onAnswer(value)
   → answer-validator.check(value, correctAnswer)
   → FeedbackOverlay shows correct/wrong
   → AudioContext.play(sfx)

3. Next question
   → useGame.advance()
   → repeat until questionsPerRound done

4. Round complete
   → RoundResult calculated (stars, score)
   → CelebrationScreen shown
   → ProgressContext.save(levelId, result)
   → localStorage updated

5. Return to world map
   → World map re-renders with updated stars
```

## Audio Flow

```
AudioContext (singleton, initialized once)
  ├── useAudio() hook — exposed to all components
  ├── play(sfxKey)    — fire-and-forget SFX
  └── speak(number)   — queued voice pronunciations

Trigger points:
  - Page load          → ambient bg music (optional)
  - Question render    → speak(promptNumber) for Hear & Tap
  - NumberTile tap     → play("tap")
  - Correct answer     → play("correct") + speak(number)
  - Wrong answer       → play("wrong")
  - Round complete     → play("celebrate")
  - Sticker unlock     → play("sticker")
```

## Persistence Flow

```
ProgressContext.save(levelId, result)
  → merge into ProgressStore
  → JSON.stringify
  → localStorage.setItem("bap-progress", ...)

ProgressContext.load() [on app start]
  → localStorage.getItem("bap-progress")
  → JSON.parse
  → validate schema
  → set state
```
