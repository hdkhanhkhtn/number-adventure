# Actor Map

## Actors

| Actor | Description | Entry Point |
|---|---|---|
| **Child** | Primary user, age 3–7, pre/early reader | `/child/home` (default) |
| **Parent** | Secondary user, supervises & configures | `/parent` (PIN-gated) |
| **System** | Game engine, progress tracker, audio engine | Background |

## Child Capabilities

- Navigate home → world map → game → back
- Play any unlocked mini-game
- Earn stars and stickers
- View sticker collection
- See daily streak on home screen
- Replay audio prompt in games

## Parent Capabilities

- Enter parent area (PIN required)
- View child's progress dashboard
- View per-game performance details
- Toggle audio on/off
- Set difficulty override
- Set daily play time limit
- Change PIN
- Reset all progress (destructive)

## System Responsibilities

- Generate questions per game config
- Validate answers
- Calculate star rating per round
- Determine sticker rewards
- Persist progress to localStorage
- Manage difficulty auto-adjustment
- Play audio SFX and voice

## Actor Boundaries

```
Child ──► Child screens (home, world, game)
              │
              └── Parent icon (small, low-prominence)
                      │
                      ▼
Parent ──► PIN gate ──► Parent screens (dashboard, settings)
                              │
                              └── Cannot access child game screens
                                  (separate route group)
```
