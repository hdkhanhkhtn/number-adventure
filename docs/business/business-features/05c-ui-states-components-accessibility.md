# UI States: Component States & Accessibility

## Button States

| State | Appearance | Interaction |
|-------|-----------|-------------|
| Default | Full color, shadow, rounded | Cursor pointer |
| Hover (desktop) | Slight scale up (1.05x) | Visual feedback |
| Pressed/Active | Scale down (0.95x), shadow reduced | Tactile feedback |
| Disabled | Muted color, no shadow | No interaction |
| Loading | Animated spinner inside | Cursor wait |

## Card/Tile States

| State | Appearance | Meaning |
|-------|-----------|---------|
| Locked | Grayed out, lock icon, opacity 0.5 | Must complete prerequisite |
| Completed | Checkmark, subtle highlight | Already finished |
| Available | Full color, interactive | Ready to play |
| In Progress | Highlighted, partial progress bar | Currently playing |
| Bonus | Star or badge overlay | Special achievement |

## Progress Bar States

| State | Appearance | Usage |
|-------|-----------|-------|
| Empty | Gray outline | No progress |
| In Progress | Animated fill (theme color) | Currently progressing |
| Complete | Full color, celebration animation | Milestone reached |
| Disabled | Muted, no interaction | Not applicable |

## Input Field States (Parent Settings)

| State | Appearance | Behavior |
|-------|-----------|----------|
| Default | Border outline, clear | Ready for input |
| Focused | Blue highlight, cursor visible | Active input |
| Error | Red border, error message | Invalid input |
| Success | Green checkmark, success message | Valid input saved |
| Disabled | Grayed out, no interaction | Read-only |

## Modal/Dialog States

**Opening:**
- Fade in (0 → 1 opacity, 150ms)
- Slide in from bottom (mobile) or scale up (desktop)
- Backdrop dims to 40% opacity
- No scroll behind modal

**Active:**
- Clear title
- Primary and secondary CTA buttons
- Close button (X) top-right
- Focus trapped within modal

**Closing:**
- Fade out / slide down
- Return focus to triggering element
- Backdrop fades

## Accessibility States

All states must include:
- **Visual indicators** (color + icon/pattern)
- **Audio cues** (where applicable)
- **Text labels** (ARIA labels, alt text)
- **High contrast** (minimum WCAG AA)
- **Large touch targets** (48×48px minimum)
- **No flashing** (no more than 3 flashes per second)

## State Implementation Checklist

When implementing a screen:
- [ ] Default state designed and coded
- [ ] Loading state implemented
- [ ] Empty state handled
- [ ] Error state with retry
- [ ] Success/complete state
- [ ] Edge cases tested (no data, slow network, etc.)
- [ ] Accessibility reviewed
- [ ] Mobile layout verified
- [ ] States documented in Storybook (if available)
