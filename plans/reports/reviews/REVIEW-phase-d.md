# Code Review Report — PR #6 Phase D
**Branch**: feature/phase-d-audio-a11y-tests-deploy → main
**Reviewer**: code-reviewer subagent | 2026-04-25
**Build**: ✓ PASS (tsc --noEmit clean, next build success)
**Tests**: ✓ 167/167 pass

---

## Plan Alignment: PASS

All 4 commits deliver what the PR description claims:
- AudioService + WebSpeechProvider + GoogleTTS stub — implemented
- Audio wired into 5 games, ARIA attributes added, Framer Motion integrated — implemented
- 5 new test files (95 new tests across api + components) — implemented, all passing
- nginx.conf, prisma/seed.ts, seed.sh — implemented

---

## Code Quality: PARTIAL

---

## Issues Found

| # | Severity | File:Line | Description | Recommendation |
|---|----------|-----------|-------------|----------------|
| 1 | Important | `app/(child)/play/…/hear-tap-game.tsx:37-49` | Wrong tile re-tap not blocked. `onPick` guards only against `correctPicked`, not against `wrongs.has(n)`. A child can tap an already-wrong tile repeatedly — each tap calls `handleWrong()` and drains another heart. | Add `if (wrongs.has(n)) return;` at top of `onPick`. |
| 2 | Important | `app/(child)/play/…/hear-tap-game.tsx:43` | Bare `setTimeout` (900ms) fires `handleCorrect()` after unmount if user exits immediately after a correct answer. No cleanup ref or `clearTimeout`. | Capture the return value in a ref, clear in `useEffect` cleanup. |
| 3 | Important | `app/(child)/play/…/hear-tap-game.tsx:60` | Speaker button has no `aria-label`. Screen readers announce nothing useful ("button"). The `SpeakerIcon` child is decorative; text child "TAP TO HEAR" is inside but not exposed as label. | Add `aria-label="Tap to hear the number"` to the button. |
| 4 | Important | `nginx/nginx.conf` | Zero security headers. Missing: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `server_tokens off`. Also no HTTPS/TLS block — HTTP-only in production. | Add an `add_header` block with minimum security headers; add `server_tokens off`. TLS block is acceptable as a separate ops ticket if terminated at load balancer, but must be documented. |
| 5 | Suggestion | `context/audio-context.tsx:84-103` | `speakNumber`, `speakText`, `stop` are plain inline functions (not `useCallback`), included in `value` useMemo with `// eslint-disable-next-line react-hooks/exhaustive-deps`. They're safe because they close over `serviceRef` (always current), but the lint suppression is misleading. | Wrap each in `useCallback` with `[]` deps and remove the suppression comment, or leave as-is and add a code comment explaining why the suppression is safe. |
| 6 | Suggestion | `context/audio-context.tsx:14` + `lib/audio/types.ts:17` | `voiceStyle` in `AudioContextValue` is typed as `string`, while `AudioConfig` requires `VoiceStyle` (`'Friendly' \| 'Slow' \| 'Adult'`). The cast `(voiceStyle as VoiceStyle)` is widening without validation. An invalid string from a future settings form would silently fall through to `STYLE_MAP` lookup (which does have a `?? Friendly` fallback in the service, so runtime is safe, but TypeScript doesn't catch it). | Type the context's `voiceStyle` as `VoiceStyle` throughout, removing the need for a cast. |
| 7 | Suggestion | `components/ui/num-tile.tsx:85` | `aria-pressed={state === 'correct' \|\| state === 'wrong'}` is semantically incorrect. `aria-pressed` communicates toggle state (on/off). The tile is a single-action answer button, not a toggle; `aria-pressed=true` on a wrong answer is misleading to screen readers. | Remove `aria-pressed` and instead use `aria-current` or communicate result state through an `aria-live` region. |
| 8 | Suggestion | `app/api/ai/generate-questions/route.ts` | The `lessonId` in the POST body is not verified against the authenticated child's accessible lessons before writing to `AIQuestion`. Any session-authenticated user can append questions to any `lessonId`. | Query `Lesson.where({ id: lessonId, world: { accessible } })` or at least validate the lessonId exists before writing. |
| 9 | Suggestion | All 5 game files | All games share an identical `setTimeout(…, 900)` pattern with no cleanup. This is a DRY violation across the codebase. | Extract into a shared `useDelayedAdvance(ms)` hook that returns a stable caller with built-in cleanup. |

---

## Workshopman Domain Checks
- [x] Multi-tenant isolation: N/A (single-user game app, not multi-tenant)
- [x] No secrets exposed: no API keys, credentials, or env values hardcoded in diff
- [x] API contracts preserved: new endpoints follow existing route patterns; seed script is additive

---

## Positives

- **Provider pattern with fallback** (`AudioService` → `GoogleTTSProvider` → `WebSpeechProvider`) is cleanly extensible. The stub pattern for Google TTS is explicit and honest.
- **useRef for AudioService** avoids re-instantiation on every render while keeping config updates reactive via `updateConfig`. Correct pattern for a non-reactive side-effect object.
- **SSR safety** is handled correctly: `typeof window === 'undefined'` guard in both the context effect and `WebSpeechProvider.isAvailable()`.
- **`onerror → resolve()`** in `WebSpeechProvider.speak()` prevents hanging promises on speech synthesis errors — a common oversight.
- **Pointer event press UX**: `setPointerCapture` → prevents ghost press loss when dragging off the button. Correct touch handling for a child-focused app.
- **ARIA on GameHud**: `role="progressbar"` with all required attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`) is complete and correct.
- **Test quality**: Report route tests cover auth (401, 403), IDOR boundary, aggregation logic, and edge cases (zero attempts, null streak). API boundary coverage is thorough.
- **Prisma seed**: upsert-based seeding is idempotent — safe to re-run without duplicates.
- **Build + TypeScript**: zero errors, zero warnings. Clean.

---

## Verdict: APPROVED WITH CONDITIONS

**Must fix before merge (blockers):**
1. Issue #1 — wrong tile re-tap drains hearts incorrectly (gameplay bug)
2. Issue #2 — bare setTimeout fires after unmount (memory/state update warning in React)
3. Issue #3 — speaker button missing aria-label (accessibility regression in the core game mechanic)
4. Issue #4 — nginx security headers missing (security requirement for production deploy)

Issues #5–#9 are tech debt; acceptable to defer with a follow-up ticket.

---

## Unresolved Questions

1. Same-pattern setTimeout (900ms) also appears in `build-number-game.tsx` (1000ms), `even-odd-game.tsx`, `number-order-game.tsx`, `add-take-game.tsx` — all with the same missing cleanup. Are any of these in scope for this PR or is cleanup deferred to a hook extraction pass?
2. Is TLS terminated at a load balancer/CDN upstream of nginx? If yes, Issue #4 can be narrowed to just adding security response headers and `server_tokens off` without a TLS block.
3. The `lessonId` ownership check (Issue #8) — is the `AIQuestion` table considered a public write target (shared AI cache) or child-owned data? This affects severity of the finding.
