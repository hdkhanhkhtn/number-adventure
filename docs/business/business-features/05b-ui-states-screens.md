# UI States: Screen-Specific States

## Home Screen States

**No Progress Yet (First Time):**
- Greeting message: "Welcome! Tap to start your first lesson."
- Unlock animation on first world
- Mascot introduction or wave

**Normal State (In Progress):**
- Current world displayed
- Lessons available to play
- Daily goal progress visible
- Streak counter (if applicable)

**Daily Goal Complete:**
- Celebration animation
- "Great job! Come back tomorrow for a new challenge!"
- Option to play more or view collection

**Session Limit Reached:**
- Friendly message: "You've reached today's session limit"
- Mascot giving thumbs up
- Option to view dashboard or exit

## Game Screen States

**Before Start:**
- Game loading complete
- Prompt visible: "Listen carefully" or game instruction
- Mascot ready to guide
- Large play area visible

**During Game:**
- Question displayed
- Interactive elements (tiles, drag zones) enabled
- Audio replay available
- No distractions

**Correct Answer:**
- Green highlight/flash
- Celebration sound
- Mascot celebrating
- Stars or sparkles appear
- Auto-advance after ~1 second (or tap to continue)

**Incorrect Answer:**
- Red shake animation
- Encouraging message: "Try again!"
- Gentle try-again sound
- Elements re-enabled for retry
- Max 3 attempts before hint or skip

**Hint Mode (After 2+ wrong):**
- Mascot offers hint
- Visual guidance overlay (arrows, highlights)
- Simplified prompt or visual clue
- "Take your time" message

**Round Complete:**
- Summary screen with stats
- Stars earned
- Celebration animation
- Mascot feedback
- "Continue" button to next round

## Reward/Celebration States

**Correct Answer Popup:**
- Small overlay: "Great job!" + animation
- 1–2 second display time
- Auto-dismiss or tap to continue

**End of Round (5 questions):**
- Full-screen celebration
- Stars earned display
- Mascot celebration dance
- Stats: Accuracy, time
- CTA: "Play Again" or "Continue"

**New Sticker Unlocked:**
- Full-screen modal
- Large sticker icon
- Message: "You earned a new sticker!"
- Add to collection animation
- CTA: "View Collection" or "Keep Playing"

**New World Unlocked:**
- Celebration screen
- World name and preview
- Mascot excitement
- CTA: "Explore [World]"

**Achievement/Milestone:**
- Badge display
- Message: "[N]-Day Streak!" or "10 Games Played!"
- Celebration animation
- Share or continue option

## Parent Dashboard States

### Dashboard Home

**First Visit:**
- Welcome message
- Empty child stats
- Setup prompt: "Set a daily goal to get started"
- Quick-start guide

**Normal State:**
- Child summary card
- Recent activity
- Progress overview
- Quick links to settings/details

**Data Loading:**
- Skeleton loaders for cards
- Pulsing animation
- "Loading progress data..."

### Progress Details

**No Data Yet:**
- Empty state: "No lessons played yet"
- Encouragement to let child play
- Tip: "Come back after the first session"

**With Data:**
- Charts and trends
- Game performance breakdown
- Strength areas highlighted
- Recommendation section
