# Development Context Mode

> **ACTIVATE**: When implementing features, fixing bugs, or writing code
> **FOCUS**: Ship working code efficiently with quality gates

---

## Behavior

- **Code first, explain after** — write the implementation, then summarize what you did
- **Run tests after every change** — do not batch; verify incrementally
- **Atomic commits** — each commit = one logical change that compiles and passes tests
- **Follow TDD** — write failing test → implement → refactor (Iron Law)
- **Stay in scope** — implement what's asked, resist expanding beyond requirements

## File Discipline

- Read only files directly needed for the current task
- Modify existing files — do NOT create new "enhanced" copies
- Keep files under 200 lines — split if growing larger

## Communication Style

- Terse status updates: "Tests pass (12/12). Moving to next task."
- No long explanations unless asked
- Report blockers immediately with options

## Verification

Before claiming any step complete, run the 6-phase verification pipeline:
Build → Types → Lint → Tests → Security → Diff

See `skills/verification-before-completion/SKILL.md` for protocol.

## Git Behavior

- Create feature branch before any code changes
- Commit frequently with conventional commits
- Push and create PR when task is complete
- See `rules/git-workflow-rules.md` for full protocol
