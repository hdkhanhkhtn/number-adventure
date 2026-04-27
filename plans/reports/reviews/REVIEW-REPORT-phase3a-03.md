# Review Report — Phase 3A-03 Onboarding Persistence (PR #18)

**Date**: 2026-04-27 | **Verdict**: ⚠️ APPROVED WITH CONDITIONS
**Files reviewed**: `app/(child)/layout.tsx` | **Plan**: phase-01 Task 3A-03

---

## Findings

| # | Dim | Sev | File:Line | Issue | Fix | Effort |
|---|-----|-----|-----------|-------|-----|--------|
| 1 | Correctness | MEDIUM | `layout.tsx:65-67` | Returning user triggers double-setStep: mount writes 'welcome', then childId effect immediately fires 'ready'. Functional but causes spurious localStorage write. Context hydration order (provider→layout) is assumed not guaranteed. | In mount effect, check `state.childId` before falling back to 'welcome'. BACKLOG #N | 15min |
| 2 | Performance | LOW | `layout.tsx:162` | `SplashScreen.onReady` inline callback is new ref on every render. If SplashScreen uses `useEffect([onReady])` internally, any parent re-render during splash resets the 2.2s timer silently. | Extract to `useCallback` with empty/stable deps. BACKLOG #10 | 10min |
| 3 | Performance | NOTE | `layout.tsx:173` | `WelcomeScreen.setLang` wrapper is new ref per render. Harmless now; causes unnecessary re-renders if WelcomeScreen ever uses React.memo. | Extract to `useCallback`. BACKLOG #11 | 5min |
| 4 | Testing | MEDIUM | `__tests__/` (absent) | Zero unit tests for 6 mount-effect localStorage branches (splash-seen, onboard-step resume, private browsing fallback, lang restore, step persistence, removal on ready). | Create `__tests__/components/screens/child-layout-persistence.test.tsx`. BACKLOG #9 | 1h |

---

## Priority Order

1. **F4** (MEDIUM — Testing): Create tests before 3A-04 to prevent regression during navigation changes
2. **F1** (MEDIUM — Correctness): Fix double-write; low effort, prevents subtle bugs in debugging
3. **F2** (LOW — Performance): Fix if SplashScreen's internal implementation confirms timer dep; verify first
4. **F3** (NOTE — Performance): Defer until WelcomeScreen is memo-wrapped

---

## What's Done Well

- Security: localStorage whitelist (`=== 'welcome' || === 'setup'`) prevents step-skip attack
- Private browsing: 3 independent try/catch blocks; one failure doesn't corrupt others
- `'splash'` never persisted; `'ready'` never written — only reachable via `state.childId`
- eslint-disable justification is correct (mount-only init effect)
- setLang wrapper type fully compatible with WelcomeScreen prop type
- Zero new external dependencies

## Conditions for Merge

This PR may be merged with the following tracked:
- [ ] F4 addressed before 3A-04 implementation begins (tests needed as regression guard)
- [ ] F1 tracked in BACKLOG.md (fix in same sprint)
- [ ] F2, F3 tracked in BACKLOG.md (deferred)

✅ CONSENSUS: tech-lead ✓ | planner ✓ | reviewer ✓
