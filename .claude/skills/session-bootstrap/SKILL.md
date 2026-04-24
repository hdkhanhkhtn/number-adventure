---
name: session-bootstrap
description: Use when starting any conversation - establishes skill discovery, instruction hierarchy, and command routing for the Workshopman workspace
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

# Session Bootstrap — Workshopman Workspace

## Instruction Priority

1. **User's explicit instructions** (CLAUDE.md, direct requests) — highest priority
2. **Project rules** (`.claude/rules/`) — project-specific rules
3. **Active skill instructions** — when skill is invoked
4. **Default system prompt** — lowest priority

If conflict: higher level wins. NEVER override user instructions with skill rules.

## Boot Sequence

1. Load `CORE.md` from `.claude/rules/`
2. Detect user intent → route to command (see CORE.md → COMMAND ROUTING)
3. Load on-demand rules as needed (PHASES, AGENTS, TEAMS, etc.)
4. Invoke relevant skills BEFORE any response

## Skill Invocation Rule

**If there is even a 1% chance a skill applies, invoke it.**

This is not negotiable. This is not optional. You cannot rationalize your way out of this.

## Core Superpowers Skills

| Trigger | Skill | Type |
|---------|-------|------|
| Creative work, features | `brainstorming` | Rigid — follow exactly |
| Multi-step tasks | `writing-plans` | Rigid |
| Executing a plan | `executing-plans` | Rigid |
| Sub-agent delegation | `subagent-driven-development` | Rigid |
| Code review request | `requesting-code-review` | Rigid |
| Receiving review | `receiving-code-review` | Rigid |
| Bug/test failure | `systematic-debugging` | Rigid |
| Writing tests | `test-driven-development` | Rigid |
| Claiming completion | `verification-before-completion` | Rigid |
| Parallel tasks | `dispatching-parallel-agents` | Flexible |
| Branch isolation | `using-git-worktrees` | Flexible |
| Feature complete | `finishing-a-development-branch` | Flexible |
| Creating skills | `writing-skills` | Rigid |

## Red Flags — STOP if you think:

| Thought | Reality |
|---------|---------|
| "This doesn't need a skill" | If a skill exists, use it. |
| "I need more context first" | Skill check comes BEFORE questions. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "I remember this skill" | Skills evolve. Read current version. |

## Skill Priority Order

1. **Process skills first** (brainstorming, debugging) — determine HOW to approach
2. **Implementation skills second** (frontend-design, databases) — guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Workshopman Domain Skills

For garage management domain work, also consider:
- `ba-analysis` — business analysis for CVDV/KTV/PASC workflows
- `api-design` — API contract patterns for microservices
- `databases` — PostgreSQL + MongoDB patterns
- `payment-integration` — payment/subscription logic
