# ADR 0003: Config-Driven Game Engine

**Status:** accepted
**Date:** 2026-04-24

## Context

5 mini-games with different logic but shared patterns (question → answer → feedback → next). Need an architecture that avoids duplicating game loop code across 5 separate implementations.

## Decision

Implement a **config-driven game engine** in `lib/game-engine/`:
- `GameConfig` object defines game type + difficulty + parameters
- `question-generator.ts` generates `Question[]` from config (pure function)
- `answer-validator.ts` validates answers per game type (pure function)
- `useGame` hook orchestrates the round using the engine

## Reasons

- Single `GameContainer` component works for all 5 games — only `QuestionDisplay` and `AnswerGrid` vary
- Adding a 6th game in Phase 2 = write a new config + generator function, no new game loop
- Pure functions are trivially unit-testable
- Difficulty scaling is centralized in `difficulty-calculator.ts`

## Consequences

- `GameConfig` schema must be stable — changes affect all games
- `question-generator` must handle all game types via a type discriminant — keep cases focused
- `useGame` hook is the single source of truth for round state — components must not manage their own question state
