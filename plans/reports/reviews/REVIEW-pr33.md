# Code Review: PR #33 — fix(phase-3a) Settings Persistence, Migration Transaction, Play Guard

## Verdict: ❌ CHANGES REQUIRED

## Executive Summary
**⚠️ Plain language:** Parents who play the app as a guest and then create an account will permanently lose all their child's game history, stars, and stickers — this data loss is 100% reproducible on every account creation today. Additionally, the session recording system has no login check, meaning anyone on the internet can award stars and stickers to any child without playing. These two issues make the feature unsafe for production regardless of the other improvements in the PR.

PR #33 delivers settings persistence, guest-to-registered migration with transaction safety, and a play guard — all core Phase 3A requirements. Three blockers prevent merge: (1) guest history is silently discarded because `guestId` is never sent in the migrate POST body, breaking the entire onboarding funnel; (2) session endpoints have zero authentication, allowing unauthenticated IDOR manipulation of any child's data; (3) the settings PATCH accepts arbitrary out-of-range numeric values. With ~10h of focused fixes, the PR is close to shippable.

## Risk Assessment
| Risk | Severity | Likelihood | Business Impact | Mitigation |
|------|----------|------------|-----------------|------------|
| Guest data permanently lost on migration | CRITICAL | HIGH (100% of migrations) | Core feature broken; user trust loss | Add `guestId` to migrate POST body (G3) |
| Unauthenticated session manipulation (IDOR) | CRITICAL | HIGH | Any user can inflate stars/stickers for any child | Add auth + ownership check to session endpoints (NEW-S1) |
| Settings PATCH accepts out-of-range values | CRITICAL | MEDIUM | DB corruption; bedtime logic crash; play disabled via dailyMin=0 | Add numeric range validation (R18) |
| Duplicate child creation on concurrent migrate | HIGH | LOW | Double-copied session data; orphaned records | Move findFirst inside transaction + catch P2002 (R1+R2) |
| XSS via unbounded name field on POST /children | HIGH | MEDIUM | Stored XSS in child profile rendered across app | Validate name length ≤ 50 chars (NEW-S3) |
| Multi-child settings collision in localStorage | HIGH | **HIGH** (shared family tablets/phones is the norm for this target demographic) | Child A bedtime overrides Child B; silent data loss on deploy for all existing users | Namespace key by childId + migration (R12) |

## Critical Issues (BLOCK MERGE — 3) — MUST fix
| # | Category | File:Line | Description | Fix | Effort |
|---|----------|-----------|-------------|-----|--------|
| 1 | Data Loss | `app/(child)/layout.tsx:139` | migrate POST body omits `guestId`; all guest sessions, stickers, streak silently dropped on migration | Add `guestId: state.childId ?? undefined` to JSON body | S (15min) |
| 2 | Security / Input | `app/api/children/[id]/settings/route.ts:52-60` | No numeric range validation; client can set volume=-999, dailyMin=0, bedtimeHour=99 | Add range checks for volume (0-100), dailyMin (1-240), bedtimeHour (0-23), bedtimeMinute (0-59), breakReminderIntervalMin (1-120) before upsert | S (30min) |
| 3 | Security / Auth | `app/api/sessions/route.ts` + `[id]/route.ts` + `[id]/attempts/route.ts` | Zero authentication on all session endpoints; unauthenticated callers can create sessions, award stickers, inflate streaks for any child (IDOR) | Add parentId cookie check + child ownership verification; guest prefix bypass allowed only after confirming no real child record exists | M (3h) |

## HIGH Issues (11) — Should fix in this sprint
| # | Category | File:Line | Description | Fix | Effort |
|---|----------|-----------|-------------|-----|--------|
| 1 | Error Handling | `app/api/children/migrate/route.ts:115` | Bare catch swallows P2002; concurrent duplicate migration returns 500 instead of 409; client retries indefinitely | Catch P2002 code and return `{ error: 'Child already exists' }` with status 409 | S |
| 2 | Race Condition | `app/api/children/migrate/route.ts:53-59` | TOCTOU: findFirst runs outside transaction; two concurrent requests can both read null and create duplicate children | Move findFirst inside `$transaction` callback; R1+R2 must ship together | S |
| 3 | Input Validation | `app/api/children/[id]/settings/route.ts:41` | Null or malformed JSON body causes unhandled TypeError returning generic 500 | Wrap `request.json()` in try/catch; return 400 on parse failure | S |
| 4 | Guard Condition | `lib/hooks/use-game-session.ts:38` | Empty string childId passes `startsWith('guest_')` guard; creates session with empty string FK | Change guard to `if (!childId \|\| childId.startsWith('guest_'))` | S |
| 5 | Render Error | `app/(child)/play/[gameType]/[lessonId]/page.tsx:67-70` | `timeUp && loading` redirect condition — once loading false the redirect stops firing; may leave child stuck | Verify intended behavior; fix condition to `timeUp && !showTimeUp` if redirect must always fire | S |
| 6 | Data Isolation | `lib/hooks/use-settings.ts:22,53` | localStorage key `bap-settings` not namespaced by childId; all children on same device share one settings record; deploying fix without migration silently erases existing saved settings | Namespace key as `bap-settings-${childId}`; add one-time legacy key migration on mount | S |
| 7 | Data Consistency | `lib/hooks/use-settings.ts:28` | Bedtime hour default is 20 in hook but 21 in DB schema; guest vs registered users see different defaults | Change hook default from `hour: 20` to `hour: 21` | S |
| 8 | Type Safety | `lib/types/common.ts:48-58` | `ChildSettings` interface missing 10 DB fields (volume, highContrast, reduceMotion, bedtimeEnabled, bedtimeHour, bedtimeMinute, breakReminderEnabled, breakReminderIntervalMin, gameHints, gameRotation); bugs hide at compile time | Expand interface to match full DB schema | S |
| 9 | Type Safety | `lib/types/api.ts:32-42` | `UpdateChildSettingsRequest` missing same 10 fields as ChildSettings; PATCH cannot accept these fields safely | Expand interface with all optional fields matching DB schema | S |
| 10 | Security / Input | `app/api/children/route.ts:34` | POST /children: name not bounded (XSS via stored unbounded string); color not validated (arbitrary string stored in DB) | Validate name 1-50 chars; validate color against `['sun','sage','coral','lavender','sky']` allowlist | S |
| 11 | Test Coverage | `__tests__/api/children-migrate.test.ts` | Zero tests for guestId copy path — the core feature of the migration route is untested | Add 4 test cases: valid copy, missing guestId, invalid prefix, no guest streak | M (2h) |

## Warnings (15) — Track in backlog
| # | Category | File:Line | Description |
|---|----------|-----------|-------------|
| 1 | Security | `app/api/children/migrate/route.ts` | No CSRF token on migrate endpoint |
| 2 | Logic | `app/api/children/migrate/route.ts` | Streak upsert dead update branch — newly created child never has existing streak |
| 3 | Data Loss (Minor) | `app/api/children/migrate/route.ts` | DifficultyProfile not copied during migration; minor data loss for advanced users |
| 4 | Logic | `app/(child)/play/[gameType]/[lessonId]/page.tsx:67-70` | `timeUp && loading` condition downgraded — behavior appears intentional; verify React strict mode double-fire |
| 5 | Performance | `lib/hooks/use-game-session.ts` | `loadLessonSync` not memoized; O(n) static array lookup with n~50; low impact |
| 6 | Memory Leak | `lib/hooks/use-settings.ts` | Pending debounce fires after unmount; in multi-profile context writes previous child's settings to DB after context switch; fix: `saveDebounced.cancel?.()` in cleanup |
| 7 | Architecture | `lib/hooks/use-settings.ts` | Two parallel settings state machines (hook + server); works correctly today but creates drift risk |
| 8 | REST Semantics | `app/api/children/[id]/settings/route.ts` | `export { PATCH as PUT }` breaks REST semantics; cosmetic |
| 9 | Info Leak | `app/api/children/[id]/settings/route.ts` | GET returns full settings row; no secrets but unnecessary exposure |
| 10 | DB Integrity | Prisma schema | `gameRotation` has no DB-level check constraint; app-level allowlist only |
| 11 | Security | `app/api/auth/login/route.ts` | No rate limiting on login endpoint (pre-existing) |
| 12 | Input | `app/api/sessions/[id]/attempts/route.ts` | Answer field has no length bound; `String(body.answer)` truncated by DB varchar (low risk) |
| 13 | Auth Design | Cookie auth | Cookie stores raw DB primary key; encrypt in Phase 4 (pre-existing design) |
| 14 | Scalability | Rate limiter | In-memory rate limiter not Redis-backed; adequate for single-instance MVP (pre-existing) |
| 15 | Security | Next.js config | No CSP header; add via `next.config.js` headers (infrastructure) |

## Security Summary
Vulnerabilities: 1 Critical (IDOR — unauthenticated session endpoints), 1 High (XSS via unbounded name), 1 High (settings range injection) | OWASP: A01 Broken Access Control, A03 Injection, A05 Security Misconfiguration

## Performance Summary
Bottlenecks: 1 | Impact: `loadLessonSync` O(n) array scan on every call without memoization; negligible at n~50 but should be memoized before content expansion increases lesson count

## Plan Compliance
Phases verified: 3/3 (settings persistence, migration transaction, play guard all implemented) | Deviations: G3 (guestId not wired in client — feature exists in route but dead), G1/G2 (TypeScript types not updated to match DB schema expansion)

## Recommended Actions
1. **[P0]** Fix G3: add `guestId: state.childId ?? undefined` to migrate POST body in `layout.tsx:139` — Owner: frontend-engineer — unblocks onboarding funnel
2. **[P0]** Fix NEW-S1: add parentId cookie + child ownership check to all 3 session endpoints (POST/GET/PATCH sessions, POST attempts); guest bypass must verify no real child record exists with the guest ID — Owner: backend-engineer — closes IDOR
3. **[P0]** Fix R18: add 5 numeric range checks to settings PATCH route before upsert — Owner: backend-engineer — prevents DB corruption
4. **[P1]** Fix R1 + R2 in same commit: catch Prisma P2002 (409) + move findFirst inside $transaction — Owner: backend-engineer — requires both to be safe under concurrent load
5. **[P1]** Fix G1 → G2 → G5 in dependency order: expand `ChildSettings` interface, then `UpdateChildSettingsRequest`, then update `DEFAULTS` to `Partial<ChildSettings>` — Owner: frontend-engineer
6. **[P1]** Fix R12 + R15 in same commit: namespace localStorage key by childId + legacy migration code on mount + debounce cleanup on unmount — Owner: frontend-engineer — critical for shared family devices
7. **[P1]** Fix R17, G4/R7, R13, NEW-S3 in one pass: null body guard, empty childId guard, bedtime default hour 21, name/color validation — Owner: backend-engineer
8. **[P1]** Add R26/R27 tests: 4 test cases for guestId copy path — Owner: backend-engineer
9. **[P2]** Track W1-W15 in backlog; prioritize NEW-S4 (login rate limit) and R12 CSP header for next sprint — Owner: tech-lead
