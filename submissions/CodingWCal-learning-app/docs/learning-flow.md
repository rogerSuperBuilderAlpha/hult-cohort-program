# Learning-flow screen recording + event log

Per the integration-spec testing section ("Submit screen recording of learning flow + event log for review"), both are included here.

## Screen recording — `assets/learning-flow.gif`

Captured headless against the live production app at `https://ai-onramp-hult.vercel.app` (real session, new visitor UUID per run). Frames:

| Frame | Stage |
|---|---|
| `00-1-landing` | Landing page — copy, module cards, "Start learning" CTA |
| `01-2-dashboard` | Dashboard after one-click demo launch (session granted via `/api/demo-launch`) |
| `02-3-lesson-head` | Lesson 1.1 "What is AI?" — content headed by the demo session |
| `03-4-quiz-answering` | "Check understanding" quiz answered (2/2 correct) |
| `04-5-quiz-result` | Score feedback ("Perfect. Great work.") |
| `05-6-marked-complete` | "Mark lesson as complete" → progression state shown |
| `06-7-progress` | Dashboard back — progress bar + "up next" updated |

Original full-page PNGs for each stage are in `assets/` if reviewers prefer stills.

## Event log — `event-log.csv`

Live export from the self-hosted API (`GET /v1/admin/events`, admin-key authorized). Shows the recorded session's event trail end to end: `lesson_started` → `session_heartbeat` → `quiz_submitted` (score 2/2) → `lesson_completed`, attributed to a unique `visitor_*` user ID. Full log includes all sessions to date.

## Verified against the live metrics endpoint

```
GET /v1/apps/78f5ecd3-4f57-4f7b-9671-0477a1b49f9e/metrics
{"unique_users":12,"qualified_users":12}
```