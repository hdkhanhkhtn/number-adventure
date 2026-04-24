# PHASES — Phase Execution Protocol

> **LOAD**: When running workflow phases | **PURPOSE**: Phase execution protocol
> **SOURCES**: Agent-Assistant PHASES + Superpowers verification + Workshopman plan org

---

## PHASE OUTPUT FORMAT

### Standard Phase (single agent):

```markdown
## Phase {N}: {name}

### Sub-agent: `{agent}` — {role}     ← TIER 1 only
### Embodying: `{agent}` — {role}     ← TIER 2 only

{agent work / summary}

### Exit Criteria
- [x] {criterion_1}
- [x] {criterion_2}

### `{agent}` complete
**Deliverable**: {summary}
```

**Rules**:
- TIER 1 → "Sub-agent" line | TIER 2 → "Embodying" line (never both)
- Emit phase start **before** work, exit criteria **after**
- Continue to next phase immediately (same reply)

---

## GOLDEN TRIANGLE PHASE OUTPUT (`:team` variant only)

> **LOAD**: `TEAMS.md` for full Golden Triangle protocol.

```markdown
## Phase {N}: {name} — GOLDEN TRIANGLE

### Triangle Assignment
| Role | Agent | Mission |
|------|-------|---------|
| Tech Lead | `{agent}` | {coordination mission} |
| Executor | `{agent}` | {implementation mission} |
| Reviewer | `{agent}` | {review mission} |

### Debate Summary (if any)
- **Rounds used**: {N}/3
- **Key disputes**: {brief}
- **Resolution**: {PASS / Tech Lead arbitration}

### CONSENSUS: {TechLead} | {Executor} | {Reviewer}

### Exit Criteria
- [x] {criterion_1}
- [x] {criterion_2}

### Phase {N} complete — Golden Triangle released
**Deliverable**: {summary}
```

---

## PHASE EXECUTION RULES

### One Phase at a Time (No Batching)

```
FOR Phase N:
  1. EMIT "## Phase N: {name}"
  2. LOAD only what Phase N needs (agent file, prior deliverables)
  3. DELEGATE via TIERED EXECUTION
  4. EMIT exit criteria + completion
  5. Write deliverable file if required
  6. CONTINUE to Phase N+1 (do not stop)
```

FORBIDDEN: Loading agents for Phase 2, 3, ... while in Phase 1

### Prior Deliverables as Constraints

```
BEFORE Phase N:
  1. CHECK if prior deliverable exists
  2. IF exists:
     → READ completely
     → LOCK as IMMUTABLE constraint (L8)
     → DO NOT modify prior decisions
  3. IF missing but required:
     → HALT with notice
     → Create first via appropriate agent
     → Then resume
```

---

## VERIFICATION GATES (from Superpowers)

Before moving to next phase, verify:
- Deliverable produced (file or chunked folder)
- Output matches agent's format
- All exit criteria met with EVIDENCE (not claims)
- No scope creep
- No placeholders — exact code, exact paths, exact commands

**Iron Law**: No completion claims without fresh verification evidence.

---

## DELIVERABLE SIZE MANAGEMENT

| Estimated Size | Strategy |
|----------------|----------|
| ≤ 150 lines | **Single file** — standard path |
| > 150 lines OR ≥ 4 major sections | **Chunked** — split into folder with index |

### Chunked Deliverable Structure

```
./plans/reports/{type}/
├── 00-index.md              # Overview + table of contents
├── 01-{section-name}.md     # Section 1
├── 02-{section-name}.md     # Section 2
└── ...
```

### Creation Rules (MANDATORY)

```
WHEN creating chunked deliverable:
  1. CREATE 00-index.md FIRST (with planned sections)
  2. CREATE each section file ONE BY ONE, SEQUENTIALLY
  3. After EACH file: update 00-index.md section status
  4. NEVER create all files in a single tool call
  5. Each section file: target 80-150 lines

  NEVER create a single file > 200 lines
  ALWAYS create index first, then sections sequentially
```

---

## PLAN FILE ORGANIZATION (Workshopman)

Plans are stored in `./plans/` with timestamp and descriptive name.

```
plans/
├── {YYMMDD}-{slug}/
│   ├── plan.md                    # Overview (≤ 80 lines)
│   ├── phase-01-{name}.md        # Phase details
│   ├── phase-02-{name}.md
│   ├── research/                  # Research reports
│   └── reports/                   # Agent reports
└── reports/                       # Standalone reports
```

See `documentation-management.md` for full plan file structure.

---

## WORKFLOW COMPLETION

After last phase:

```markdown
## Workflow Complete

### User Request Verification
> {Quote user's original request}

### Requirements Verification
| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| R1 | {req} | done | {file:line or deliverable} |

### Deliverables
- {list of outputs with paths}

### Notes
{any warnings, limitations, or follow-ups}
```

**Rules**:
- Trace EVERY requirement to evidence
- Verify against ORIGINAL user request
- No silent drops
