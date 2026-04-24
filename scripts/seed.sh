#!/usr/bin/env bash
# scripts/seed.sh
# Seeds the database with initial sticker definitions.
# Run after first deploy or when sticker data needs reset.
#
# Usage:
#   bash scripts/seed.sh              # uses running Docker Compose stack
#   APP_DIR=/custom/path bash scripts/seed.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml"

echo "[seed] Running Prisma seed..."
${COMPOSE} exec app npx prisma db seed
echo "[seed] Done."
