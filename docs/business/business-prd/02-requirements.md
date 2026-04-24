# Requirements

## Functional Requirements

### Child Experience

| ID | Requirement |
|---|---|
| F01 | Child can access home screen without login |
| F02 | Home screen shows mascot Bắp, daily greeting, and streak count |
| F03 | World map shows all worlds and levels with lock/unlock state |
| F04 | Tapping a level starts the corresponding mini-game |
| F05 | Each game session has 5 questions per round |
| F06 | Correct answer → positive audio feedback + score increment |
| F07 | Wrong answer → gentle audio feedback + retry (no penalty) |
| F08 | Round completion → star rating + celebration screen |
| F09 | Sticker earned → sticker reveal animation |
| F10 | All interactions have audio feedback |
| F11 | Numbers are spoken aloud (voice audio) where applicable |

### Mini-Games

| ID | Requirement |
|---|---|
| F12 | Hear & Tap: audio plays number, child taps matching tile |
| F13 | Number Order: sequence shown with gap, child fills missing number |
| F14 | Build the Number: drag digits into slots to form target number |
| F15 | Even or Odd: classify number by tapping correct house |
| F16 | Math Kitchen: solve addition/subtraction, tap correct answer |

### Parent Experience

| ID | Requirement |
|---|---|
| F17 | Parent area protected by 4-digit PIN |
| F18 | Dashboard shows total stars, levels completed, today's play time |
| F19 | Progress details show per-game performance |
| F20 | Settings: toggle audio, set difficulty override, change PIN |

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF01 | First contentful paint < 2s on 4G mobile |
| NF02 | Game interactions respond < 100ms (tap to audio) |
| NF03 | Works offline (no network dependency in MVP) |
| NF04 | Runs on iOS Safari 15+ and Android Chrome 100+ |
| NF05 | Accessible: min 48×48px touch targets throughout |
| NF06 | No external network calls during gameplay |
| NF07 | localStorage data survives app close/reopen |
