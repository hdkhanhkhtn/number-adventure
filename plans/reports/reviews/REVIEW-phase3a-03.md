# Code Review: Phase 3A-03 Onboarding Persistence (PR #18)

## Verdict: ⚠️ APPROVED WITH CONDITIONS

## Executive Summary

PR #18 implements localStorage persistence for the onboarding wizard (step resume, language restore, splash-seen skip) with correct security guards and private-browsing safety. No critical or high issues exist. Two medium findings — a subtle double-write on returning users and zero unit test coverage for the new localStorage branches — should be resolved before 3A-04 begins to prevent debugging confusion and regression risk.

## Risk Assessment

| Risk | Severity | Likelihood | Business Impact | Mitigation |
|------|----------|------------|----------------|------------|
| Returning user sees spurious localStorage write | Low | Medium | Debug noise only; UX unaffected | Fix F1 in same sprint |
| SplashScreen timer reset on parent re-render | Low | Low | Splash could extend beyond 2.2s if layout re-renders during it | Fix F2 after confirming SplashScreen internals |
| localStorage branch regression in 3A-04 | Medium | Medium | Onboarding breaks silently if nav changes break step persistence | Fix F4 (tests) before 3A-04 |
| Private browsing: step not persisted | Acceptable | High | Expected behavior; app degrades gracefully | No action needed |

## Critical Issues (0) — MUST fix

None.

## Warnings (2) — SHOULD fix

| # | Category | File:Line | Description | Fix | Effort |
|---|----------|-----------|-------------|-----|--------|
| 1 | Correctness | `layout.tsx:65-67` | Double-setStep on returning user: mount writes 'welcome' then childId effect overwrites with 'ready', causing spurious localStorage write | Add `state.childId` check in mount effect before defaulting to 'welcome' | 15min |
| 4 | Testing | `__tests__/` (absent) | Zero unit tests for 6 mount-effect localStorage branches | Create `__tests__/components/screens/child-layout-persistence.test.tsx` | 1h |

## Suggestions (2) — COULD improve

| # | Category | File:Line | Description | Fix | Effort |
|---|----------|-----------|-------------|-----|--------|
| 2 | Performance | `layout.tsx:162` | `onReady` inline callback is new ref per render — may reset SplashScreen timer | Extract to `useCallback` | 10min |
| 3 | Performance | `layout.tsx:173` | `setLang` wrapper is new ref per render — harmless until WelcomeScreen uses memo | Extract to `useCallback` | 5min |

## Security Summary

Vulnerabilities: 0 | OWASP: None triggered

- `bap-onboard-step` restoration is whitelisted to `['welcome', 'setup']` — no step-skip attack possible
- `lang` value from localStorage is passed as prop only — no DOM injection surface
- No auth tokens, secrets, or PII in any persisted key
- Private browsing failures isolated per key via independent try/catch blocks

## Performance Summary

Bottlenecks: 0 blocking | Minor: 2 (inline callbacks, LOW/NOTE severity)

No render-loop risks. useEffect dependency arrays correct. Mount effect runs once; step persistence effect runs only when `hydrated` or `step` changes.

## Plan Compliance

Phases verified: 3A-03 (1/1) | Deviations: None

All 6 plan requirements implemented exactly as specified. Plan todo updated to `[x]`.

## Recommended Actions

1. **Write localStorage persistence tests** — Owner: Dev — Priority: P1 — Before 3A-04 starts
2. **Fix double-write on returning user** — Owner: Dev — Priority: P2 — Same sprint
3. **Extract `onReady` to useCallback** — Owner: Dev — Priority: P3 — Next sprint
4. **Extract `setLang` wrapper to useCallback** — Owner: Dev — Priority: P3 — When WelcomeScreen gets memo

---

✅ CONSENSUS: tech-lead ✓ | reporter ✓ | business-analyst ✓
