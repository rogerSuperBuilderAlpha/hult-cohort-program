#!/usr/bin/env bash
#
# Two one-off production fixes. Run once, then this file can go.
#
#   1. Publish firestore.rules. The copy running in Firebase predates the fix that stops a
#      recipe author inflating their own "people unstuck" count — the only ranking in the
#      product. A reviewer reads the rules in the PR and assumes those are the rules that
#      run; right now they aren't.
#
#   2. Delete the fake member docs left in production by an e2e suite that was accidentally
#      pointed at the deployed URL instead of the emulator. They appear in the assignee
#      dropdown, so the app currently shows invented people while the PR says nothing is
#      faked. `firestore.rules` says `allow delete: if false` for members — no client can
#      remove them, by design, so this needs admin credentials rather than the app.
#
# Prerequisite (interactive, so it can't be scripted):
#
#   firebase login
#
# Then:
#
#   ./scripts/fix-prod.sh
#
# Safe to re-run. Deletes ONLY docs whose email ends @emulator.test or @pulse-audit.test,
# and prints every doc it is about to touch before touching it.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

PROJECT="$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d= -f2 | tr -d ' "')"
API_KEY="$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d= -f2 | tr -d ' "')"
FS="https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents"

if ! npx firebase projects:list >/dev/null 2>&1; then
  echo "✗ Not authenticated. Run: firebase login" >&2
  exit 1
fi

echo "→ Project: ${PROJECT}"

# --- 1. rules ---------------------------------------------------------------
echo
echo "→ Publishing firestore.rules..."
npx firebase deploy --only firestore:rules --project "${PROJECT}"

# --- 2. fake members --------------------------------------------------------
# Reading members needs a signed-in user (the rules require it, correctly). A throwaway
# account is the cheapest way in; it's deleted again at the end.
echo
echo "→ Finding fake member docs..."

PROBE_EMAIL="cleanup-probe-$(date +%s)@pulse-audit.test"
PROBE_PW="cleanup-probe-pw-1"

TOKEN="$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${PROBE_EMAIL}\",\"password\":\"${PROBE_PW}\",\"returnSecureToken\":true}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("idToken",""))')"

if [[ -z "${TOKEN}" ]]; then
  echo "✗ Could not create the probe account — cannot enumerate members." >&2
  exit 1
fi

FAKES="$(curl -s "${FS}/members?pageSize=300" -H "Authorization: Bearer ${TOKEN}" | python3 -c '
import sys, json
docs = json.load(sys.stdin).get("documents", [])
for d in docs:
    f = d.get("fields", {})
    email = f.get("email", {}).get("stringValue", "")
    if email.endswith("@emulator.test") or email.endswith("@pulse-audit.test"):
        print(d["name"].split("/documents/")[1], email)
')"

# Delete the probe before anything else can go wrong and strand it.
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}" \
  -H 'Content-Type: application/json' -d "{\"idToken\":\"${TOKEN}\"}" >/dev/null

if [[ -z "${FAKES}" ]]; then
  echo "✓ No fake member docs found — nothing to clean."
else
  echo
  echo "About to delete:"
  echo "${FAKES}" | sed 's/^/  /'
  echo
  while read -r path email; do
    [[ -z "${path}" ]] && continue
    echo "  deleting ${email}"
    npx firebase firestore:delete "${path}" --project "${PROJECT}" --force >/dev/null
  done <<< "${FAKES}"
fi

echo
echo "✓ Done. Verify the assignee dropdown on /board shows only real people."
