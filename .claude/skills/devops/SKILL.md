# SKILL: DevOps

## Trigger
`deploy` · `ci/cd` · `setup env` · `devops [service]`

## Deploy Rules
- KHÔNG deploy production mà không qua staging
- KHÔNG deploy 17h-22h workdays
- DB migration → rollback script bắt buộc
- Rollback trigger: error rate >5% trong 5 phút

## Workshopman Deploy Context

**Environments & Domains**
| Domain | Service | Stack |
|---|---|---|
| workshopman.com | gara-wordpress | WordPress/PHP |
| gara.workshopman.com | gara-management (FE + microservices) | ReactJS + Node.js |
| gara.workshopman.com/zalo-connect | gara-zalo-python | Python |
| workshopdiag.com | datatool-fe-enduser + datatool-raw | ReactJS + Node.js |
| ⚠️ Cần xác nhận: datatool-fe-admin domain | datatool-fe-admin | ReactJS |

**CI/CD**
- GitHub Actions: BE (NestJS/Node) + FE (ReactJS) — PR → staging auto; main → production manual trigger
- Appcenter: Mobile (React Native) — dev build on PR; release build on git tag

**Key Services per Env**
- Databases: PostgreSQL (main data), MongoDB (Aggregate + Logging microservices)
- Message broker: RabbitMQ (async transactions between microservices)
- Cache/session: Redis (auth tokens, subscription cache)
- Service communication: gRPC (sync internal calls), RabbitMQ (async events)

## Output: Runbook

```markdown
## Deploy Runbook: [service] v[X.Y.Z]

### Pre-deploy
- [ ] Backup DB
- [ ] Migration tested trên staging
- [ ] Rollback script ready
- [ ] Thông báo team: downtime ~[X] phút

### Steps
\`\`\`bash
git pull origin main
[migration command]
[deploy command]
[health check]
\`\`\`

### Rollback
\`\`\`bash
[rollback commands]
\`\`\`

### Post-deploy
- [ ] Smoke test: [test cases]
- [ ] Monitor 30 phút
- [ ] Thông báo PO
```
