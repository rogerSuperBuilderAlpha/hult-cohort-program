# Phase 2 Venture Submission — @celiciakitty-creator

**Celicia Arneaud** (@celiciakitty-creator) · Hult Cohort Developer Program · Summer 2026 · Week 5 (`phase-2-venture`)

**Product:** LexLearn — interactive UK law learning platform  
**Production URL:** https://lex-learn-ten.vercel.app/  
**Application repository:** https://github.com/celiciakitty-creator/LexLearn

## Summary

LexLearn is an interactive UK law learning platform focused on making foundational legal concepts easier to understand through short lessons, quizzes, Legal Bites, case/statute spotlights, progress tracking, and achievements. The Week 5 venture package wraps the live production app with investor materials, a business plan, and verified external-user metrics from a self-hosted Hult/Ludwitt reference API.

| Requirement | Status |
|-------------|--------|
| Production venture app | Yes — Next.js 16 on Vercel |
| ≥25 qualified external users | Yes — 25/25 verified during Week 5 pilot |
| Business plan | Complete — in LexLearn repo |
| Investor deck | Complete — in LexLearn repo |
| Metrics infrastructure | Operational — self-hosted reference API on Supabase |
| Investor engagement | **Not completed** — see unmet gate below |

## Production URL

https://lex-learn-ten.vercel.app/

## Application repository

https://github.com/celiciakitty-creator/LexLearn

## App URL + user metrics

| Field | Value |
|-------|-------|
| Production listing URL | https://lex-learn-ten.vercel.app/ |
| App ID | `10af7f09-1664-4ccf-866c-c917dc9d9df2` |
| `unique_users` | 25 |
| `qualified_users` | 25 |
| Qualification events | `lesson_started`, `lesson_completed`, `quiz_submitted` |
| Metrics source | Self-hosted Hult/Ludwitt reference API backed by Supabase |
| Reference API URL | https://lexlearn-week5-metrics-api.vercel.app |

**Snapshot note:** No exact API snapshot timestamp is attached to this submission. The 25/25 production metrics were verified during the Week 5 pilot; this file was prepared on **August 18, 2026**.

## Metrics architecture

LexLearn reports learning activity to a self-hosted Hult/Ludwitt reference API deployed at https://lexlearn-week5-metrics-api.vercel.app, backed by Supabase. Qualified users are counted as unique external users with at least one qualifying event (`lesson_started`, `lesson_completed`, or `quiz_submitted`).

```
Browser → LexLearn (Vercel) → reference API (Vercel) → Supabase (events + user counts)
```

## Investor deck link (in repo)

https://github.com/celiciakitty-creator/LexLearn/blob/main/docs/week5/LEXLEARN-INVESTOR-DECK.md

## Business plan path

https://github.com/celiciakitty-creator/LexLearn/blob/main/docs/week5/LEXLEARN-BUSINESS-PLAN.md

## Product research

Qualitative product research was collected through an earlier product questionnaire with **22 responses**. This is described as qualitative feedback only — no demographics or formal methodology are reported here.

Recurring feedback themes included requests for:

- graphics and visual learning support
- expert or qualified legal input
- indexes and glossaries
- additional learning activities
- assistive AI or learning support
- user accounts

## Investor touch log (redact PII)

**No qualifying investor engagement was completed or documented.**

No investor email, meeting, response, investor name, or touch log entry has been recorded for this submission. The Week 5 investor-engagement requirement remains unmet.

## Agent usage

- **Research:** Reviewed cohort venture requirements, Ludwitt metrics patterns, UK law learning UX references, and questionnaire feedback themes.
- **Dev:** Built and deployed LexLearn production app; wired event tracking to the self-hosted reference API; authored venture documents in the LexLearn repository.
- **QA:** Verified production app availability and metrics counts during the Week 5 pilot; confirmed business plan and investor deck are present in repo paths listed above.

## Test plan

- [x] Production app live at https://lex-learn-ten.vercel.app/
- [x] 25 unique users verified
- [x] 25 qualified external users verified
- [x] Business plan complete (`docs/week5/LEXLEARN-BUSINESS-PLAN.md`)
- [x] Investor deck complete (`docs/week5/LEXLEARN-INVESTOR-DECK.md`)
- [x] Metrics infrastructure operational (reference API + Supabase)
- [ ] Investor engagement — no qualifying touch documented

## Known limitation / unmet gate

| Gate | Status |
|------|--------|
| ≥25 qualified external users | Met — 25/25 verified during Week 5 pilot |
| Production app + venture documents | Met |
| ≥1 investor engagement (pitch email, call, or meeting) | **Unmet** — no qualifying investor engagement was completed or documented |

This submission is submitted transparently with the investor-engagement pass gate outstanding. Reviewers should treat the metrics figures as pilot-verified counts without a date-stamped API export attached to this file.
