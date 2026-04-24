# Art Direction: Colors, Typography & Animation

## Color Palette (from tokens.css)

### Primary Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Cream | `#FFF8EC` | Warm, welcoming backgrounds |
| Parchment | `#FDE9C2` | Secondary background, cards |
| Sage Green | `#A8D5A2` | Calm, nature, growth |
| Sky Blue | `#B8DEEF` | Open, safe, exploration |
| Lavender | `#D9C7F0` | Magical, playful, dreamy |
| Sun Yellow | `#FFD36E` | Warmth, joy, energy |
| Coral | `#FFA48C` | Friendly, approachable, warm |
| Berry Pink | `#E6779E` | Playful, fun, engaging |

### Semantic Colors

| Role | Hex | Meaning |
|------|-----|---------|
| Correct/Success | `#5FB36A` | Growth, achievement |
| Try Again | `#F2A97A` | Gentle, encouraging |
| Text (Dark) | `#2D3A2E` | High contrast, legible |

### Theme Variants (in tokens.css)
- **[data-theme="candy"]** — Softer, more pastel palette for variety
- **[data-theme="sunny"]** — Warmer, more golden tones for alternate theme

### Color Usage Rules
- Backgrounds: Creams, pale pastels (low-contrast, restful)
- Sections/cards: Sage, sky, lavender (distinct but harmonious)
- Accents/highlights: Sun, coral, berry (draw attention, playful)
- Text: Dark ink for legibility
- Interactive elements: Themed by world (e.g., forest = sage, kitchen = coral)

---

## Typography

### Font Families (from tokens.css)

| Audience | Font | Usage |
|----------|------|-------|
| Child-facing | Fredoka or Baloo 2 | Game prompts, titles, numbers |
| Numbers | Fredoka or Baloo 2 | Monospaced feel, highly legible |
| Parent mode | Be Vietnam Pro or Inter | Settings, dashboard, analysis |

### Typography Scale

| Element | Size | Notes |
|---------|------|-------|
| Titles (child) | 48–64px | Large, playful, rounded |
| Headings | 32–40px | Rounded |
| Body/labels (child) | 18–24px | Large for readability |
| Small text | 14–16px | Parent mode, buttons |
| Numbers in games | 36–56px | Extra legible, bold |

### Typographic Hierarchy
1. Game prompt / main action (largest, most prominent)
2. Instructions / secondary info (medium, supporting)
3. Labels / UI elements (smaller, functional)
4. Parent mode text (readable but compact)

### Anti-Patterns
- Don't use serif fonts (too formal for children)
- Don't use thin/light weights (hard to read at small sizes)
- Don't use all-caps for long text (harder for children to read)
- Don't combine more than 2 font families

---

## Animation Principles

### Personality in Motion
- Animations should feel **delightful and encouraging**
- **Celebrate** correct answers (scale, bounce, sparkle)
- **Gently correct** wrong answers (shake, not harsh)
- **Quick transitions** (150–300ms, keep pace fast)
- **Avoid** overstimulation (no rapid flashing, spinning)

### Animation Examples

| Animation | Implementation | Context |
|-----------|---------------|---------|
| Mascot jump | Scale + translate up | Celebrate correct |
| Shake feedback | Horizontal translate ±8px | Wrong answer |
| Scale celebration | 1 → 1.2 → 1 (pop, grow, settle) | Correct answer |
| Fade transitions | Opacity 0 → 1 | Screen changes |
| Slide entry | TranslateY -20px → 0 | Cards, objects entering |

---

## Accessibility in Illustration

- **High contrast:** Illustrated elements must have clear edges
- **Simple forms:** Avoid intricate patterns or dense detail
- **Color ≠ meaning:** Don't rely on color alone (use icons, text, shape)
- **Readable text overlays:** Ensure text contrast against backgrounds
- **Animated gifs/SVGs:** Provide option to reduce motion (prefers-reduced-motion)
- **Icon clarity:** Icons must be recognizable at 24×24px+ minimum

---

## Reference Design Files

See handoff folder for detailed design specifications:
- `Bắp Art Direction Guide.html` — mascot usage, world themes, color applications
- `Bắp Design System.html` — complete component library, color grid, typography scale
- Individual screen files — specific illustration and layout details per screen
