# Init Workflow

## Phase 1: Parallel Codebase Scouting

1. Scan the codebase and calculate the number of files with LOC in each directory (skip credentials, cache or external modules directories, such as `.claude`, `.opencode`, `.git`, `tests`, `node_modules`, `__pycache__`, `secrets`, etc.)
2. Target directories **that actually exist** - adapt to project structure, don't hardcode paths
3. Activate `ck:scout` skill to explore the code base and return detailed summary reports to the main agent
4. Merge scout reports into context summary

## Phase 2: Documentation Creation (docs-manager Agent)

**CRITICAL:** You MUST spawn `docs-manager` agent via Task tool with merged reports. Do not wait for user input.

Pass the gathered context to docs-manager agent to create initial documentation:
- `README.md`: Update README with initial documentation (keep it under 300 lines)
- `docs/knowledge-overview/01-project-identity.md`: Project overview and PDR (Product Development Requirements)
- `docs/knowledge-source-base/00-index.md`: Codebase summary
- `docs/knowledge-standards/01-code-style.md`: Codebase structure and code standards
- `docs/knowledge-architecture/01-system-overview.md`: System architecture
- `docs/sprints/roadmap.md`: Project roadmap
- `docs/runbooks/deployment-guide.md` [optional]: Deployment guide
- `docs/knowledge-standards/05-design-guidelines.md` [optional]: Design guidelines

## Phase 3: Size Check (Post-Generation)

After docs-manager completes:
1. Run `find docs/ -name '*.md' -exec wc -l {} + | sort -rn` to check LOC
2. Use `docs.maxLoc` from session context (default: 800)
3. For files exceeding limit:
   - Report which files exceed and by how much
   - docs-manager should have already split proactively
   - If still oversized, ask user: split now or accept as-is?
