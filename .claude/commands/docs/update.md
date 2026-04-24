---
description: "⚡⚡⚡ Analyze the codebase and update documentation (project override)"
---

# /docs:update — Project Override

> **This project uses folder-based documentation.** The global `/docs:update` targets flat files. This override works with folder-based structure.

<scope>$ARGUMENTS</scope>

## Phase 1: Parallel Codebase Scouting

1. Scan the codebase and calculate files with LOC per directory (skip `.claude`, `.git`, `node_modules`, `__pycache__`, `secrets`)
2. Target directories **that actually exist** — adapt to project structure
3. Spawn multiple `scout` subagents via Task tool (context: < 200K tokens each)
4. Merge scout reports into context summary

## Phase 1.5: Parallel Documentation Reading

1. Count docs: `find docs/ -name "*.md" | wc -l`
2. Get LOC: `find docs/ -name "*.md" -exec wc -l {} + | sort -rn | head -20`
3. Spawn `Explore` agents to read existing docs (distribute by LOC)
4. Each agent: "Read these docs, extract: purpose, key sections, areas needing update"
5. Merge results into context for docs-manager

## Phase 2: Documentation Update (docs-manager Agent)

Pass context to `docs-manager` agent to update **folder-based** documentation:

### Core Knowledge (5 folders)
- `docs/knowledge-overview/` — Update project identity, tech stack, features
- `docs/knowledge-architecture/` — Update system overview, components, data flow
- `docs/knowledge-domain/` — Update entities, DB schema, API contracts, business rules
- `docs/knowledge-source-base/` — Update directory structure, entry points, modules
- `docs/knowledge-standards/` — Update code style, conventions, git, testing

### Business (4 folders under `docs/business/`)
- `docs/business/business-prd/` — Update PRD, goals, stakeholders
- `docs/business/business-features/` — Update feature inventory, prioritization
- `docs/business/business-workflows/` — Update workflows, actor map, SLAs
- `docs/business/business-glossary/` — Update domain terms, API mapping

### Other
- `README.md` — Update if needed (keep under 300 lines)
- `docs/decisions/` — Add new ADRs if architectural changes detected
- `docs/runbooks/` — Update operational procedures if needed

## Phase 3: Size Check (Post-Update)

1. Run `find docs/ -name "*.md" -exec wc -l {} + | sort -rn | head -20`
2. Use `docs.maxLoc` from session context (default: 800)
3. Files exceeding limit: report and ask user to split or accept

## Phase 4: Documentation Validation

Run validation if available:
1. `node $HOME/.claude/scripts/validate-docs.cjs docs/` (if script exists)
2. Display validation report (warnings only, non-blocking)

## Additional Requests
<additional_requests>
  $ARGUMENTS
</additional_requests>

**IMPORTANT**: Do not create flat files. Use folder-based structure with `00-index.md` + sub-files.
**IMPORTANT**: Do not start implementing code.
