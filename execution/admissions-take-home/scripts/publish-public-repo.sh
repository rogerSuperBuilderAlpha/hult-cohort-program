#!/usr/bin/env bash
# Copy starter files to a clean directory for public GitHub publish (no SOLUTIONS/GRADING).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/../admissions-task-board-fall26-publish}"

rm -rf "$OUT"
mkdir -p "$OUT"

rsync -a \
  --exclude node_modules \
  --exclude SOLUTIONS.md \
  --exclude GRADING.md \
  --exclude scripts/publish-public-repo.sh \
  "$ROOT/" "$OUT/"

echo ""
echo "Public starter bundle ready at:"
echo "  $OUT"
echo ""
echo "Next:"
echo "  cd \"$OUT\" && npm ci && npm run test:ci"
echo "  git init && git add . && git commit -m \"Admissions take-home Fall 2026\""
