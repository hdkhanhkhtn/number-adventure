# REFERENCE — Quick Lookup Tables

> **PURPOSE**: Fast lookup tables for commands, agents, and domain terms
> **SOURCES**: Agent-Assistant REFERENCE + Workshopman domain glossary

---

## COMMAND TABLE

| Command | Router | Variants |
|---------|--------|----------|
| `/cook` | `cook.md` | `fast`, `hard`, `focus`, `team` |
| `/fix` | `fix.md` | `fast`, `hard`, `focus`, `team` |
| `/plan` | `plan.md` | `fast`, `hard`, `team` |
| `/debug` | `debug.md` | `fast`, `hard`, `focus` |
| `/test` | `test.md` | `fast`, `hard`, `team` |
| `/review` | `review.md` | `fast`, `hard` |
| `/docs` | `docs.md` | `core`, `audit` |
| `/brainstorm` | `brainstorm.md` | `fast`, `hard` |

---

## AGENT TABLE

| Agent | Category | Primary Tasks |
|-------|----------|---------------|
| `tech-lead` | meta | Architecture, orchestration |
| `planner` | meta | Task breakdown, roadmap |
| `backend-engineer` | execution | APIs, services, logic |
| `frontend-engineer` | execution | UI, components, styling |
| `database-architect` | execution | Schema, queries, migrations |
| `tester` | validation | Unit, integration, E2E tests |
| `reviewer` | validation | Code review, PR feedback |
| `security-engineer` | validation | Security audit |
| `debugger` | validation | Bug investigation |
| `researcher` | research | External research |
| `scouter` | research | Codebase analysis |
| `brainstormer` | research | Ideas, requirements |
| `designer` | research | UI/UX design |
| `docs-manager` | support | Documentation |
| `devops-engineer` | support | CI/CD, deployment |
| `business-analyst` | support | Business requirements |
| `project-manager` | support | Project coordination |

---

## NATURAL LANGUAGE DETECTION

| User Says | Detect As |
|-----------|-----------|
| implement, build, create, add | `/cook` |
| fix, bug, error, broken | `/fix` |
| plan, how should, strategy | `/plan` |
| debug, investigate, why | `/debug` |
| test, coverage | `/test` |
| review, PR, check code | `/review` |
| document, readme | `/docs` |
| brainstorm, ideas, explore | `/brainstorm` |

---

## RULES FILES

| File | Purpose | Load When |
|------|---------|-----------|
| `CORE.md` | Entry point, identity, routing | **Always** |
| `PHASES.md` | Phase execution, output format | Running phases |
| `AGENTS.md` | Agent handling, tiered execution | Delegating |
| `TEAMS.md` | Golden Triangle protocol | `:team` variant |
| `SKILLS.md` | Skill resolution | Skill lookups |
| `ERRORS.md` | Error recovery | Errors occur |
| `REFERENCE.md` | Lookup tables | Quick lookups |
| `red-flags.md` | Rationalization detection | Red flag detected |
| `development-rules.md` | Code standards | Development work |
| `documentation-management.md` | Plan/doc structure | Documentation |
| `documentation-navigation.md` | Doc routing rules | Reading/writing docs |
| `git-workflow-rules.md` | Git workflow for AI | Code changes |
| `token-optimization.md` | Token/context management | Context efficiency |

---

## WORKSHOPMAN DOMAIN GLOSSARY

| Term | Definition |
|------|-----------|
| **CVDV** | Co van dich vu — service advisor, receives vehicles, creates quotes |
| **KTV** | Ky thuat vien — technician, performs repairs |
| **QD** | Quan doc — foreman, assigns KTV, confirms repair plans |
| **NCC** | Nha cung cap — parts supplier |
| **PASC** | Phuong an sua chua — repair plan (damage list + approach) |
| **PTN** | Phieu tiep nhan — vehicle reception form |
| **LSC** | Lenh sua chua — work order for KTV (hides price, shows parts + qty) |
| **HDSC** | Hoa don sua chua — repair invoice (generated after closing work order) |
| **Workspace** | Tenant of 1 garage/chain in multi-tenant system |
| **Chuoi** | Multi-branch — 1 Owner manages multiple workshops |
| **Can tru CN** | Debt offset — receivable vs payable of same entity |

---

## WORKSHOPMAN SERVICE MAP

> All services live in a single monorepo under `src/`. Two active groups; `workshopman-core` deferred.

### DataTool — Tra cuu ky thuat oto

| Service | Stack | Domain |
|---------|-------|--------|
| `workshopman-datatool-raw` | Node.js + PostgreSQL | DataTool (Ingest) |
| `workshopman-datatool-management` | Node.js + PostgreSQL | DataTool (Admin) |
| `workshopman-datatool-fe-admin` | ReactJS | DataTool (Admin UI) |
| `workshopman-datatool-fe-enduser` | ReactJS | DataTool (WorkshopDiag) |

### GaraMgmt — Quan ly xuong & Marketing

| Service | Stack | Domain |
|---------|-------|--------|
| `workshopman-gara-management` | ReactJS + Node.js | GaraMgmt (Workshop Business) |
| `workshopman-gara-fe-enduser` | ReactJS | GaraMgmt (Customer Portal) |
| `workshopman-gara-wordpress` | WordPress/PHP | GaraMgmt (Landing + Sales) |
| `workshopman-gara-zalo-python` | Python | GaraMgmt (Zalo Marketing) |
| `workshopman-mobile` | React Native | GaraMgmt (Mobile App) |

### Deferred

| Service | Stack | Domain |
|---------|-------|--------|
| `workshopman-core` | Node.js + PostgreSQL | Platform (Auth, User, Subscription, Payment) |

---

## PHASE DEPENDENCY

| Phase | Requires | Produces |
|-------|----------|----------|
| Brainstorm | Request | BRAINSTORM report |
| Research | Request | RESEARCH report |
| Scout | Request | SCOUT report |
| Plan | Research + Scout | PLAN document |
| Implement | **PLAN (mandatory)** | Code |
| Test | Code | Test results |
| Review | Code + Tests | Review verdict |

### Blocking Rules
- Implementation REQUIRES plan first
- Test REQUIRES code to exist
- Review REQUIRES code + tests

---

## ORCHESTRATION LAWS (Quick Reference)

| # | Law | One-liner |
|---|-----|----------|
| L1 | Single Truth | Entry file → CORE → rest on-demand |
| L2 | Requirement Integrity | 100% fidelity, zero loss |
| L3 | Explicit Loading | State what you loaded |
| L4 | Deep Embodiment | Follow agent's full protocol |
| L5 | Sequential Execution | Phase N before N+1 |
| L6 | Language Compliance | User's lang; files in English |
| L7 | Recursive Delegation | Meta agents never implement |
| L8 | Stateful Handoff | Prior deliverables = locked |
| L9 | Constraint Propagation | Scout→Planner→Impl chain |
| L10 | Deliverable Integrity | Agent files define format |
