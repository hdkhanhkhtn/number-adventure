---
name: ck:docs
description: "Analyze codebase and manage project documentation — init, update, summarize."
argument-hint: "init|update|summarize"
---

# Documentation Management

Analyze codebase and manage project documentation through scouting, analysis, and structured doc generation.

## Default (No Arguments)

If invoked without arguments, use `AskUserQuestion` to present available documentation operations:

| Operation | Description |
|-----------|-------------|
| `init` | Analyze codebase & create initial docs |
| `update` | Analyze changes & update docs |
| `summarize` | Quick codebase summary |

Present as options via `AskUserQuestion` with header "Documentation Operation", question "What would you like to do?".

## Subcommands

| Subcommand | Reference | Purpose |
|------------|-----------|---------|
| `/ck:docs init` | `references/init-workflow.md` | Analyze codebase and create initial documentation |
| `/ck:docs update` | `references/update-workflow.md` | Analyze codebase and update existing documentation |
| `/ck:docs summarize` | `references/summarize-workflow.md` | Quick analysis and update of codebase summary |

## Routing

Parse `$ARGUMENTS` first word:
- `init` → Load `references/init-workflow.md`
- `update` → Load `references/update-workflow.md`
- `summarize` → Load `references/summarize-workflow.md`
- empty/unclear → AskUserQuestion (do not auto-run `init`)

## Shared Context

Documentation lives in `./docs` directory:
```
./docs
├── architecture/
│   ├── overview.md                 # System architecture
│   ├── domain-model.md
│   ├── service-map.md
│   ├── project-overview-pdr.md     # Project overview & PDR
│   └── codebase-summary.md         # Codebase summary
├── decisions/                      # ADRs
├── features/                       # Feature docs
├── runbooks/
│   ├── deployment-guide.md         # Deployment procedures
│   └── environment-resolver.md
├── standards/
│   ├── code-standards.md           # Code standards
│   └── design-guidelines.md        # Design guidelines
├── sprints/
│   └── roadmap.md                  # Project roadmap
├── journals/                       # Journal entries
├── CHANGELOG.md
└── SPRINT_TEMPLATE.md
```

Use `docs/` directory as the source of truth for documentation.

**IMPORTANT**: **Do not** start implementing code.
