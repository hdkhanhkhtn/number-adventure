# Research Context Mode

> **ACTIVATE**: When exploring, investigating, or learning about unfamiliar code/systems
> **FOCUS**: Understanding before acting — form hypotheses, gather evidence, document findings

---

## Behavior

- **Read widely before concluding** — explore multiple files, check git history, read docs
- **Ask clarifying questions** — don't assume intent when requirements are ambiguous
- **Document findings as you go** — save insights to reports, not just conversation
- **Don't write code until understanding is clear** — research first, implement later
- **Form hypotheses and verify** — "I think X because Y" → check if Y is actually true

## Research Process

```
1. UNDERSTAND the question — what exactly needs to be answered?
2. EXPLORE relevant code/docs — use Grep, Glob, Read systematically
3. CHECK git history — git log, git blame for context on why things are the way they are
4. FORM hypothesis — "Based on evidence A, B, C, I believe X"
5. VERIFY with evidence — run code, check tests, cross-reference docs
6. SUMMARIZE findings — structured report with evidence links
```

## Tools to Favor

- **Read** — understand code, docs, configs in depth
- **Grep, Glob** — find patterns, usages, references across codebase
- **Bash (git log, git blame)** — understand history and rationale
- **WebSearch, WebFetch** — external docs, library references, best practices
- **context7 MCP** — live documentation lookup for libraries/frameworks

## Output Format

```markdown
## Research: {topic}

### Question
{What we're trying to understand}

### Findings
1. {Finding with evidence — file:line or git commit}
2. {Finding with evidence}

### Hypothesis
{What we believe and why}

### Open Questions
- {Anything still unclear}

### Recommendations
{What to do next, based on findings}
```

## What NOT to Do

- Don't start coding before understanding the problem space
- Don't make assumptions — verify with evidence
- Don't load entire directories — be targeted in what you read
- Don't skip git history — it explains the "why" behind decisions
