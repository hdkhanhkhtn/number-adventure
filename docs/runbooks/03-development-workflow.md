# Development Workflow Guide

Quy trình chuẩn từ ý tưởng đến production cho Bắp Number Adventure.

---

## 1. Command Reference

### Variants

Hầu hết commands đều có 4 variants:

| Variant | Ý nghĩa | Khi nào dùng |
|---|---|---|
| `:fast` | Chạy nhanh, bỏ qua research/review | Bug nhỏ, tweak UI, hotfix |
| `:hard` | Full pipeline, có research + review | Feature trung bình, API mới |
| `:focus` | Full pipeline + tối ưu context window | Feature lớn, context dài |
| `:team` | Golden Triangle: Tech Lead + Executor + Reviewer song song | Phase quan trọng, cần quality cao nhất |

---

### `/brainstorm` — Khám phá ý tưởng

Dùng khi chưa rõ hướng implement, cần phân tích trade-off, hoặc cần ra quyết định kiến trúc trước khi plan.

**Pipeline `:hard`:** Requirements discovery → Research → Codebase analysis → Solution synthesis

**Output:** `plans/reports/brainstorms/BRAINSTORM-{topic}.md`

```
# Ví dụ
/brainstorm:hard Phase 2 Content Expansion — more worlds, difficulty auto-adjustment, PWA support, bilingual audio

## Context
- Project: Bắp Number Adventure — game học số cho trẻ em 4-7 tuổi
- Phase 1 đã hoàn thành: Next.js 16 + PostgreSQL + Docker + 5 mini-games
- Roadmap: docs/sprints/roadmap.md (Phase 2 section)
- Stack: Next.js 16, TypeScript, Tailwind, Framer Motion, Prisma, Howler.js

## Cần brainstorm
1. Thứ tự ưu tiên implement Phase 2
2. Kiến trúc difficulty auto-adjustment
3. PWA strategy (offline, install to homescreen)
4. Vietnamese bilingual audio pipeline
5. More worlds — data structure, content strategy
```

---

### `/plan` — Lên kế hoạch implement

Tạo plan chi tiết trong `plans/` với phases, tasks, file paths, commands cụ thể. **Không có placeholder** — exact code, exact paths.

**Pipeline `:hard`:** Research → Codebase analysis → Design (nếu có UI) → Plan creation

**Output:** `plans/reports/plans/PLAN-{task}.md` hoặc split multi-phase nếu > 3 phases / > 3 ngày

```
# Ví dụ
/plan:hard Create detailed implementation plan for Phase 2A: audio pipeline upgrade,
question difficulty auto-adjustment, and worlds/levels API

## Task Scope
1. Audio Pipeline — Vietnamese + bilingual TTS, preload, fallback chain
2. Difficulty Auto-adjustment — tự động tăng/giảm dựa trên accuracy history
3. Worlds & Levels API — /api/worlds, /api/worlds/[worldId]/lessons

## Context
- Dir: /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
- Stack: Next.js 16, TypeScript, Prisma/PostgreSQL, Howler.js
- Branch: main (Phase 1 complete)

## Scout cần đọc
- lib/audio/ — AudioService, google-tts-provider.ts
- lib/game-engine/ — 5 engines, question-loader.ts, types.ts
- app/api/worlds/route.ts, app/api/sessions/
- prisma/schema.prisma

## Constraints
- Mobile-first, iOS Safari compatible
- Không break 5 games hiện tại
- DB migrations phải backward-compatible
```

---

### `/cook` — Implement feature

Implement theo plan. Nếu chưa có plan, tự tạo plan trước rồi implement.

**Pipeline `:hard`:** Brainstorm → Research → Scout → Design → Plan → Implement → Test → Review

**Pipeline `:team`:** Giống `:hard` nhưng mỗi phase chạy với 3 agents: Tech Lead điều phối, Executor implement, Reviewer phản biện.

**Cách truyền plan:** Truyền đường dẫn thư mục plan vào argument — agents sẽ đọc `plan.md` và các phase files.

```
# Ví dụ — dùng plan đã có sẵn
/cook:team @plans/260425-0849-phase2a-audio-difficulty-worlds-api/

# Ví dụ — không có plan, tự tạo
/cook:hard Implement Vietnamese bilingual TTS audio pipeline

## Context
- Dir: /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
- lib/audio/ — AudioService hiện tại cần upgrade
- Constraints: iOS Safari, Web Speech API primary → Google TTS fallback
```

---

### `/test` — Viết và chạy tests

Viết unit tests + integration tests theo plan checkpoints. Mỗi checkpoint trong plan phải có test tương ứng.

```
# Ví dụ
/test:hard @plans/260425-0849-phase2a-audio-difficulty-worlds-api/ Test full Phase 2A after cook fully completed

# Hoặc test scope hẹp
/test:fast Test AudioService bilingual TTS — lib/audio/audio-service.ts
```

---

### `/fix` — Fix bugs và issues

Dùng sau khi test fail hoặc review phát hiện vấn đề. Luôn investigate root cause trước khi fix.

```
# Ví dụ — fix theo plan sau test fail
/fix:team @plans/260425-0849-phase2a-audio-difficulty-worlds-api/ Fix all issues found after testing Phase 2A

# Fix nhanh một lỗi cụ thể
/fix:fast AudioContext không reset khi navigate giữa các game
```

---

### `/review` — Code review

Review code theo 2 giai đoạn: spec compliance (có đúng plan không?) → code quality (clean, secure, performant?).

```
# Ví dụ — review PR vừa tạo
/review:team Review PR vừa tạo cho Phase 2A

# Review nhanh
/review:fast Review lib/audio/audio-service.ts changes
```

---

### `/git cm` — Commit

Stage files + tạo commit với conventional commit message.

```
/git cm feat(audio): implement Vietnamese bilingual TTS with Web Speech API fallback
```

---

### `/git cp` — Commit + Push

Stage + commit + push lên remote branch hiện tại.

```
/git cp after test and fix, commit all Phase 2A changes
```

---

### `/git pr` — Tạo Pull Request

Push branch + tạo PR với template đầy đủ (problem, changes, test evidence, checklist).

```
/git pr Create PR for Phase 2A: audio pipeline + difficulty fix + worlds API
```

---

### `/git merge` — Merge PR

Merge PR vào base branch sau khi review approved.

```
/git merge Merge Phase 2A PR into main
```

---

### `/debug` — Debug issues

Investigate root cause của bugs, lỗi server, CI/CD failures.

```
/debug:hard AudioContext crashes on iOS Safari 16 — investigate root cause
```

---

### `/docs` — Cập nhật tài liệu

Cập nhật `docs/` sau khi implement feature lớn.

```
/docs:update Update docs after Phase 2A complete — architecture, API reference
```

---

## 2. Quy trình chuẩn theo độ phức tạp

### Feature đơn giản (< 1 ngày)

```
/cook:fast  →  /git cp
```

### Feature trung bình (1-2 ngày)

```
/plan:fast  →  /cook:hard  →  /test:fast  →  /git pr  →  /git merge
```

### Feature lớn / Phase (> 2 ngày)

```
/brainstorm:hard  →  /plan:hard  →  /cook:team  →  /test:hard  →  /fix:team  →  /git cp  →  /review:team  →  /git merge
```

### Bug fix

```
/debug:fast  →  /fix:fast  →  /git cp
/debug:hard  →  /fix:hard  →  /test:fast  →  /git pr  →  /git merge
```

---

## 3. Quy trình Phase chuẩn (ví dụ Phase 2A)

Đây là quy trình đầy đủ áp dụng cho mỗi Phase trong roadmap:

```
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 1 — IMPLEMENT                                      │
│                                                          │
│  /cook:team @plans/260425-0849-phase2a-.../              │
│                                                          │
│  → Tech Lead đọc plan, chia task cho Executor            │
│  → Executor implement từng phase file                    │
│  → Reviewer kiểm tra từng deliverable                    │
│  → Debate tối đa 3 rounds, Tech Lead arbitrate           │
└──────────────────────────────┬──────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 2 — TEST                                           │
│                                                          │
│  /test:hard @plans/260425-0849-phase2a-.../              │
│             Test full Phase 2A after cook fully complete │
│                                                          │
│  → Viết tests cho mọi plan checkpoint                    │
│  → Chạy full test suite                                  │
│  → Báo cáo pass/fail với evidence                        │
└──────────────────────────────┬──────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 3 — FIX (nếu có lỗi)                              │
│                                                          │
│  /fix:team @plans/260425-0849-phase2a-.../               │
│            Fix all issues found after testing            │
│                                                          │
│  → Root cause investigation trước khi fix               │
│  → Fix → re-run tests → xác nhận pass                   │
└──────────────────────────────┬──────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 4 — COMMIT & PUSH                                  │
│                                                          │
│  /git cp after test and fix, commit and push Phase 2A    │
│                                                          │
│  → Stage tất cả changes                                  │
│  → Conventional commit message                           │
│  → Push lên feature branch                               │
└──────────────────────────────┬──────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────┐
│  BƯỚC 5 — REVIEW                                         │
│                                                          │
│  /review:team Review PR vừa tạo cho Phase 2A             │
│                                                          │
│  → Kiểm tra spec compliance (đúng plan chưa?)            │
│  → Kiểm tra code quality (clean, secure, performant?)    │
│  → Reviewer phản biện, Executor defend hoặc fix          │
└──────────────────────────────┬──────────────────────────┘
                               ↓
              ┌────────────────┴────────────────┐
              ↓ Pass                            ↓ Fail
┌─────────────────────────┐   ┌────────────────────────────┐
│  BƯỚC 6 — MERGE         │   │  Quay lại BƯỚC 2           │
│                         │   │                            │
│  /git merge Merge PR    │   │  /test:hard → /fix:team    │
│  Phase 2A into main     │   │  → /git cp → /review:team  │
│                         │   │  → /git merge              │
└─────────────────────────┘   └────────────────────────────┘
```

---

## 4. Thứ tự Phase 2

Mỗi phase phải **merge về `main` trước** khi bắt đầu phase tiếp theo.

```
Phase 2A — Audio pipeline + Difficulty fix + Worlds API
  branch: feature/phase-2a-audio-difficulty-worlds-api
  plan:   plans/260425-0849-phase2a-audio-difficulty-worlds-api/
     ↓ merge vào main
Phase 2B — PWA + Smart difficulty algorithm
  branch: feature/phase-2b-pwa-difficulty-algorithm
  plan:   plans/{date}-phase2b-pwa-difficulty-algorithm/
     ↓ merge vào main
Phase 2C — Game registry refactor + New game types
  branch: feature/phase-2c-registry-new-game-types
  plan:   plans/{date}-phase2c-registry-new-game-types/
     ↓ merge vào main
```

---

## 5. Git Branch Convention

```
feature/<tên>     # tính năng mới
fix/<tên>         # bug fix
refactor/<tên>    # refactor
docs/<tên>        # docs only
test/<tên>        # tests
chore/<tên>       # maintenance
hotfix/<tên>      # production critical
```

**Không bao giờ commit thẳng vào `main`** — luôn tạo branch → PR → merge.

---

## 6. Roadmap

| Phase | Trạng thái | Nội dung |
|---|---|---|
| Phase 0 | ✅ Done | Design & Prototype |
| Phase 1 | ✅ Done | Production MVP — Next.js + PostgreSQL + Docker + 5 mini-games |
| Phase 2A | 🔄 In Progress | Audio pipeline + Difficulty fix + Worlds API |
| Phase 2B | 🔜 Next | PWA + Smart difficulty algorithm |
| Phase 2C | ⏳ Planned | Game registry refactor + New game types |
| Phase 3 | ⏳ Planned | Social / Engagement — leaderboard, classroom |

Roadmap chi tiết: [`docs/sprints/roadmap.md`](../sprints/roadmap.md)
