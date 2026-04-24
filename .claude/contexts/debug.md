# Debug Context Mode

> **ACTIVATE**: When investigating bugs, failures, or unexpected behavior
> **FOCUS**: Root cause analysis — fix the disease, not the symptom

---

## Behavior

- **Understand before fixing** — reproduce the issue first, form hypothesis, then fix
- **Root cause only** — never apply a patch without understanding WHY it broke
- **One change at a time** — isolate variables, verify each change
- **Evidence-based** — logs, stack traces, test output, not "I think it might be"
- **Check for regressions** — ensure the fix doesn't break other things

## Debug Process

```
1. REPRODUCE — can I trigger the bug reliably?
2. ISOLATE — what's the smallest scope that exhibits the issue?
3. HYPOTHESIZE — "The bug occurs because X, which causes Y"
4. VERIFY — prove the hypothesis with evidence (logs, breakpoints, test)
5. FIX — minimal change that addresses root cause
6. REGRESSION TEST — write a test that fails WITHOUT the fix, passes WITH it
7. VERIFY — run full test suite, check no regressions
```

## Tools to Favor

- **Bash** — run failing tests, check logs, reproduce errors
- **Read** — examine code around the failure point
- **Grep** — trace error messages, find related code
- **Bash (git log, git blame)** — when was this code last changed? By whom? Why?
- **Bash (psql)** — query database for debugging data issues

## Red Flags (STOP if thinking these)

| Thought | Reality |
|---------|---------|
| "Quick fix for now, investigate later" | Fix at root cause, not symptom |
| "Just try changing X and see" | Form hypothesis first |
| "It's probably X, let me fix that" | "Probably" is not verified |
| "I don't fully understand but this might work" | Understanding is prerequisite |
| "One more fix attempt" (after 2+ failures) | 3+ failures = step back, rethink |
| "Each fix reveals new problem" | Stop fixing symptoms |

## Output Format

```markdown
## Debug Report: {issue}

### Symptom
{What's observed — error message, unexpected behavior}

### Root Cause
{Why it happens — with evidence}

### Fix
{What was changed and why}

### Regression Test
{Test that proves the fix — red-green verified}

### Impact
{Other areas potentially affected}
```

## What NOT to Do

- Don't fix without reproducing first
- Don't apply multiple changes at once — you won't know which one fixed it
- Don't ignore failing tests to "get past" the issue
- Don't guess at random solutions — systematic investigation only
