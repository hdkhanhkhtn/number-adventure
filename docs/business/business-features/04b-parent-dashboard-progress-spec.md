# Parent Dashboard & Progress Details Specification

## Dashboard Home (Parent Overview)

**Purpose:** Quick glance at child's overall progress, today's activity, and learning trends.

**Layout (Mobile-First):**
1. **Header:** Child name + avatar + current world level
2. **Today's Summary Card:**
   - Minutes played today
   - Levels completed today
   - Time remaining (if daily limit set)
3. **Streak Card:**
   - Current streak (flame icon + number)
   - Longest streak achieved
   - Next milestone toward bonus reward
4. **Overall Progress Card:**
   - Total stars earned / total possible (progress bar)
   - Completion percentage (levels completed / total)
   - Unlocked worlds count
5. **Game Breakdown (Horizontal scroll or grid):**
   - Each mini-game: average accuracy, latest session result
   - Shows child's strongest games at a glance
6. **Recent Activity (Last 5 sessions):**
   - Date, time, game name, stars earned
   - "View Details" link to drill-down

**Parent-Friendly Copy:**
- "Strong with: Number Recognition" (highlight strength)
- "Keep practicing: Even/Odd sorting" (non-judgmental suggestion)
- "All caught up! Ready for next world?" (encouragement)

**Tone:** Calm, informative, encouraging (no pressure language)

**Design Reference:** `Parent Dashboard Home.html`

---

## Progress Details (Drill-Down Analysis)

**Purpose:** Help parent understand where child excels and where they might benefit from more practice.

### By World
- Per-world breakdown (Number Forest, Tens Town, etc.)
- Levels completed in world + stars distribution
- Unlock status (locked vs. available)
- Time spent in world

### By Game Type
- Hear & Tap, Number Order, Build the Number, Even/Odd, Math Kitchen
- Average accuracy per game
- Star distribution (how many 1★, 2★, 3★ completions)
- Total playtime per game
- Recommended next focus (lowest accuracy game)

### Trends Over Time
- 7-day activity chart (bar chart: days vs. minutes played)
- Accuracy trend over time (line chart: sessions vs. accuracy %)
- Star trend (stacked bar: stars earned per day)
- Streak visualization (calendar heat-map style)

**Data Presentation:**
- Simple charts, not overly complex
- Key stats highlighted in large text
- Color-coded feedback:
  - Green: Strong performance (≥80% accuracy)
  - Amber: Developing (60–79%)
  - Neutral: Building foundation (<60%)
- Actionable insights: "Your child is ready for Medium difficulty in Number Order"

**Parent-Focused Language:**
- Replace game jargon with plain English
- "Accuracy" instead of "score"
- "Games practiced" instead of "sessions"
- "Time spent" instead of "engagement metric"

**Design Reference:** `Parent Progress Details.html`
