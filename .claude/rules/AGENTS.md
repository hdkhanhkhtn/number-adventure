# AGENTS — Agent Delegation Protocol

> **LOAD**: When delegating to agents | **PURPOSE**: Agent handling protocol
> **SOURCES**: Agent-Assistant AGENTS + Superpowers subagent-driven-dev + dispatching-parallel-agents

---

## TIERED EXECUTION

### TIER 1: Sub-agent (MANDATORY when tool exists)

```
1. Prepare handoff:
   include: requirements, task, acceptance criteria, constraints
   exclude: internal reasoning, failed attempts

2. Invoke: Agent tool or Task tool (isolated context)

3. Verify: format matches, criteria met

4. On error: fallback to TIER 2, log reason
```

### TIER 2: EMBODY (Fallback only)

```
permitted_when:
  - Agent/Task tool returned system error
  - Tool unavailable in current context

forbidden_reasons:
  - Task seems "simple"
  - "Save tokens"
  - "Efficiency"

execution:
  1. Log: "TIER 2: {reason}"
  2. READ agent file COMPLETELY
  3. EXTRACT: Directive, Protocol, Constraints, Format
  4. EXECUTE as agent (follow THEIR protocol)
  5. EXIT embodiment, continue as orchestrator
```

---

## AGENT CATEGORIES

| Category | Agents | Purpose |
|----------|--------|---------|
| **meta** | tech-lead, planner | Coordinate, never implement |
| **execution** | backend-engineer, frontend-engineer, database-architect | Implementation |
| **validation** | tester, reviewer, security-engineer, debugger | QA |
| **research** | researcher, scouter, brainstormer, designer | Investigation |
| **support** | docs-manager, devops-engineer, business-analyst, project-manager | Support |

---

## TASK → AGENT MAPPING

| Task | Agent |
|------|-------|
| API, backend logic | `backend-engineer` |
| UI, components | `frontend-engineer` |
| Database schema | `database-architect` |
| Security | `security-engineer` |
| Testing | `tester` |
| Code review | `reviewer` |
| Debugging | `debugger` |
| Planning | `planner` |
| Research | `researcher` |
| Codebase analysis | `scouter` |
| Documentation | `docs-manager` |
| Deployment | `devops-engineer` |
| Business analysis | `business-analyst` |
| Design | `designer` |
| Brainstorming | `brainstormer` |
| Technical leadership | `tech-lead` |

---

## GOLDEN TRIANGLE TEAMS (`:team` variant only)

> **LOAD**: `TEAMS.md` for full protocol.

| Domain | Tech Lead | Executor | Reviewer |
|--------|-----------|----------|----------|
| `backend-team` | `tech-lead` | `backend-engineer` | `reviewer` |
| `frontend-team` | `tech-lead` | `frontend-engineer` | `reviewer` |
| `debug-team` | `debugger` | `backend-engineer` | `reviewer` |
| `qa-team` | `tester` | `tester` | `security-engineer` |
| `docs-team` | `docs-manager` | `researcher` | `reviewer` |
| `planning-team` | `planner` | `researcher` | `tech-lead` |

---

## CONTEXT ISOLATION (from Superpowers subagent-driven-dev)

### Fresh Agent Per Task

Each sub-agent gets a FRESH context with only relevant information:

```
INCLUDE:
  - Original requirements (verbatim)
  - Decisions from prior phases
  - Concrete deliverables
  - Current state
  - File paths to read

EXCLUDE:
  - Internal reasoning
  - Failed attempts
  - Alternatives not selected
  - Unrelated codebase context
```

### Parallel Dispatch (from Superpowers dispatching-parallel-agents)

When tasks are independent, dispatch multiple agents in parallel:

```
BEFORE parallel dispatch:
  1. Verify tasks are truly independent (no shared files)
  2. Define clear file ownership boundaries
  3. Plan integration points

DURING parallel:
  - Each agent works on isolated set of files
  - No overlapping edits

AFTER parallel:
  - Verify no conflicts
  - Integrate results
```

---

## RECURSIVE DELEGATION

```
IF agent.category == "meta":
  → This is a MANAGER agent
  → MUST delegate to specialists
  → NEVER implement directly
```

---

## ANTI-LAZY FALLBACK DETECTION

```
detection:
  - Choosing TIER 2 without attempting TIER 1
  - Justifying EMBODY with "task is simple"
  - Mentioning "efficiency" when choosing EMBODY

correction:
  1. STOP
  2. Log: "LAZY FALLBACK DETECTED"
  3. Attempt TIER 1 first
  4. Only use TIER 2 if TIER 1 actually fails
```

---

## COMPLETION GUARANTEE

```
EVERY delegation request WILL be fulfilled:
  - TIER 1 is primary when available
  - TIER 2 is fallback when TIER 1 fails
  - NO task is ever skipped
  - NO delegation ever fails completely
```
