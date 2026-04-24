---
name: refactor-clean
description: Dead code detection, safe removal, and duplicate consolidation with test verification at every step
---

# Refactor Clean — Dead Code & Duplicate Elimination

## Overview

Safely identify and remove dead code from the codebase. Every deletion is verified by running the full test suite. One deletion at a time — never batch.

**Core principle:** Conservative deletion with continuous verification.

## When to Activate

- Codebase cleanup sprints
- After major feature removals
- When file count or bundle size grows without reason
- Post-migration cleanup (old API routes, deprecated components)
- **NEVER during active feature development** — finish the feature first

## Detection Tools

Run these to identify dead code candidates:

```bash
# TypeScript/Node.js — unused files, exports, dependencies
npx knip

# Unused npm dependencies
npx depcheck

# Unused TypeScript exports
npx ts-prune

# Unused ESLint disable directives
npx eslint . --report-unused-disable-directives

# Python — unused code
vulture src/
```

If tools are not installed, install them temporarily:
```bash
npx knip          # runs without global install
npx depcheck      # runs without global install
npx ts-prune      # runs without global install
pip install vulture --break-system-packages  # Python
```

## Safety Tiers

Categorize every finding before taking action:

| Tier | Examples | Action |
|------|----------|--------|
| **SAFE** | Unused utility functions, test helpers, internal-only functions with 0 references | Delete confidently after grep verification |
| **CAUTION** | Components, API routes, middleware, exported functions | Verify no dynamic imports (`import()`, `require()` with variables), no external API consumers |
| **DANGER** | Config files, entry points, type definitions, index files | Investigate thoroughly — often used by build tools or external systems invisibly |

## Safe Deletion Workflow

```
Step 1: DETECT
  Run detection tools (knip, depcheck, ts-prune)
  Collect candidate list

Step 2: CATEGORIZE
  For each candidate:
    - Grep for references (including dynamic patterns)
    - Check if part of public API
    - Assign tier: SAFE / CAUTION / DANGER
  Sort: SAFE first, DANGER last

Step 3: DELETE (one at a time)
  For each SAFE candidate:
    1. Run full test suite BEFORE deletion → record baseline
    2. Delete the file/export/function
    3. Run full test suite AFTER deletion
    4. If tests fail → REVERT immediately → move to CAUTION tier
    5. If tests pass → commit: "refactor: remove unused {name}"
    6. Move to next candidate

Step 4: HANDLE CAUTION
  For each CAUTION candidate:
    1. Search for dynamic imports: grep -r "import(" and grep -r "require("
    2. Check if any external service calls this endpoint
    3. If safe → follow Step 3 deletion process
    4. If uncertain → SKIP, document as "needs manual review"

Step 5: REPORT DANGER
  Do NOT delete DANGER items automatically.
  Document them for human review:
    "DANGER: {file} appears unused but is a {config/entry/type}. Manual review needed."

Step 6: CONSOLIDATE DUPLICATES
  After dead code removal:
    1. Identify duplicate code blocks (>10 lines)
    2. Extract into shared utility
    3. Run tests after each consolidation
    4. Commit: "refactor: consolidate duplicate {description}"
```

## Verification Rules

- **Full test suite** before AND after every single deletion
- **Revert immediately** if any test fails — do not debug
- **One deletion per commit** — atomic, revertable changes
- **Never skip tests** — "it's obviously unused" is not evidence

## Red Flags

| Thought | Reality |
|---------|---------|
| "This is obviously dead code, no need to test" | Test anyway. Obvious is not verified. |
| "I'll batch these 5 deletions together" | One at a time. Batching hides which deletion broke tests. |
| "The tool says unused, that's enough" | Grep for dynamic references. Tools miss runtime usage. |
| "I'll clean up during this feature PR" | Never. Refactor and feature changes in separate PRs. |
| "Config files are safe to remove" | DANGER tier. Config files are often invisible to static analysis. |

## Output Format

```markdown
## Refactor-Clean Report

### Detection Results
- Tool: {knip/depcheck/ts-prune}
- Candidates found: {N}
- SAFE: {N} | CAUTION: {N} | DANGER: {N}

### Deletions
| # | File/Export | Tier | Tests | Status |
|---|-----------|------|-------|--------|
| 1 | {path} | SAFE | PASS | Deleted |
| 2 | {path} | CAUTION | SKIP | Needs review |

### Summary
- Removed: {N} files, {N} exports
- Lines removed: ~{N}
- Bundle impact: {estimate if available}
- Items needing manual review: {N}
```
