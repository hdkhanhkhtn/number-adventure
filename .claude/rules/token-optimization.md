# Token Optimization Guidelines

> **LOAD**: When managing context efficiency | **PURPOSE**: Maximize AI effectiveness within token limits
> **SOURCE**: Adapted from ECC token-optimization + Workshopman context rules

---

## Model Selection

| Task Type | Recommended Model | Rationale |
|-----------|------------------|-----------|
| Simple subagent tasks (file search, grep, format) | **Haiku** | Fast, cheap, sufficient for mechanical tasks |
| Standard development (code, review, debug) | **Sonnet** | Best balance of speed and quality |
| Complex reasoning (architecture, security audit, planning) | **Opus** | Maximum quality for high-stakes decisions |

**Rule**: Default to Sonnet. Escalate to Opus only for tasks requiring deep reasoning or multi-step analysis. Use Haiku for parallelizable subtasks.

---

## Context Management

### When to Clear Context

- **Between unrelated tasks**: Use `/clear` to reset context
- **At natural breakpoints**: After completing a phase or major task
- **When context > 50%**: Use `/compact` to summarize and continue

### File Loading Discipline

```
BEFORE loading any file:
  1. Is this file DIRECTLY needed for the current task?
     - YES → Load it
     - NO → Skip it
  2. Can I answer from already-loaded context?
     - YES → Don't reload
     - NO → Load minimal section needed

NEVER:
  - Load "all files in a directory"
  - Load files "for reference" without immediate need
  - Re-read files already in context
  - Load entire files when only a section is needed (use offset/limit)
```

### Context Budget Awareness

| Context Usage | Action |
|---------------|--------|
| 0-25% | Normal operation — load freely |
| 25-50% | Be selective — only load essential files |
| 50-75% | Conservative — use `/compact`, summarize before loading more |
| 75%+ | Critical — `/compact` immediately, avoid new file loads |

---

## Subagent Context Isolation

Each sub-agent receives a **FRESH context** with minimal, targeted information:

```
INCLUDE in subagent prompt:
  - Original requirements (verbatim, concise)
  - Relevant decisions from prior phases
  - Specific file paths to read (not "explore the codebase")
  - Acceptance criteria
  - Constraints

EXCLUDE from subagent prompt:
  - Internal orchestrator reasoning
  - Failed attempts and alternatives not chosen
  - Unrelated codebase context
  - Full conversation history
```

**Size target**: Subagent prompts should be under 500 words for simple tasks, under 1000 words for complex tasks.

---

## MCP Tool Management

- Only activate MCP tools relevant to current task
- Deactivate unused connectors to reduce tool discovery overhead
- Prefer built-in tools (Read, Edit, Grep, Bash) over MCP when both can accomplish the task

---

## Response Efficiency

| Pattern | Instead of | Do |
|---------|------------|-----|
| Explaining what you'll do | Long preamble | Start doing it |
| Repeating user's request | Paraphrasing back | Acknowledge briefly, act |
| Verbose status updates | "Now I will proceed to..." | Just proceed |
| Post-action summary | Detailed recap of every step | Key findings only |

---

## Anti-Patterns

| Waste | Fix |
|-------|-----|
| Loading all CLAUDE.md files at once | Load root, then service-specific on demand |
| Reading entire file when you need 10 lines | Use `offset` and `limit` parameters |
| Multiple agents reading same files | Share findings via context handoff |
| Reloading files between messages | Trust already-loaded context within same conversation |
| Spawning Opus for a grep task | Use Haiku or built-in tools |
