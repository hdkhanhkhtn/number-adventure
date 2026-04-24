# SKILL: BA Analysis

## Trigger
`us` · `user story` · `ba [tính năng]` · `phân tích [requirement]`

## Domain Context — Workshopman
**Actors:** Chủ xưởng (Owner) · Quản lý (Manager) · Kỹ thuật viên (Technician) · Lễ tân (Receptionist) · Khách hàng (Customer) · Admin (KIMEI)

**Core flows:**
1. Khách gọi/walk-in → Lễ tân tạo Phiếu tiếp nhận → phân công Technician
2. Technician cập nhật tiến độ → Owner/Manager theo dõi
3. Phát sinh phụ tùng → tạo báo giá → khách xác nhận → xuất kho
4. Hoàn thành → tạo hoá đơn → khách nhận xe → đánh giá

## Quy trình

1. **Actor** — Ai thực hiện? Vai trò gì trong flow?
2. **Happy path** — Luồng chính từng bước
3. **Edge cases** — Điều gì có thể xảy ra bất thường?
4. **Business rules** — Quy tắc nghiệp vụ đặc thù (phân quyền, giới hạn, ...)
5. **Dependencies** — Cần service/data/API gì?
6. **Out of scope** — Rõ ràng những gì KHÔNG làm trong sprint này

## Output Format

```markdown
## [US-XXX] — [Tên tính năng]

**As a** [Actor — VD: Kỹ thuật viên]
**I want** [hành động cụ thể]
**So that** [lợi ích đo được]

### Acceptance Criteria
- **AC1:** Given [điều kiện] / When [hành động] / Then [kết quả đo được]
- **AC2:** ...

### Business Rules
- BR1: [quy tắc nghiệp vụ]

### Out of scope
- ...

### Definition of Done
- [ ] Code + unit test
- [ ] QC pass trên staging
- [ ] Demo cho PO
- [ ] Docs cập nhật (nếu có API mới)

### Estimate: [X story points]
```

## Rules
- AC phải đo được — không dùng "nhanh", "dễ dùng", "hoạt động tốt"
- Mỗi AC = 1 test case có thể viết
- US > 5 ngày → đề xuất tách nhỏ
- Luôn xem xét RBAC: role nào được làm gì?

## Workshopman Context

**Actors (full RBAC hierarchy)**
WorkspaceOwner > FactoryManager > Manager(QĐ) / ServiceAdvisor(CVDV) / Technician(KTV) / Accountant / Sale / WarehouseManagement / PurchasingStaff > Customer

**Core User Flows**
1. **PTN → BG → LSC → HĐSC (Repair Lifecycle)**
   - CVDV tạo PTN → QĐ phân KTV → KTV lập PASC → CVDV tạo PBG → duyệt nội bộ → KH duyệt → CVDV tạo LSC → Kho cấp PT → KTV SC → CVDV nghiệm thu → HĐSC → thu tiền
2. **Workshop Connect (Zalo marketing)**
   - Manager kết nối Zalo QR → sync contacts → tạo campaign với điều kiện KH → gửi tin → log kết quả
3. **DataTool lookup (WorkshopDiag)**
   - User login → subscription validated → query kỹ thuật (AllData/Mitchell/etc.) → xem kết quả; thiết bị mới login → kick thiết bị cũ cùng loại

**Key Business Rules Reference**
- LSC price hidden from KTV + QĐ; đền bù nội bộ không in cho KH
- PBG cần 2 lớp duyệt: nội bộ → KH
- Tồn kho không được âm; debt formula cố định (see domain-model.md)
- Subscription auto-block khi expired; Workspace auto-create khi mua gói qua WordPress
- Permission key pattern: `module-submodule-action`; price visibility split into separate keys
