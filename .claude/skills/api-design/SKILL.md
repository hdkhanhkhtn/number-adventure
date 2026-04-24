# SKILL: API Design

## Trigger
`api` · `endpoint` · `api contract` · `api design [feature]`

## Workshopman API Standards
- Base: `/api/v1`
- Auth: `Authorization: Bearer <JWT>` (từ workshopman-core)
- Response: `{ data, message, statusCode }`
- Error: `{ error, message, statusCode, details? }`
- Pagination: `{ data: [], meta: { page, limit, total } }`
- URL: kebab-case, plural nouns — `/work-orders` ✅ `/getWorkOrders` ❌

## Output: API Contract

```markdown
## [METHOD] /api/v1/[resource]

**Auth:** Bearer JWT — Role: `[owner|manager|technician|receptionist]`
**Service:** workshopman-[service-name]

### Request Body / Query Params
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| | | | |

### Response 200
\`\`\`json
{ "data": {}, "message": "string", "statusCode": 200 }
\`\`\`

### Errors
| Status | Khi nào |
|--------|---------|
| 400 | Invalid input |
| 401 | Chưa authenticate |
| 403 | Role không có quyền |
| 404 | Resource không tồn tại |
| 409 | Conflict (duplicate, state invalid) |

### Breaking change: Yes / No
```

## Rules
- Đổi response structure = BREAKING CHANGE → ADR bắt buộc
- Endpoint mới liên quan đến tài chính → thêm audit log
- Subscription-gated endpoint → kiểm tra quota trước khi xử lý

## Workshopman API Conventions

**Permission Key Structure:** `module-submodule-action`
- Examples: `wsm-lsc-read`, `wsm-lsc-read-price`, `warehouse-stock-export`, `marketing-campaign-create`, `wsc-contact-list`
- Price visibility is a separate key: `wsm-lsc-read` (no price) vs `wsm-lsc-read-price` (with price) — never merged

**Key Modules**
| Prefix | Module |
|---|---|
| `wsm` | GaraMgmt core (PTN, PBG, LSC, HĐSC) |
| `warehouse` | Inventory (NHK, XHK, stock, supplier) |
| `marketing` | Campaigns, promotions |
| `wsc` | Workshop Connect (Zalo OA, contacts, messages) |

**Standard Actions**
`-list` `-read` `-create` `-update` `-delete` `-cancel` `-approve` `-close` `-import` `-export`

**Response Format**
```json
// Single: { "data": {}, "message": "string", "statusCode": 200 }
// List:   { "data": [], "meta": { "page": 1, "limit": 20, "total": 100 } }
// Error:  { "error": "string", "message": "string", "statusCode": 4xx }
```

**Special Rules**
- LSC endpoints: two variants required — with-price (CVDV/Accountant) and without-price (KTV/QĐ)
- State-transition endpoints (e.g., approve, cancel): return 409 if current state is invalid for transition
- Zalo/external integration endpoints: always async — return `{ jobId }` and poll or use webhook
