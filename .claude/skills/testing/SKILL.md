# SKILL: Testing

## Trigger
`test` · `tc` · `test cases [feature/US]` · `viết test`

## Workshopman Test Priorities
- **RBAC** — role sai không được xem/làm gì (critical)
- **Subscription gate** — feature premium bị chặn khi hết quota
- **State machine** — Work Order chỉ chuyển trạng thái hợp lệ
- **Inventory** — tồn kho không âm, xuất kho đúng số lượng
- **Financial** — tính tiền đúng, không mất dữ liệu khi payment fail

## Output: QC Test Cases

```markdown
## Test Suite: [US-XXX] — [Tên]

### TC-001: [Happy path]
- Pre: [điều kiện ban đầu, bao gồm role của user]
- Steps: 1. ... 2. ...
- Expected: [kết quả cụ thể, đo được]
- Priority: HIGH

### TC-002: [RBAC — unauthorized role]
- Pre: Login với role Technician
- Steps: Truy cập tính năng Accounting
- Expected: 403 Forbidden, redirect về dashboard
- Priority: HIGH

### TC-003: [Edge case]
...
```

## Output: Unit Test (Dev)

```typescript
describe('[Module]', () => {
  it('should [behavior] when [condition]', async () => {
    // Arrange — setup, mock
    // Act — call function
    // Assert — verify result
  });
});
```

## Rules
- Mỗi AC → ≥1 test case
- RBAC test bắt buộc cho mọi US có phân quyền
- Negative case bắt buộc: invalid input, unauthorized, insufficient quota
- Unit test: mock external services (core API, Zalo API)

## Workshopman Test Priorities

**High Priority Areas**
- BG approval flow: internal approval gate → KH approval gate (both must be independently testable)
- LSC permission/price visibility: KTV + QĐ roles must NEVER receive price fields in response
- Debt calculation: phải thu / phải trả formulas with concurrent transactions
- Stock consistency: XHK prevents negative stock; concurrent issue requests must serialize
- Zalo session management: reconnect retry at 09:00; campaign daily-limit enforcement
- Payment flows: VnPay callback idempotency; PayPal auto-renew failure handling
- Subscription gate: expired subscription blocks premium features immediately

**Key Edge Cases**
- KTV breaks part → internal compensation item (đền bù nội bộ) created — must not appear on customer invoice
- BG price changes mid-approval — re-approval flow triggered; old approval invalidated
- Cấn trừ công nợ — netting receivable and payable for same counterparty (atomic transaction)
- DataTool device kick-out — user logs in on PC while already active on PC → previous PC session terminated
- Zalo account disconnected mid-campaign — messages queued, retry on reconnect, daily limit respected
- PTN/LSC state transition guard — invalid state jump must return 409 Conflict
