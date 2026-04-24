# SKILL: Code Review

## Trigger
`cr` · `review` · `code review [file]`

## Checklist (theo thứ tự)

1. **Intent** — Code làm đúng mục đích nghiệp vụ không? (VD: Work Order logic, kho phụ tùng)
2. **Naming** — Tên biến/hàm/class rõ nghĩa, theo convention repo?
3. **SOLID / DRY / YAGNI** — Vi phạm? Chỉ dòng cụ thể
4. **Security** — SQL injection, XSS, auth bypass, role leak (technician xem được accounting?)
5. **Performance** — N+1 query, missing index, loop nặng
6. **Error handling** — Null check, async error, edge case nghiệp vụ
7. **Testability** — Có thể test độc lập? Coverage đủ?
8. **Domain correctness** — Logic nghiệp vụ có đúng không?
   - Subscription check trước khi access feature premium?
   - RBAC đúng theo role matrix?
   - Workflow state machine đúng? (VD: Work Order chỉ → Completed khi tất cả Job xong)

## Output

```markdown
## Code Review: [file/feature]

### ✅ Tốt
-

### 🔴 Critical (phải sửa)
- [Dòng X]: [vấn đề] → [gợi ý fix cụ thể]

### 🟡 Major (nên sửa)
-

### 🔵 Minor (cân nhắc)
-

### Score: [X/10]
```

## Rules
- Luôn kèm code snippet gợi ý fix cho Critical/Major
- Phân biệt rõ lỗi kỹ thuật vs lỗi nghiệp vụ
- "No issues" nếu code sạch — không cố bịa ra vấn đề

## Workshopman Domain Checklist

**Business Logic**
- LSC endpoints: price fields (`unitPrice`, `totalPrice`, `discount`) MUST be stripped for KTV and QĐ roles
- Internal compensation items (`đền bù nội bộ`) must not appear in customer-facing print/export
- BG approval: verify 2-layer gate (internal approved → then KH approval) — skipping either layer is a bug
- State transitions: PTN/PBG/LSC must only move to valid next states (see domain-model.md state machines)
- Debt formula: phải thu SD cuối = SD đầu + Nợ − Có; phải trả SD cuối = SD đầu − Nợ + Có — any deviation is critical

**Security**
- Permission key format: `module-submodule-action` — verify guard uses exact key, no wildcard bypass
- Role check must happen at API Gateway level AND service level (defense in depth)
- DataTool session: new device login must kick previous session of same type (PC or phone)
- No financial data in logs or error responses

**Data Integrity**
- Stock-out (XHK) must validate current stock ≥ quantity before issuing — never allow negative stock
- Debt balance recalculation must be atomic (transaction-wrapped)
- Subscription expiry check must be evaluated on every premium-feature request, not cached indefinitely
