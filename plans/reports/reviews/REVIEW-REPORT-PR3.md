# Code Review Report — PR #3: Phase A Foundation

| Field | Value |
|-------|-------|
| PR | #3 — Phase A: Foundation (project setup, DB schema, API stubs, UI primitives) |
| Date | 2026-04-24 |
| Reviewer | Golden Triangle (Phase 2 consolidated, Phase 3 structured) |
| Verdict | **BLOCK** — 5 critical issues must be resolved before merge |

---

## CRITICAL (fix before merge)

| # | ID | Location | Issue | Fix | Effort | Risk if skipped |
|---|-----|----------|-------|-----|--------|-----------------|
| 1 | S1 | `middleware.ts` (missing) | No auth middleware. All 14 API routes publicly accessible. | Create `middleware.ts` at project root with NextAuth/JWT session check. Matcher: `/api/((?!auth/register\|auth/login).*)`. Return 401 for unauthenticated requests. | M | Any user can access any parent/child data. Total data breach. |
| 2 | S2 | `app/api/progress/[childId]/route.ts`, `app/api/report/[childId]/route.ts`, `app/api/children/[id]/*`, `app/api/sessions/[id]/*` | IDOR: URL params never validated against authenticated session. Parent A reads Parent B's child data. | In each route, extract `parentId` from session, query `Child` with `where: { id: params.childId, parentId }`. Return 403 on mismatch. | M | Cross-account data leakage. COPPA risk for child data. |
| 3 | S3 | `lib/types/api.ts:57` — `SubmitAttemptRequest.correct: boolean` | Client supplies `correct` boolean. Server trusts it blindly. Game integrity is zero. | Remove `correct` from `SubmitAttemptRequest`. Server must look up `AIQuestion.payload` by `questionId`, compare `answer` against expected answer, compute correctness server-side. | L | Children (or adults) can submit `correct: true` for every answer. All progress/stars/stickers meaningless. |
| 4 | A5 | `app/globals.css:131-133` — `@theme inline` block | `--shadow-card: var(--shadow-card)` is a CSS custom property self-reference. Tailwind v4 `@theme inline` creates NEW properties; referencing the same name creates a cycle. All `shadow-card`, `shadow-pop`, `shadow-tile` utilities resolve to empty. | Rename the theme keys: `--shadow-card: var(--shadow-card)` -> use the raw values directly, e.g. `--shadow-card: 0 2px 0 rgba(46,90,58,0.08), 0 10px 24px rgba(46,90,58,0.10)`. Or rename source vars to `--_shadow-card` (private prefix) then map `--shadow-card: var(--_shadow-card)`. Same for `--shadow-pop`, `--shadow-tile`, `--font-kid`, `--font-num`, `--font-parent`. | S | Every component using `shadow-card`/`shadow-pop`/`shadow-tile` Tailwind classes has no shadow. Entire app looks flat, no 3D tactile feel — core UX identity broken. |
| 5 | C8 | `prisma/schema.prisma` — all relations | No `onDelete: Cascade` on any FK. Prisma defaults to `Restrict`. Deleting a `Child` fails because `GameSession`, `ChildSticker`, `Streak`, `ChildSettings` rows reference it. | Add `onDelete: Cascade` to: `Child.parent`, `ChildSettings.child`, `GameSession.child`, `GameAttempt.session`, `ChildSticker.child`, `Streak.child`. Keep `Restrict` on `Lesson` FKs (data integrity). | S | Parent cannot delete a child profile once any game session exists. Admin cleanup impossible. Orphaned data accumulates. |

---

## HIGH (fix same sprint, before affected routes ship)

| # | ID | Location | Issue | Fix | Effort | Risk if skipped |
|---|-----|----------|-------|-----|--------|-----------------|
| 6 | A1 | All 14 `app/api/**/route.ts` files | Route handlers have signature `GET()` / `POST()` with no `request` parameter. Cannot read body, headers, or params. Phase B/C implementation blocked. | Change signatures to `GET(request: NextRequest, { params }: { params: Promise<{ id: string }> })` (or appropriate param shape). Import `NextRequest` from `next/server`. | S | Every API implementation in Phase B requires touching every route signature first. |
| 7 | A2 | `app/api/` | 3 routes missing from plan: `/api/worlds`, `/api/lessons/[lessonId]`, `/api/streaks/[childId]`. | Create stub route files following existing pattern. | XS | World map screen and streak features have no backend endpoint. |
| 8 | P1 | `prisma/schema.prisma` | No `@@index` directives. Missing indexes on `Child.parentId`, `GameSession.childId`, `GameSession.lessonId`, `GameAttempt.sessionId`. | Add `@@index([parentId])` to `Child`, `@@index([childId])` to `GameSession`, `@@index([sessionId])` to `GameAttempt`. | XS | Full table scans on every parent-dashboard query. Slow at scale. |
| 9 | A10 | `prisma/` directory | No `prisma/migrations/` — only `schema.prisma`. `prisma migrate deploy` (used by docker-compose `migrate` service) fails with no migrations to apply. | Run `npx prisma migrate dev --name init` to generate initial migration. Commit the `prisma/migrations/` directory. | XS | Docker deployment fails. Database schema never created. |
| 10 | S7 | `next.config.ts` | Empty config. No HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS). | Add `headers()` async function returning security headers array. At minimum: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. | S | Clickjacking, MIME sniffing, referrer leakage. Fails basic security audit. |
| 11 | C3 | `components/ui/bap-mascot.tsx:91-92` | Both eyes render identical `EYES[mood]`. For `wink` mood, both eyes show closed arc — looks asleep, not winking. | Create separate `LEFT_EYE` and `RIGHT_EYE` maps. `wink` left eye = normal open eye, right eye = closed arc. | S | Mascot's signature wink expression is broken. Key brand personality feature. |
| 12 | C4 | `components/ui/num-tile.tsx:41` | `disabled` state uses `pointerEvents: 'none'` only. No HTML `disabled` attribute. Keyboard users can still activate via Enter/Space. Screen readers don't announce disabled state. | Add `disabled={state === 'disabled'}` and `aria-disabled={state === 'disabled'}` to the `<button>`. | XS | Accessibility failure. Keyboard-only users can interact with disabled tiles. |
| 13 | C5 | `components/ui/big-button.tsx:42` | `disabled` prop prevents `onClick` in JS but no HTML `disabled` attr on `<button>`. Keyboard Enter still fires native button behavior. | Add `disabled={disabled}` to the `<button>` element. | XS | Same accessibility issue as C4. |
| 14 | C1 | `context/audio-context.tsx:40,52-53` | `speak()` hardcodes `utterance.lang = 'en-US'`. `voiceStyle` and `kidLang` are hardcoded strings in provider value, not state. Changing settings has no effect. | Make `voiceStyle` and `kidLang` state via `useState`. Wire `kidLang` into `utterance.lang` mapping (`'en' -> 'en-US'`, `'vi' -> 'vi-VN'`). | S | Vietnamese language setting does nothing. Voice always speaks English. |
| 15 | A6 | `app/layout.tsx:9` vs `app/globals.css:58` | Layout registers `--font-fredoka` CSS variable via `next/font`. But `globals.css` uses literal `'Fredoka'` in `--font-kid`. Next.js font optimization bypassed — browser fetches font from Google instead of self-hosted subset. | Change `globals.css:58` to `--font-kid: var(--font-fredoka), 'Baloo 2', ui-rounded, system-ui, sans-serif;`. Same for `--font-num`. | XS | Larger font payload, FOUT on slow connections, font optimization wasted. |

---

## WARN (tech debt, fix in Phase B/C/D)

| # | ID | Location | Issue | Fix | Effort |
|---|-----|----------|-------|-----|--------|
| 16 | C9 | `context/theme-context.tsx:29` | `useState(readStoredTheme)` calls `localStorage` during SSR lazy init. Returns `'garden'` on server but may differ on client. Hydration mismatch warning. | Init with `'garden'`, apply stored value in `useEffect`. | XS |
| 17 | C21 | `context/game-progress-context.tsx:108` | `ctx` object recreated every render. All consumers re-render on any state change. | Wrap `ctx` in `useMemo` keyed on `state` + dispatch-based callbacks (stable via `useReducer`). | XS |
| 18 | Q1 | `num-tile.tsx` + `big-button.tsx` | 5-event press handler (~40 lines) duplicated verbatim. | Extract `usePressEffect(disabled: boolean)` hook returning event handler props. | S |
| 19 | Q3 | `components/ui/streak-card.tsx:9` | `DAYS = ['M','T','W','T','F','S','S']` — Tue and Thu both `'T'`. | Use `['M','Tu','W','Th','F','Sa','Su']`. | XS |
| 20 | C6 | `components/ui/num-tile.tsx` | Touch events have no `preventDefault()`. Mobile fires both `touchend` + synthetic `click` — double visual jitter on press. | Add `e.preventDefault()` in `onTouchEnd`. | XS |
| 21 | S4 | `app/api/auth/pin/route.ts` | PIN endpoint (stub) has no rate-limit design. 4-digit PIN = 10k combinations, brute-forceable in seconds. | When implementing: add rate limiting (5 attempts/min per session), PIN length validation (exactly 4 digits). | S |
| 22 | S6 | API auth design | Session token architecture not defined. If returned in JSON body, vulnerable to XSS token theft. | Design auth to use `HttpOnly`, `Secure`, `SameSite=Strict` cookies. | M |
| 23 | P6 | API route design | N+1 query risk on parent dashboard (children + settings + progress). | Use Prisma `include` for eager loading when implementing. | S |
| 24 | C13 | `prisma/schema.prisma:26` vs plan | `Child.color` defaults to `"sun"` but plan spec says `"sage"`. | Align with plan or update plan. Decide one source of truth. | XS |
| 25 | P11 | `lib/types/api.ts:63` | `GenerateQuestionsRequest.count` has no upper bound. Client can request `count: 999999` questions. | Add server-side validation: `count = Math.min(count ?? 10, 50)`. | XS |

---

## INFO

| # | Note |
|---|------|
| 26 | Zero test files in entire PR. Violates TDD Iron Law. Plan for Phase B should include test scaffolding. |
| 27 | No `app/(child)/home/page.tsx` — root `page.tsx` redirect to `/child/home` will 404. |
| 28 | `body { overflow: hidden }` in `globals.css:155` may block page-level scroll on taller screens. Verify on real devices. |
| 29 | `public/` has default Next.js SVG placeholders (`next.svg`, `vercel.svg`). Remove before production. |
| 30 | Dockerfile exists and is well-structured (multi-stage, non-root user). I1 finding from earlier review was incorrect. |
| 31 | `docker-compose.yml` properly uses `env_file: .env` and `${POSTGRES_PASSWORD}` — not hardcoded. S8 finding was incorrect. |

---

## Dependency Order

```
A5 (shadow self-ref)      -> standalone, fix first for visual testing
C8 (onDelete cascade)     -> before A10 (migration)
A10 (generate migration)  -> after C8, before any Docker deploy
S1 (middleware)            -> before S2 (IDOR requires session to validate against)
S2 (IDOR)                 -> after S1
A1 (route signatures)     -> before S2 and S3 (routes need request param)
S3 (server-side correct)  -> after A1
A2 (missing stubs)        -> standalone
```

**Recommended fix order**: A5 -> C8 -> A10 -> A1 -> S1 -> S2 -> S3 -> remaining HIGH in any order.

---

## Effort Summary

| Severity | Count | Total Effort |
|----------|-------|-------------|
| CRITICAL | 5 | ~2 days |
| HIGH | 10 | ~1.5 days |
| WARN | 10 | ~1 day |
| **Total** | **25** | **~4.5 days** |
