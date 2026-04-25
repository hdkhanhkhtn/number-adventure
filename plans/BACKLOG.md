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
| — | — | — | — | — | — |

---

## 🔵 Suggestion (nice-to-have / tech debt)

| # | Issue | File:Line | Source | Phase | GitHub |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

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
