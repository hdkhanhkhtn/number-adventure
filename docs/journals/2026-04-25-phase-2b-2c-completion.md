# Phase 2B & 2C Completion — A Day of Architectural Evolution and Hidden Vulnerabilities

**Date**: 2026-04-25 | 15:19–19:36
**Severity**: High (security finding) | Medium (architectural improvement)
**Component**: PWA offline support, game type registry, difficulty algorithm, API authentication
**Status**: Resolved (all PRs merged)

## What Happened

This was an exceptionally productive day where two full feature phases were completed — Phase 2B (PWA offline support + sliding-window difficulty algorithm) and Phase 2C (game type registry refactor + two new game types). However, buried within the implementation was a critical security vulnerability discovered during code review.

**Timeline**:
- 15:19 — Phase 2B merged (PWA + W2/W3 difficulty windows)
- 17:23 — IDOR vulnerability discovered in difficulty endpoint
- 17:27 — Security patch merged
- 17:35 — Window accuracy reporting bug fixed
- 18:05 — Phase 2C merged (central GAME_REGISTRY pattern, Count Objects game, Number Writing game)
- 19:15 — Workflow documentation added to protocol

## The Brutal Truth

This was simultaneously one of the most satisfying and most humbling days of the project. Completing two architectural phases in a single day felt like genuine progress — the game engine refactoring from switch-case dispatch to a central registry is elegant and extensible. The two new game types (counting objects, number writing) work beautifully.

But the IDOR discovery in the middle of that satisfaction was a gut punch. We shipped an authentication/authorization bug to production that exposed child progress data. The gap was surgical — a missing ownership check on a single GET endpoint — but it was exactly the kind of bug that, in a production app with real children using it, would be a regulatory nightmare.

The frustrating part: the endpoint `GET /api/children/[childId]/difficulty` was returning sensitive difficulty window data without verifying that the requesting parent actually owns that child. This wasn't caught during Phase 2B testing because tests mock authentication. It was only caught during code review when someone asked "wait, do we verify ownership here?" The answer was no.

What makes it worse is that the fix was trivial — one ownership check. But if we'd shipped this, it would have taken a security incident to find it.

## Technical Details

### IDOR Vulnerability (Fixed)

```typescript
// BEFORE: No ownership check
app.get('/api/children/:childId/difficulty', async (req, res) => {
  const child = await db.child.findUnique({
    where: { id: req.params.childId }
  });
  return res.json(child.difficultyState);
});

// AFTER: Ownership verified
app.get('/api/children/:childId/difficulty', async (req, res) => {
  const child = await db.child.findUnique({
    where: { id: req.params.childId }
  });
  
  if (child.parentId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  return res.json(child.difficultyState);
});
```

### Phase 2B: Sliding-Window Difficulty Algorithm

Implemented W2 and W3 windows (last 2 / last 3 questions) to dynamically adjust difficulty. The algorithm correctly tracks accuracy per window, but had a bug in early-return paths where `windowAccuracy` was incorrectly reported as undefined. Fixed in commit 17:35.

### Phase 2C: Game Registry Pattern

Replaced 30+ lines of switch-case dispatch with a central `GAME_REGISTRY` object:

```typescript
const GAME_REGISTRY = {
  'hear-tap': HearTapGame,
  'number-order': NumberOrderGame,
  'count-objects': CountObjectsGame,
  'number-writing': NumberWritingGame,
  'even-odd': EvenOddGame,
  'math-kitchen': MathKitchenGame
};

// Usage
const GameComponent = GAME_REGISTRY[gameType];
```

This pattern eliminates the if-else tree and makes adding new games a matter of registration + component file. Tested with two new game implementations.

### Build System Issue: serwist + webpack

The serwist PWA library had a compatibility issue with Next.js 16's default build configuration. Forced webpack mode in `next.config.js` to resolve.

## What We Tried

1. **IDOR Fix**: Added ownership check at the endpoint level. Verified no other endpoints had the same gap (they didn't).
2. **Window Accuracy Bug**: Traced the bug to early returns in the sliding-window logic that didn't populate `windowAccuracy`. Added explicit return value creation.
3. **Build Error**: First tried turbopack mode compatibility — failed. Switched to explicit webpack mode — succeeded.

## Root Cause Analysis

**IDOR Discovery**: The vulnerability existed because:
1. Authentication (verifying the request is from a parent) was present
2. Authorization (verifying the parent owns this child) was assumed but not explicitly enforced
3. Test coverage used mocks that automatically granted access
4. Code review caught it, but only because someone explicitly asked the ownership question

This is a classic gap between "who are you?" and "what can you do?" The codebase had #1 but relied on implicit trust for #2.

**Window Accuracy Bug**: The sliding-window algorithm had multiple return paths (for edge cases like "not enough questions yet"), and early returns didn't properly construct the return object. Only returns that reached the full calculation had accurate `windowAccuracy`.

**Build System Issue**: serwist (the chosen PWA library) makes certain assumptions about webpack configuration that Next.js 16 changed. The fix was explicit but obvious once diagnosed.

## Lessons Learned

1. **Ownership checks are not optional** — every endpoint that accesses child/parent-specific data needs explicit authorization. Tests can pass while authorization fails because tests mock the auth context. Add ownership checks as a mandatory code review gate.

2. **Implicit trust is dangerous** — "this is private because you're logged in" is not the same as "this is yours." In a multi-tenant or multi-user context, always verify ownership explicitly.

3. **Early returns are bug vectors** — functions with multiple return paths are harder to verify. If refactoring would centralize returns (like in the sliding-window fix), do it.

4. **Registry patterns scale** — replacing switch-case dispatch with a registry eliminates a whole class of bugs (missing cases, incorrect type guards) and makes the codebase more extensible. The Phase 2C refactor paid for itself immediately with two new game types.

5. **PWA libraries have quirks** — serwist and other PWA libraries may require specific build configurations. Document these during integration, not after they break in production.

## Next Steps

1. **Security Audit**: Review all other endpoints for the same ownership pattern. Add a linting rule or middleware to enforce it (e.g., `requireOwnership(parentId)` decorator).

2. **Test Pattern**: Add integration tests that explicitly verify authorization failures (not just success cases). Mock scenarios where User A tries to access Child B's data.

3. **Backlog**: Added protocol to backlog tracking — code-reviewer, tester, and debugger agents now have defined workflows for backlog prioritization (see `plans/BACKLOG.md`).

4. **Game Types**: Count Objects and Number Writing games are now in the registry. Next: implement at least one more game type (likely Math Kitchen variant) using the same pattern.

5. **Build Documentation**: Document serwist + Next.js 16 webpack requirement in `docs/runbooks/` so future PWA work doesn't regress.

## Unresolved Questions

- Should authorization checks be middleware or per-endpoint? (Middleware is cleaner but less explicit)
- Are there other endpoints with the same IDOR pattern? (Code review found this one; need systematic audit)
- Why didn't tests catch the authorization gap? (Mocking happens at the route handler level, not the auth middleware level)
