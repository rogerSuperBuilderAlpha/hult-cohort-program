# Pulse — design spec

**Project 1 · @nikjain15** · Hult Cohort Developer Program, Summer Pilot 2026.

> **Pulse senses the work, banks how it got solved, and hands that to the next person who gets stuck.**

Design is closed. Implement it; don't redesign it.

Companions: [CHECKLIST.md](CHECKLIST.md) (definition of done) · [TESTING.md](TESTING.md) (test
regime) · [PLAN.md](PLAN.md) (submission mechanics) · [pulse-flows.html](pulse-flows.html) (17
screens) · [pulse-responsive.html](pulse-responsive.html) (responsive sandbox).

---

## 1. Thesis

Every task board dies the same way: **updating it is manual, boring, and the first thing to go.**
Every peer will ship a board that's a lie by Wednesday.

This cohort's work is already legible — 65 people running coding agents, committing to public repos.
The status is out there. Nobody should be typing it in.

| Layer | Does | Ships |
|---|---|---|
| **1 · Sense** | Reads your commits and PRs. Writes your week in plain English. | **Week 1** |
| **2 · Bank** | Extracts how a problem got solved from the session that solved it. | Week 2 — designed, surfaced, not automated |
| **3 · Broker** | Spots who's stuck on what someone already solved. Introduces them. | Week 3 — designed, not built |

Each repairs the one below: sensing removes bank's manual paste; banking gives broker something worth
handing over. **Remove the model and there's no product left** — that's the test for AI-first, and why
a chat box in the corner was rejected.

The winner operates their platform for the pilot while 64 people contribute PRs weekly. **Two named,
designed, unbuilt layers are a better thing to vote for than a finished toy.** The roadmap is the
invitation.

### Scope

**Layer 1 only this week.** The graded CRUD baseline (§7) is **not optional and doesn't get cheaper**
— it exists whether or not sensing works. If time forces a cut, cut *autonomy* before CRUD.

---

## 2. Ground truth — measure, don't assume

The cohort repo is public and small **right now**:

| | Count |
|---|---|
| Enrolled | 65 |
| Forks | 9 |
| Distinct PR authors | 7 |
| `nikjain15` among them | **no** |

**Pulse can recognise ~7 of 65 people today.** Coverage grows toward the Sun 5 PM deadline, so the
landing page is weakest at Friday's demo and strongest during the Sun 5 PM → Mon 2 PM review window —
exactly when 64 reviewers open it. Re-measure before relying on any number:

```
gh api "repos/rogerSuperBuilderAlpha/hult-cohort-program/pulls?state=all&per_page=100" \
  --jq '[.[].user.login]|unique|length'
```

⚠️ **Nik has no PR, so Pulse cannot recognise Nik.** Opening one is a prerequisite for the demo.

---

## 3. Principles

1. **Nobody updates Pulse.** Anything requiring typed status is wrong by default — including
   *approving* status. A confirmation step is still an update step.
2. **Publish by default, correct by exception.** Consent is the only gate, asked once. After it,
   Pulse posts, moves cards and creates tasks unattended. Every post is editable and undoable forever.
3. **Facts vs narrative.** Facts (commits, PR numbers, filenames) come from the API and can't be
   wrong — publish freely. Narrative is model-written and can be — always attach its evidence, always
   one click to fix.
4. **Say when Pulse did it.** Every automatic post or card move shows its receipt ("PR #41 merged").
5. **Public ≠ welcome.** Public *facts* about a member are fine — merged PRs are public record.
   **Model-written narrative about a member requires their opt-in.** No exceptions.
6. **Kudos, not scores. No leaderboard, ever.** Recipes rank by *people unstuck* — the only ranking
   that measures generosity rather than output.
7. **Never punish the quiet.** Pulse can see who hasn't pushed; that's the most dangerous thing it
   knows. It never ranks, counts, or shows silence to the cohort. See §6.
8. **Never fake data.** No invented members, no padded feeds. Seven real people beat sixty-five
   invented ones, and the honesty claim is the submission's strongest asset.
9. **Realtime or it didn't happen.** Anything the feed shows arrives via `onSnapshot`.

---

## 4. Foundations

### Visual language

| | |
|---|---|
| Type | System sans. 11/12/13/14px. Two weights: 400, 500. Sentence case everywhere. |
| Surfaces | White cards on light-gray. Dark mode out of scope. |
| Borders | Hairline. Radius 8px cards, 4px controls. |
| Colour | **Green** = the motivating action (approve, steal, send). **Red** = debt or time against you. **Nothing else is coloured.** |
| Density | Feed rows ~44px. Comfortable — reviewers skim on phones. |
| Motion | New rows fade ~200ms. Kudos scales once. Nothing else animates. |

No gradients, no shadows beyond a hairline, no emoji.

### Responsive

Working sandbox: [pulse-responsive.html](pulse-responsive.html). **Breakpoints are named for what
breaks, not for devices** — a 900px window on a desktop gets the tablet layout, correctly.

| Width | Home | Board |
|---|---|---|
| 320–479 | One column · kudos icon-only · evidence trimmed · bottom nav | Carousel, 78% peek |
| 480–767 | Kudos labelled · nav words return · top nav | Carousel 2-up · filters 2-up |
| 768–1023 | Full evidence line, filenames visible | **Grid takes over — 3 columns** |
| 1024–1439 | Reference layout | 3 columns |
| 1440+ | **Feed capped at 68ch, centred** | 3 columns, wider gutters |

**The board is the hard case.** Under 768 it's a horizontally scroll-snapped carousel with a peek —
**it does not stack.** Stacking destroys the only thing a kanban is for: seeing flow across states.

**The feed is the opposite.** Narratives are prose; past ~68ch they get harder to read. Extra width
becomes margin, **never a second column**.

All sizes: drag is `pointer: fine` only — every card also has a status control, targets ≥44px on
`pointer: coarse`. Sticky header releases under `max-height: 500px` (landscape phones). Use `dvh`,
never `vh`. Reflow at 200% zoom, no horizontal body scroll. Safe-area insets on the bottom nav.
`prefers-reduced-motion` honoured.

### Data model

`lib/types.ts` is authoritative for what exists — `Member`, `Project`, `Task`, `Status`
(`todo`·`in_progress`·`done`), `PulseEvent`, `PulseKind`, `Comment` (unused). `lib/pulse.ts` provides
`logPulse`, `subscribeToPulse`, `toggleKudos`. **Extend; don't fork.**

### ⚠️ Identity — `Member.handle` MUST be the GitHub login

**This is currently broken and it breaks everything downstream.** `lib/auth-context.tsx` derives the
handle from the email local-part:

```ts
const fromEmail = user.email?.split('@')[0];   // dev-1588@example.com -> "nikjain1588"
```

Real case: `dev-1588@example.com` produced `handle: "nikjain1588"`, but the GitHub login is
**`nikjain15`**. The cohort repo indexes by GitHub login, so `CohortMember.handle` is `nikjain15` and
`Member.handle` is `nikjain1588` — **the join silently never matches.** Pulse would tell you "you're
not one of them yet" while your own PR sits in the repo.

**The rule: handle is the GitHub login, and nothing else.**

- **GitHub sign-in** — take it from `getAdditionalUserInfo(result)?.username` at sign-in time. It is
  *not* on `User`; grab it from the credential result and persist it. `providerData[0].uid` is the
  numeric GitHub id, not the login — don't use it.
- **Email/password sign-in** — there is no GitHub login. Leave `handle: null` rather than inventing
  one from the email. A fabricated handle is worse than none: it silently fails to match, and it can
  *collide* with a real member's login and attach one person's work to another.
- **`CohortMember.uid`** is linked when a signed-in user's GitHub login matches a pre-indexed handle.
  Match case-insensitively; GitHub logins are case-preserving but case-insensitive.
- Anyone who signed up by email can link GitHub later at `/connect`; that's when their handle is set.

**Test it (D11):** sign in with GitHub, then assert `Member.handle === <your github login>`, not the
email local-part.

Additions:

```ts
// Evidence for anything Pulse asserts. Never render an inference without it.
type Evidence = {
  commits: number;
  prNumbers: number[];
  files: string[];
  spanHours: number | null;    // first → last commit: how long they fought it
};

// A member indexed from the PUBLIC cohort repo, before they ever sign up.
// Facts only — no narrative until they consent.
type CohortMember = {
  handle: string;              // github login, from the repo's PRs
  uid: string | null;          // set once they sign in
  evidence: Evidence;
  lastSeenAt: Timestamp;
  narrationOptIn: boolean;     // false until consent. Gates ALL model-written text.
};

type GitHubLink = {
  uid: string;
  handle: string;
  connectedAt: Timestamp;
  status: 'connected' | 'declined' | 'revoked';
  mode: 'auto' | 'ask_first';
  excludedRepos: string[];
  lastSyncedAt: Timestamp | null;
};

type Recipe = {
  id: string; problem: string; body: string; authorUid: string;
  taskId: string | null; turns: number; unstuckUids: string[]; createdAt: Timestamp;
};

type Introduction = {
  id: string; stuckUid: string; helperUid: string; recipeId: string | null;
  state: 'suggested' | 'sent' | 'dismissed'; createdAt: Timestamp;
};
```

New `PulseKind` values: `recipe_banked`, `intro_made`. `PulseEvent` gains `narrative`, `evidence`,
`editedAt`.

### The sensing pipeline

1. **Pre-index (no auth)** — read the public cohort repo's PRs. ~1–2 API calls; one request returns
   100 PRs. Build a `CohortMember` per handle. Facts only.
2. **Trigger** — Next route handler, on sign-in and a ~15-min poll while a session is open. No
   webhooks in Project 1; note as a limitation.
3. **Read** — GitHub REST via the user's OAuth token: commit messages, PR titles, filenames, branch
   names. **Never file contents. Never private repos.**
4. **Infer** — one model call per member per sync. **Cache by commit SHA range; skip members with no
   new commits.** Uncached this is ~$12/day (~$524 over the pilot); cached ~$0.65/day. The cache is a
   budget requirement, not an optimisation.
5. **Publish** — `logPulse` fires immediately; cards move, tasks appear. **No pending state, no
   approval queue.** Every row carries its `Evidence` and an inline edit/undo.
6. **Correct** — the human edits or undoes from the post itself (§5.2).

**Only narrate members with `narrationOptIn: true`.** Everyone else is facts only — a member who
never signed up is a row reading "PR #38 open · quiet 2d", never a sentence about them.

**Rate limits.** 5,000/hr per user token. Poll per-user; back off on 403; degrade to "current as of
{n}m ago" rather than erroring. Unauthenticated GitHub is 60/hr **per IP** and Vercel egresses from
shared IPs — the logged-out pre-index uses `GITHUB_TOKEN` (no scopes needed).

**If GitHub fails, Pulse silently falls back to the manual board. It must never block CRUD.**

---

## 5. Before sign-in

### 5.0 Landing — `/` signed out

Pulse pre-indexes whoever has pushed to the public cohort repo — no auth. **No signup wall in front
of the value.**

**Recognised handle:**
- "You're @{handle}. Here's your week already."
- Their real facts: open PRs, commit counts, paths touched.
- Below: the cohort so far, facts only.
- CTA: "sign in — and Pulse keeps it current."

**Unknown handle — the common case on Friday** (~58 of 65). Don't pretend to know them; make the
ignorance the invitation:
- **"7 people have shipped this week. You're not one of them yet."**
- Below: the real 7, with real evidence. **True, and it's the motivating fact.**
- CTA: "sign in with GitHub — Pulse will find your work."

⚠️ **Facts only here.** Merged PRs are public record; showing them isn't a disclosure. A model-written
sentence about someone who never opted in is. `narrationOptIn` gates every generated sentence.

**Footer disclosure — required on this page.** Small, plain, always visible:

> Pulse reads public activity from the cohort's GitHub repo to show the cohort's work. Facts only —
> AI summaries about a person appear only if they've connected their own account. Built for the Hult
> Cohort Developer Program, **non-commercial, for cohort use only**. Not you?
> [Remove me](/opt-out).

**`/opt-out` must exist and must work without signing in** — someone who wants out shouldn't have to
create an account to leave. Handle in, confirm via GitHub OAuth, delete their `CohortMember` doc,
tombstone the handle so the pre-index never re-adds it.

⚠️ The non-commercial line is a statement of intent, **not consent**. What actually protects people
is the facts-only default, the opt-in gate on narration, and a working opt-out. Don't let the
disclaimer become the substitute for those.

### 5.1 Sign in — `/signin`

GitHub OAuth primary — it's the sensor, not a convenience. The sync runs **during the OAuth
round-trip**, so there's no spinner after: you land on a finished home screen. Email/password stays
for B3 and for anyone who won't connect a repo.

First sign-in of any method: create `Member`, then `logPulse({ kind: 'member_joined' })` — **guarded**,
once per member ever. Errors inline, plain language, never raw Firebase codes.

### 5.2 Sign up — `/signup`

**Open to anyone** — B1 requires all 65 accounts to work with no allowlist and no manual DB edits.
Name, email, live-validated password (8 min). On success: create `Member`, log `member_joined`,
→ `/connect`. Errors say what to do: *"That email's already registered. Sign in instead."*

### 5.3 Consent — `/connect` — the only gate

The single human checkpoint. It buys autonomy and must say so.

| Block | Content |
|---|---|
| **It will, without asking** | create tasks from your branches · move cards when you push · **post a sentence about what you shipped** |
| **It reads** | commit messages · PR titles · filenames · branch names · **public repos only** |
| **It never reads** | your code · private repos |
| **You can always** | edit or delete anything it posted · turn it off · make it ask first — **all in Settings** |

Three choices: **Let it run** (primary; `narrationOptIn: true`, `mode: 'auto'`) · **Let it run, but
ask me first** (`mode: 'ask_first'`) · **Not now — I'll add tasks myself** (manual board, fully
functional).

⚠️ **"Pulse will post without asking" must appear in those words.** If someone is surprised later,
this consent was a trick.

---

## 6. Home — `/`

Signed out → landing (§5.0). Three regions:

**1 · Your posted row.** Header: **"pulse posted this · {n}m ago"** — past tense, not a question.
Headline: the narrative. Evidence: commits, PR numbers, files, kudos. Two quiet inline links: *edit
the wording* · *undo*. **No approve step** — `logPulse` already fired at sync. The card is a receipt,
not a form. (Only `mode: 'ask_first'` renders this as a pending proposal.)

**2 · The standing ask.** Home always carries **exactly one** ask — a tool nobody must act in cannot
motivate contribution. First rule that matches:

| Priority | Ask | When |
|---|---|---|
| 1 | "Marcus is stuck on something you solved" — broker card | a match exists |
| 2 | "Someone's stuck on something you probably know" | weak match: their problem touches files you've shipped |
| 3 | "Nobody's on this" — an unclaimed task | unclaimed work exists |
| 4 | Your oldest `in_progress` task | you have one |
| 5 | "Nothing needs you right now. That's allowed." | the honest floor |

**The ask should be social wherever possible** — "help a named person" motivates contribution;
"finish your task" is a to-do list. **Never render more than one** — two asks is a backlog, and a
backlog is what we deleted.

**3 · The cohort's week.** The pulse strip (~34px: 7 days, one bar per day, height = events, today
marked, derived client-side from the feed already in memory — no new query). Then the feed:
`subscribeToPulse`, limit 50, newest first.

| Kind | Copy |
|---|---|
| `task_shipped` | **{actor}** {narrative} — evidence beneath |
| `task_started` | **{actor}** started *{subject}* |
| `project_created` | **{actor}** created *{subject}* |
| `member_joined` | **{actor}** joined the cohort |
| `recipe_banked` | **{actor}** banked *{problem}* |
| `intro_made` | **{actor}** unstuck **{other}** on *{problem}* |

Rows carry avatar, copy, relative time, kudos, and a `recipe` chip when one exists. Your own events
show the count but the control is inert. Below 50: a static "⋯ older" — a limitation, not pagination.

### 6.1 When Pulse is wrong

**Autonomy is only tolerable if being wrong is cheap.** If correcting is harder than approving would
have been, the whole argument collapses.

- **One click from the post itself.** Never settings, never support.
- Shows what was inferred **and from what**: "6 commits · PR #41 · 2h between first and last". A
  legible mistake is forgivable; a mysterious one isn't.
- *Save my wording* · *delete the post*. **Undo removes it from every feed**, not just yours.
- Optional one-tap reasons that tune later syncs: "that wasn't a ship" · "wrong project" · "too
  dramatic" · "don't post this repo".
- **Pulse never argues.** No "are you sure?". The human is right.

### 6.2 The quiet member

Pulse can see who hasn't pushed. The rule is asymmetric on purpose:

| Who | Sees |
|---|---|
| **The cohort** | **Nothing.** No red mark, no count, no rank, no "3 days inactive". |
| **One peer who can help** | A private nudge, **once**: "Marcus has been on the OAuth redirect for six hours. You solved it Tuesday." |
| **The quiet member** | An offer, never a flag: "Nik hit this too, on Tuesday. Here's what worked for him." |

Never a streak. Never a shame list. **When in doubt, say nothing.** Get this wrong and Pulse is
surveillance aimed at the bottom half of the cohort — the people the no-leaderboard rule protects,
and whose votes decide this.

### 6.3 Empty states

| Who | Shows |
|---|---|
| Signed out | None — the landing page has their week, or the honest "you're not one of them yet". |
| Connected GitHub | **None.** Their week is already posted. |
| Declined GitHub | "Nothing of yours here yet." + the cohort's real week + *Connect GitHub* / *Add a task myself* |

---

## 7. The graded baseline — not the pitch, still not optional

**Build this first.** B4–B8 grade it, and it must work with **GitHub disconnected**.

### The board builds itself

| Signal | Effect |
|---|---|
| Branch `fix-oauth-redirect` pushed | Task created "Fix OAuth redirect", `todo` |
| First commit on it | → `in_progress`, logs `task_started` |
| PR opened | → `in_progress`, links the PR |
| PR merged | → `done`, sets `completedAt`, logs `task_shipped`, **celebrates** |
| PR closed unmerged | → `todo`. **No event.** Nothing is logged when something is abandoned. |

Branch → title: strip `feat/`/`fix/`, split on `-`/`_`, sentence-case. Prefer the PR title when one
exists — better prose than any branch name. **Dedupe:** an inferred task matching an existing manual
task by normalised title **updates it, never twins**.

**Repos are projects.** Each connected repo becomes a `Project`. Manual projects still exist for
non-code work — that keeps B4 honest.

### Board — `/board`

Three columns: To do · In progress · Done. Cards: title, project, assignee avatar, due date (red if
past). Move by drag **and** a status control — both, because drag alone fails on phones.

Filters above: assignee · status · project. "All" by default, combinable, reflected in the URL.

→ `done` celebrates: card pulses once, feed row appears live. Out of `done` clears `completedAt` and
logs nothing — **no un-shipping event**; the feed isn't a place to be embarrassed.

**Every automatic card shows its receipt** — "PR #44 opened · 3 commits". Manual cards say "you · by
hand".

### Projects — `/projects`, `/projects/[id]`

List: name, description, counts by status, owner, "New project". Archived behind a toggle. Detail:
header (name, description, owner, edit, archive) + that project's tasks with the same cards and
filters.

Create/edit project — modal. Name (required, ≤80), description (≤500). Create logs `project_created`.
**Archive sets `archived: true`; nothing in Project 1 hard-deletes.**

Create/edit task — modal. Title (required, ≤120), description, project (required), status (default
`todo`), assignee (any member, default you), due date. Assigning to others is expected — B7 verifies
the assignee sees it. **This is the whole product for anyone who declined GitHub.**

---

## 8. Recipes — `/recipes`, `/recipes/[id]`

Layer 2's surface, shipping week 1 reading manually-attached notes; **automatic extraction is the
week-2 PR** — a named, obvious contribution for a peer.

**Index.** "What the cohort has figured out" + "{n} recipes · {n} steals". Search by problem; sort by
*most unstuck* (default) or newest. Rows: the problem as headline (**indexed by problem, not
author**), author, turns, *{n} unstuck*.

**Detail.** The problem in their words. Author, when, how long they fought it. The session verbatim
in a mono block. What it touched. Who it unstuck. **Steal** copies it, appends your uid to
`unstuckUids`, notifies the author — credit arrives as a thank-you, never a score.

**Empty (likely, week 1):** "Nothing banked yet. When you finish something hard, keep what worked —
someone else is about to hit it."

---

## 9. Settings — `/settings`

⚠️ **Load-bearing.** Consent promises "turn it off", "make it ask first", "delete anything it
posted". **A promise you can't reach is a dark pattern.** Ships in the same PR as consent.

| Control | Keeps the promise |
|---|---|
| Let Pulse post without asking | the bargain; off = sensing runs, nothing publishes |
| Ask me first instead | restores the approval queue |
| Let Pulse create tasks from branches | off = status inference only |
| Repos Pulse watches | exclude any repo without disconnecting |
| Everything Pulse has posted as you | edit or delete **any** past post |
| Disconnect GitHub | stops reading, **deletes every narrative about you**, keeps your tasks |

Disconnect sets `status: 'revoked'` and `narrationOptIn: false`, then hard-deletes every `PulseEvent`
where `actorUid == uid` carrying a narrative. Manual tasks and projects survive — they're leaving the
sensing, not the cohort.

---

## 10. Degraded + errors

### Sync degraded

The product claims "it updates itself" — **when it can't, it says so in the same breath.**

| Condition | Behaviour |
|---|---|
| Rate limited | "GitHub is rate-limiting us. Back at {time}." + "Your week is current as of **{n} minutes ago**." |
| GitHub unreachable | Same shape, no ETA. Offer the manual path. |
| Feed while degraded | Header reads "as of {n}m ago" — **never presented as live** |
| CRUD while degraded | **Fully works.** A sync failure never blocks the board. |

⚠️ **Silence is the worst option.** A stale feed that looks live is the exact lie every other board
tells — the one this product exists to avoid.

### Errors

| State | Copy | Action |
|---|---|---|
| 404 | "That page isn't here. The cohort still is, though." | → feed |
| Auth failed | "GitHub didn't let us in. You may have declined the permission prompt. Nothing was saved." | retry · use email |
| Offline | "You're offline. Showing the last thing we saw. Changes will send when you're back." | banner, read-only, auto-recovers |

**Never** a raw Firebase code. **Never** a bare "Something went wrong".

---

## 11. Security rules

`firestore.rules` is written and published. Intent:

- **Read**: any signed-in member reads members, projects, tasks, pulse, recipes.
- **Write**: signed-in only; you write your own `Member` and nobody else's. Any member creates
  projects and tasks.
- **`pulse`**: create with `actorUid == request.auth.uid` only. Update = kudos toggle (own uid only)
  **or** the actor rewording their own narrative. **Delete = actor only** — the product promises
  "undo, any time", and an undo that left the row in 64 other feeds would make that a lie.
- **`cohortMembers`**: read by signed-in; **server-writable only**. `narrationOptIn` is writable only
  by the member it describes, and only that field.
- **`githubLinks/{uid}`**: own uid only.
- **`recipes`**: read by signed-in; author writes; `unstuckUids` appendable for your own uid only.
- **`introductions`**: **readable only by `helperUid`** — never the cohort, never the person it
  describes. Client create is denied. A cohort-readable "who's stuck" list is exactly the
  surveillance this design refuses to build.

---

## 12. Honest limitations — for the PR

Write these; don't let a reviewer find them:

- Polling, not webhooks — status lags up to ~15 minutes.
- Public repos only; private work is invisible.
- **Narratives are model-written, post automatically, and are sometimes wrong.** Every one is
  editable, undoable, and carries its evidence. This is the central trade, not a caveat to bury.
- Tasks and projects are inferred from branches, PRs and repos; inference will occasionally create a
  task nobody wanted. Delete works.
- **Non-members appear as facts only** — no model-written sentence about anyone who hasn't opted in.
- **Pulse pre-indexes the public cohort repo without asking.** Facts only (PR titles, commit counts,
  filenames — all already public on GitHub). AI summaries about a person require that person to
  connect their own account. Anyone can remove themselves at `/opt-out` without signing up.
  Non-commercial, built for this cohort only. Stated plainly on the landing page, not just here.
- **Coverage is partial** — ~7 of 65 have pushed so far; the landing page fills in as the cohort
  ships. No data is faked to hide this.
- Feed caps at 50 events; no pagination.
- Layers 2 and 3 are designed and surfaced, **not automated** — that's the roadmap, stated plainly.
- Out of scope: comments, notifications, attachments, search, dark mode, presence, webhooks.

**Agent usage must be honest.** This design and most of this code came from Claude. Say so.

---

## 13. Build order

| # | Step | Gate |
|---|---|---|
| 1 | Test harness — Vitest, rules-unit-testing, Playwright, MSW, emulator | — |
| 2 | **CRUD baseline** — board, filters, projects, project detail, task modal | **B** |
| 3 | `sync-portfolio.sh` → confirm `/signin` is 200 in prod | **A** |
| 4 | GitHub OAuth + `/connect` consent + **`/settings`** (ship together) | B |
| 5 | Pre-index the public cohort repo → `CohortMember` docs | C |
| 6 | **Landing page** — recognised + unknown-handle states | **C** |
| 7 | Sensing pipeline → auto-publish, SHA-range cache | C |
| 8 | Home — posted row, standing ask, pulse strip, live feed | C |
| 9 | Correction flow, board self-build, recipes | C |
| 10 | Degraded + error states, empty states, quiet-member asymmetry | B |
| 11 | Responsive pass — every stop in §4 | B |
| 12 | README, fresh-clone verification, **PR by Saturday morning** | D |

**If time runs out, ship 1 · 2 · 3 · 5 · 6.** A landing page that already knows the reviewer beats a
half-built sensing pipeline.

**Verified = driven in a real browser against the deployed URL.** Two sessions side by side for the
realtime checks.
