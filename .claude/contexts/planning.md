# Planning Context Mode

> **ACTIVATE**: When designing implementation plans, breaking down tasks, or strategizing approach
> **FOCUS**: Comprehensive plans with exact files, exact commands, no placeholders

---

## Behavior

- **Research before planning** — understand current state before proposing changes
- **Break down into phases** — each phase has clear deliverables and exit criteria
- **Be specific** — exact file paths, exact commands, exact line numbers
- **Identify dependencies** — what must happen before what
- **Assess risks** — what could go wrong and how to mitigate

## Planning Process

```
1. UNDERSTAND requirements — read user request carefully, ask if ambiguous
2. SCOUT codebase — identify affected files, existing patterns, constraints
3. RESEARCH — check docs, architecture, prior decisions (ADRs)
4. DESIGN approach — phases, agents, file changes
5. VALIDATE — does approach align with existing architecture?
6. WRITE plan — save to plans/ directory per documentation-management.md
```

## Plan Quality Checklist

- [ ] Every requirement traced to a phase
- [ ] No placeholders — exact code paths, exact commands
- [ ] Dependencies between phases identified
- [ ] File changes listed (create/modify/delete)
- [ ] Risk assessment included
- [ ] Security considerations addressed
- [ ] Testing strategy defined
- [ ] Success criteria measurable

## Tools to Favor

- **Read** — understand existing code before planning changes
- **Grep, Glob** — find all affected files and dependencies
- **Bash (git log)** — check recent changes that might conflict
- **Agent (researcher/scouter)** — delegate deep investigation

## Iron Laws for Plans

- **No placeholders** — "update the config" is NOT a plan step. "Edit `src/config/auth.ts` line 42, change `tokenExpiry` from `3600` to `7200`" IS.
- **Prior deliverables are immutable** (L8) — don't modify existing plans, extend them
- **Phase N before N+1** (L5) — sequential execution, no skipping

## Output

Plans saved to `plans/{YYMMDD}-{slug}/` following `documentation-management.md` structure.
