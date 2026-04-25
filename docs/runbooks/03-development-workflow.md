# Development Workflow Guide

Quy trình chuẩn từ ý tưởng đến production cho Bắp Number Adventure.

---

## Commands nhanh

| Command | Mô tả |
|---|---|
| `/brainstorm` | Brainstorm ý tưởng, khám phá hướng đi |
| `/plan` | Lên kế hoạch implement với research |
| `/cook` | Implement feature theo plan |
| `/test` | Viết và chạy tests |
| `/review` | Code review |
| `/git cm` | Commit |
| `/git cp` | Commit + push |
| `/git pr` | Tạo Pull Request |
| `/git merge` | Merge branch → main |
| `/ck:kanban` | Dashboard visualize tiến độ plans/ |
| `/ck:journal` | Ghi journal sau session |

Mỗi command có variants: `:fast` (nhanh) · `:hard` (toàn diện) · `:team` (Golden Triangle) · `:focus` (tối ưu context)

---

## Quy trình chuẩn (Full Lifecycle)

```
/brainstorm:fast  →  /plan:hard  →  /cook:hard  →  /test  →  /review  →  /git pr  →  /git merge
```

### Khi nào dùng variant nào

| Tình huống | Command |
|---|---|
| Feature đơn giản, rõ ràng | `/cook:fast` → `/git cp` |
| Feature trung bình | `/plan:fast` → `/cook` → `/test` → `/git pr` |
| Feature phức tạp / quan trọng | `/brainstorm` → `/plan:hard` → `/cook:hard` → `/test:hard` → `/review` → `/git pr` → `/git merge` |
| Bug fix | `/fix:fast` hoặc `/fix:hard` → `/git cp` |
| Cần nhiều agent song song | thêm `:team` vào bất kỳ command nào |

---

## Chi tiết từng bước

### 1. Brainstorm (tùy chọn)
Dùng khi chưa rõ hướng implement hoặc cần khám phá các lựa chọn kỹ thuật.
```
/brainstorm:fast   # nhanh, không cần research
/brainstorm:hard   # sâu, có research, phù hợp feature lớn
```

### 2. Planning
Tạo plan chi tiết trong `plans/` với phases, tasks, research reports.
```
/plan:fast    # plan nhanh, không cần research sâu
/plan:hard    # plan toàn diện với research
/plan:team    # Golden Triangle: adversarial planning
```

### 3. Implementation
```
/cook:fast    # implement nhanh (bỏ qua planning phase)
/cook:hard    # full lifecycle: plan → code → test → review
/cook:team    # Tech Lead + Executor + Reviewer chạy song song
```

### 4. Testing
```
/test:fast    # test scope hẹp, nhanh
/test:hard    # full coverage + quality gates
```

### 5. Code Review
```
/review:fast  # quick review
/review:hard  # deep analysis + architecture review
```

### 6. Git Operations
```
/git cm       # stage files + commit
/git cp       # stage + commit + push
/git pr       # tạo Pull Request (tự điền template)
/git merge    # merge branch vào main
```

### 7. Theo dõi tiến độ
```
/ck:kanban    # mở dashboard Kanban + Gantt cho plans/
```

### 8. Journal (sau mỗi session lớn)
```
/ck:journal   # ghi nhận thay đổi, quyết định, reflection vào docs/journals/
```

---

## Git Branch Convention

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

## Roadmap Phases

| Phase | Trạng thái | Nội dung |
|---|---|---|
| Phase 0 | ✅ Done | Design & Prototype |
| Phase 1 | ✅ Done | Production MVP (Next.js + PostgreSQL + Docker) |
| Phase 2 | 🔜 Next | Content Expansion (worlds, PWA, bilingual audio) |
| Phase 3 | ⏳ Planned | Social / Engagement (leaderboard, classroom) |

Roadmap chi tiết: [`docs/sprints/roadmap.md`](../sprints/roadmap.md)
