# Component Map

## Atomic UI (`components/ui/`)

| Component | Props | Purpose |
|---|---|---|
| `Button` | `variant`, `size`, `onPress`, `disabled` | Primary tap action — large, rounded, child-friendly |
| `Card` | `children`, `elevated` | Content container with rounded corners |
| `NumberTile` | `value`, `onTap`, `state` (idle/correct/wrong) | Tappable number tile — core game element |
| `ProgressBar` | `value`, `max`, `color` | Round progress (stars earned per round) |
| `StarRating` | `stars` (1–3) | Star display after round completion |

## Game Components (`components/game/`)

| Component | Purpose |
|---|---|
| `GameContainer` | Shell: progress bar (top) + prompt (middle) + answers (bottom) |
| `QuestionDisplay` | Renders the question — number, sequence, or image |
| `AnswerGrid` | Grid of `NumberTile` or answer options |
| `FeedbackOverlay` | Flash correct/wrong state + audio trigger |
| `CelebrationScreen` | Full-screen overlay: confetti + mascot + sticker reward |
| `DragSlot` | Drop zone for Build the Number game |
| `AudioReplayButton` | Re-plays the spoken number prompt |

## Layout (`components/layout/`)

| Component | Purpose |
|---|---|
| `AppShell` | Root wrapper: background, safe area, audio provider |
| `IOSFrame` | iPhone frame wrapper for browser preview at 390×844 |
| `MascotBap` | Animated mascot — idle / celebrate / sad / thinking states |
| `WorldMapNode` | Clickable level node on world map |
| `ParentGate` | PIN overlay to enter parent area |

## Component Hierarchy (Child game flow)

```
AppShell
  └── (child)/game/[gameId]/page.tsx
        └── GameContainer
              ├── ProgressBar          ← top
              ├── MascotBap            ← contextual
              ├── QuestionDisplay      ← middle
              │     └── AudioReplayButton
              └── AnswerGrid           ← bottom
                    └── NumberTile[]
                          └── FeedbackOverlay (on answer)
                                └── CelebrationScreen (on round complete)
```
