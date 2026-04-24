# Documentation Navigation Rules

> **LOAD**: When writing or reading documentation | **PURPOSE**: Route docs to correct location and optimize token usage
> **PREREQUISITE**: Load after CORE.md

---

## Rule 1: Document Placement Guard

**BEFORE writing any documentation:**

1. CLASSIFY: Is this content system-specific or cross-system?
2. IF system-specific → Target: `src/{service}/docs/`
3. IF cross-system (affects 2+ services) → Target: `docs/` root
4. IF unsure → Default to service

**System-specific indicators:**
- Single service name mentioned
- Single deployment unit
- Single module feature
- Internal architecture of one service

**Cross-system indicators:**
- Service communication patterns
- Shared domain models (CVDV, KTV, PASC, LSC, etc.)
- API contracts between 2+ services
- Project-wide standards
- Workshopman-wide workflows

---

## Rule 2: Context Loading Flow (Token-Efficient)

**WHEN working on a task:**

1. Root `CLAUDE.md` already loaded (boot sequence)
2. IDENTIFY target system from task description
3. IF target system identified:
   - READ `src/{service}/CLAUDE.md`
   - READ `src/{service}/docs/` relevant files ONLY
   - DO NOT load root `docs/` unless cross-system context needed
4. IF cross-system task:
   - READ `docs/knowledge-architecture/01-system-overview.md`
   - READ relevant service CLAUDE.md (max 2-3)
5. NEVER load ALL service docs — load only what task requires

**Token optimization principle:** Load only files that directly answer the current task question.

---

## Rule 3: Doc Creation Routing Table

| Content Type | Location | Rationale |
|-------------|----------|-----------|
| System architecture | `src/{sub}/docs/architecture/` | System-specific design |
| System ADR | `src/{sub}/docs/decisions/` | Decision rationale for one service |
| System runbook | `src/{sub}/docs/runbooks/` | Operational procedures for one service |
| System features | `src/{sub}/docs/features/` | Feature docs for one service |
| System API docs | `src/{sub}/docs/api/` | API contract of one service |
| Cross-system architecture | `docs/knowledge-architecture/` | How services interact |
| Cross-system ADR | `docs/decisions/` | Decisions affecting 2+ services |
| Cross-system runbook | `docs/runbooks/` | Deployment, multi-service operations |
| Project standards | `docs/knowledge-standards/` | Code standards, naming conventions |
| Project overview | `docs/knowledge-overview/` | Project identity, tech stack, features |
| Source base | `docs/knowledge-source-base/` | Directory structure, entry points, modules |
| Domain model | `docs/knowledge-domain/` | Entities, DB schema, API contracts |
| Business docs (structured) | `docs/business/` | PRD, features, workflows, glossary |
| Business context (raw) | `context/` | Domain glossary, workflows, requirements |
| Security audit | `docs/audit/` | Security, compliance, dataflow analysis |
| Sprint tracking | `docs/sprints/` | Sprint plans, progress, retrospectives |

---

## Rule 4: Service Discovery

Quick lookup to identify which service a task targets:

| Keywords | Target Service |
|----------|----------------|
| core, auth, subscription, payment, user, workspace, token | `workshopman-core` |
| datatool, ingest, raw data, alldata, autodata, mitchell, haynes, prodemand, identifix | `workshopman-datatool-raw` |
| datatool admin, datasource management, admin | `workshopman-datatool-management` |
| datatool UI admin, admin interface | `workshopman-datatool-fe-admin` |
| workshopdiag, tra cứu kỹ thuật, vehicle lookup | `workshopman-datatool-fe-enduser` |
| gara, workshop, garage, CVDV, KTV, LSC, PTN, PASC, HĐSC, quản đốc, kỹ thuật viên | `workshopman-gara-management` |
| customer portal, KH theo dõi, customer tracking | `workshopman-gara-fe-enduser` |
| landing, wordpress, workshopman.com, subscription purchase | `workshopman-gara-wordpress` |
| zalo, marketing campaign, zalo OA, qr login, message | `workshopman-gara-zalo-python` |
| mobile, app nhân viên, react native, employee app, ios, android | `workshopman-mobile` |

---

## Rule 5: Documentation Reading Pattern

**WHEN reading documentation for a task:**

```
Step 1: IDENTIFY which file to read
  → Use Rule 3 (Routing Table) to find location
  → Use Rule 4 (Service Discovery) if unsure which service

Step 2: LOAD ONLY that file
  → Not "all docs in the folder"
  → Not "related files"
  → Only the specific file answering the question

Step 3: IF that file doesn't answer:
  → Check referenced files (links within the doc)
  → Do not guess — follow explicit references only

Step 4: IF still blocked:
  → Ask user or check CLAUDE.md of that service
```

**Rationale:** Token efficiency. Avoid loading irrelevant documentation.

---

## Rule 6: Documentation Writing Checklist

**BEFORE creating new docs:**

- [ ] Classified as system-specific or cross-system (Rule 1)
- [ ] Correct location identified (Rule 3)
- [ ] If system-specific: checked if `src/{service}/docs/` exists
- [ ] If cross-system: confirmed it affects 2+ services
- [ ] Does not duplicate existing docs (checked both locations)
- [ ] Links to related docs (both same-location and cross-location)

**AFTER creating new docs:**

- [ ] Updated index file (if exists in that folder)
- [ ] Added entry to CLAUDE.md's doc reference section (if applicable)
- [ ] Cross-referenced from related docs

---

## Exception: Docs Seeker Skill

When you need to explore latest docs across the codebase, activate the `docs-seeker` skill. This skill helps you:

- Search for docs by topic
- Discover undocumented code patterns
- Find the most recent version of a standard

Use when:
- Task requires broad doc discovery
- Updating docs that might be scattered
- Creating new docs for an established pattern
