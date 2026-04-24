#!/usr/bin/env bash
# scripts/server-setup.sh
#
# One-time VPS initialisation for Bắp Number Adventure.
# Run as root (or a sudo user) on a fresh Ubuntu 22.04 server:
#
#   curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/scripts/server-setup.sh | sudo bash
#
# What this script does:
#   1. Install Docker + Docker Compose plugin
#   2. Create a dedicated system user `bap` (no login shell for security)
#   3. Add `bap` to the docker group
#   4. Set up SSH key for GitHub Actions to deploy as `bap`
#   5. Clone the repository
#   6. Create the .env file placeholder
#   7. Set up the systemd service so Docker starts on reboot
#
# After running, you still need to:
#   - Fill in /home/bap/number-adventure/.env
#   - Add the GitHub Actions SSH public key printed by this script to GitHub Secrets
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_USER="bap"
APP_DIR="/home/${APP_USER}/number-adventure"
REPO_URL="${REPO_URL:-}"         # pass as env var: REPO_URL=https://github.com/... sudo bash server-setup.sh
BRANCH="${BRANCH:-main}"

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
error() { echo -e "${RED}[error]${NC} $*"; exit 1; }

# ── 0. Checks ─────────────────────────────────────────────────────────────────
[[ $(id -u) -eq 0 ]] || error "Must be run as root."
[[ -n "$REPO_URL" ]]  || error "Set REPO_URL before running. e.g. REPO_URL=https://github.com/org/repo sudo bash server-setup.sh"

info "Starting server setup for Bắp Number Adventure..."

# ── 1. System update + essentials ─────────────────────────────────────────────
info "Updating system packages..."
apt-get update -qq
apt-get install -y -qq \
  curl git ca-certificates gnupg lsb-release ufw

# ── 2. Install Docker ─────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  info "Docker installed: $(docker --version)"
else
  info "Docker already installed: $(docker --version)"
fi

# ── 3. Create app user ────────────────────────────────────────────────────────
if id "${APP_USER}" &>/dev/null; then
  warn "User '${APP_USER}' already exists — skipping creation."
else
  info "Creating system user '${APP_USER}'..."
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
  info "User '${APP_USER}' created."
fi

# Add to docker group so user can run docker without sudo
usermod -aG docker "${APP_USER}"
info "User '${APP_USER}' added to docker group."

# ── 4. SSH key for GitHub Actions ─────────────────────────────────────────────
SSH_DIR="/home/${APP_USER}/.ssh"
KEY_FILE="${SSH_DIR}/github_actions"

mkdir -p "${SSH_DIR}"
chmod 700 "${SSH_DIR}"
chown "${APP_USER}:${APP_USER}" "${SSH_DIR}"

if [[ ! -f "${KEY_FILE}" ]]; then
  info "Generating SSH keypair for GitHub Actions..."
  sudo -u "${APP_USER}" ssh-keygen -t ed25519 \
    -C "github-actions@bap-number-adventure" \
    -f "${KEY_FILE}" -N ""
fi

# Add public key to authorized_keys (idempotent)
PUBKEY=$(cat "${KEY_FILE}.pub")
AUTH_KEYS="${SSH_DIR}/authorized_keys"
touch "${AUTH_KEYS}"
chmod 600 "${AUTH_KEYS}"
chown "${APP_USER}:${APP_USER}" "${AUTH_KEYS}"
grep -qF "${PUBKEY}" "${AUTH_KEYS}" || echo "${PUBKEY}" >> "${AUTH_KEYS}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  GitHub Actions SSH Private Key (add to repo Secrets → VPS_SSH_KEY):${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat "${KEY_FILE}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 5. Clone repository ───────────────────────────────────────────────────────
if [[ -d "${APP_DIR}/.git" ]]; then
  warn "Repository already cloned at ${APP_DIR} — skipping."
else
  info "Cloning repository into ${APP_DIR}..."
  sudo -u "${APP_USER}" git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
  info "Repository cloned."
fi

# ── 6. Create .env placeholder ────────────────────────────────────────────────
ENV_FILE="${APP_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  info "Creating .env placeholder at ${ENV_FILE}..."
  cat > "${ENV_FILE}" <<'EOF'
# ─── Database ────────────────────────────────────────────────────────────────
POSTGRES_DB=bap_adventure
POSTGRES_USER=bap
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# ─── App ─────────────────────────────────────────────────────────────────────
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN_OR_IP

# ─── AI ──────────────────────────────────────────────────────────────────────
AI_ENDPOINT=https://9router.remotestaff.vn/v1
AI_MODEL=advance-model
AI_API_KEY=CHANGE_ME

# ─── Next.js ─────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=CHANGE_ME_RANDOM_32_CHARS
EOF
  chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  warn ".env created — EDIT IT NOW before running deploy: ${ENV_FILE}"
else
  warn ".env already exists — not overwritten."
fi

# ── 7. Firewall (UFW) ─────────────────────────────────────────────────────────
info "Configuring UFW firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp    # Next.js (remove once Nginx is in front)
ufw --force reload
info "Firewall configured."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Server setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Next steps:"
echo "  1. Edit ${ENV_FILE} — fill in real passwords + domain"
echo "  2. Add the printed private key to GitHub → Settings → Secrets → VPS_SSH_KEY"
echo "  3. Add these GitHub Secrets:"
echo "       VPS_HOST   = $(curl -s ifconfig.me 2>/dev/null || echo '<server-ip>')"
echo "       VPS_USER   = ${APP_USER}"
echo "       VPS_PORT   = 22"
echo "       VPS_APP_DIR = ${APP_DIR}"
echo "  4. Push to main — GitHub Actions will handle the rest."
echo ""
