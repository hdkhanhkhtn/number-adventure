# TEAMS — Golden Triangle Architecture

> **LOAD**: When `:team` variant is invoked | **PURPOSE**: 3-agent adversarial collaboration protocol
> **SOURCE**: Agent-Assistant TEAMS, adapted for Workshopman

---

## CORE PRINCIPLE

Every team phase spawns exactly **3 agent roles** — no more, no less. Quality emerges from structured tension between an Executor who builds and a Reviewer who challenges, orchestrated by a Tech Lead who arbitrates.

```
ORCHESTRATOR
└── invokes Golden Triangle for Phase N

     ┌──────────────────────┐
     │     TECH LEAD        │
     │  Decomposes          │
     │  Arbitrates          │
     │  FINAL AUTHORITY     │
     └────┬──────────┬──────┘
          │          │
    ┌─────▼──┐  ┌───▼────────┐
    │EXECUTOR│  │ REVIEWER   │
    │ Builds │◄─┤ Challenges │
    │ Defends│──►│ Validates  │
    └────────┘  └────────────┘
          ▲          ▲
          └─── MAILBOX ──┘
```

---

## THE THREE ROLES

### 1. Tech Lead
- **Function**: Task decomposer, coordinator, dispute arbitrator, output synthesizer
- **Authority**: FINAL on all decisions — overrides Executor and Reviewer when consensus fails
- **Actions**: Produces Shared Task List, reads all exchanges, issues binding DECISION

### 2. Executor
- **Function**: Direct implementer — builds, codes, creates actual deliverable
- **Authority**: Owns implementation decisions. MUST defend work when Reviewer is wrong.
- **Actions**: Implements tasks, posts SUBMISSION, posts DEFENSE with evidence when challenged

### 3. Reviewer
- **Function**: Quality gatekeeper with Devil's Advocate mindset
- **Authority**: Can FAIL submissions and demand fixes. Can escalate to Tech Lead.
- **Actions**: Reviews submissions, posts REVIEW (PASS/FAIL), re-checks fixes

---

## THE DEBATE MECHANISM

```
Executor implements → Reviewer critiques
     │                    │
     ▼                    ▼
Executor DEFENDS (with evidence) OR FIXES
     │
     ▼
Reviewer re-checks → PASS → Consensus
     │
     └── FAIL → Loop (max 3 rounds)
                  │
                  ▼
         Tech Lead ARBITRATES (binding)
```

**Max debate rounds**: 3. After round 3, Tech Lead makes **binding decision**.

**Defense rules**:
- Executor MUST defend with **technical evidence** (benchmarks, specs, code references)
- "I disagree" without proof = automatic FAIL
- Reviewer MUST consider valid evidence
- Tech Lead evaluates **evidence quality**, not role

---

## TEAM ROSTER (Workshopman-relevant teams)

| Domain | Tech Lead | Executor | Reviewer Focus |
|--------|-----------|----------|----------------|
| `backend` | `tech-lead` | `backend-engineer` | `reviewer` — security + performance |
| `frontend` | `tech-lead` | `frontend-engineer` | `reviewer` — design + performance |
| `fullstack` | `tech-lead` | `backend-engineer` + `frontend-engineer` | `reviewer` — full stack |
| `database` | `tech-lead` | `database-architect` | `reviewer` — security |
| `research` | `researcher` | `scouter` | `brainstormer` — critical evaluator |
| `planning` | `planner` | `researcher` | `tech-lead` — feasibility critic |
| `qa` | `tester` | `tester` | `security-engineer` |
| `debug` | `debugger` | `backend-engineer` | `reviewer` — root-cause validator |
| `docs` | `docs-manager` | `researcher` | `reviewer` — accuracy |
| `devops` | `devops-engineer` | `backend-engineer` | `security-engineer` |

---

## CONSENSUS PROTOCOL

Output is released **ONLY** when:

| Condition | Trigger |
|-----------|---------|
| **Clean pass** | Reviewer approved, no disputes |
| **Resolved pass** | Reviewer approved after fixes/defense |
| **Arbitrated pass** | Tech Lead overrode after max 3 rounds |

**Consensus stamp**: `CONSENSUS: TechLead OK | Executor OK | Reviewer OK`

Without this stamp, no phase output is released.

---

## COMMUNICATION

| Artifact | Owner | Purpose |
|----------|-------|---------|
| **Shared Task List** | Tech Lead | State management — assignments, status |
| **Mailbox** | All agents (append-only) | Communication log for submissions, reviews, defenses |

**Rules**:
- Mailbox is **append-only** — no edits to prior exchanges
- All agents read the full Mailbox for shared context
- One Mailbox per phase execution

---

## WHEN TO USE TEAMS

| Variant | Agents | When |
|---------|--------|------|
| `:fast` | 1 | Speed priority, simple tasks |
| `:hard` | 1 | Standard quality, focused tasks |
| `:focus` | 1 | Clean execution, noise reduction |
| `:team` | 3 | Maximum quality, adversarial review, complex tasks |

**Do NOT use `:team` for**:
- Simple single-domain tasks
- Time-critical hotfixes
- Pure research with no reviewable deliverable

---

## ERROR HANDLING

| Error | Recovery |
|-------|----------|
| Executor fails to produce deliverable | Tech Lead re-dispatches or produces minimal output |
| Reviewer too strict (fails 3 times) | Tech Lead overrides with documented reasoning |
| Reviewer rubber-stamps | Tech Lead rejects PASS, re-invokes with checklist |
| All agents fail | Tech Lead produces minimal output, flags for review |
