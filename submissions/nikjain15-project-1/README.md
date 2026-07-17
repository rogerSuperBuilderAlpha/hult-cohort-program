# Pulse

**Project 1 · [@nikjain15](https://github.com/nikjain15)** · Hult Cohort Developer Program, Summer Pilot 2026

> **Pulse senses the work, banks how it got solved, and hands that to the next person who gets stuck.**

**Production: https://pm-nikjain15.vercel.app**

Every task board dies the same way: updating it is manual, boring, and the first thing to go. This
cohort's work is already legible — 65 people running coding agents against public repos. The status is
already out there. Nobody should be typing it in.

| Layer | Does | Ships |
|---|---|---|
| **1 · Sense** | Reads your commits and PRs. Writes your week in plain English. | **Week 1** |
| **2 · Bank** | Extracts how a problem got solved from the session that solved it. | Week 2 — designed, surfaced, not automated |
| **3 · Broker** | Spots who's stuck on what someone already solved. Introduces them. | Week 3 — designed, not built |

Remove the model and there's no product left. That's the test for AI-first, and why a chat box in the
corner was rejected.

---

## Setup

Requires **Node 20.9+** (Next 16's floor). Java 11+ is only needed for the emulator, not the app.

```bash
git clone -b participants/summer26/phase-1-project-1/nikjain15 \
  https://github.com/nikjain15/hult-cohort-program.git
cd hult-cohort-program/submissions/nikjain15-project-1
npm install
cp .env.example .env.local
npm run dev                 # http://localhost:3000
```

> The `-b` is load-bearing until the PR merges: this is a fork of the cohort monorepo, and its
> default branch has no `submissions/nikjain15-project-1` in it. A plain `git clone` gets you a tree
> without the submission, and step 2 fails with "no such file or directory". Verified by doing it.

Fill `.env.local` with the six `NEXT_PUBLIC_FIREBASE_*` values from a Firebase web app
(**Project settings → General → Your apps**). Those are public by design — they ship in the client
bundle, and access is controlled by `firestore.rules`, not by hiding them.

In the Firebase console you also need:
- **Authentication** → enable **GitHub** and **Email/Password**
- **Firestore** → create a database in **production mode**
- **Firestore → Rules** → publish this repo's `firestore.rules`
- **Authentication → Settings → Authorized domains** → add your deploy domain

`ANTHROPIC_API_KEY` and `GITHUB_TOKEN` are **server-side only and optional**. Without them the board,
projects and feed all work — only narration and the logged-out pre-index are skipped. **Never prefix
either with `NEXT_PUBLIC_`**: that inlines them into the bundle and serves them to every visitor.

### Run it without any Firebase credentials

The emulator needs no console access and no account, so you can run the whole app locally without
holding production credentials:

```bash
brew install openjdk          # macOS; any Java 11+ works
npm run emulator              # terminal 1 — Firestore + Auth on 8080 / 9099
npm run dev:emulator          # terminal 2 — app pointed at the emulator
```

> On macOS, Homebrew's `openjdk` is keg-only and may not be on `PATH`. If the emulator can't find
> Java: `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.

---

## Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | React 19 + Tailwind 4 |
| Auth | Firebase Auth — GitHub OAuth (the sensor) + email/password |
| DB | Firestore, realtime via `onSnapshot` |
| Model | Claude, from a server-side route handler only |
| Deploy | Vercel |

```
app/
  signin/          GitHub OAuth + email/password. Errors in plain language, never a raw code.
  board/           Three columns. Carousel under 768, grid at 768.
  projects/        List, archive toggle; [id] is the project's own board.
  recipes/         What the cohort figured out, indexed by problem; [id] is one, with Steal.
lib/
  types.ts         Authoritative for what exists. Member, Project, Task, PulseEvent,
                   CohortMember, Evidence, GitHubLink, Recipe, Introduction.
  pulse.ts         logPulse, subscribeToPulse, toggleKudos — the heartbeat.
  data.ts          Projects and tasks. setTaskStatus is the only path that logs events.
  recipes.ts       The bank's writes. recipe-index.ts is its pure ordering/search, split
                   out so unit tests can load it without live Firebase config.
  sense.ts         Pure sensing logic: branch→title, dedupe, status inference, evidence
                   receipts, the standing-ask ladder, narration cache key, checkNarrative.
  auth-context.tsx Sign-in, and the member doc. handle is the GitHub login or null.
firestore.rules    The product's ethical promises, enforced.
```

**Some decisions worth knowing about:**

- **`Member.handle` is the GitHub login, or `null`. Never a guess.** The cohort repo indexes people by
  login, so handle is the join key for everything downstream. Deriving it from an email local-part
  produced `nikjain1588` for a user whose login is `nikjain15`, and the join silently never matched —
  no error, just a permanent "we don't know you". A fabricated handle is worse than none: it can also
  collide with a real member's login and attach one person's work to another.
- **The feed is denormalised.** `PulseEvent` copies in the actor's name at write time, so one listener
  renders the whole home screen without joining to members, projects or tasks.
- **Creating the member doc is a transaction**, because `onAuthStateChanged` and the sign-in call race
  each other. A read-then-write let both win and published `member_joined` twice.
- **Sensing can never block CRUD.** If GitHub fails, Pulse falls back to the manual board and says so.
- **`checkNarrative` is the prompt-injection backstop.** Commit messages are attacker-controlled text
  that a model turns into a post published to 64 people with no human in the loop. A narrative may
  only ever describe the actor — injection's payoff is publishing an insult about someone else.
- **Narration is cached by commit SHA range**, and members with no new commits are skipped entirely.
  That's a budget requirement, not an optimisation: uncached is ~$524 over the pilot.

---

## Tests

```bash
npm run typecheck
npm run lint
npm run test:unit          # 108 tests — pure logic, no network
npm run test:rules         # 76 tests — security rules against the emulator
npm run test:e2e           # Playwright, B1–B10, against the emulator
npm run test:e2e:smoke     # against the deployed URL
npm run gate               # all of it
```

**The rules tests are the highest-value tests here.** The rules encode the product's ethical
promises, and a promise the rules don't enforce is marketing. Every attack is asserted denied: nobody
deletes or rewords someone else's post, nobody flips another member's `narrationOptIn`, nobody ranks
their own recipe, and `introductions` — the collection that names someone who is struggling — is
readable *only* by the one peer being asked to help, never by the cohort and never by the person it
describes.

The e2e suite runs against the **emulator**, not production, and that's deliberate: it creates
members, projects and tasks, and none of that may reach the collection reviewers read. **Test fixtures
are not product seed data.** The cohort's activity in production is real, which is the whole bet.

---

## Known limitations

- **Narratives are model-written, post automatically, and are sometimes wrong.** This is the central
  trade, not a caveat. Every one is editable, undoable from the post itself, and carries its evidence.
- **Coverage is partial** — 7 of 65 have pushed to the cohort repo so far, so Pulse can only recognise
  those 7. **Nothing is faked to hide it.**
- **Polling, not webhooks** — status lags up to ~15 minutes. A degraded sync says "current as of {n}m
  ago" rather than showing a stale feed as live.
- **Public repos only.** Private work is invisible.
- Inference will occasionally create a task nobody wanted. Delete works.
- **Pulse pre-indexes the public cohort repo without asking.** Facts only — PR titles, commit counts
  and filenames, all already public on GitHub. AI summaries about a person require that person to
  connect their own account. Anyone can remove themselves at `/opt-out` without signing up.
  Non-commercial, built for this cohort only.
- Feed caps at 50 events; no pagination.
- Layers 2 and 3 are designed and surfaced, **not automated**.
- Out of scope: comments, notifications, attachments, search, dark mode, presence, webhooks.

## Agent usage

**This design and most of this code came from Claude.** The thesis, the spec and the wireframes came
out of long sessions with Claude (Opus); Claude Code wrote the large majority of the implementation,
the security rules and the tests. I chose the thesis and the standard to optimise for, decided what to
cut, measured the ground truth against the live repo rather than assuming it, and refused the
shortcuts that would have made the demo look better than the truth.

The adversarial review that produced the facts-vs-narrative split, the quiet-member asymmetry and the
prompt-injection mitigations was also done with Claude, against my own design.
