# Deployment Guide — Bắp Number Adventure

## Overview

| Item | Value |
|---|---|
| Target | Ubuntu 22.04 VPS |
| App user | `bap` |
| App dir | `/home/bap/apps/number-adventure` |
| Stack | Next.js 14 + PostgreSQL 16, both in Docker |
| CD trigger | Push to `main` (PR merge) via GitHub Actions |
| Scripts | `scripts/server-setup.sh`, `scripts/deploy.sh` |

---

## Part 1 — One-time Server Setup

Run **once** on a fresh VPS as root.

### 1.1 Run the setup script

```bash
# On your local machine — SSH into the server as root
ssh root@<your-server-ip>

# On the server — download and run the setup script
REPO_URL=https://github.com/<org>/<repo> \
  bash <(curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/scripts/server-setup.sh)
```

The script will:
1. Install Docker + Docker Compose plugin
2. Create system user `bap` (added to `docker` group)
3. Generate an SSH keypair for GitHub Actions at `/home/bap/.ssh/github_actions`
4. Clone the repository to `/home/bap/apps/number-adventure`
5. Create a `.env` placeholder file
6. Configure UFW firewall (ports 22, 80, 443, 3000)
7. Print the **private key** — copy it for Step 1.3 below

### 1.2 Fill in `.env` on the server

```bash
# Switch to the bap user
su - bap
nano ~/apps/number-adventure/.env
```

Required values:

```dotenv
# Database
POSTGRES_DB=bap_adventure
POSTGRES_USER=bap
POSTGRES_PASSWORD=<strong-random-password>

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://<your-domain-or-ip>

# AI
AI_ENDPOINT=https://9router.remotestaff.vn/v1
AI_MODEL=advance-model
AI_API_KEY=<your-api-key>

# Next.js
NEXTAUTH_SECRET=<32-char-random-string>   # openssl rand -base64 32

# Email (Phase 3C — weekly reports)
RESEND_API_KEY=re_<your-resend-key>
CRON_SECRET=<random-string>               # openssl rand -hex 32

# Content generation (local-only, never deploy to server)
# AI_API_KEY=<your-api-key>
# AI_ENDPOINT=https://9router.remotestaff.vn/v1
# AI_MODEL=advance-model
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Feature flags
NEXT_PUBLIC_USE_DB_LESSONS=false          # set true after seeding lessons
```

`.env` is never committed to git (it's in `.gitignore`).

### 1.3 Add GitHub Actions Secrets

In your GitHub repo go to **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `VPS_HOST` | Server IP address |
| `VPS_USER` | `bap` |
| `VPS_PORT` | `22` (or your custom SSH port) |
| `VPS_SSH_KEY` | Contents of `/home/bap/.ssh/github_actions` (private key) |
| `VPS_APP_DIR` | `/home/bap/number-adventure` |

### 1.4 First manual deploy

```bash
# On the server as user bap
cd ~/apps/number-adventure
docker compose up -d db          # start database first
docker compose run --rm migrate  # run migrations
docker compose up -d app         # start app
docker compose ps                # verify both are running
```

---

## Part 2 — Automated Deploy (CD Pipeline)

### How it works

```
PR merged → push to main
  └── GitHub Actions: .github/workflows/deploy.yml
        ├── Job 1: Quality Gate
        │     ├── npm run lint
        │     ├── npm run type-check
        │     └── npm test
        └── Job 2: Deploy (only if Job 1 passes)
              ├── SSH into VPS as user `bap`
              └── Run scripts/deploy.sh on server
```

### What `scripts/deploy.sh` does on the server

```
1. git fetch + git reset --hard origin/main
2. docker compose build --no-cache app migrate
3. docker compose run --rm migrate          ← prisma migrate deploy
4. docker compose up -d --no-deps app       ← restart app only
5. Health check
6. docker image prune                       ← clean old images
```

### Triggering a deploy

Any push to `main` triggers the pipeline automatically — including PR merges.  
To deploy manually without a code change:

```bash
# On your local machine
git commit --allow-empty -m "chore: trigger deploy"
git push origin main
```

---

## Part 3 — One-time Content Generation (Phase 3B)

Run these **once** after initial deploy to populate AI-generated lessons and TTS audio.
All commands run locally (not on the server).

### 3B-1: Generate AI lesson content

Requires `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL` in your local `.env`.

```bash
npm run generate:lessons -- --all
# Outputs: prisma/seed-lessons.json
# Preview only (no file write): npm run generate:lessons -- --all --dry-run
```

### 3B-2: Seed lessons to database

Requires `DATABASE_URL` in your local `.env` pointing at the target DB.

```bash
npm run seed:lessons
# Idempotent — safe to re-run; upserts by (worldId, order)
# Verify: npx prisma studio → Lesson table should show 63 rows (7 worlds × 9 lessons)
```

### 3B-3: Generate TTS audio files

Requires `GOOGLE_APPLICATION_CREDENTIALS` in your local `.env` (path to GCP service account JSON).

```bash
npm run generate:audio
# Outputs: public/audio/tts/en-US/{0..100}.mp3  (101 files)
#          public/audio/tts/vi-VN/{0..100}.mp3  (101 files)
# Verify:  ls public/audio/tts/en-US/ | wc -l   → 101
```

Commit the generated MP3 files after verification (~3 MB total):

```bash
git add public/audio/tts/
git commit -m "chore(audio): add TTS audio pack en-US and vi-VN (0-100)"
```

### 3B-4: Activate DB lessons (optional)

Set in server `.env` to switch lesson source from static templates to DB:

```dotenv
NEXT_PUBLIC_USE_DB_LESSONS=true
```

Restart app to apply. Falls back to static templates automatically if DB is empty.

---

## Part 4 — Day-to-day Operations

### View logs

```bash
# As user bap on the server
docker compose logs -f app        # Next.js app logs (live)
docker compose logs -f db         # PostgreSQL logs
tail -f ~/apps/number-adventure/deploy.log  # deploy history
```

### Restart services manually

```bash
docker compose restart app        # restart app only
docker compose restart            # restart everything
```

### Stop / Start

```bash
docker compose down               # stop all containers
docker compose up -d              # start all containers
```

### Database shell

```bash
docker compose exec db psql -U bap -d bap_adventure
```

### Run a one-off Prisma command

```bash
docker compose run --rm migrate npx prisma studio     # visual DB browser
docker compose run --rm migrate npx prisma db seed    # seed data
```

---

## Part 5 — Rollback

If a bad deploy gets through:

```bash
# On the server as bap
cd ~/apps/number-adventure

# Find the last good commit
git log --oneline -10

# Roll back to it
git reset --hard <good-commit-sha>

# Rebuild and restart
docker compose build --no-cache app
docker compose up -d --no-deps app
```

---

## Part 6 — Environment Checklist (pre-deploy)

- [ ] `npm run build` succeeds locally
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] All tests pass (`npm test -- --watchAll=false`)
- [ ] `.env` on server has all required values
- [ ] GitHub Secrets are all set (VPS_HOST, VPS_USER, VPS_PORT, VPS_SSH_KEY, VPS_APP_DIR)

## Part 7 — Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥ 75 |
| First Contentful Paint (4G) | < 2s |
| Audio response on tap | < 100ms |

---

## File Reference

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage Next.js production image |
| `docker-compose.yml` | PostgreSQL + migrate + app services |
| `scripts/server-setup.sh` | One-time VPS initialisation (run as root) |
| `scripts/deploy.sh` | Deploy script (run on server by GitHub Actions) |
| `.github/workflows/deploy.yml` | GitHub Actions CD pipeline |
| `.env` | Secrets (server only, never committed) |
| `.env.example` | Template for `.env` (committed, no secrets) |
