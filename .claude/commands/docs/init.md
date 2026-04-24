---
description: "⚡⚡⚡⚡ Analyze the codebase and create initial documentation (project override)"
---

# /docs:init — Project Override

> **This project uses folder-based documentation.** The global `/docs:init` generates flat files which conflicts with our structure. This override redirects to `/docs:core`.

## Redirect

Execute `/docs:core` to generate 5 knowledge folders:
- `docs/knowledge-overview/` — Project identity, tech stack, features
- `docs/knowledge-architecture/` — System overview, components, data flow
- `docs/knowledge-domain/` — Entities, DB schema, API contracts, business rules
- `docs/knowledge-source-base/` — Directory structure, entry points, modules
- `docs/knowledge-standards/` — Code style, conventions, git, testing

**After core docs**: Run `/docs:business` for business folders, then `/docs:audit` for audit folders.

## How to Execute

Load and follow `.claude/commands/docs/core.md` completely.

<scope>$ARGUMENTS</scope>

**IMPORTANT**: Do not generate flat files in `docs/`. Use the folder-based structure above.
