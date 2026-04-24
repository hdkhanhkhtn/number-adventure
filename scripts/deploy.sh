#!/usr/bin/env bash
# scripts/deploy.sh
#
# Runs on the VPS as user `bap` — triggered by GitHub Actions via SSH.
# Pull latest code, rebuild Docker images, run migrations, restart services.
#
# Usage (called by GitHub Actions):
#   ssh bap@<host> "bash ~/apps/number-adventure/scripts/deploy.sh"
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/home/bap/apps/number-adventure}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml"
LOG_FILE="${APP_DIR}/deploy.log"

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[deploy $(date '+%H:%M:%S')]${NC} $*" | tee -a "${LOG_FILE}"; }
warn()  { echo -e "${YELLOW}[warn   $(date '+%H:%M:%S')]${NC} $*" | tee -a "${LOG_FILE}"; }
error() { echo -e "${RED}[error  $(date '+%H:%M:%S')]${NC} $*" | tee -a "${LOG_FILE}"; exit 1; }

echo "" >> "${LOG_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "${LOG_FILE}"
info "Deploy started — $(date)"

cd "${APP_DIR}"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
info "Pulling latest code from origin/main..."
git fetch origin main
BEFORE=$(git rev-parse HEAD)
git reset --hard origin/main
AFTER=$(git rev-parse HEAD)

if [[ "${BEFORE}" == "${AFTER}" ]]; then
  warn "No new commits — image will still be rebuilt to pick up env changes."
else
  info "Updated: ${BEFORE:0:7} → ${AFTER:0:7}"
  # Print concise changelog
  git log --oneline "${BEFORE}..${AFTER}" | head -10 | while read -r line; do
    info "  • ${line}"
  done
fi

# ── 2. Build new app image ────────────────────────────────────────────────────
info "Building Docker image (app)..."
${COMPOSE} build --no-cache app migrate

# ── 3. Run database migrations ────────────────────────────────────────────────
info "Running Prisma migrations..."
${COMPOSE} run --rm migrate
info "Migrations complete."

# ── 4. Restart app (zero-downtime: bring up new, then stop old) ───────────────
info "Restarting app service..."
${COMPOSE} up -d --no-deps --remove-orphans app
${COMPOSE} ps app

# ── 5. Health check ───────────────────────────────────────────────────────────
info "Waiting for app to become healthy..."
RETRIES=15
until ${COMPOSE} ps app | grep -qE "running|Up" || [[ ${RETRIES} -eq 0 ]]; do
  sleep 2
  RETRIES=$((RETRIES - 1))
done

if [[ ${RETRIES} -eq 0 ]]; then
  echo "" | tee -a "${LOG_FILE}"
  echo "── app logs (last 40 lines) ──────────────────────────" | tee -a "${LOG_FILE}"
  ${COMPOSE} logs app --tail=40 2>&1 | tee -a "${LOG_FILE}"
  echo "──────────────────────────────────────────────────────" | tee -a "${LOG_FILE}"
  error "App failed to become healthy. See logs above."
fi

# Quick HTTP check (if port 3000 is accessible from localhost)
if curl -sf http://localhost:3000/api/health &>/dev/null; then
  info "Health check passed ✓"
else
  warn "HTTP health check skipped (no /api/health endpoint yet)."
fi

# ── 6. Clean up old images ────────────────────────────────────────────────────
info "Pruning dangling Docker images..."
docker image prune -f --filter "until=24h" 2>/dev/null || true

info "Deploy finished — $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "${LOG_FILE}"
