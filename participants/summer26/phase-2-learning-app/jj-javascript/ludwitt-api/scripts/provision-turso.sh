#!/usr/bin/env bash
# Provision Turso for Git Arcade Ludwitt API persistence.
# Requires: turso CLI authenticated (`turso auth login`)
set -euo pipefail

DB_NAME="${TURSO_DB_NAME:-git-arcade-jj-javascript}"
VERCEL_PROJECT="${VERCEL_API_PROJECT:-ludwitt-api}"

if ! command -v turso >/dev/null 2>&1; then
  echo "Install Turso CLI: curl -sSfL https://get.tur.so/install.sh | sh"
  exit 1
fi

turso auth whoami >/dev/null 2>&1 || { echo "Run: turso auth login"; exit 1; }

if ! turso db show "$DB_NAME" >/dev/null 2>&1; then
  turso db create "$DB_NAME"
fi

DB_URL="$(turso db show "$DB_NAME" --url)"
TOKEN="$(turso db tokens create "$DB_NAME")"

echo "TURSO_DATABASE_URL=$DB_URL"
echo "TURSO_AUTH_TOKEN=$TOKEN"
echo
echo "Add to Vercel ($VERCEL_PROJECT):"
echo "  vercel env add TURSO_DATABASE_URL production"
echo "  vercel env add TURSO_AUTH_TOKEN production"
echo "Then redeploy: vercel --prod"
