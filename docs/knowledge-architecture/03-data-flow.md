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

## Child Switching Flow (Phase 3C)

```
1. Child taps avatar on home screen
   → ChildSwitcherModal opens (bottom sheet)
   → fetches /api/parent/children on modal open
   → renders list of parent's children

2. Parent taps child name
   → calls GameProgressContext.switchChild(childId, profile)
   → triggers SWITCH_CHILD reducer action:
       ├─ activeChildId ← childId
       ├─ currentWorldId ← null (reset to prevent stale state)
       ├─ sessionActive ← false (stop current session)
       └─ localStorage.setItem('bap-active-child', childId)
   → ChildSwitcherModal closes

3. UI re-renders
   → Home screen shows selected child's data
   → Profile stats refresh from DB
   → All game state reset for new child
```

## Encouragement Message Flow (Phase 3C)

```
Parent Action (creates message):
  1. Parent posts /api/parent/encouragement
     → { parentId, childId, message (1–200 chars) }
     → ownership verified (message.parentId === parentId)
     → saved to EncouragementMessage table
     → read = false (default)

Child Action (receives & reads):
  1. Child home screen loads
     → fetches /api/parent/encouragement?childId=...
     → unauthenticated endpoint; checks childId exists
     → returns latest unread message (order by createdAt DESC)

  2. EncouragementBanner renders
     → receives { messageId, childId, message, onDismiss }
     → displays soft card with parent message

  3. Child dismisses
     → calls PATCH /api/parent/encouragement
     → { id (messageId), childId }
     → ownership verified (message.childId === childId)
     → message.read = true
     → next load shows no banner (or next unread)
```

## Weekly Email Flow (Phase 3C)

```
Vercel Cron Trigger:
  Monday 09:00 UTC
  → GET /api/cron/weekly-report
  → Bearer: CRON_SECRET (env auth)

Endpoint Flow:
  1. Query Parent table
     → where emailReports = true
     → cursor pagination (50/batch) to prevent OOM

  2. Per parent:
     → Fetch children (all per parent)
     → Aggregate per child: session count, accuracy %, stars, streak
     → Sanitize parent name (strip CRLF for header injection safety)
     → Render weekly-report-template (React Email)
     → Call Resend.send(email)
     → Track: { sent: count, failed: count }

  3. Unsubscribe handling:
     → createUnsubscribeToken(parentId)
     → HMAC-SHA256 signed with CRON_SECRET
     → embed in email link: /api/parent/unsubscribe?token=...

  4. Return:
     → { sent: count, failed: count }

Unsubscribe endpoint:
  GET /api/parent/unsubscribe?token=<hmac>
  → verifyUnsubscribeToken(token) — timingSafeEqual check
  → Parent.emailReports = false
  → Redirect to /?unsubscribed=1
```

## Family Leaderboard Display (Phase 3C)

```
Parent Dashboard:
  1. Fetch /api/parent/children
     → list all children with totalStars (computed at fetch time)

  2. IF children.length >= 2:
     → <FamilyLeaderboard /> renders
     → sorts by totalStars (descending)
     → rank icons: 👑 (1st), 🥈 (2nd), 🥉 (3rd)

  3. Per child:
     → fetch /api/report/:childId
     → extract totalStars for latest session data
     → (Note: N+1 pattern; deferred to Phase 4 for server aggregation)

Display:
  ├─ Rank, child name, avatar color, total stars
  └─ Shows only when 2+ children in family
```
