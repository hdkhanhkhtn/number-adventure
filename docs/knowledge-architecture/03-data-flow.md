# Data Flow

## Lesson Start Flow

```
1. Child taps lesson on world map
   → /play/[gameType]/[lessonId]
   → useGame hook initializes

2. Check AI cache
   → /api/sessions/start (POST)
   → creates GameSession in DB
   → queries AIQuestion table for lesson
   → IF no cached questions:
       → /api/ai/generate (POST)
       → calls https://9router.../v1
       → validates response JSON
       → saves to AIQuestion table
   → ELSE: reuse cached questions

3. Load into React state
   → GameProgressContext.setSession()
   → questions[] array set
   → renderQuestion(0)
```

## Game Round Flow

```
1. Question display
   → AnswerGrid renders with choices
   → AudioService.speak(prompt) via Web Speech API
   → Howler.js plays optional background

2. Child taps answer
   → AnswerGrid.onAnswer(value)
   → answer-validator.check(value, correctAnswer)
   → FeedbackOverlay shows correct/wrong
   → /api/sessions/attempt (POST)
   → saves GameAttempt to DB
   → AudioService.play(sfx)

3. Next question
   → GameProgressContext.advance()
   → repeat until all questions done

4. Round complete
   → calculate stars, accuracy
   → /api/sessions/complete (POST)
   → updates GameSession.completedAt, stars
   → checks for sticker unlocks
   → CelebrationScreen renders
   → AudioService.play("celebrate")

5. Return to home
   → useProgress hook fetches latest from /api/progress
   → ProgressContext updates with DB state
   → World map re-renders with updated stars
```

## AI Generation Flow

```
/api/ai/generate (POST)
  ├─ Input: { lessonId, gameType, difficulty }
  ├─ Check AIQuestion cache
  ├─ IF cache miss:
  │   ├─ Build prompt per gameType
  │   ├─ POST to https://9router.../v1
  │   │  └─ model: "advance-model"
  │   ├─ Validate response (JSON schema)
  │   ├─ Save to AIQuestion table
  │   └─ Return cached questions
  └─ IF cache hit:
      └─ Return 5-10 stored questions
```

## Audio Flow

```
AudioService (browser)
  ├─ Web Speech API (default)
  │  └─ playText(prompt)
  ├─ Howler.js (SFX)
  │  ├─ play("correct")
  │  ├─ play("wrong")
  │  ├─ play("celebrate")
  │  └─ play("tap")
  └─ Optional: Google TTS
     └─ playFile(audioUrl)

Fallback:
  IF Web Speech fails → silent mode (visual feedback only)
```

## Database-Driven State

```
App boot:
  1. /api/auth/session → get current child
  2. /api/progress → fetch GameSession[], streak, stickers
  3. GameProgressContext.setState(data)
  4. Home screen re-renders with DB data

Session state:
  ├─ ProgressContext (cache of last fetch)
  ├─ API responses stored in Context
  └─ localStorage as fallback (opt)

Persistence:
  ├─ Every /api/* call updates DB
  ├─ Context syncs with latest response
  └─ Authoritative source = PostgreSQL
```

## Streak System

```
On GameSession.complete:
  → check last activity date
  → IF today: increment streak
  → IF yesterday: keep streak
  → IF older: reset streak
  → update Streak table
  → ProgressContext updates
  → StreakCard component re-renders

Display:
  ├─ Home screen (StreakCard)
  ├─ Parent dashboard (StreakCard)
  └─ Reward screen (StreakCard)
  NO separate /progress/streak route in MVP
```
