# QA — Plan Review: phase1-completion
**Date**: 2026-04-25 | **Reviewer**: tech-lead (Golden Triangle P4)
**Verdict**: APPROVED (with 2 amendments)

---

## Traceability Matrix

| Gap (Scout) | Plan Phase | Steps | AC | Status |
|---|---|---|---|---|
| StreakCard not wired into Home | A | A1, A2 | Home bottom renders StreakCard w/ weekData | PASS |
| StreakCard not wired into Reward | A | A3, A4 | Reward renders StreakCard when streak>0 | PASS |
| Difficulty not passed to AI generator | B | B1, B2 | loadQuestions 4th param, POST body includes difficulty | PASS |
| Roadmap M5-M9 statuses stale | C | roadmap.md edits | No "Todo" for implemented tasks | PASS |

---

## Technical Coherence Findings

### Phase A — StreakCard (PASS with note)

**A1**: Confirmed. `home/page.tsx` line 33 destructures only `currentStreak`; API route returns `longestStreak`. Plan's change is correct and minimal.

**A2 — Amendment 1 (non-blocking)**: Plan says "replace lines 53-60 with a simpler streak badge" then says "top bar badge stays as-is". This is contradictory wording. The top-bar `🔥 {streak}` badge (lines 53-60) SHOULD stay unchanged — `<StreakCard>` replaces only the Weekly Progress section (lines 101-125). The plan body text correctly describes this at the end of Step A2, but the interim code block creates confusion. Implementer must skip the badge replacement and only replace the Weekly Progress section. **No code change needed; just clarify the instruction.**

**A3**: Confirmed. `reward/page.tsx` `SessionResult` interface (line 9) lacks `streak` field. `useGameSession.completeSession` returns `SessionResult` with `streak: { currentStreak, longestStreak }`. When `childId` is guest, `completeSession` returns `null` — the plan handles this with `result.streak ?? null`. Correct.

**A4**: Confirmed. `reward-content.tsx` has no `streak` prop today. After A3+A4 the component receives it optionally. Render guard `streak.currentStreak > 0` is correct for child UX.

**Line counts post-change (all within 200 limit)**:
- `home/page.tsx`: 72 → ~79 (+7 lines: state + fetch destructure + prop) — OK
- `home-screen.tsx`: 129 → ~106 (-23 lines: 25 weekly-progress lines replaced by 1 StreakCard call + 1 import + 1 prop) — OK
- `reward/page.tsx`: 64 → ~73 (+9 lines: interface field + prop pass) — OK
- `reward-content.tsx`: 85 → ~95 (+10 lines: import + prop + conditional render) — OK

### Phase B — Difficulty Wiring (PASS)

**B1**: Confirmed. `question-loader.ts` (41 lines) currently sends `{ lessonId, gameType, count }`. AI route reads `difficulty` from body with default `'easy'` (route.ts line 30). Adding 4th param with default `'easy'` is backward-compatible — callers that don't pass it retain current behavior.

**B2**: Confirmed. `LESSON_TEMPLATES` has `difficulty` typed as `Difficulty` ('easy'|'medium'|'hard') on every lesson. `lesson?.difficulty ?? 'easy'` is safe.

**Post-change line count**: `question-loader.ts` 41 → 42, `play/page.tsx` 96 → 99 — both within limit.

### Phase C — Roadmap Sync (PASS with note)

**Amendment 2 (non-blocking)**: The plan marks M5 tasks as "Deferred" but the roadmap header already says "Phase 1 — Production MVP ✅ Complete". The plan should also update the M6/M7/M8/M9 headers to show ✅ Done (matching M1-M4, M10-M12 style), not just update individual task rows. Recommend implementer adds ` ✅ Done` to the M6, M7, M8, M9 milestone heading lines, and marks M5 as `⏭ Deferred`.

---

## Completeness Check

All 3 scout-identified gaps are addressed. No orphan tasks. No scope creep.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| A2 confusing wording leads to deleting top-bar badge | Low | Amendment 1 above; verify via tsc + visual check |
| Guest path: `completeSession` returns null → streak absent | Low | Plan handles with `?? null` guard — correct |
| `weekData` prop missing on Reward StreakCard | None | Plan correctly omits it (optional, defaults to empty) |

---

## Unresolved Questions

None blocking. Plan is ready for execution.
