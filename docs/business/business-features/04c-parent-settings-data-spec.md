# Parent Settings, Data & Messaging Specification

## Settings (Parent Controls)

### Audio Settings
- **Sound & Audio:** Toggle on/off
- **Volume:** Slider 0–100%
- **Language:** English only / Vietnamese only / Bilingual mode
- **Guided Hints:** On / Off (whether mascot provides hints during games)
- **Celebration Animations:** On / Off (reduce motion option)

### Learning Settings
- **Difficulty:** Auto-adapt (default) / Easy / Medium / Hard
  - Auto-adapt: App adjusts based on child's accuracy
  - Manual: Lock difficulty for consistency
- **Game Rotation:** Auto (balanced) / Favorite only / All games
- **Hints in Games:** Always / After 2 wrong attempts / Never

### Time Management
- **Daily Session Limit:** Off / 10 min / 20 min / 30 min / Custom
- **Reminder to take break:** Off / 15 min / 30 min / 60 min
- **Bedtime mode:** Off / 7 PM / 8 PM / 9 PM (app not available after set time)

### Account & Data
- **Child Profile:** Edit name, avatar, age
- **Change Parent PIN:** Enter old PIN → enter new PIN → confirm
- **Reset All Progress:** Full reset with confirmation dialog
  - Warning: "This will delete all levels, stars, stickers, and streaks. You cannot undo this."
  - Requires re-entry of PIN for confirmation
- **Export Data (Future):** Download child progress as CSV or PDF

### Accessibility
- **Reduce Motion:** Off / On (disables animations across app)
- **High Contrast:** Off / On

### About
- App version
- Privacy policy link
- Terms of service link
- Feedback / contact developer email

**Form Elements:** Toggles · Sliders · Dropdowns · Numeric-only PIN inputs

**Tone:** Helpful, clear, not overwhelming. Explanatory tooltips; recommendation text.

**Design Reference:** `Parent Settings.html`

---

## Data Storage & Persistence

**Data Stored Locally (localStorage):**
- Child profile (name, age, avatar)
- Progress per level (stars, accuracy, completion status)
- Sticker collection (earned stickers)
- Streak (current and longest)
- Session history (last 30 sessions: date, game, stars)
- Parent settings (PIN, audio, difficulty, etc.)

**Data NOT Stored:** Passwords · Parent personal info · Analytics or tracking data

**Data Format:**
```javascript
{
  childProfile: { name, age, avatar },
  progress: {
    levels: { [levelId]: { stars, accuracy, completed, date } },
    worlds: { [worldId]: { unlocked, currentLevel } }
  },
  stickers: { [stickerId]: { earned, date } },
  streak: { current, longest, lastDate },
  sessions: [ { date, gameType, stars, accuracy } ],
  settings: { pin, audio, volume, language, difficulty, dailyLimit }
}
```

**No Backend / No Cloud Sync (MVP):** All data is device-local · No login required · No account system

---

## Parent Messaging Principles

**Tone Across All Parent Communication:**
- Warm, supportive, non-judgmental
- Celebratory of child's effort and progress
- Actionable recommendations (not criticisms)
- Emphasis on growth (how to help child improve)
- No shame or pressure language
- Bilingual-friendly (English and Vietnamese labels)

**Example Messages:**
- ✅ "Your child is building strong number recognition skills!"
- ✅ "Ready for the next challenge? Your child has mastered the Number Forest!"
- ❌ "Your child's accuracy is low" → ✅ "Your child is building fluency. More practice will help!"
- ❌ "Session time exceeded" → ✅ "Time for a break! Come back tomorrow for a fresh streak!"
