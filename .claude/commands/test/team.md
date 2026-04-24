---
description: "🔺 Team Test — Golden Triangle adversarial collaboration for maximum quality testing"
version: "2.0"
category: testing
execution-mode: execute
---

# /test:team — Golden Triangle Test & Quality Assurance

> **MISSION**: Maximum quality testing through adversarial collaboration.
> Each phase spawns a **Golden Triangle** of 3 agents: Tech Lead (coordinator),
> Executor (implementer), Reviewer (devil's advocate). Tests are released ONLY
> upon consensus after debate.

<scope>$ARGUMENTS</scope>

---

## 🛑 PRE-FLIGHT (DO FIRST — BLOCKS PHASE 1)

**LOAD now** (in order; path `./rules/` or `.claude/rules/`):

1. CORE.md — Identity, Laws, Routing
2. PHASES.md — Phase Execution
3. AGENTS.md — Tiered Execution
4. **TEAMS.md** — Golden Triangle protocol (MANDATORY)

**⛔ Do not run Phase 1 until all are loaded.** Follow **all** rules in those files; they override any conflicting instructions in this file.

**Skills Resolution**: Load `SKILLS.md` on-demand for fitness calculation and dynamic discovery.

---

## 🔀 TIERED EXECUTION

> Reference: AGENTS.md (Tiered Execution) + TEAMS.md (Golden Triangle Protocol)

| Tier       | When                          | Action                                                                    |
| ---------- | ----------------------------- | ------------------------------------------------------------------------- |
| **TIER 1** | runSubagent/Agent Tool EXISTS | Orchestrator spawns Tech Lead → Tech Lead spawns Executor + Reviewer      |
| **TIER 2** | Tool MISSING or SYSTEM error  | EMBODY Tech Lead → EMBODY Executor → EMBODY Reviewer → EMBODY Tech Lead  |

**❌ Anti-Lazy**: Never use TIER 2 when TIER 1 tool available.

**TIER 2 Golden Triangle Embodiment**: EMBODY Tech Lead (decompose) → EMBODY Executor (implement) → EMBODY Reviewer (review) → IF FAIL loop max 3 → EMBODY Tech Lead (arbitrate + synthesize)

---

## 📬 MAILBOX — Central Communication Hub

**Location**: `./plans/reports/MAILBOX-{date}.md` — All 3 triangle agents READ + APPEND. Never overwrite.

**Message Types**: `TASK_ASSIGNMENT` (Lead→Executor) · `SUBMISSION` (Executor→Reviewer) · `REVIEW` (Reviewer→Executor: PASS/FAIL) · `DEFENSE` / `RESUBMISSION` (Executor→Reviewer) · `APPROVAL` (Reviewer→Lead) · `ESCALATION` (Any→Lead) · `ARBITRATION` / `DECISION` (Lead→All)

**Format**: `[{TIMESTAMP}] {TYPE} | {AGENT} → {TARGET} | Phase: {n} | Task: {id} | Content: ...`

---

## 📁 DELIVERABLE FILES

| Phase / Team     | Output                                          |
| ---------------- | ----------------------------------------------- |
| Phase 1          | `./plans/reports/tests/TEST-STRATEGY-{scope}`      |
| Phase 2          | `./plans/reports/tests/TEST-PLAN-{scope}`          |
| Phase 3          | Test files written to codebase                  |
| Phase 4          | `./plans/reports/tests/TEST-RESULTS-{scope}`       |
| Phase 4          | `./plans/reports/qa/QA-{scope}`                    |
| ALL Phases       | `./plans/reports/MAILBOX-{date}.md`                   |

All files in `./plans/reports/` → English only.
**⚠️ Paths above = base names.** Small (≤ 150 lines) → create as `{name}.md`. Large (> 150 lines or ≥ 4 sections) → create as `{name}/` folder with `00-index.md` + `01-*.md`, `02-*.md` section files.

---

## 🔗 PHASE DEPENDENCIES

| Phase                           | Requires                            | Blocking    |
| ------------------------------- | ----------------------------------- | ----------- |
| P1: Test Strategy               | User scope + codebase access        | No          |
| P2: Test Planning               | TEST-STRATEGY from P1               | **YES**     |
| P3: Test Implementation         | TEST-PLAN from P2                   | **YES**     |
| P4: Coverage & Verification     | Tests from P3 + code under test     | **YES**     |

**⛔ Blocking**: If input missing → STOP → Create it first → Resume

---

## ⛔ INCREMENTAL EXECUTION (MANDATORY)

**Deliverable paths = base names.** Small (≤ 150 lines) → `{name}.md`. Large (> 150 lines or ≥ 4 sections) → `{name}/` folder with `00-index.md` + section files.

One phase at a time. Within each phase, follow the **Golden Triangle Loop**:

```
1. Tech Lead decomposes → Shared Task List → TASK_ASSIGNMENT to Mailbox
2. Executor works tasks → SUBMISSION to Mailbox (what, files, approach)
3. Reviewer critiques → REVIEW to Mailbox (PASS or FAIL + findings)
4. IF FAIL → debate loop: fix/defend → re-review (max 3 rounds)
   → After 3 rounds unresolved → ESCALATION to Tech Lead → ARBITRATION
5. IF PASS → APPROVAL → task ✅
6. All tasks done → Tech Lead verifies coherence → DECISION + consensus stamp
```

**Consensus Stamp** (required per phase): `✅ CONSENSUS: {TechLead} ✓ | {Executor} ✓ | {Reviewer} ✓`

Format: rules/PHASES.md § Phase output + rules/TEAMS.md § Golden Triangle Phase Output Format.

---

## 🎭 Phase 1: TEST STRATEGY — 🔺 GOLDEN TRIANGLE

| Role      | Agent                                | Mission                                                    |
| --------- | ------------------------------------ | ---------------------------------------------------------- |
| Tech Lead | `tester`                             | Decompose: test strategy, coverage targets, test types needed |
| Executor  | `scouter`                            | Execute: analyze codebase, identify testable units, map dependencies |
| Reviewer  | `tech-lead` (Devil's Advocate)       | Challenge: is strategy complete? Missing test categories? Over-testing? |

**Triangle Loop**:
1. `tester` decomposes into areas: test pyramid, coverage targets, framework selection, test data needs → TASK_ASSIGNMENT to `scouter`
2. `scouter` analyzes codebase → SUBMISSION per area: testable units inventory, dependency graph, coverage gaps, complex logic paths, external deps requiring mocks
3. `tech-lead` reviews → REVIEW: pyramid appropriate? Targets realistic? Missing categories (contract, smoke, regression)? Over-testing low-risk areas? Framework fits CI/CD?
4. Debate loop if FAIL → max 3 rounds → ESCALATION to `tester` if unresolved
5. `tester` synthesizes approved findings into unified test strategy

**Deliverable**: `./plans/reports/tests/TEST-STRATEGY-{scope}`
**Exit Criteria**: Test pyramid defined, coverage targets set, frameworks chosen, testable units mapped
**Consensus**: ✅ CONSENSUS: tester ✓ | scouter ✓ | tech-lead ✓

---

## 🎭 Phase 2: TEST PLANNING — 🔺 GOLDEN TRIANGLE

| Role      | Agent                                | Mission                                                    |
| --------- | ------------------------------------ | ---------------------------------------------------------- |
| Tech Lead | `tester`                             | Decompose: test plan with specific test cases per component |
| Executor  | `researcher`                         | Execute: research testing patterns, edge cases, boundary conditions |
| Reviewer  | `security-engineer` (Devil's Advocate) | Challenge: security test cases missing? Edge cases not covered? Injection tests? |

**Prerequisite**: **READ** `./plans/reports/tests/TEST-STRATEGY-{scope}` before starting.

**Triangle Loop**:
1. `tester` reads strategy → decomposes into: unit test cases, integration scenarios, E2E journeys, security cases, perf benchmarks → TASK_ASSIGNMENT to `researcher`
2. `researcher` researches patterns → SUBMISSION per area: specific test cases (inputs/outputs/edges), boundary conditions, equivalence partitions, mock strategies, test data approaches
3. `security-engineer` reviews → REVIEW: injection tests (SQL/XSS/command)? Auth bypass? IDOR/privilege escalation? Input validation (null/overflow/special chars)? Race conditions? Error message leakage?
4. Debate loop if FAIL → max 3 rounds → ESCALATION to `tester` if unresolved
5. `tester` synthesizes approved test cases into final test plan

**Deliverable**: `./plans/reports/tests/TEST-PLAN-{scope}`
**Exit Criteria**: Every component has specific test cases, edge cases documented, security scenarios covered
**Consensus**: ✅ CONSENSUS: tester ✓ | researcher ✓ | security-engineer ✓

---

---

## 🎭 Phase 3: TEST IMPLEMENTATION — 🔺 GOLDEN TRIANGLE (CRITICAL)

> **THIS IS THE MOST CRITICAL PHASE.** Every step is detailed. No shortcuts.

### Team Selection

```
Fullstack → Tech Lead: tester | Executor: backend-engineer then frontend-engineer | Reviewer: reviewer + perf lens
Backend  → Tech Lead: tester | Executor: backend-engineer | Reviewer: reviewer + perf lens
Frontend → Tech Lead: tester | Executor: frontend-engineer | Reviewer: reviewer + perf lens
Self     → Tech Lead: tester | Executor: tester (self) | Reviewer: reviewer + perf lens
```

| Role      | Agent                                                    | Mission                                                    |
| --------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| Tech Lead | `tester`                                                 | Load TEST-PLAN → decompose into test writing tasks → Shared Task List → coordinate all work |
| Executor  | `tester` (self) OR `backend-engineer`/`frontend-engineer`| Follow plan EXACTLY → write tests per spec → submit via Mailbox |
| Reviewer  | `reviewer` + `performance-engineer` lens                 | Review EVERY submission → check test quality, assertions, mocks, coverage |

**Prerequisite**: **READ and FOLLOW** `./plans/reports/tests/TEST-PLAN-{scope}`

### GOLDEN TRIANGLE IMPLEMENTATION LOOP (CRITICAL — Step by Step)

```
╔══════════════════════════════════════════════════════════════════════╗
║  PHASE 3: TEST IMPLEMENTATION LOOP — FOLLOW EXACTLY                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  STEP 1: Tech Lead reads TEST-PLAN-{scope}.md                       ║
║  - Load full test plan, identify all tasks, determine ordering       ║
║                                                                      ║
║  STEP 2: Tech Lead creates Shared Task List                          ║
║  - Break into atomic tasks: unit→integration→E2E→security→perf      ║
║  - Format: [ID] [Status] [Description] [Files] [Acceptance]         ║
║  - Post as TASK_ASSIGNMENT to Mailbox                                ║
║                                                                      ║
║  STEP 3: Dispatch — each TASK_ASSIGNMENT includes:                   ║
║  - Task ID, test files to create, cases from plan, mock reqs,       ║
║    coverage target                                                   ║
║                                                                      ║
║  STEP 4: FOR EACH TASK — Executor writes tests                       ║
║  a. Read TASK_ASSIGNMENT → write tests EXACTLY as plan specifies     ║
║  b. Post SUBMISSION: Task | Tests written | Files | Cases covered    ║
║     | Mocks used | Self-review notes | Plan step reference           ║
║                                                                      ║
║  STEP 5: Reviewer reviews each SUBMISSION                            ║
║  c. Check 5 dimensions:                                              ║
║     1. ASSERTIONS — meaningful, not trivial?                         ║
║     2. COVERAGE — edge cases, boundaries, error paths?               ║
║     3. MOCKS — appropriate? Over-mocking hiding bugs?                ║
║     4. PLAN COMPLIANCE — matches test plan exactly?                  ║
║     5. TEST QUALITY — isolated, deterministic, readable?             ║
║  d. Post REVIEW: PASS/FAIL + findings table (severity + action)      ║
║                                                                      ║
║  STEP 6: IF FAIL — Debate Loop (max 3 rounds)                       ║
║  e. Executor reads findings, for EACH:                               ║
║     - VALID → fix test + note what was fixed                         ║
║     - DISPUTED → DEFENSE with evidence/reasoning                     ║
║  f. Post RESUBMISSION/DEFENSE: Task | Round | Fixes | Defenses      ║
║  g. Reviewer re-reviews → back to step (c)                          ║
║  h. After round 3 unresolved → ESCALATION → Tech Lead ARBITRATION   ║
║                                                                      ║
║  STEP 7: IF PASS → APPROVAL → task ✅ → next task                   ║
║                                                                      ║
║  STEP 8: After ALL tasks complete                                    ║
║  i. Tech Lead verifies: all ✅ | no conflicts | mock consistency    ║
║     | test independence (no shared state)                             ║
║  j. Posts DECISION: Phase 3 COMPLETE | tasks {n}/{n} |               ║
║     disputes {n} | arbitrations {n}                                  ║
║     ✅ CONSENSUS: tester ✓ | {executor} ✓ | reviewer ✓              ║
║  k. Phase output released                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

### STRICT PLAN ADHERENCE (ENFORCED BY REVIEWER)

```
1. READ TEST PLAN FIRST — every test MUST trace to a plan test case
2. IF test case seems wrong → STOP → ESCALATION → Tech Lead evaluates
3. NO unauthorized test additions — Reviewer checks: "Any tests not in plan?"
4. Unauthorized deviations → automatic FAIL: CRITICAL | "Remove or get plan amended"
```

**Exit Criteria**: All plan test cases implemented, all reviews passed, no unauthorized deviations, test suite integration verified
**Consensus**: ✅ CONSENSUS: tester ✓ | {executor} ✓ | reviewer ✓

---

## 🎭 Phase 4: COVERAGE & VERIFICATION — 🔺 GOLDEN TRIANGLE

| Role      | Agent                                | Mission                                                    |
| --------- | ------------------------------------ | ---------------------------------------------------------- |
| Tech Lead | `tester`                             | Synthesize: coverage report, gap analysis, quality gate evaluation |
| Executor  | `tester` (self-executes)             | Execute: run all tests, generate coverage report, collect metrics |
| Reviewer  | `tech-lead` (Devil's Advocate)       | Challenge: coverage sufficient? Brittle tests? False positives? |

**Triangle Loop**:
1. `tester` (Tech Lead) decomposes: test execution, coverage analysis, quality gates, gap identification → TASK_ASSIGNMENT to self
2. `tester` (Executor) runs full suite → SUBMISSION: pass/fail per category, coverage metrics (line/branch/function), quality gate eval, failure analysis (code bugs vs test flaws vs flaky), plan checkpoint verification
3. `tech-lead` reviews → REVIEW: gaming metrics with trivial tests? Brittle tests? False positives? Flaky tests (shared state)? Missing negative tests? Maintainable long-term?
4. Debate loop if FAIL → max 3 rounds → `tester` synthesizes final QA report

**PLAN CHECKPOINT VERIFICATION** (if PLAN exists):
```
FOR EACH AC in PLAN-{scope}.md → map to test → tech-lead confirms not trivial → "AC-{id} → Test: {name} → {pass/fail}"
```

**QUALITY GATES** (all must pass for ✅):
```
Coverage: unit ≥ strategy target | integration: critical paths exercised | E2E: journeys pass
Test Health: no flaky | no false positives | assertions meaningful
Security: injection passed | auth bypass covered | input validation verified
Performance: no regressions beyond threshold | baselines established
```

**Deliverable**: `./plans/reports/tests/TEST-RESULTS-{scope}` + `./plans/reports/qa/QA-{scope}`
**Exit Criteria**: All tests run, quality gates evaluated, coverage verified, no brittle/flaky tests, report complete
**Consensus**: ✅ CONSENSUS: tester ✓ | tester(exec) ✓ | tech-lead ✓

---

## ✅ COMPLETION

```markdown
# 🔺 Golden Triangle Test Report: {scope}

## Phase Results
| Phase | Triangle | Consensus | Rounds |
|-------|----------|-----------|--------|
| P1: Test Strategy | tester / scouter / tech-lead | ✅ | {n} |
| P2: Test Planning | tester / researcher / security-engineer | ✅ | {n} |
| P3: Test Implementation | tester / {executor} / reviewer | ✅ | {n} |
| P4: Coverage & Verification | tester / tester / tech-lead | ✅ | {n} |

## Summary
Submissions: {n} | First-pass: {n} | Debates: {n} | Arbitrations: {n}
Coverage: {pass/fail} | Health: {pass/fail} | Security: {pass/fail} | Perf: {pass/fail}
Mailbox: `./plans/reports/MAILBOX-{date}.md`

## Next Actions
1. ✅ **All Pass** → quality gates met (triangle-validated)
2. ⚠️ **Partial** → failures categorized by severity
3. 🔧 **Fix** → `/fix:team` | 📝 **Review** → `/review` | 🚀 **Deploy** → `/deploy:preview`
```
