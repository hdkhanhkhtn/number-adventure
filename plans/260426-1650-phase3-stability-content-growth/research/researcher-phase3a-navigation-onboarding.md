# Research Report: Phase 3A Navigation, Onboarding & Settings

**Scope:** Next.js 16 App Router — guest→auth migration, onboarding wizard, navigation stability, settings UX
**Confidence:** High (official docs + codebase inspection)

---

## 1. Guest → Auth Flow (Save Your Progress)

### Current state (codebase)
- `(child)/layout.tsx` already has a `TODO Phase 2E` comment at line ~30:
  `// if state.childId?.startsWith('guest_') → show "Save your progress" prompt`
- Guest IDs are prefixed `guest_<uuid>`, stored in localStorage via `game-progress-context`.
- `home/page.tsx`: `if (!profile) return null` — renders blank screen when profile is absent.

### Best pattern: deferred merge, not blocking login
```
1. Guest plays → progress saved locally (childId = "guest_xxx")
2. Parent taps "Save progress" → parent auth gate opens (PIN / login)
3. On parent auth success → POST /api/children/migrate { guestId, parentId }
4. Server: copy sessions/stickers from guest child → new DB child, return newChildId
5. Client: setChild(newChildId, profile) — localStorage updated
6. Guest data removed after confirmed migration
```

**Key pitfall:** Never block gameplay waiting for auth. The guest mode MUST remain fully functional.

**Auth detection:** Use a cookie (`parentId` / session cookie) set after parent login.
Check `document.cookie` or fetch `/api/auth/me` (cached) to detect logged-in parent.
Do NOT store auth state in localStorage — cookies survive XSS better.
- Source: [Next.js Auth Guide](https://nextjs.org/docs/app/guides/authentication)
- Source: [Common App Router mistakes — Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)

**Prompt placement:** Show banner on HomeScreen when `childId.startsWith('guest_') && parentCookieDetected`.
Keep it dismissible. Re-show after 3 sessions.

---

## 2. Multi-Step Onboarding Wizard

### Current state (codebase)
`(child)/layout.tsx` implements a 4-step wizard with a simple `useState<OnboardStep>`:
`'splash' → 'welcome' → 'setup' → 'ready'`
This is the correct pattern. No library needed.

### Recommended: simple `useState` union type (already in place)
State machine libs (XState) add significant bundle weight (~20 KB gzipped) with no real benefit for 4 linear steps.

**localStorage gate for first-run detection:**
```typescript
// In game-progress-context (already has this)
// Onboarding is "done" when state.childId is set
// Layout checks: if (hydrated && state.childId) setStep('ready')
```
This is correct. The only gap: the `splash → welcome` transition should skip splash on repeat visits.

**Redirect strategy after completion:**
```typescript
// After handleProfileDone succeeds → setStep('ready') → children render
// DO NOT use router.push('/home') — the layout already wraps /home
// router.push causes a full re-render and potential blank flash
```
Current code handles this correctly by rendering `{children}` directly.

**Step persistence across refresh:**
If user closes browser mid-onboarding, current code restarts from splash.
For Phase 3A: store `onboardStep` in localStorage alongside childId only when profile is partially filled. Clear on completion.
- Source: [OnboardJS localStorage persistence pattern](https://onboardjs.com/blog/nextjs-onboarding-onboardjs-getting-started)
- Source: [XState + Next.js App Router](https://www.adammadojemu.com/blog/opinionated-approach-xstate-with-next-js-app-router-rsc)

---

## 3. Navigation Stability — Blank Screens & Back Navigation

### Root cause of current blank screens
`home/page.tsx` line: `if (!profile) return null`
This renders a blank screen when:
- Context hasn't hydrated yet (first paint before `useEffect`)
- `childId` exists but `profile` is null (corrupted state edge case)

### Fix pattern: guard + redirect, not null return
```typescript
// In home/page.tsx — replace "if (!profile) return null"
const { state, isHydrated } = useGameProgress();

if (!isHydrated) return <SplashScreen />; // or skeleton
if (!state.childId || !state.profile) {
  // Context lost — redirect to root which triggers onboarding
  redirect('/'); // server-side: import { redirect } from 'next/navigation'
  // or client-side: router.replace('/') — use replace, not push
}
```

**Rule:** Never `return null` for required data — always redirect or show skeleton.
- Source: [Next.js redirect() docs](https://nextjs.org/docs/app/api-reference/functions/redirect)

### router.back() vs router.push()
| Scenario | Use |
|---|---|
| Back from game → worlds | `router.back()` if history exists, else `router.push('/worlds')` |
| Post-completion redirect | `router.replace('/home')` — prevents back-nav returning to finished game |
| Deep link (direct URL open) | Always guard with profile check; redirect to '/' if no profile |

**Deep-link pattern:**
```typescript
// play/[gameType]/[lessonId]/page.tsx
// If no profile, child deep-linked directly — send to onboarding
if (!childId) return router.replace('/');
```

**Back nav safety:**
```typescript
const canGoBack = window.history.length > 1;
canGoBack ? router.back() : router.push('/worlds');
```
- Source: [Next.js Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- Source: [Next.js redirect guide](https://nextjs.org/docs/app/guides/redirecting)

### Layout auth check warning
Official docs warn: Layouts do NOT re-render on navigation.
Do NOT put sole auth checks in Layout — checks must be close to the data consumer.
Current `(child)/layout.tsx` is correct: it only gates onboarding, not per-page auth.

---

## 4. Settings Page Patterns

### Recommended React patterns for each setting type

**Volume slider:**
```typescript
// Debounce writes to localStorage — don't write on every tick
const [vol, setVol] = useState(savedVol);
const debouncedSave = useMemo(() => debounce((v) => saveSettings({ volume: v }), 300), []);
<input type="range" value={vol} onChange={e => { setVol(+e.target.value); debouncedSave(+e.target.value); }} />
```

**High-contrast toggle:**
Apply class to `<html>` element, not component-local — affects entire app.
```typescript
useEffect(() => {
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
}, [settings.highContrast]);
```

**Bedtime mode + daily break reminder:**
Store as `{ enabled: boolean, hour: number, minute: number }` in settings.
Use `Notification API` (requires parent permission grant). Check `Notification.permission` before scheduling.
For PWA: use `ServiceWorker.registration.showNotification()` for reliable delivery even when app is backgrounded.

**Settings persistence pattern:**
```typescript
// Single source of truth: one settings object in localStorage
type AppSettings = {
  volume: number;         // 0–100
  highContrast: boolean;
  bedtime: { enabled: boolean; hour: number; minute: number };
  breakReminder: { enabled: boolean; intervalMinutes: number };
};
```
Persist via a dedicated `useSettings` hook with localStorage sync. Keep separate from `game-progress-context` to avoid re-renders on every game event.

---

## Summary Recommendations

| Topic | Recommended Approach |
|---|---|
| Guest→auth | Banner on HomeScreen when guest + parent cookie detected; migrate endpoint |
| Onboarding | Keep current `useState` approach; add partial-state localStorage persistence |
| Null profile | Replace `return null` with `router.replace('/')` or skeleton |
| Back nav | `router.back()` with `history.length` guard; `router.replace` after completions |
| Settings | Dedicated `useSettings` hook; debounce slider; toggle class on `<html>` |

---

## Sources
1. [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
2. [Next.js Redirecting Guide](https://nextjs.org/docs/app/guides/redirecting)
3. [Next.js redirect() API](https://nextjs.org/docs/app/api-reference/functions/redirect)
4. [Next.js Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
5. [Common App Router Mistakes — Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
6. [OnboardJS Next.js guide](https://onboardjs.com/blog/nextjs-onboarding-onboardjs-getting-started)
7. [XState + Next.js App Router (opinionated)](https://www.adammadojemu.com/blog/opinionated-approach-xstate-with-next-js-app-router-rsc)
