#!/usr/bin/env bash
#
# deploy.sh — build locally + push the static site to the server.
#
# Usage:
#   ./deploy.sh           # build + upload + verify
#   ./deploy.sh --push    # also `git push` before deploying
#   ./deploy.sh --no-build # skip the build, just re-upload existing dist/
#
set -euo pipefail
cd "$(dirname "$0")"

# ── config ───────────────────────────────────────────────────────────────────
SSH_HOST="ubuntu@bluedopamine.ir"
REMOTE_DIR="/var/www/dashboarddemo"
DOMAIN="dashboarddemo.bluedopamine.ir"
DIST="dist"

DO_BUILD=1
DO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --push)     DO_PUSH=1 ;;
    *) echo "unknown flag: $arg"; exit 1 ;;
  esac
done

say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$1"; }

# ── optional: push code first ────────────────────────────────────────────────
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

# ── upload ───────────────────────────────────────────────────────────────────
say "Uploading $DIST/ → $SSH_HOST:$REMOTE_DIR"
rsync -az --delete -e "ssh -o LogLevel=ERROR" "$DIST"/ "$SSH_HOST:$REMOTE_DIR/"

# ── verify ───────────────────────────────────────────────────────────────────
say "Verifying https://$DOMAIN"
CODE="$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" || true)"
if [ "$CODE" = "200" ]; then
  printf "\033[1;32m✓ Live — https://%s (HTTP %s)\033[0m\n" "$DOMAIN" "$CODE"
else
  printf "\033[1;31m✗ Unexpected status %s from https://%s\033[0m\n" "$CODE" "$DOMAIN"
  exit 1
fi
