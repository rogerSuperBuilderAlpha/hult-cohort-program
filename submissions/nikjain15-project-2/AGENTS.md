# Rally — notes for agents

**Read [README.md](README.md) first** for setup and architecture. This file is the stuff that will
bite you. Next **16**: Turbopack is the default; Node 20.9+. Every screen is a client component (the
whole app is realtime listeners) — they use `useParams()`/hooks, not promised `params`.

## Rules that outrank your judgement (ordered, higher wins)

1. **Core comms must work with the smart layer OFF.** Channels/DMs/threads/reactions/realtime must
   function even if every model call fails and no admin credential exists. The three intelligences
   and all points-writing routes degrade to no-op (null / 503), never a crash. Re-test with
   `ANTHROPIC_API_KEY` and `FIREBASE_SERVICE_ACCOUNT` unset.
2. **Never say "AI" in the UI.** It is always "Rally". Backend/agent code may say what it likes.
   `grep -rniE '\bA\.?I\b' app/` must stay empty.
3. **Ledger, not counters.** XP/rank derive from the append-only `xpEvents` collection, written
   ONLY by admin routes. Clients can never write `points`, `xpEvents`, or `pulseEvents`. Rank is
   computed (query + reduce), never a stored total. The rules tests prove inflation is impossible —
   if one goes red, the product is gameable.
4. **Be kind to the quiet.** No public shame, no "N days inactive", no full public ranking. The
   leaderboard is neighbors-only (±2, computed server-side and never fully returned); the team goal
   is cooperative; unread/read state is personal and never broadcast; a missed commitment earns
   nothing but is never penalized. The judged axis is *motivation* — lift, never punish.
5. **Recognition/commitment completion is server-only.** Confirming a recognition or completing a
   commitment writes the XP ledger AND flips status in ONE admin transaction. Clients cannot flip
   recognition status directly (an earlier version let them, producing "confirmed but unawarded").

## Where the bodies are buried

- **Java on PATH for the emulator/rules tests:** `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.
  Without it `firebase emulators:exec` fails with "Unable to locate a Java Runtime".
- **Emulator project id is `demo-rally`** (Pulse uses `demo-pulse`) so local datasets never collide.
  `NEXT_PUBLIC_EMULATOR_PROJECT=demo-rally` selects it in the shared `firebase.ts`; the integration
  vitest project sets it too.
- **`@cohort/core` is vendored** at `vendor/cohort-core` (a committed `file:` dep), NOT the sibling
  `../cohort-common`. The sibling works for graders (whole-repo clone) but the isolated deploy
  (subtree split of just this folder) drops it. After editing `submissions/cohort-common/src`, run
  `npm run sync:core` to regenerate the vendored copy, and commit the `dist/` (the repo root
  `.gitignore` ignores `dist/`, so `git add -f`).
- **Turbopack + committed `.js`:** `@cohort/core` ships compiled `dist/`, not `.ts` — Turbopack
  won't transpile a `file:`-symlinked package whose exports point at source.
- **The profiles create-contention log at sign-in is benign.** `onAuthStateChanged` and the sign-in
  path both call `ensureProfile`; the transaction retries and one takes the backfill branch. The
  profile is created exactly once. Same race Pulse documents — don't "fix" it into a read-then-write.
- **`handle` is the GitHub login or null — never guessed from an email local-part.** It's only on
  `getAdditionalUserInfo(result)?.username` at sign-in; grab it there or it's gone. A guessed handle
  can collide with a real member's login (Pulse shipped `nikjain1588` for login `nikjain15` once).
- **Reactions are an inline `{uid: emoji}` map on the message, not a subcollection** — one listener
  per channel, not one per message. The rule proves an update touches only the caller's own key.
- **The Brief's unread count is `limit(50)`.** A brand-new member has no read bookmark; without the
  limit the gather scans a channel's entire history.
- **Detection never awards.** It only proposes a *suggested* recognition the helped peer must
  confirm — inference (regex or model) can be wrong, so it never carries points. Model output is
  schema-validated (`extractJson`) before it's trusted; it degrades to the deterministic detector.
- **Deploy via `../../sync-rally.sh`, NEVER Pulse's `pm-nikjain15`.** Rally has its OWN target repo
  (`nikjain15/rally-nikjain15`) + Vercel project. Feature-probe `/api/health` after (expects
  `{"app":"rally",...}`; a 404 there means stale/wrong target). Smoke passing does NOT prove a fresh
  deploy landed.

## Testing

`npm run gate` for the full net; `npm run test:e2e` for the signed-in browser flows (a Playwright
global-setup warms the dev routes so no test pays the cold Turbopack compile). Nothing is done
because it compiled — the e2e drives the real signed-in path. Fixtures are synthetic only; never
ingest real peers' data.
