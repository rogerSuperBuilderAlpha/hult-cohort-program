# Pulse — the cohort's heartbeat

**Project 1 · @nikjain15** · Hult Cohort · Summer Pilot 2026

> **Deadline: PR merged by Sun Jul 19, 5:00 PM ET.**
> **Presentations: Fri Jul 17, 6:00 PM ET** — [Zoom](https://bentley.zoom.us/j/93654285156) `936 5428 5156`

---

## 1. The standard

> *"The standard you'll be judged by — the standard your peers should judge you by — is
> **how motivational your tool is**."* — Roger
>
> *"The key challenge is **motivating others in the cohort to actively contribute**."*

Your 64 peers vote. They pick the tool they'd want to live in for 6 weeks. The winner operates it;
everyone else contributes PRs to it weekly. **Feature count is not the axis.**

---

## 2. The thesis: Pulse

> *You open it and see the cohort shipping. You don't want to be the one standing still.*

**Pulse** — the cohort has a heartbeat, and you can feel it. A live feed with a visible rhythm:
steady when people are shipping, flat when they're not. Nobody wants to be the flat line.

| Decision | Consequence |
|---|---|
| Home is a **live cohort feed**, not your board | First thing you see is other people moving |
| Realtime via Firestore `onSnapshot` | The feed moves while you watch — no refresh |
| Events: task shipped · project created · member joined | "Aditya shipped *Auth flow*" |
| Your next action sits **inside** the feed | Momentum → somewhere to put it. Never a blank screen |
| **Kudos**, not scores | Recognition, not ranking |
| **No leaderboard** | Ranking demotivates the bottom half — who need it most |

**The empty state is the product.** A new reviewer's board is empty; the *cohort feed isn't*. That's
this thesis's structural edge — it has something to show on day zero.

---

## 3. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 + TypeScript |
| UI | React 19 + Tailwind |
| Auth | Firebase Auth — GitHub OAuth + email/password |
| DB | Firestore (realtime listeners) |
| Deploy | Vercel |

---

## 4. Repos

Two, one source of truth, zero drift.

| Repo | Role |
|---|---|
| **`nikjain15/hult-cohort-program`** (fork) | **Working tree.** App at `submissions/nikjain15-project-1/`. The PR comes from here. |
| **`nikjain15/pulse`** | **Portfolio + deploy target.** App at root. Public. Generated from the fork. |

**Production URL: https://pulsecohort.vercel.app** (Vercel team `Pulse`, project `pulse`)

`./sync-portfolio.sh` regenerates the portfolio repo via `git subtree split` — real commit history,
app at root, force-pushed. Idempotent; re-run after any commit worth publishing.

**Never edit `pm-nikjain15` directly** — it's regenerated and your changes would be overwritten.

This also covers §9 Q1 both ways: if Roger wants the code in his repo it's already there; if he
wants a standalone repo + submission doc, `pm-nikjain15` is it.

---

## 5. Submission mechanics

| | |
|---|---|
| Work from | Fork `nikjain15/hult-cohort-program` (READ-only on cohort repo — all peers fork) |
| Branch | `participants/summer26/phase-1-project-1/nikjain15` |
| App path | `submissions/nikjain15-project-1/` |
| PR base | `projects/summer26/phase-1-project-1` |
| PR title | `[Project 1] Submission — nikjain15` |
| Merged by | **Sun Jul 19, 5:00 PM ET** — unmerged = ineligible for review and voting |

**PR body must include all six:**
1. Production URL
2. Setup steps verified on fresh clone
3. Architecture summary
4. Motivation / engagement design notes
5. Known limitations
6. Agent usage summary

Plus, to present Friday: *"I'd like to present on Friday."*

---

## 6. Build order

| # | Phase | Gate |
|---|---|---|
| 1 | ~~Fork · branch · Next.js + Tailwind + Firebase scaffold · pushed~~ | **A** ✅ |
| 2 | Vercel deploy live on HTTPS | **A** 👤 |
| 3 | Firebase Auth — GitHub OAuth + email/password | **B** |
| 4 | Firestore model — projects, tasks, status, assignee | **B** |
| 5 | CRUD + list views + filters (assignee / status / project) | **B** |
| 6 | **Cohort momentum feed** — realtime, kudos, next action | **C** |
| 7 | Comments · due dates · mobile · **seed data** | **C** |
| 8 | Firestore security rules | **C** |
| 9 | `README.md` — setup, architecture, deploy URL, known bugs | **D** |
| 10 | Fresh-clone verification | **D** |
| 11 | PR opened + merged | **D** |

**Fri 6 PM target: A + B + C** — enough for a 2-minute demo.

---

## 7. The loop

```
  PLAN ──► BUILD ──► VERIFY ──► SHOW ──► APPROVE ──► COMMIT
    ▲                                        │
    └────────────── revise ◄─────────────────┘
```

**Gates: A · B · C · D.**

**Verified** = driven in a **real browser against the deployed URL**, as a reviewer would — sign up,
create, assign, filter, complete — with screenshots. Not "it compiled."

Each gate runs its slice of **[CHECKLIST.md](CHECKLIST.md)** (every guideline → how verified → state).
A gate passes only when its rows are ✅. Built-but-unwatched (◐) never passes.

**What to build** is settled in **[DESIGN-SPEC.md](DESIGN-SPEC.md)** — every screen, state, and empty
state, wireframed in **[pulse-flows.html](pulse-flows.html)**. The build chat implements it; it
doesn't redecide it.

⚠️ **§2 of this plan is superseded.** The thesis is no longer a live feed you read — it's
*Pulse senses the work, banks how it got solved, and hands that to the next person who gets stuck.*
Layer 1 (sense) ships week 1. Seed data is no longer needed: the cohort's PRs are real.

**Rules**
1. Source of truth: Roger's emails > live site > `main`'s `program.ts` > what peers actually did.
   The parent monorepo's curriculum files (its `curriculum/` directory, calendar, the-loop,
   requirements, and review-rubric docs) describe a **different, stale program — ignore them
   entirely.**
2. Cite the source and state confidence for any claim about the program.
3. Contradiction → stop and report. No improvising.
4. No secrets committed; `.env*` gitignored; config via Vercel env vars.
5. Log agent usage as we go — the PR must summarise it honestly.

---

## 8. Nik's actions

| # | Action |
|---|---|
| 1 | Sign **Expectations Acknowledgment** on the dashboard |
| 2 | Baseline **survey** (or decline — both unlock the project) |
| 3 | **Firebase**: project is `cursor-boston-project` (already in `.env.local`) → enable Auth (GitHub + Email/Password) → create Firestore in **production mode** |
| 4 | **Vercel**: import **`nikjain15/pulse`** — root directory `/`, production branch `main`. No monorepo config needed. |
| 5 | **Discord** ([invite](https://discord.gg/Wsncg8YYqc)) — ask Roger the two questions below |
| 6 | After shipping: post on LinkedIn/X, tag Cursor Boston + Hult |
| 7 | 64 written reviews + 64 private votes by **Mon Jul 20, 2:00 PM ET** |

---

## 9. Open questions for Roger

1. ~~**Code location**~~ — ✅ **RESOLVED Jul 16.** Roger in `#general`: *"I think so, is that what the
   repo and site say??? lol"*, corroborated by peers' merged PRs. **App code lives in
   `submissions/nikjain15-project-1/`.** `pm-nikjain15` remains the **deploy target only** — §4
   stands, keep `sync-portfolio.sh`.
2. **Reviews** — 64 written reviews in the Sun 5 PM → Mon 2 PM window (21 hrs). Real expectation?
   *Not asked yet.*
3. **⚠️ Peer indexing / IRB** — not asked, and it gates the landing page. See
   [CHECKLIST.md](CHECKLIST.md) open questions.
