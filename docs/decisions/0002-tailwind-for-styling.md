# ADR 0002: Use TailwindCSS for Styling

**Status:** accepted
**Date:** 2026-04-24

## Context

Need a styling approach that supports design token mapping, rapid iteration, and mobile-first responsive design.

## Decision

Use **TailwindCSS** with design tokens from `handoff/number-adventure/project/tokens.css` mapped into `tailwind.config.ts`.

## Reasons

- Design tokens (colors, spacing, fonts) can be mapped directly as Tailwind theme extensions
- Utility classes keep styling co-located with components — no separate CSS files to maintain
- Mobile-first utilities (`sm:`, `md:`) built in
- No CSS-in-JS runtime cost — critical for smooth 60fps game interactions
- Good Framer Motion compatibility

## Consequences

- Long className strings on complex components — extract to `cva()` variants when needed
- Design tokens must be manually mapped from `tokens.css` to `tailwind.config.ts` (one-time setup)
- No CSS Modules or styled-components — team must learn Tailwind conventions
