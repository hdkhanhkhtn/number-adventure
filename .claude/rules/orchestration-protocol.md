# Orchestration Protocol

> **PREREQUISITE**: `CORE.md` must be loaded first.
> **SEE ALSO**: `AGENTS.md` for delegation rules, `TEAMS.md` for Golden Triangle protocol.

## Delegation Context (MANDATORY)

When spawning subagents via Task/Agent tool, **ALWAYS** include in prompt:

1. **Work Context Path**: The git root of the PRIMARY files being worked on
2. **Reports Path**: `{work_context}/plans/reports/` for that project
3. **Plans Path**: `{work_context}/plans/` for that project

**Rule:** If CWD differs from work context, use the **work context paths**, not CWD paths.

---

## Tiered Execution (from AGENTS.md)

| Tier | When | Action |
|------|------|--------|
| **TIER 1** | Agent/Task tool available | MUST use sub-agent (isolated context) |
| **TIER 2** | Tool missing/error | EMBODY agent (fallback only) |

FORBIDDEN: Using TIER 2 when TIER 1 is available.

---

## Context Isolation (from Superpowers)

Each sub-agent gets FRESH context with only relevant information:
- **INCLUDE**: requirements, prior deliverables, current state, file paths
- **EXCLUDE**: internal reasoning, failed attempts, unrelated context

---

## Sequential Chaining
Chain subagents when tasks have dependencies:
- **Planning → Implementation → Testing → Review**: Feature development
- **Research → Design → Code → Documentation**: New components
- Each agent completes fully before the next begins
- Pass context and outputs between agents in the chain

## Parallel Execution
Spawn multiple subagents simultaneously for independent tasks:
- **Code + Tests + Docs**: Separate, non-conflicting components
- **Multiple Feature Branches**: Different agents on isolated features
- **Careful Coordination**: Ensure no file conflicts
- **Merge Strategy**: Plan integration points before parallel begins

---

## Golden Triangle Teams (`:team` variant)

> **LOAD**: `TEAMS.md` for full protocol.

For adversarial collaboration with 3 agents per phase: Tech Lead + Executor + Reviewer.
Use when maximum quality with debate is priority. See `TEAMS.md` for roster and protocol.

---

## Agent Teams (Optional)

For multi-session parallel collaboration, activate the `/team` skill.
See `.claude/skills/team/SKILL.md` for templates and spawn instructions.
