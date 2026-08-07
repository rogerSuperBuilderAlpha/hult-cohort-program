# The Voice of Pulse (v2)

**Every string in the product follows this document.** The spec ([DESIGN-SPEC.md](DESIGN-SPEC.md))
governs what Pulse does; this governs how it speaks. A string that breaks these rules is a bug,
whoever wrote it — human or agent.

## The pitch

- **Tagline: "Pulse — the board that updates itself."** Used on the landing hero, the tab
  title, and anywhere Pulse introduces itself. Do not reintroduce "the cohort's heartbeat" —
  *cohort* is an in-group word and *heartbeat* says mood, not value.
- **One-breath pitch:** *Do the work — Pulse spots it, moves your card, and tells your team.*

## Personality

Pulse **is**: **plain · warm · alive.**
Pulse is **not**: **peppy · corporate · apologetic.**

## The rules

1. **Lead with the action Pulse just did or will do.** Every hero line has a verb Pulse owns:
   "Pulse spots it, moves your card, and tells your team." Never a passive description of a
   philosophy.
2. **One idea per sentence. Cut every sentence the paragraph survives without.**
3. **Excitement comes from specificity, never punctuation.** "Before you've even switched
   tabs" is exciting; "seamlessly automated!" is noise. Zero exclamation marks, zero emoji.
4. **Empty states are invitations, not apologies.** "Ship something — it lands here by
   itself." Never "nothing here", never "sorry".
5. **Translate, don't dumb down.** Keep the checkable receipt (PR #41 stays verbatim) but
   phrase everything around it in human terms: "about 7 days from start to finish", never
   "169h between first and last".
6. **Celebrate without gushing.** "Maya shipped the login screen. Three days, start to
   finish." Facts carry the pride.
7. **Degrade without alarming.** Say what broke, what's current, and what still works — in
   the same calm voice. Never a raw error code, never a stale board dressed as live.
8. **Nudge without nagging.** One ask, once. No badges, no counts of overdue, no red except
   time-debt.
9. **Describe work, never work ethic.** No adjectives about pace or volume ("only 2 commits",
   "finally", "quiet lately"). Pulse knows who's quiet; the copy never does.
10. **Consent language is a rail, not copy.** "Pulse will post without asking." appears
    verbatim on /connect, above the choices. The three-way choice (yes / ask-first / a free
    no) is never reduced, reordered into pressure, or softened.

## One-time delight beats (built — keep them once-only)

- **"Pulse did this"** — a sensed card's first viewing by its owner: emerald hairline +
  "Pulse moved this — PR #41 merged". Facts only, own cards only, once per card
  (localStorage `pulse:did:<uid>`). Never on a peer's card — that would be commentary on
  their pace.
- **The first sentence** — a member's first published narrative carries, once:
  "Your team saw this the moment it happened. Nobody typed it in — least of all you."
  (localStorage `pulse:firstPost:<uid>`). Burns only on a *published* narrative, never on a
  pending ask-first proposal.
- **The limbo card** — consent record absent (not declined): "One decision is waiting on
  you." Answering it either way removes it forever. Never shown as a badge or count.

## Reference strings (the register to match)

| Surface | String |
|---|---|
| Landing hero | "The board that updates itself." |
| Sign-in | "The board that updates itself. Sign in — yours is waiting." |
| Consent headline | "Want your board to run itself?" |
| Consent, no GitHub | "Link GitHub — then let it run" |
| Home, declined | "Your board is live. Pulse just can't see you yet." |
| Board · done, empty | "Ship something — it lands here by itself." |
| Board lede | "Pulse moves these when you ship. Drag works too — every card says where it came from." |
| The honest floor | "Nothing needs you right now. That's allowed." |
| 404 | "That page isn't here. The cohort still is, though." |

## Before shipping any copy change

1. Does it follow rules 1–10?
2. Does it collide with an ethics rail (the "Rules that outrank your judgement")? The
   ethic wins, every time.
3. Is the string pinned by a test? `grep -rn "<the string>" tests/` before editing.
