# Business Rules

## Difficulty Progression

| Rule | Detail |
|---|---|
| Default difficulty | `easy` for first play of any level |
| Auto-advance | After 3 consecutive ≥3-star rounds → bump to `medium` |
| Auto-reduce | After 2 consecutive <2-star rounds → drop back to `easy` |
| Manual override | Parent can set fixed difficulty in Settings |

**Score → Stars mapping:**

| Correct % | Stars |
|---|---|
| ≥ 90% | 3 stars |
| 70–89% | 2 stars |
| < 70% | 1 star |

## Level Unlocking

- Level N+1 unlocks when Level N is completed (any star count)
- World N+1 unlocks when all levels in World N earn ≥ 1 star
- Locked levels show a padlock on the world map

## Reward Triggers

| Event | Reward |
|---|---|
| First completion of any level | 1 sticker |
| 3-star on a level (first time) | 1 bonus sticker |
| 7-day streak | Special mascot badge |
| All levels in a world completed | World trophy sticker |

## Streak Rules

- Streak increments if child plays at least 1 level per calendar day
- Streak resets if a full calendar day is skipped
- Streak displayed on home screen (motivational, not punitive in UX)

## Parent Gate

- Parent area locked behind a 4-digit PIN (set on first access)
- No PIN set → prompt to create one on first tap of parent icon
- Wrong PIN 3× → 30-second lockout (prevents child brute-force)
- PIN stored in localStorage (hashed with simple XOR — not security-critical, UX only)

## Audio Rules

- Audio enabled by default
- Parent can toggle audio in Settings
- Voice pronunciation uses local audio files (no network request)
- Audio plays even if device is on silent (Web Audio API, not Media session)
