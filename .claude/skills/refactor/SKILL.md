# SKILL: Refactor

## Trigger
`refactor` · `clean up [file]` · `cải thiện code`

## Quy trình
1. Đọc code → hiểu mục đích nghiệp vụ trước khi sửa
2. Identify smells: duplication, long method, magic number, god class
3. Propose list refactors theo priority → confirm trước khi thực hiện
4. Refactor từng bước nhỏ → chạy test sau mỗi bước
5. Verify behavior không đổi

## Output
```markdown
## Refactor Plan: [file]

### Vấn đề
[Mô tả + dẫn dòng code]

### Đề xuất (priority order)
1. [HIGH] Extract method: `processOrderAndNotify()` → `processOrder()` + `sendNotification()`
2. [MED] Replace magic: `7` → `REFRESH_TOKEN_DAYS = 7`
3. [LOW] Rename: `tmp` → `filteredWorkOrders`

### After
[Code đã refactor]

### Behavior unchanged: ✅
```

## Rules
- KHÔNG thay đổi behavior
- Mỗi refactor = 1 commit riêng
- Interface public đổi → tạo ADR
