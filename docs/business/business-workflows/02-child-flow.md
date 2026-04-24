# Child User Flow

## Main Journey

```
App opens
  └── /child/home
        ├── Mascot Bắp greets child (audio)
        ├── Streak count shown
        └── [Tap "Play"] ──► /child/world

/child/world (World Map)
  ├── Shows worlds 1..N
  ├── Each world has level nodes (locked/unlocked/completed)
  └── [Tap unlocked level] ──► /child/game/[gameId]?level=[levelId]

/child/game/[gameId]
  ├── GameContainer loads
  ├── Round starts: 5 questions
  │     ├── Question displayed + audio
  │     ├── Child taps/drags answer
  │     │     ├── Correct → feedback → next question
  │     │     └── Wrong → shake → retry same question
  │     └── [5 questions done]
  └── CelebrationScreen
        ├── Stars animated in (1–3)
        ├── Sticker revealed (if earned)
        └── CTA:
              ├── [Play Again] → restart same level
              └── [Back to Map] → /child/world
```

## First-Time Flow

```
First launch
  └── /child/home
        └── (optional) Intro/onboarding screen
              └── Mascot explains how to play
                    └── → /child/world (World 1 unlocked, all else locked)
```

## Sticker Collection Access

```
/child/home
  └── [Tap sticker album icon] ──► /child/stickers
        └── Grid of earned stickers (empty slots for unearned)
              └── [Back] → /child/home
```

## Navigation Rules

- No back button during active game (prevents accidental exit)
- Home button always accessible on world map
- Parent icon on home screen (subtle, lower corner)
