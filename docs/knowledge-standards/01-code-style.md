# Code Style

## TypeScript

- Strict mode enabled
- Prefer `type` over `interface` for data shapes; use `interface` for component props
- No `any` — use `unknown` + type guards if needed
- Explicit return types on functions > 5 lines

## React / Next.js

- Functional components only
- Server Components by default; add `"use client"` only when needed (interactivity, hooks, browser APIs)
- Co-locate component styles with the component file (Tailwind classes inline)
- Extract to separate file when component exceeds 150 lines

## File Naming

- Components: `PascalCase.tsx` (e.g., `NumberTile.tsx`, `GameContainer.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAudio.ts`)
- Utils/lib: `kebab-case.ts` (e.g., `game-engine.ts`, `difficulty-calculator.ts`)
- Pages: `page.tsx` (Next.js convention)

## Tailwind

- Use design tokens from `tokens.css` mapped in `tailwind.config.ts`
- Prefer semantic token names: `bg-primary`, `text-child-heading` over raw colors
- No inline `style={{}}` unless animation values are dynamic

## Component Structure

```tsx
// 1. Imports
// 2. Types/Props
// 3. Component function
// 4. Sub-components (if small and co-located)
// 5. Export
```

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component | PascalCase | `NumberTile` |
| Hook | camelCase + use prefix | `useGameProgress` |
| Context | PascalCase + Context | `AudioContext` |
| Event handler | handle + Action | `handleTap`, `handleAnswer` |
| Boolean props | is/has/can prefix | `isCorrect`, `hasAudio` |
