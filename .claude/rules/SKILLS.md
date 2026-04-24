# SKILLS — Skill Resolution Protocol (Simplified)

> **LOAD**: When skill resolution needed | **PURPOSE**: Skill discovery and invocation
> **SOURCES**: Agent-Assistant SKILLS (simplified) + Superpowers using-superpowers priority rules

---

## OVERVIEW

Skills = Domain knowledge modules in `.claude/skills/`.

**Discovery**: Skills are discovered via the Skill tool or by scanning `.claude/skills/*/SKILL.md`.

---

## INSTRUCTION PRIORITY (from Superpowers)

1. **User's explicit instructions** (CLAUDE.md, direct requests) — highest priority
2. **Superpowers skills** — override default behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md says "don't use TDD" and a skill says "always use TDD," follow the user's instructions.

---

## SKILL INVOCATION RULE

**Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill might apply means invoke it to check.

```
1. User message received
2. Check: Might any skill apply?
   - YES → Invoke Skill tool
   - NO → Proceed normally
3. Follow skill instructions exactly
4. Respond to user
```

---

## SKILL DECISION FLOW

### By Complexity

| Assessment | Action |
|------------|--------|
| Simple | Base knowledge sufficient — skip resolution |
| Complex | MUST invoke relevant skills |

### By Variant

| Variant | Skill Usage |
|---------|-------------|
| `:fast` | Minimal skills, speed priority |
| `:hard`, `:focus` | Full skill resolution |
| `:team` | Skills per agent role |

---

## SKILL TYPES

**Rigid** (TDD, debugging, verification): Follow exactly. Don't adapt away discipline.
**Flexible** (patterns, design): Adapt principles to context.

The skill itself tells you which type.

---

## CORE SKILL MAPPING

| Trigger | Skill |
|---------|-------|
| Starting work | `using-superpowers` (session bootstrap) |
| Brainstorming | `brainstorming` |
| Writing plans | `writing-plans` |
| Executing plans | `executing-plans` |
| Code review request | `requesting-code-review` |
| Receiving review feedback | `receiving-code-review` |
| Bug/test failure | `systematic-debugging` |
| Writing tests | `test-driven-development` |
| Claiming completion | `verification-before-completion` |
| Parallel tasks | `dispatching-parallel-agents` |
| Sub-agent work | `subagent-driven-development` |
| Feature branch done | `finishing-a-development-branch` |
| Git worktree needed | `using-git-worktrees` |
| Creating skills | `writing-skills` |
| Dead code cleanup | `refactor-clean` |

---

## RED FLAGS (from Superpowers)

| Thought | Reality |
|---------|---------|
| "This doesn't need a skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This is just a simple question" | Questions are tasks. Check for skills. |

---

## ADDING NEW SKILLS

```
1. Create: .claude/skills/{skill-id}/SKILL.md
2. Add referral documents alongside SKILL.md
3. Skill is auto-discovered by Skill tool
```

---

## EDGE CASES

| Scenario | Action |
|----------|--------|
| No skills found for complex task | Proceed with general capabilities, note gap |
| Skill conflicts with user instruction | User instruction wins (priority 1) |
| Multiple skills apply | Process skills first (debugging), then implementation skills |
| Skill is outdated | Read current version, not memory |
