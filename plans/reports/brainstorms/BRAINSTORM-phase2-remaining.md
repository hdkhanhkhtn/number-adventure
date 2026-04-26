# BRAINSTORM — Phase 2 Remaining Work
**Date:** 2026-04-25 | **Author:** brainstormer | **Status:** Final Synthesis

---

## 1. Executive Summary

Phase 2's technical deliverables are complete: audio pipeline, PWA/offline, difficulty engine, 7 game types, GAME_REGISTRY, 63 lessons across 7 worlds. What remains is **UX completion** (11 of 33 designed screens missing), **backend hardening** (2 auth stubs returning 501), and **quality closure** (component tests for 2 new game UIs). The critical insight is that these gaps are not equal: a handful block real-world usability for parents (auth, session enforcement, parent onboarding), while most are polish overlays that enhance but don't break the core loop. Recommendation: define Phase 2D as the **"shippable MVP" gate** — auth, session enforcement, empty states, and 5 high-value missing screens — and explicitly defer the remaining 6 cosmetic screens plus notification permission to Phase 3.

---

## 2. Priority Matrix

| Item | Priority | Effort | Risk if Deferred |
|---|---|---|---|
| `POST /api/auth/pin` + `GET /api/auth/session` (auth stubs) | P0 | M | Parent PIN gate is client-only — trivially bypassed. Security hole. |
| Guest-to-DB registration (onboarding TODO) | P0 | M | Progress lost on app reinstall / clear storage. Child retention killer. |
| Session time limit enforcement UI | P0 | S | `dailyMin` stored but never enforced — parent trust broken. |
| Parent Dashboard empty state | P0 | S | Crashes UX for new parents — first impression damage. |
| Settings — Profile & Security tab (PIN change, reset) | P0 | M | No way to change PIN = parents locked out permanently if forgotten. |
| Component tests: `count-objects-game`, `number-writing-game` | P0 | S | New game types ship untested at UI level. Regression risk. |
| First Day Intro (World Intro) screen | P1 | M | Cold-start confusion — child lands on World Map with no orientation. |
| World Unlock Celebration overlay | P1 | S | Milestone moment goes unrewarded. Kills motivation loop. |
| Session Complete / Time Limit screen | P1 | S | Session end is abrupt — no natural stopping point communicated. |
| Daily Goal Complete screen | P1 | S | Reward loop incomplete — daily goal achieved silently. |
| Parent Onboarding (first-run flow) | P1 | M | Parent drops off without understanding dashboard features. |
| Exit Game Confirmation modal | P1 | XS | Accidental exits lose in-progress sessions — frequent child UX issue. |
| Sticker Earn Moment overlay | P2 | S | Sticker reward is silent. Lowers sticker book engagement. |
| Sticker Detail screen | P2 | XS | Sticker book browsing incomplete. No description on tap. |
| Streak Screen (standalone full-page) | P2 | S | Streak widget exists; full page adds depth but not critical. |
| Offline / No Connection state screen | P2 | S | PWA caching handles gameplay; UI feedback is polish. |
| Notification Permission Request screen | P2 | XS | Push notifications not wired to backend yet — premature. |
| Parent Dashboard sparkline / skill gap callout | P2 | M | Data exists in API but not surfaced. Nice analytics, not blocking. |
| "Big Number Castle" world (if in roadmap) | P2 | L | Scout found no reference in worlds.ts — may be Phase 3 content. |

Legend: XS=<1 day, S=1-2 days, M=3-5 days, L=1+ week

---

## 3. Proposed Phase Structure

### Phase 2D — "Shippable MVP Gate" (P0 items + critical P1)

**Goal**: Close all gaps that break parent trust, child retention, or security.

**Scope**:
1. **Auth hardening**: Implement `POST /api/auth/pin` (bcrypt compare + rate limiting) and `GET /api/auth/session`. Wire `parent-gate.tsx` to real API.
2. **Onboarding persistence**: Complete guest-to-DB registration path in `app/(child)/layout.tsx`. Remove localStorage-only dependency for progress.
3. **Session time enforcement**: Add session-end screen/modal triggered when `dailyMin` elapsed. Simple countdown + "Great job, see you tomorrow!" state.
4. **Parent Dashboard empty state**: Skeleton/empty UI when child has no sessions yet.
5. **Settings Profile & Security tab**: 4th tab with PIN change, profile name edit, and reset progress (with confirmation modal).
6. **Component tests**: `count-objects-game.test.tsx` + `number-writing-game.test.tsx` covering tap interaction, completion trigger, and error states.
7. **Exit Game Confirmation modal**: Simple "Are you sure?" overlay on back/exit press during active session.
8. **World Unlock Celebration overlay**: Confetti + mascot animation on first access to newly unlocked world.
9. **Daily Goal Complete screen**: Post-session screen when `dailyMin` achieved for the day.

**Rationale**: Items 1-3 are security/data-integrity P0. Items 4-6 are quality P0. Items 7-9 are highest-value P1 that close the retention loop with minimal effort.

---

### Phase 2E — "Polish Completion" (P1/P2 cosmetic items)

**Goal**: Bring screen count from 22 → 30+ for design parity. Optional for Phase 2 sign-off.

**Scope**:
1. **First Day Intro (World Intro)** screen — orientation overlay for new players
2. **Parent Onboarding** first-run flow
3. **Session Complete** screen variant (distinct from reward screen)
4. **Sticker Earn Moment** overlay
5. **Sticker Detail** screen
6. **Streak Screen** standalone page
7. **Offline / No Connection** state screen

**Decision gate**: If Phase 2D ships and passes stakeholder review, Phase 2E runs immediately. If Phase 3 (multiplayer/social) has higher business priority, Phase 2E items slide to Phase 3 as "debt closure."

---

## 4. Trade-off Analysis

### T1: Auth Now vs. Phase 3

**Option A (Recommend)**: Implement PIN auth in Phase 2D. bcrypt + rate limiting + session cookie — ~3 days. The current client-only PIN check is a trivial bypass. Parents discovering this erodes trust entirely. The 501 stub was explicitly tagged "Phase C" which is now.

**Option B**: Keep client-only, defer to Phase 3. Faster Phase 2 ship but security regression visible to technical parents. Not acceptable for a children's app.

**Decision**: Implement in 2D. Non-negotiable for production readiness.

---

### T2: Guest Persistence — localStorage vs. Full DB Registration

**Option A (Recommend)**: Complete the DB registration path on profile creation. UUID in localStorage was always a temporary measure (`// Phase B: DB registration is deferred to Phase C`). Progress loss on storage clear is a 1-star App Store review waiting to happen.

**Option B**: Add DB sync on every session save (lazy registration). More complex — creates orphan session rows before child profile exists.

**Decision**: Complete registration on profile creation (Option A). Simpler, already designed for.

---

### T3: All 11 Missing Screens vs. Critical Path Only

**Option A (Recommend)**: Phase 2D covers 9 items (P0 + high-value P1). Phase 2E covers remaining 7. Total ~6-8 dev days.

**Option B**: Implement all 11 in one push. Risk of scope creep and delayed Phase 2 sign-off.

**Option C**: Implement only P0 (6 items), defer everything else to Phase 3. Fastest Phase 2 close but leaves retention loops broken (no world unlock celebration, no daily goal celebration).

**Decision**: Option A. P1 items (world unlock, daily goal, exit confirm) take <1 day each and have outsized impact on daily active usage.

---

### T4: Notification Permission Screen

**Skip for Phase 2**. Push notification backend (APNs/FCM integration) does not exist. Requesting permission without being able to send notifications is a dark pattern — users deny forever. Implement in Phase 3 when notification backend is ready.

---

### T5: "Big Number Castle" World

**Defer to Phase 3**. Scout found no reference in `worlds.ts` or lesson templates. If it's in the roadmap as a 7th world, the existing 7 worlds (including writing-workshop) already constitute full content. Adding an 8th is scope expansion, not completion.

---

## 5. Risks & Open Questions

**Risks**:
- **Auth rate limiting**: `POST /api/auth/pin` needs rate limiting to prevent PIN brute-force. Recommend in-memory sliding window (5 attempts / 15 min per IP) in Phase 2D. Redis-backed rate limiting is YAGNI at this scale.
- **bcrypt on Next.js edge runtime**: If `api/auth/pin` runs on Edge, bcrypt (native binding) fails. Must use Node.js runtime. Add `export const runtime = 'nodejs'` to that route.
- **Guest UUID migration**: Existing localStorage `guest_<UUID>` users have no migration path if DB registration wasn't completed. Phase 2D must handle "existing guest without DB row" gracefully — create row on next session save.
- **Session time limit UX**: If child is mid-question when time elapses, abrupt cutoff is jarring. Implement "complete current question, then show time-up screen" — not hard stop.

**Open Questions**:
1. Does Phase 2 sign-off require all 33 designed screens, or is 30+ (22 existing + 2D additions) acceptable? Determines if Phase 2E is in-scope or Phase 3.
2. PIN reset flow: if parent forgets PIN, is email recovery in scope or is it "reset all progress"? Affects Profile & Security tab design.
3. `number-sequence` world reuses `number-order` engine — intentional? If a distinct sequence-with-gaps mechanic is planned, that's a new engine (Phase 3).
4. Component tests for new game UIs — should these be added before or after Phase 2D? Recommend before (P0 in same phase).
