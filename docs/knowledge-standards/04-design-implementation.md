# Design Implementation Standards

## Golden Rule

**Read the design HTML file before implementing any screen.** Match spacing, layout, and colors exactly. Do not copy raw HTML — rebuild components in React + Tailwind.

## Design Source Location

```
handoff/number-adventure/project/
  ├── tokens.css                           ← CSS variables for colors, typography, spacing
  ├── Bắp Design System.html               ← Component library, colors, typography, spacing scale
  ├── Bắp Art Direction Guide.html         ← Mascot Bắp usage, visual tone, illustration style
  ├── Bắp IA & User Flows.html            ← Information architecture, user journeys
  ├── UI States Gallery.html               ← Loading, empty, locked, success, error states
  ├── [Screen Name].html                   ← Per-screen detailed reference
  └── ref/app.html                         ← Full app prototype reference
```

## Token System (CSS Variables → Tailwind)

**Primary colors (brand palette):**
- `--cream` (#FFF8EC), `--cream-2` (#FFEFD3) — backgrounds
- `--sage` (#A8D5A2), `--sky` (#B8DEEF), `--lavender` (#D9C7F0) — card/section backgrounds
- `--sun` (#FFD36E), `--coral` (#FFA48C), `--berry` (#E6779E) — accent highlights

**Semantic colors:**
- `--correct` (#5FB36A) — success/correct answers
- `--gentle-miss` (#F2A97A) — gentle encouragement, try again
- `--ink` (#2D3A2E) — text (high contrast)
- `--ink-soft` (#6B7A6C) — secondary text
- `--ink-faint` (#A9B4A8) — disabled, low emphasis

**Typography:**
- `--font-kid` — Fredoka / Baloo 2 (child-facing screens, large playful headings)
- `--font-num` — Fredoka / Baloo 2 (numbers in games, must be highly legible)
- `--font-parent` — Be Vietnam Pro / Inter (parent dashboard, smaller body text)

**Spacing & Radii:**
- `--r-sm` (12px), `--r-md` (20px), `--r-lg` (28px), `--r-xl` (36px), `--r-pill` (9999px)
- Use Tailwind `rounded-[12px]` equivalent or CSS variables

**Shadows (soft, physical):**
- `--shadow-card`: 0 2px 0 + 0 10px 24px (cards, subtle lift)
- `--shadow-pop`: 0 4px 0 + 0 18px 32px (interactive tiles, modal pop)
- `--shadow-tile`: 0 3px 0 (game tiles, light 3D effect)

**Tailwind Config Integration:**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        'cream-2': 'var(--cream-2)',
        sage: 'var(--sage)',
        sky: 'var(--sky)',
        lavender: 'var(--lavender)',
        correct: 'var(--correct)',
        'gentle-miss': 'var(--gentle-miss)',
      },
      fontFamily: {
        kid: ['var(--font-kid)', 'system-ui', 'sans-serif'],
        num: ['var(--font-num)', 'system-ui', 'sans-serif'],
        parent: ['var(--font-parent)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--r-sm)',
        sm: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        full: 'var(--r-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        tile: 'var(--shadow-tile)',
      },
    },
  },
}
```

## Responsive Design Rules

**Mobile-first approach:**
- Default: mobile layout (base Tailwind classes)
- Tablet (768px+): Use `md:` prefix (e.g., `md:text-lg`, `md:grid-cols-2`)
- Desktop (1024px+): Use `lg:` prefix
- **Priority:** Optimize for mobile first; tablet/desktop are secondary

**Key breakpoints:**
- Mobile: 320px–767px (priority)
- Tablet: 768px–1023px (secondary)
- Desktop: 1024px+ (tertiary, not critical for MVP)

**Touch targets:**
- Minimum: 44×44px (WCAG AA), prefer 48×48px for children
- Use Tailwind: `min-h-12 min-w-12` (48px)
- Spacing around targets: at least 8px (Tailwind `gap-2`)

## Pixel-Perfect Implementation

1. **Read the design file first** — open in browser, inspect layout and spacing
2. **Do NOT copy raw HTML** — analyze structure, rebuild in React + Tailwind
3. **Match colors exactly** — use CSS variables, no hardcoded hex
4. **Match spacing exactly** — use Tailwind scale (4px units)
5. **Match typography exactly** — font family, size, line height, letter spacing
6. **Use iOS frame** — wrap in `components/layout/IOSFrame` for mobile preview
7. **Test on mobile** — verify touch target sizes and tap areas

## Interaction Patterns

| Pattern | Implementation | Notes |
|---|---|---|
| Tap / Click | `onClick` event + `touch-action: manipulation` | Immediate feedback |
| Drag & Drop | HTML5 drag API or `@dnd-kit/core` | Must provide visual feedback during drag |
| Audio on tap | `useAudio` hook from game engine | Play SFX immediately (no delay) |
| Correct answer | Green highlight + sound + Framer Motion scale | See animation tokens below |
| Incorrect answer | Red shake + try-again sound + encouragement | No penalty, keep tone positive |
| Navigation | Use Next.js `useRouter` with `push()` | Smooth transitions between screens |

## Animation & Motion Standards

**Framer Motion integration:**

```tsx
// Correct answer celebration
<motion.div
  initial={{ scale: 1 }}
  animate={{ scale: 1.2 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
  className="text-correct"
>
  ✓ Great job!
</motion.div>

// Wrong answer shake
<motion.div
  animate={{ x: [-8, 8, -8, 8, 0] }}
  transition={{ duration: 0.3 }}
>
  Try again...
</motion.div>
```

**Animation standards:**

| State | Animation | Duration | Easing | Sound |
|---|---|---|---|---|
| Correct answer | Scale 1 → 1.2 → 1 | 200ms | ease-out | Celebratory ding/chime |
| Wrong answer | Shake ±8px | 300ms | ease-in-out | Gentle buzz |
| Celebration (end-of-round) | Confetti + mascot jump | 600ms | ease-out | Celebration music |
| Screen transition | Fade 0 → 1 opacity | 150ms | ease-in-out | Optional swish sound |
| Hover/press state | Scale 0.95 → 1 | 100ms | ease-out | Subtle tap sound |

**Avoid:**
- Animations longer than 600ms (keep pace fast for children)
- Rapid flashing or seizure-inducing patterns
- Overly complex animations that distract from learning

## State Design

All key screens must show these states (see `UI States Gallery.html`):

- **Default:** Normal interaction state
- **Loading:** Animated mascot + fun loading phrase (e.g., "Getting ready...")
- **Empty:** Encouraging start message + CTA (e.g., "Ready to play?")
- **Locked lesson:** Visual lock + explanation (e.g., "Complete 3 more lessons to unlock")
- **Error:** Gentle message + retry button (avoid tech jargon)
- **Success:** Celebratory feedback + confirmation
- **Disabled:** Muted appearance, no interaction

## Accessibility for Preschoolers

- **High legibility:** Simple, large, rounded fonts
- **High contrast:** Text color must contrast well with background (WCAG AA)
- **Simple shapes:** Avoid complex or cluttered UI
- **Consistent placement:** Key controls always in same location
- **Audio + visual cues:** Never rely on color alone; always provide audio and visual feedback
- **Large buttons:** Minimum 48×48px; prefer 56×56px+
- **Touch-friendly spacing:** At least 8px between interactive elements
- **No text clutter:** Use icons and speech bubbles instead of long text
- **Support for early learners:** Provide hints, visual guidance, encouraging tone
