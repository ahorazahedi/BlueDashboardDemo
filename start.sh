#!/usr/bin/env bash
#
# start.sh — راه‌اندازی سامانه بهره‌وری هوشمند (dev / build / preview)
#
# Usage:
#   ./start.sh            # install (if needed) + dev server  → http://localhost:5173
#   ./start.sh dev        # same as above
#   ./start.sh build      # production build → dist/
#   ./start.sh preview    # build + serve preview            → http://localhost:4173
#
set -euo pipefail

cd "$(dirname "$0")"

# ── checks ──────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js یافت نشد. نصب کن: https://nodejs.org (≥ 18)"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node نسخهٔ $NODE_MAJOR یافت شد. نسخهٔ ≥ 18 لازم است."
  exit 1
fi

# ── install deps if missing ─────────────────────────────────────────────────
if [ ! -d node_modules ]; then
  echo "→ نصب وابستگی‌ها (npm install)…"
  npm install
fi

# ── run ─────────────────────────────────────────────────────────────────────
CMD="${1:-dev}"
case "$CMD" in
  dev)
    echo "→ اجرای dev server …  http://localhost:5173"
    exec npm run dev
    ;;
  build)
    echo "→ ساخت نسخهٔ production …"
    exec npm run build
    ;;
  preview)
    echo "→ build + preview …  http://localhost:4173"
    npm run build
    exec npm run preview -- --port 4173
    ;;
  *)
    echo "دستور ناشناخته: $CMD"
    echo "گزینه‌ها: dev | build | preview"
    exit 1
    ;;
esac
