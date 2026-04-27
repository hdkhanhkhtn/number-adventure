# SCOUT — Phase 3A-03 Onboarding Persistence (PR #18)

**Date**: 2026-04-27 | **PR**: #18 | **Branch**: feature/phase-3a-03-onboarding-persistence

---

## Changed Files

| File | +/- | Change |
|------|-----|--------|
| `app/(child)/layout.tsx` | +55/-6 | localStorage persistence for step, lang, splash-seen |
| `plans/.../phase-01-navigation-onboarding-redesign.md` | +1/-1 | Mark 3A-03 [x] |

## Call Chain

- Next.js App Router renders `ChildLayout` at `(child)/` level
- Wraps: `home/`, `worlds/`, `play/`, `stickers/`, `reward/`
- Renders (conditional): `SplashScreen`, `WelcomeScreen`, `ProfileSetup`, `OfflineToast`, `SaveProgressBanner`, `ParentGate`, `{children}`
- **Callback changes**: `SplashScreen.onReady` now writes `bap-splash-seen`; `WelcomeScreen.setLang` now writes `bap-lang`

## Blast Radius

- `bap-splash-seen`, `bap-onboard-step`, `bap-lang` — **used only in `app/(child)/layout.tsx`**
- No other components read these keys
- No API calls added
- No context mutations beyond existing `setChild()`

## Architecture Layers Touched

| Layer | Change |
|-------|--------|
| React state (useState/useEffect) | Mount effect reads 3 keys; step effect writes/removes |
| localStorage persistence | New — all try/catch wrapped |
| Component callbacks | SplashScreen.onReady, WelcomeScreen.setLang extended |
| API | None |

## Plan Compliance Baseline

Task 3A-03 requirements vs implementation:

| Requirement | Status |
|---|---|
| Read `bap-onboard-step` on mount | ✅ |
| Write `bap-onboard-step` on step change | ✅ |
| Remove key on completion (ready) | ✅ |
| Persist `bap-lang` | ✅ |
| Skip splash via `bap-splash-seen` | ✅ |
| Private browsing safety (try/catch) | ✅ |

**No deviations from plan.**

## Risk Flags for Reviewer

1. No unit tests in PR diff — localStorage mocking coverage unverified
2. `eslint-disable-line react-hooks/exhaustive-deps` on line 62 (mount effect) — verify justification
3. WelcomeScreen expects `(lang: string) => void` — verify inline wrapper is compatible
4. Graceful fallback: unrecognized `bap-onboard-step` values default to 'welcome' — verify coverage

## Recent Churn

layout.tsx has high churn in last 2 weeks (3A-02, 3A-03 work). Previous stable since Phase B.

✅ CONSENSUS: reviewer ✓ | scouter ✓ | tech-lead ✓
