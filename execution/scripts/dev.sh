#!/usr/bin/env bash
# Local dev: marketing site + Ludwitt API
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  kill $API_PID $SITE_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting Ludwitt/Hult API on :4000..."
(cd "$ROOT/ludwitt-hult-api" && npm run dev) &
API_PID=$!

echo "Starting marketing site on :3000..."
(cd "$ROOT/marketing/site" && npm run dev) &
SITE_PID=$!

echo ""
echo "  Site:  http://localhost:3000"
echo "  API:   http://localhost:4000/health"
echo "  Overview: http://localhost:3000/overview"
echo ""
echo "Press Ctrl+C to stop."

wait
