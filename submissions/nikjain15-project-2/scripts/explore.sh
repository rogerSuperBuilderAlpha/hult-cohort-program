#!/usr/bin/env bash
#
# Rally — one-command local playground.
#
# Starts the Firebase emulator, seeds a lively SYNTHETIC demo world, and runs the dev server.
# Everything stays up as long as this terminal is open; Ctrl-C tears it all down.
#
#   bash scripts/explore.sh
#   → open http://localhost:3000  and sign in with GitHub (the emulator stands in for GitHub)
#
set -euo pipefail
cd "$(dirname "$0")/.."

# Java is required by the Firestore emulator. Note: macOS ships a /usr/bin/java STUB that
# exists on PATH but isn't a real JDK — so test that `java -version` actually WORKS, not just
# that java is found. Add Homebrew's openjdk if the working check fails.
java_ok() { java -version >/dev/null 2>&1; }
if ! java_ok; then
  for d in /opt/homebrew/opt/openjdk/bin /usr/local/opt/openjdk/bin "$(/usr/libexec/java_home 2>/dev/null)/bin"; do
    if [ -x "$d/java" ]; then export PATH="$d:$PATH"; fi
    java_ok && break
  done
fi
if ! java_ok; then
  echo "✗ No working Java runtime (the Firestore emulator needs one)." >&2
  echo "  Install it with:  brew install openjdk" >&2
  exit 1
fi
echo "→ Java: $(java -version 2>&1 | head -1)"

export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
export GCLOUD_PROJECT=demo-rally
export NEXT_PUBLIC_USE_EMULATOR=1
export NEXT_PUBLIC_EMULATOR_PROJECT=demo-rally
# Rally runs on its OWN port (3100) so it never collides with — or gets confused for — Pulse
# (Project 1), which uses :3000. Override with RALLY_PORT if you like.
export PORT="${RALLY_PORT:-3100}"
# Free Rally's port if a previous run left it held (never touches Pulse's :3000).
if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then kill -9 "$(lsof -ti "tcp:$PORT")" 2>/dev/null || true; fi

echo "→ Starting Firebase emulator…"
./node_modules/.bin/firebase emulators:start --only firestore,auth --project demo-rally &
EMU_PID=$!
cleanup() { echo; echo "→ Shutting down…"; kill "$EMU_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# Wait for BOTH Firestore (8080) AND Auth (9099) — the seed creates Auth accounts, so it must
# not run before the Auth emulator is up (otherwise: "fetch failed", empty world).
echo -n "→ Waiting for the emulators"
until curl -s "http://127.0.0.1:8080/" >/dev/null 2>&1 && curl -s "http://127.0.0.1:9099/" >/dev/null 2>&1; do
  echo -n "."; sleep 1
done
echo " ready."
sleep 2

echo "→ Seeding a demo world…"
node scripts/seed.mjs || { echo "  (first seed failed — retrying once…)"; sleep 2; node scripts/seed.mjs || echo "  (seed skipped — run 'node scripts/seed.mjs' manually)"; }

echo
echo "════════════════════════════════════════════════════════════════════"
echo "  RALLY (Project 2) is live →  http://localhost:$PORT"
echo "  (Rally is the LIGHT app with the 3-column layout — not dark Pulse on :3000)"
echo "  Sign in with GitHub. In the emulator popup, pick a demo person"
echo "  (e.g. Linus T.) or Add new account -> Auto-generate."
echo "  Sign in as Linus to see a recognition from Grace waiting to confirm."
echo "  First page load compiles for ~30s. Press Ctrl-C ONCE to stop."
echo "════════════════════════════════════════════════════════════════════"
echo

# Foreground (no exec) so bash keeps its signal trap: one Ctrl-C stops the dev server AND the
# trap tears the emulator down cleanly, instead of leaving a half-running state.
npm run dev
