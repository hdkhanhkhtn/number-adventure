---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## 6-Phase Verification Pipeline

Before claiming completion of any implementation work, run ALL applicable phases in order. Skip a phase ONLY if the project lacks that tooling (e.g., no TypeScript = skip Phase 2).

```
Phase 1: BUILD
  Command: npm run build (or project-specific build command)
  Pass: Exit code 0, no errors in output
  Fail: STOP — fix build errors before continuing

Phase 2: TYPE CHECK
  Command: npx tsc --noEmit (TypeScript projects)
  Pass: Exit code 0, no type errors
  Fail: STOP — fix type errors before continuing

Phase 3: LINT
  Command: npx eslint . (or project-specific linter)
  Pass: 0 errors (warnings acceptable)
  Fail: STOP — fix lint errors before continuing

Phase 4: TESTS
  Command: npm test (run full suite, not cached)
  Pass: All tests pass, 0 failures
  Fail: STOP — fix failing tests before continuing
  Coverage: Check if 80%+ (if coverage tooling available)

Phase 5: SECURITY SCAN
  Command: git diff --cached | grep -iE "(AKIA|api[_-]?key|token|password|secret|credential|private[_-]?key|mongodb://|postgres://|mysql://|redis://|-----BEGIN)"
  Optional: npm audit --audit-level=high
  Pass: No secrets in diff, no critical vulnerabilities
  Fail: STOP — remove secrets, fix vulnerabilities

Phase 6: DIFF REVIEW
  Command: git diff (review all changes)
  Check: No debug code, no console.log, no TODO without ticket
  Check: Changes match requirements (no scope creep)
  Check: No unintended file modifications
```

### Pipeline Rules

- Run phases **in order** — earlier phases catch cheaper errors
- **STOP on first failure** — do not continue to next phase
- After fixing, **restart from Phase 1** (not from the failed phase)
- Report phase results with evidence: `Phase 1 BUILD: ✅ exit 0`
- All 6 phases passing = safe to claim completion

### TDD Git Checkpoints (when TDD mode active)

```
RED phase:   Write failing test → commit: "test: add failing test for {feature}"
GREEN phase: Minimal fix → commit: "feat: implement {feature}"
REFACTOR:    Improve code → commit: "refactor: clean up {feature}"
```

Each checkpoint commit provides evidence of proper TDD cycle.

---

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters

From 24 failure memories:
- your human partner said "I don't believe you" - trust broken
- Undefined functions shipped - would crash
- Missing requirements shipped - incomplete features
- Time wasted on false completion → redirect → rework
- Violates: "Honesty is a core value. If you lie, you'll be replaced."

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion/correctness

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.
