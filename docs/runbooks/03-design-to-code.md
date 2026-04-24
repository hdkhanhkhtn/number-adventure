# Design to Code Runbook

How to read design files and implement screens correctly.

## Step 1 — Read the master reference

Open `handoff/number-adventure/project/Bắp Number Adventure.html` first.
Understand the overall visual language, layout principles, and mascot usage.

## Step 2 — Read the design system

Open `handoff/number-adventure/project/Bắp Design System.html`.
Extract: color palette, typography scale, spacing system, component patterns.

## Step 3 — Import design tokens

Map `handoff/number-adventure/project/tokens.css` into `tailwind.config.ts`:

```bash
# Read the tokens file
cat handoff/number-adventure/project/tokens.css
```

Add each CSS variable as a Tailwind theme extension.

## Step 4 — Read the target screen HTML

For each screen you are implementing, open its HTML file:

| Screen | File |
|---|---|
| Child Home | `Home Screen Designs.html` |
| World Map | `World Map Designs.html` |
| Hear & Tap | `Hear & Tap Game UI.html` |
| Number Order | `Number Order Game UI.html` |
| Build Number | `Build the Number Game UI.html` |
| Even or Odd | `Even or Odd House Game UI.html` |
| Math Kitchen | `Math Kitchen Game UI.html` |
| Rewards | `Reward & Celebration Screens.html` |
| Parent Dashboard | `Parent Dashboard Home.html` |
| Parent Gate | `Parent Gate Screen.html` |
| Settings | `Parent Settings.html` |

## Step 5 — Implement in React + Tailwind

- Rebuild from scratch — do NOT copy HTML structure
- Use semantic HTML (`button`, `main`, `section`, `h1`, etc.)
- Apply design tokens via Tailwind classes
- Wrap in `IOSFrame` component for mobile preview
- Minimum touch target: `min-h-12 min-w-12` (48px)

## Step 6 — Verify against design

Check:
- [ ] Colors match (use browser devtools color picker)
- [ ] Spacing matches the design scale
- [ ] Typography matches (font, size, weight, line-height)
- [ ] Interactions work (tap, drag) with correct audio feedback
- [ ] Responsive at 375px width (iPhone SE portrait)
