# Feature List (MoSCoW)

## Must Have (MVP)

| ID | Feature | Screen |
|---|---|---|
| M01 | Child home screen with mascot + greeting | `/child/home` |
| M02 | World map with level nodes + lock state | `/child/world` |
| M03 | Hear & Tap mini-game | `/child/game/hear-tap` |
| M04 | Number Order mini-game | `/child/game/number-order` |
| M05 | Build the Number mini-game | `/child/game/build-number` |
| M06 | Even or Odd mini-game | `/child/game/even-odd` |
| M07 | Math Kitchen mini-game | `/child/game/math-kitchen` |
| M08 | Star rating (1–3) per round | shared |
| M09 | Sticker reward on level complete | shared |
| M10 | Celebration screen (confetti + mascot) | overlay |
| M11 | Daily streak counter on home | home |
| M12 | Progress persistence (localStorage) | global |
| M13 | Audio SFX for all interactions | global |
| M14 | Voice pronunciation for numbers | game screens |
| M15 | Parent gate (4-digit PIN) | `/parent` |
| M16 | Parent dashboard — overview | `/parent/dashboard` |
| M17 | Parent settings (audio, difficulty, PIN) | `/parent/settings` |

## Should Have

| ID | Feature |
|---|---|
| S01 | Sticker collection screen (view all earned stickers) |
| S02 | Daily progress & streak detail screen |
| S03 | Parent progress details (per-game breakdown) |
| S04 | Difficulty auto-adjustment based on performance |
| S05 | iOS frame wrapper for browser preview |

## Could Have

| ID | Feature |
|---|---|
| C01 | Background ambient music |
| C02 | Multiple mascot emotion states (happy, sad, thinking) |
| C03 | Onboarding / intro screen for first-time users |
| C04 | Accessibility: high-contrast mode |

## Won't Have (MVP)

| Feature | Reason |
|---|---|
| User accounts / cloud sync | Backend complexity, privacy |
| In-app purchases | Out of scope |
| Multiplayer | Phase 3 |
| Push notifications | Requires native app |
| Ads | Child-safe policy |
