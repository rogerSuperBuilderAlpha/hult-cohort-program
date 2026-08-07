# Phase A2 — Real Curriculum + Phase B — Production Deploy (The Effective Facilitator)

## Context for the agent

Phase A is complete: the Ludwitt pipeline (register → launch JWT → events → metrics) is proven end to end against the local `execution/ludwitt-hult-api` instance, 11/11 smoke test green. This phase replaces the placeholder seed content with the real curriculum, then deploys to production.

Two source-of-truth content files have been placed at `docs/curriculum/` in this repo:
- `TEF_programme_outline.md` — programme architecture, module structure, assessment model
- `TEF_curriculum_spec.md` — full product spec including COMPLETE content for three modules (Detachment §15, Intentionality §16, Sense of Wonder §17), baseline assessment items (§13), and scoring logic (§14)

Seed content comes from these files VERBATIM where the spec provides finished text (dilemmas, options, correct answers, self-assessment items, knowledge checks). Do not paraphrase, "improve," or summarize the spec's finished content — it is authored curriculum, not draft material. Where the spec provides only structure for the six preview modules, assemble the preview from the outline's per-module sections (central AI question + focus bullets).

**MVP scope (deliberate — do not exceed):**
- 3 full modules: Detachment, Intentionality, Sense of Wonder
- 6 preview modules: Focus, Engagement, Interior Dialogue, Awareness, Presence, Action
- Scenario quizzes wired to events; module completion wired to events
- DEFERRED (do not build): baseline assessment, confidence calibration, scoring dashboards, development profiles, practice journal, integration challenge, final comparison. These are roadmap, not Week 4.

Stop and report back after each checkpoint. Supabase migrations: print SQL for manual review/execution in the SQL Editor — never attempt to run them yourself. Do not modify anything under `execution/ludwitt-hult-api`.

---

## Checkpoint A2.1 — Schema migration + content seed SQL

1. Write `supabase/migrations/0003_curriculum.sql` and print it for review:

```sql
-- Schema additions
alter table disciplines add column is_full_module boolean not null default false;
alter table disciplines add column central_question text not null default '';
alter table disciplines add column subtitle text not null default '';

alter table scenarios add column kind text not null default 'dilemma';
  -- 'dilemma' | 'recognition' | 'knowledge_check' | 'preview_scenario'
alter table scenarios add column options jsonb not null default '[]'::jsonb;
  -- [{ "key": "A", "text": "...", "score": 4 }, ...] — dilemmas use spec's 4/3/2/1; knowledge checks use 1/0
alter table scenarios add column correct_key text;
alter table scenarios add column explanation text not null default '';

alter table progress add column knowledge_score int;
alter table progress add column behaviour_commitment text;

-- Grants for the new columns are inherited; no new tables, so no new grants needed.
```

2. Write `supabase/migrations/0004_seed_curriculum.sql` and print it for review. This REPLACES the placeholder seed (delete placeholder rows first, preserving nothing from 0002). Structure:

**Paths (3):**
| slug | title | sort |
|---|---|---|
| regarding-others | Regarding Others — Authority, participation and ownership | 1 |
| regarding-myself | Regarding Myself — Agency, imagination and intention | 2 |
| regarding-life | Regarding Life — Perception, uncertainty and intervention | 3 |

**Disciplines (9), in path/module order from the outline:**
| slug | path | full? | subtitle (from spec) |
|---|---|---|---|
| detachment | regarding-others | YES | Releasing attachment without abandoning responsibility |
| focus | regarding-others | preview | Keeping purpose ahead of possibility |
| engagement | regarding-others | preview | Retaining responsibility after delegation |
| interior-dialogue | regarding-myself | preview | Preserving independent judgment |
| sense-of-wonder | regarding-myself | YES | Seeing what is not yet there |
| intentionality | regarding-myself | YES | Choosing what the technology is for |
| awareness | regarding-life | preview | Seeing the whole situation |
| presence | regarding-life | preview | Remaining in the human situation |
| action | regarding-life | preview | Acting without artificial certainty |

`central_question` = the "Core AI question" from the outline, verbatim, for all nine.

**Full-module `content_md`** (Detachment, Intentionality, Sense of Wonder): assemble from the spec's §15/§16/§17 in this section order, as markdown with `##` headers — Foundation, AI-era definition, Why it matters, What it is / What it is not, Central tension, Behavioural continuum (as a markdown table), AI-era failure modes, Lesson content, Practice exercise, Evidence reflection, Closing statement. Verbatim text.

**Preview-module `content_md`**: AI-era framing sentence from the outline, the focus bullets, and a "Full module coming next" note per the spec's §7 preview definition.

**Scenarios per full module:**
- 1 × `dilemma` — the Opening Dilemma with its 4 options; spec's best response scores 4, assign 3/2/1 to the others per the spec's situational-judgment scale (strongest 4 → weakest 1; use your judgment for the middle two ONLY if the spec doesn't rank them, and flag which you assigned)
- Recognition activities (Detachment has 2) as `recognition`
- 4 × `knowledge_check` with `correct_key` and the spec's correct answers; `explanation` = the spec's stated rationale where given
- Self-assessment items go in `content_md` as a section for now (deferred from interactive scoring — MVP scope)

**Scenarios per preview module:** 1 × `preview_scenario` — for Focus, Engagement, Interior Dialogue, Awareness, Presence, Action, use the module's Core AI question to frame a single-question scenario drawn from the outline's focus bullets. These six are the ONLY place you compose new scenario text; keep each to the outline's framing, one question, four options, flag all six for my review in your report.

**Report back:** both SQL files printed in full. Wait for confirmation they've been run before proceeding.

## Checkpoint A2.2 — App pages over real content

1. `/paths` — list the three paths with titles and their disciplines in order; full modules visually distinct from previews. Use the brand palette: deep green `#173F35` (primary/text on light), pale `#EAF4F4` (background), terracotta `#D56F3E` (primary action/accent), sage `#5E8C78` and gold `#C7A65A` (supporting). Read /mnt/skills — if a frontend-design skill is available in this environment use it; otherwise keep the design restrained: generous whitespace, the palette above, no gradients, no emoji.
2. Discipline page renders `content_md` sections, then scenarios in order (dilemma → recognitions → knowledge checks for full modules; single scenario for previews).
3. Quiz behavior: each scenario submission fires `quiz_submitted` (existing event util). Knowledge-check group is scored together; `progress.knowledge_score` = percent correct; retakes allowed (best score kept). 
4. Completion rules (this replaces the placeholder "Mark complete" button):
   - Full module: content viewed + dilemma answered + knowledge_score ≥ 80 → "Complete module" becomes available → on click, fire `lesson_completed`, set `completed_at`, run existing path_completions check.
   - Preview module: content viewed + preview scenario answered → same completion flow.
5. `lesson_started`, `session_heartbeat` wiring unchanged.
6. Landing page `/` (public, outside middleware guard): positioning statement, core premise ("AI makes generation abundant. Human judgment becomes the constraint."), the three paths, and the attribution statement from spec §2 VERBATIM. No sign-up — the only door remains `/launch`.
7. About/attribution: the spec §2 attribution block must also appear on the landing page footer or an /about page.

**Report back:** screenshots or route list + confirmation the full local smoke test still passes with real content (launch → Detachment → dilemma → knowledge check ≥80 → complete → path_completions unchanged-logic check: now requires all 3 disciplines in regarding-others).

## Checkpoint B — Production deploy

1. **API:** Deploy `execution/ludwitt-hult-api` to Railway per its DEPLOY.md (or Render if Railway blocks). Do NOT modify its source. Report the deployed base URL. NOTE in your report: the store is in-memory — registration and all events are lost on redeploy/restart. After this deploy, do not redeploy it.
2. **App:** Deploy the Next.js app to Vercel. Production env vars: fresh `LUDWITT_*` values will come from re-registering against the DEPLOYED API (step 3), `LUDWITT_API_BASE_URL=<railway-url>/v1`, `NEXT_PUBLIC_SITE_URL=<vercel-url>`, Supabase prod values, `SESSION_SECRET` (new random), `ADMIN_METRICS_PASSWORD` (new).
3. **Register** The Effective Facilitator against the deployed API (`launch_url` = `<vercel-url>/launch`, `repo_url` = https://github.com/Lorra-V/the-effective-facilitator). Print the returned app_id (NOT the api_key/jwt_secret — those go straight into Vercel env vars without being echoed).
4. **Production smoke test:** mint a launch token from the deployed API's `/v1/auth/launch-token`, complete the full Detachment flow on the Vercel URL, confirm events land (`ludwitt_event_log` http_status 202) and `GET <railway-url>/v1/apps/{app_id}/metrics` shows qualified_users ≥ 1.

**Report back:** Vercel URL, Railway URL, app_id, production smoke results. STOP — the PR is drafted with the human, not by you.
