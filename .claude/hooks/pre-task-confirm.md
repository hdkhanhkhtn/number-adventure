# HOOK: Pre-Task Confirmation

## Trigger
Mọi request liên quan đến: viết code, sửa file, tạo file, xoá, deploy.

## Hành động (trừ khi có `--auto`)

```
## 🔍 Xác nhận task

**Hiểu:** [tóm tắt 1-2 câu]

**Scope:**
- Files/modules: [list]
- Services: [list]
- Breaking change: Yes / No

**Plan:** [≤3 bước]

Gõ "ok" để tiếp tục, hoặc đặt câu hỏi nếu cần làm rõ.
```

## Bypass
Thêm `--auto` vào cuối prompt để skip.
Dùng cho: explain, read-only queries, tasks đã rõ.

## Post-task
```
## ✅ Done
- Changed: [files]
- Tests: [pass/fail/skipped]
- CLAUDE.md cần update: Yes / No
```
