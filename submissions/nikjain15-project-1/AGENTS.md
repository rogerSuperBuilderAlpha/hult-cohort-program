<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pulse — notes for agents

**Read [README.md](README.md) first** for setup and architecture. This file is the stuff that will
bite you.

Next **16**: Turbopack is the default and `--turbopack` flags are gone; Node 20.9+ only. Route
`params` is a promise in server components — every screen here is a client component (the whole app is
realtime listeners), so they use `useParams()`, which stays synchronous. Don't "fix" that.

## Rules that outrank your judgement

Ordered. Higher wins.

1. **B4–B8 must work with GitHub disconnected.** A reviewer who declines consent still gets a working
   project manager. If sensing is the only path, the submission fails. After any sensing change,
   re-run the board with GitHub disconnected — that's the regression that will actually bite.
2. **Consent and Settings ship together.** Consent promises "turn it off", "make it ask first",
   "delete anything it posted". A promise you can't reach is a dark pattern. If time forces a cut, cut
   autonomy (default to ask-first), never Settings.
3. **Facts vs narrative.** Public facts about a member are fine — merged PRs are public record.
   **Model-written narrative about a member requires their opt-in.** No exceptions. `narrationOptIn`
   gates every generated sentence.
4. **Never punish the quiet.** No streaks, ranks, shame lists, or "N days inactive" shown to the
   cohort. Pulse can see who hasn't pushed; that's the most dangerous thing it knows.
5. **No leaderboard. Ever.**
6. **Never fake data.** No invented members, no padded feeds. Seven real people beat sixty-five
   invented ones, and the honesty claim is this submission's strongest asset.
7. **Never present a stale feed as live.** Degrade loudly.
8. **No secrets committed.** `.env*` is gitignored. Never `NEXT_PUBLIC_` a secret — that prefix ships
   it to every browser.
9. **Every user-facing string follows [VOICE.md](VOICE.md).** Tagline is "the board that
   updates itself" — never "the cohort's heartbeat". Empty states invite, receipts stay
   verbatim, spans read human ("about 7 days from start to finish"). Grep `tests/` before
   changing any string — several are pinned. When voice and an ethics rule above collide,
   the ethic wins.

## Where the bodies are buried

- **`Member.handle` is the GitHub login or `null`.** Never derive it from an email local-part. That
  bug shipped once: `dev-1588@example.com` → handle `nikjain1588`, but the login is `nikjain15`, so
  the join against the cohort repo silently never matched. A guessed handle can also collide with a
  real member's login and attach one person's work to another. The login is only on
  `getAdditionalUserInfo(result)?.username` at sign-in time — grab it there or it's gone.
  `providerData[0].uid` is the numeric id, not the login.
- **`ensureMember` must stay a transaction.** `onAuthStateChanged` fires before `signInWithPopup` and
  `updateProfile` resolve, so it races the sign-in call. A read-then-write let both reads miss and
  published `member_joined` twice on someone's first five seconds in the product.
- **`actorName` is denormalised into `PulseEvent` at write time.** Backfilling a member doc does not
  fix a feed row that already shipped with the wrong name — that's why the typed sign-up name is
  parked in a module-level value the auth listener can read.
- **`setTaskStatus` is the only path that logs `task_started` / `task_shipped`** and sets
  `completedAt`. Don't route status through `updateTask`.
- **Moving a card out of `done` logs nothing.** The feed is a record of progress, never a place to be
  embarrassed. Same for a PR closed unmerged.
- **`branchToTitle` prefixes are slash-delimited only.** A hyphen would eat the first real word:
  `fix-oauth-redirect` is "Fix oauth redirect" — the `fix` is the verb, not a namespace.
- **`shouldNarrate` returning false on an unchanged SHA range is load-bearing.** Uncached narration is
  ~$12/day (~$524 over the pilot) against ~$11 of credit. A cache miss on an unchanged range is a bug,
  not an inefficiency.
- **The board must not stack under 768.** It's a scroll-snapped carousel with a peek. Stacking
  destroys the only thing a kanban is for: seeing flow across states.
- **Drag is `pointer: fine` only.** Every card also needs its status control at ≥44px — drag alone
  fails on phones and B6 is graded.
- **Projects and tasks are cohort-wide and persist.** Tests must use unique fixture names; they don't
  start on an empty database.

## Prompt injection is live, not theoretical

Pulse reads attacker-controlled text (commit messages, PR titles, branch names), feeds it to a model,
and **auto-publishes the output to 64 people with no human in the loop.** The approve-first design had
a human as the backstop; this one has `checkNarrative` in `lib/sense.ts`.

Its critical rule is that a narrative may **only describe the actor** — injection's payoff is
publishing an insult about *someone else*. On any validation failure: publish facts only, silently.
Never publish a suspect narrative, never surface a scary error. Never `dangerouslySetInnerHTML` on a
sensed field.

## Testing

Never stress production — Blaze bills rather than blocks, so this is about polluting the data
reviewers read and about runaway cost, not an outage. **Stress and e2e run on the emulator**, which
needs no auth and no console access.

Nothing is done because it compiled or because tests pass. Done = driven in a real browser, two
contexts side by side for the realtime checks. Never mark a checklist row ✅ on something you haven't
watched work.
