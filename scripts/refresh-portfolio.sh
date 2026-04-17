#!/usr/bin/env bash
#
# Refresh the static widget assets in the Astro portfolio.
# Reads target path + widget id from .env.local at the repo root.
#
# Setup (one-time):
#   1. Create .env.local in the repo root with:
#        PORTFOLIO_PATH=/absolute/path/to/your-astro-site
#        PORTFOLIO_WIDGET_ID=<widget-id>
#   2. chmod +x scripts/refresh-portfolio.sh
#
# Usage:
#   ./scripts/refresh-portfolio.sh
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.local ]; then
  cat <<EOF >&2
✗ .env.local not found at $ROOT_DIR/.env.local.

  Create one with:
    PORTFOLIO_PATH=/absolute/path/to/your-astro-site
    PORTFOLIO_WIDGET_ID=<widget-id>
EOF
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env.local; set +a

: "${PORTFOLIO_PATH:?PORTFOLIO_PATH not set in .env.local}"
: "${PORTFOLIO_WIDGET_ID:?PORTFOLIO_WIDGET_ID not set in .env.local}"

OUT_DIR="$PORTFOLIO_PATH/public/embeds/contributions"

echo "→ Refreshing widget for portfolio at: $PORTFOLIO_PATH"
echo "  Widget id: $PORTFOLIO_WIDGET_ID"
echo

pnpm export:widget --widget-id "$PORTFOLIO_WIDGET_ID" --out "$OUT_DIR"

cat <<EOF

✓ Refreshed: $OUT_DIR

Next steps:
  cd "$PORTFOLIO_PATH"
  git add public/embeds/contributions
  git commit -m "refresh: contributions data"
  git push   # CI will auto-deploy

EOF
