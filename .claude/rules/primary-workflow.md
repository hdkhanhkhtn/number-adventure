# Primary Workflow

> **PREREQUISITE**: `CORE.md` must be loaded first.
> **IMPORTANT:** Analyze the skills catalog and activate skills needed for the task.
> **IMPORTANT**: Ensure token efficiency while maintaining high quality.

---

## COMMAND ROUTING

When user gives a task, detect intent and route to the appropriate command:

| User Intent | Command | Default Variant |
|-------------|---------|-----------------|
| implement, build, create | `/cook` | `:hard` |
| fix, bug, error | `/fix` | `:hard` |
| plan, strategy, approach | `/plan` | `:hard` |
| debug, investigate | `/debug` | `:hard` |
| test, coverage | `/test` | `:hard` |
| review, PR | `/review` | `:hard` |
| brainstorm, ideas | `/brainstorm` | `:hard` |
| document, readme | `/docs` | `:core` |

**Variant selection** (if user doesn't specify):
- Simple task → `:fast`
- Standard task → `:hard` (default)
- Complex multi-concern → `:team`

See `CORE.md → COMMAND ROUTING` for full routing table.

---

## STANDARD WORKFLOW (`:hard` variant)

#### 1. Planning
- Delegate to `planner` agent to create implementation plan in `./plans`
- Use multiple `researcher` agents in parallel for different topics
- **No placeholders** — exact code, exact paths, exact commands

#### 2. Implementation
- Delegate to appropriate execution agent (backend-engineer, frontend-engineer, etc.)
- Follow established architectural patterns
- After code changes, run compile/build to verify
- **DO NOT** create new enhanced files, update existing files directly

#### 3. Testing
- Delegate to `tester` agent to run tests
- **DO NOT** ignore failing tests
- **DO NOT** use fake data, mocks, cheats, tricks just to pass
- Fix failing tests and re-run until all pass

#### 4. Code Quality
- After testing passes, delegate to `code-reviewer` agent
- Two-stage review: spec compliance THEN code quality (Iron Law)
- Follow coding standards in `./docs`

#### 5. Integration
- Follow the plan from `planner` agent
- Maintain backward compatibility
- Document breaking changes
- Delegate to `docs-manager` agent if docs need updating

#### 6. Debugging (when bugs reported)
- Activate `systematic-debugging` skill (Iron Law: root cause first)
- Delegate to `debugger` agent
- Fix → test → review cycle until resolved

#### 7. Visual Explanations
When explaining complex code, protocols, or architecture:
- Use `/preview --explain <topic>` for visual explanation
- Use `/preview --diagram <topic>` for architecture diagrams
- Use `/preview --slides <topic>` for step-by-step walkthroughs
- Use `/preview --ascii <topic>` for terminal-friendly output

---

## VERIFICATION GATE (from Superpowers — applies to ALL variants)

Before claiming ANY phase or workflow complete:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the verification command (fresh, complete)
3. READ: Full output, check exit code
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim

See `rules/red-flags.md` for rationalization detection.
