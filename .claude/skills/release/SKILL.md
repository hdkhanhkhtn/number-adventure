# SKILL: Release

## Trigger
`release` · `chuẩn bị release` · `release v[X.Y.Z]`

## Versioning
- PATCH: bug fix, không đổi API
- MINOR: tính năng mới, backward compatible
- MAJOR: breaking change

## Output: Release Checklist

```markdown
## Release v[X.Y.Z] — Sprint [N]

### Pre-release
- [ ] Tất cả tasks Sprint status = Done (KIMEI Console)
- [ ] QC sign-off trên staging
- [ ] DB migration + rollback script ready
- [ ] Env vars đã cập nhật
- [ ] Breaking changes: thông báo services liên quan
- [ ] CLAUDE.md cập nhật nếu có thay đổi kiến trúc

### Changelog
**Features:** [US-XXX] ...
**Bug Fixes:** [BUG-XXX] ...
**Breaking:** [nếu có]

### Post-release
- [ ] Smoke test production
- [ ] Monitor error logs 30 phút
- [ ] Thông báo PO + client
```
