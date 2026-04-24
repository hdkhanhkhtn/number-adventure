# Documentation Triggers

## When to Update Docs

MUST update project documentation in `./docs` when:

| Trigger | Which Docs | Action |
|---------|-----------|--------|
| Phase status changes | sprints/roadmap.md | Update progress %, milestone status |
| Major feature complete | sprints/roadmap.md, architecture/codebase-summary.md | Add feature, update architecture |
| Bug fix (significant) | sprints/roadmap.md | Document fix, severity, impact |
| Security patch | sprints/roadmap.md, architecture/overview.md | Record improvement |
| API contract changes | architecture/overview.md, standards/code-standards.md | Update endpoints, schemas |
| Architecture decision | architecture/overview.md | Document decision + rationale |
| Scope/timeline change | sprints/roadmap.md | Adjust phases, dates |
| Dependencies updated | architecture/overview.md | Record version changes |
| Breaking changes | standards/code-standards.md | Document migration path |

## Documentation Files

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

## Update Protocol

1. **Read current state:** Always read target doc before editing
2. **Analyze reports:** Review agent reports in plan reports directory
3. **Update content:** Modify progress %, statuses, dates, descriptions
4. **Cross-reference:** Ensure consistency across docs
5. **Validate:** Verify dates, versions, references accurate

## Quality Standards

- **Consistency:** Same formatting, versioning across all docs
- **Accuracy:** Progress %, dates, statuses reflect reality
- **Completeness:** Sufficient detail for stakeholder communication
- **Timeliness:** Update within same session as significant changes
- **Traceability:** Clear links between roadmap items and implementation

## Delegation Pattern

Use `docs-manager` subagent for documentation updates:

```
Task(
  subagent_type: "docs-manager",
  prompt: "Update ./docs for [changes]. Work context: [path]",
  description: "Update docs"
)
```

Project manager coordinates WHEN to update; docs-manager handles HOW.
