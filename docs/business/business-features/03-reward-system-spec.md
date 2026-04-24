# Reward System Specification

## Overview

The reward system reinforces learning progress without creating pressure. All rewards feel earned, celebratory, and encouraging. Three main reward types: stars (feedback on performance), stickers (collectibles), and streaks (consistency encouragement).

## Stars (Performance Feedback)

**Purpose:** Provide immediate feedback on accuracy; reward good performance; encourage mastery.

**Earning Rules:**
- Earned per round (5 questions = 1 round)
- Based on accuracy percentage
- Persist on world map level nodes (best star count displayed, not overwritten)

**Star Tiers:**
| Accuracy | Award | Meaning |
|---|---|---|
| ≥ 90% | ⭐⭐⭐ | Perfect! Master level |
| 70–89% | ⭐⭐ | Great effort! Keep improving |
| ≤ 70% | ⭐ | Good try! Keep practicing |

**Star Display:**
- Animated count-up (stars appear one-by-one with sound)
- Shown on celebration screen immediately after round
- Persistent on world map level nodes (visual record of best performance)
- Total stars shown on parent dashboard (aggregate progress metric)

**Audio:**
- 1 star: Single ding
- 2 stars: Double ding with ascending pitch
- 3 stars: Triple ding + celebration sound + confetti

## Stickers (Collectible Rewards)

**Purpose:** Create a fun collection goal; reward milestone achievements; drive engagement through variety.

**Sticker Count:** 20+ unique stickers in MVP (one per level + bonuses)

**Earning Rules:**
- **Level completion:** 1 sticker for completing any level (first time)
- **Bonus sticker:** Extra sticker for first 3-star completion of a level
- **Streak milestones:** Special sticker at 3-day and 7-day streaks
- **World unlocks:** Special sticker when unlocking new world

**Sticker Reveal:**
- Animated "scratch/peel" reveal on celebration screen
- Satisfying animation: scratch effect reveals sticker design
- Magical reveal sound (sparkle/shimmer)
- Shows sticker name and world theme
- Option to view sticker immediately or continue playing

**Sticker Collection Screen:**
- Organized by world theme
- Can view locked stickers (hint at what's coming)
- Sticker stats: how many collected, how many remaining
- Share option (parent dashboard feature)

**Design Reference:** `Reward & Celebration Screens.html`, `Sticker Collection Screen.html`

## Celebration Screen (End-of-Round Reward)

**Trigger:** After 5 questions completed (round end)

**Screen Flow:**
1. Full-screen overlay with dark semi-transparent background
2. Animated mascot Bắp in celebrate pose (jump, dance, or arms up)
3. Confetti particles animate downward (light, festive, not overwhelming)
4. Star rating animates in: stars appear one-by-one
5. Celebration text: "Great job!", "You're amazing!", "Fantastic round!"
6. If sticker earned: sticker reveal animation (scratch effect)
7. Round stats (optional): Accuracy %, games correct, bonus earned
8. CTAs: "Play Again" (next level) / "Back to Map" (world map)

**Animation Sequence (3–4 seconds total):**
- Confetti fade-in (200ms)
- Mascot appears + jump animation (300ms)
- Stars animate in one-by-one (600ms total)
- Sticker reveal (if earned, 800ms)
- Fade in CTAs (300ms)

**Audio:**
- Celebrate jingle (cheerful, uplifting, 2–3 seconds)
- Star sounds (ding sounds per star count)
- Sticker reveal sound (sparkle, shimmer)
- No background music (keep focus on celebration)

**Design Reference:** `Reward & Celebration Screens.html`

**Accessibility:**
- All visual rewards accompanied by audio cues
- High contrast colors for celebration screen
- No flashing (animation smooth, not jarring)
- Animations can be reduced (prefers-reduced-motion support)

## Daily Streak (Consistency Encouragement)

**Purpose:** Encourage daily engagement without creating pressure or guilt.

**Mechanics:**
- **Increment rule:** +1 day for each calendar day child completes ≥ 1 full level (minimum 5 questions)
- **Display:** Home screen (prominent: flame icon 🔥 + number)
- **Duration:** Resets only if ≥ 24 hours pass without activity
- **Visual indicator:** Flame color intensifies with streak length

**Streak Milestones (Bonus Rewards):**
- **3-day streak:** Unlock special "Hot Streak 🔥" sticker
- **7-day streak:** Unlock special "Weekly Champion 👑" badge or mascot accessory
- **14-day streak:** Unlock "Consistency Master 🌟" achievement
- **30-day streak:** Unlock "Learning Legend 🏆" achievement

**Streak Reset Message (Empathetic Tone):**
- If day is skipped: "Your streak ended, but that's okay!"
- "It's never too late to start a new adventure."
- "Ready for a fresh streak? Let's play!"
- Show encouragement, never shame or penalty language

**Streak Display (Home Screen):**
- Flame icon with dynamic color:
  - 1–2 days: light orange
  - 3–6 days: bright orange
  - 7+ days: golden/red (intense fire effect)
- Streak number displayed next to flame
- Tap to see milestone progress (how many days until next reward)

**Design Reference:** `Daily Progress & Streak Screen.html`

## Reward Frequency & Pacing

**Session Structure:**
- Every 5 questions = 1 round = celebration screen with stars
- Each level = sticker earned
- Daily play = streak increment
- No pressure; rewards naturally flow from play

**Avoiding Overstimulation:**
- Celebration screens not too frequent (every 5 questions is natural pacing)
- Confetti and animations are brief (≤4 seconds)
- Mascot not overbearing (present but doesn't dominate)
- Sound effects are gentle, not jarring
- Encourage "just one more" through rewards, not notifications

## Parent Dashboard Reward Insights

Parents see:
- Total stars earned (aggregate metric)
- Sticker collection progress (X of 20 collected)
- Current streak length
- Streak milestones achieved
- Favorite games (where child earns most stars)
- Accuracy trends over time
- No pressure metrics (no "time wasted" or failure counts)
