# UI States: Global States

All key screens must support these UI states. Reference: `UI States Gallery.html` in handoff.

## Loading State
**When:** Initial app load, between screens, data fetching

**Visual:**
- Animated mascot Bắp in center
- Fun loading message (e.g., "Getting ready...", "Loading your adventure...")
- Soft spinning or floating animation
- No progress bar (indeterminate loading)
- Warm, cozy appearance

**Implementation:**
```tsx
<LoadingState
  message="Getting ready..."
  showMascot={true}
  variant="child" // or "parent"
/>
```

## Error State
**When:** Network error, data load failure, unexpected issue

**Visual (Child Mode):**
- Gentle, non-threatening message
- Avoid technical jargon (no "Error 500")
- Retry button prominent and clear
- Mascot in supportive pose
- Warm tone

**Messages:**
- Child: "Something went wrong. Let's try again!"
- Parent: "Unable to load data. Check your connection and try again."

**Implementation:**
```tsx
<ErrorState
  message="Something went wrong. Let's try again!"
  onRetry={() => refetch()}
  variant="child"
/>
```

## Empty State
**When:** No data yet (first app open, no progress, new child profile)

**Visual:**
- Encouraging message
- Clear CTA to begin
- Mascot greeting or welcoming
- Playful illustration
- Inviting tone

**Messages:**
- "Ready to start your adventure?"
- "No lessons yet. Ready to play?"
- "Begin your journey!"
