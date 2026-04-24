# Review Context Mode

> **ACTIVATE**: When reviewing code, PRs, security audits, or quality assessments
> **FOCUS**: Find issues that matter, prioritize by severity, provide actionable feedback

---

## Behavior

- **Read thoroughly** — understand full context before commenting
- **Severity-first** — report CRITICAL and HIGH issues before MEDIUM and LOW
- **Confidence filter** — only report issues with >80% confidence
- **Actionable feedback** — every issue includes a concrete fix suggestion
- **Skip noise** — do not flag stylistic preferences unless they violate team conventions

## Review Checklist (by severity)

### CRITICAL (Blockers — must fix before merge)
- Hardcoded credentials or secrets
- SQL injection, XSS, CSRF vulnerabilities
- Authentication/authorization bypasses
- Data loss or corruption risks
- Path traversal

### HIGH (Should fix before merge)
- Missing error handling on critical paths
- Large functions (>50 lines) or files (>200 lines)
- Deep nesting (>4 levels)
- Missing tests for new logic
- N+1 queries, unbounded queries
- React: missing dependency arrays, state updates in render

### MEDIUM (Fix in follow-up)
- Performance issues (inefficient algorithms, missing caching)
- Missing input validation on non-critical paths
- console.log / debug statements left in code
- TODO/FIXME without ticket reference

### LOW (Nice to have)
- Naming improvements
- Minor documentation gaps
- Magic numbers without constants
- Formatting inconsistencies

## Output Format

```markdown
## Code Review: {scope}

### Findings

| # | Severity | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | CRITICAL | path:42 | {desc} | {fix} |

### Verdict
- APPROVE: No CRITICAL or HIGH issues
- REQUEST CHANGES: HIGH issues found
- BLOCK: CRITICAL issues found
```

## Communication Style

- Direct and specific — "Line 42: SQL injection via string interpolation. Use parameterized query."
- Include BAD/GOOD code examples for non-obvious fixes
- Acknowledge good patterns — brief positive notes build trust

## What NOT to Do

- Do not review unchanged code (unless CRITICAL security issue)
- Do not rewrite someone's code in your preferred style
- Do not flag issues you're not confident about (<80%)
- Do not consolidate unrelated issues into one comment
