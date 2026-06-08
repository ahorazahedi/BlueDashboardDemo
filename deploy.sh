#!/usr/bin/env bash
#
# deploy.sh — git push + build locally + push the static site to the server.
#
# Usage:
#   ./deploy.sh            # git push + build + upload + verify (default)
#   ./deploy.sh --no-push  # skip git push
#   ./deploy.sh --no-build # skip the build, just re-upload existing dist/
#
# The SSH password is asked at runtime (never stored in this script). If
# `sshpass` is installed it is fed via env; otherwise ssh prompts you directly.
#
set -euo pipefail
cd "$(dirname "$0")"

# ── config ───────────────────────────────────────────────────────────────────
SSH_HOST="ubuntu@bluedopamine.ir"
REMOTE_DIR="/var/www/dashboarddemo"
DOMAIN="dashboarddemo.bluedopamine.ir"
DIST="dist"

DO_BUILD=1
DO_PUSH=1
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --no-push)  DO_PUSH=0 ;;
    *) echo "unknown flag: $arg"; exit 1 ;;
  esac
done

say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$1"; }

# ── git push ─────────────────────────────────────────────────────────────────
if [ "$DO_PUSH" -eq 1 ]; then
  say "git push"
  git push
fi

# ── build ────────────────────────────────────────────────────────────────────
if [ "$DO_BUILD" -eq 1 ]; then
  say "Building production bundle"
  npm run build
fi

if [ ! -f "$DIST/index.html" ]; then
  echo "✗ $DIST/index.html not found — build first (drop --no-build)"; exit 1
fi

# ── ask for SSH password (not stored) ────────────────────────────────────────
read -rs -p "SSH password for ${SSH_HOST}: " SSHPASS_INPUT; echo

# ── upload ───────────────────────────────────────────────────────────────────
say "Uploading $DIST/ → $SSH_HOST:$REMOTE_DIR"
if command -v sshpass >/dev/null 2>&1; then
  SSHPASS="$SSHPASS_INPUT" sshpass -e \
    rsync -az --delete \
    -e "ssh -o LogLevel=ERROR -o PreferredAuthentications=password -o PubkeyAuthentication=no" \
    "$DIST"/ "$SSH_HOST:$REMOTE_DIR/"
else
  echo "  (sshpass not found — ssh will prompt; install: brew install hudochenkov/sshpass/sshpass)"
  rsync -az --delete -e "ssh -o LogLevel=ERROR" "$DIST"/ "$SSH_HOST:$REMOTE_DIR/"
fi
unset SSHPASS_INPUT

# ── verify ───────────────────────────────────────────────────────────────────
say "Verifying https://$DOMAIN"
CODE="$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" || true)"
if [ "$CODE" = "200" ]; then
  printf "\033[1;32m✓ Live — https://%s (HTTP %s)\033[0m\n" "$DOMAIN" "$CODE"
else
  printf "\033[1;31m✗ Unexpected status %s from https://%s\033[0m\n" "$CODE" "$DOMAIN"
  exit 1
fi
