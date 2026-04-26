# Project Backlog

Issues tồn đọng từ cook, test, review, debug — chưa được ưu tiên fix.
Mỗi entry có GitHub Issue link để track trên remote.

> **Severity:** Critical = block merge | Important = fix trong phase tiếp | Suggestion = nice-to-have
> **Source:** review | test | debug | cook

---

## 🔴 Critical (block merge — fix ngay)

| # | Issue | File:Line | Source | Phase | GitHub |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

## 🟡 Important (fix trong phase tiếp)

| # | Issue | File:Line | Source | Phase | GitHub |
|---|---|---|---|---|---|
| 1 | `isHydrated` guard missing in play page — cold load triggers premature redirect to `/` before hydration completes | `app/(child)/play/[gameType]/[lessonId]/page.tsx:108` | review | Phase 3A | #14 |
| 2 | Write-through localStorage cache fires on `sessionActive` changes (not serialised) — redundant writes on game-intensive pages | `context/game-progress-context.tsx:99` | review | Phase 3A | #15 |

---

## 🔵 Suggestion (nice-to-have / tech debt)

| # | Issue | File:Line | Source | Phase | GitHub |
|---|---|---|---|---|---|
| 3 | `pulse` keyframe not self-contained in SkeletonScreen — animation silently no-ops if global CSS missing | `components/ui/skeleton-screen.tsx:16` | review | Phase 3A | — |
| 4 | `JSON.parse(cached)` in reward page has no try/catch — malformed sessionStorage throws uncaught exception | `app/(child)/reward/page.tsx:33` | review | Phase 3A | — |

---

## ✅ Resolved

| # | Issue | Fixed in | PR |
|---|---|---|---|
| — | — | — | — |

---

## Hướng dẫn thêm issue

### Thêm vào BACKLOG.md
```markdown
| 1 | AudioService không retry khi TTS timeout | lib/audio/audio-service.ts:45 | review | Phase 2B | #12 |
```

### Tạo GitHub Issue tương ứng
```bash
gh issue create \
  --title "fix(audio): add retry logic when TTS times out" \
  --body "Found during Phase 2A review.\nFile: lib/audio/audio-service.ts:45\nSuggestion: retry 3x with 500ms backoff before falling back to Web Speech API." \
  --label "important,phase-2b"
```

### TODO comment trong code
```typescript
// TODO(phase-2b)[important]: add retry logic when TTS times out — see BACKLOG.md #1
```

### Khi resolve
1. Move entry từ Important/Suggestion → Resolved
2. Close GitHub Issue: `gh issue close <number>`
3. Remove TODO comment khỏi code
