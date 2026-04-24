# Parent User Flow

## Entry Flow

```
/child/home
  └── [Tap lock icon (subtle)] ──► /parent (PIN Gate)
        ├── PIN not set → create PIN flow
        │     └── Enter 4 digits → confirm → /parent/dashboard
        └── PIN set → enter PIN
              ├── Correct → /parent/dashboard
              └── Wrong (3×) → 30s lockout screen
```

## Dashboard Flow

```
/parent/dashboard
  ├── Today's summary card (time played, levels done)
  ├── Streak card
  ├── Overall progress bar
  ├── Game breakdown (5 mini-games × stars)
  ├── Recent activity list
  └── Nav:
        ├── [Details] → /parent/progress
        └── [Settings] → /parent/settings
```

## Progress Details Flow

```
/parent/progress
  ├── World/level grid with star states
  ├── Per-game accuracy chart
  ├── 7-day session time chart
  └── [Back] → /parent/dashboard
```

## Settings Flow

```
/parent/settings
  ├── Audio toggle (on/off)
  ├── Volume slider
  ├── Difficulty selector (Auto / Easy / Medium / Hard)
  ├── Daily limit selector
  ├── [Change PIN] → enter old → enter new → confirm
  ├── [Reset Progress] → confirmation dialog → clear localStorage
  └── [Back] → /parent/dashboard
```

## Exit Parent Area

```
Any parent screen
  └── [Back / Home] → returns to /child/home
        (no PIN required to exit, only to enter)
```
