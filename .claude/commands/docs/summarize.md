---
description: "⚡ Summarize documentation (project override)"
argument-hint: "[focused-topics] [should-scan-codebase]"
---

# /docs:summarize — Project Override

> **This project uses folder-based documentation.** This override reads from the correct folder structure.

## Arguments
$1: Focused topics (default: all)
$2: Should scan codebase (`Boolean`, default: `false`)

<focused_topics>$1</focused_topics>
<should_scan_codebase>$2</should_scan_codebase>

## Documentation Structure

Use `docs-manager` agent to analyze the codebase based on folder-based docs and respond with a summary report.

### Primary Sources (read in order)
1. `docs/knowledge-overview/00-index.md` — Project overview
2. `docs/knowledge-architecture/00-index.md` — Architecture summary
3. `docs/knowledge-domain/00-index.md` — Domain summary
4. `docs/knowledge-source-base/00-index.md` — Source overview
5. `docs/knowledge-standards/00-index.md` — Standards summary
6. `docs/business/business-prd/00-index.md` — PRD summary
7. `docs/business/business-features/00-index.md` — Features summary
8. `docs/business/business-workflows/00-index.md` — Workflows summary
9. `docs/business/business-glossary/00-index.md` — Glossary summary

### Rules
- Read `00-index.md` files first — they contain TOC and summaries
- Only dive into sub-files if focused topics require detail
- Do not scan the entire codebase unless the user explicitly requests it

**IMPORTANT**: Do not start implementing.
