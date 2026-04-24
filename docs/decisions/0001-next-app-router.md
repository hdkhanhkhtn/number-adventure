# ADR 0001: Use Next.js App Router

**Status:** accepted
**Date:** 2026-04-24

## Context

Need a React framework for a mobile-first web app. Options: Next.js (Pages Router), Next.js (App Router), Vite + React SPA.

## Decision

Use **Next.js 14+ with App Router**.

## Reasons

- File-based routing maps cleanly to screen hierarchy `(child)/` and `(parent)/` route groups
- Route groups allow separate layouts per user type without extra complexity
- Server Components available for static screens (home, world map) — faster initial load
- Strong TypeScript support out of the box
- Active ecosystem, good Tailwind/Framer Motion integration

## Consequences

- Must understand Server vs Client Component boundary — add `"use client"` for interactive game screens
- Dynamic route `/game/[gameId]` handles all 5 game types cleanly
- Slightly more complex than a pure SPA, but scales well to Phase 2 content expansion
