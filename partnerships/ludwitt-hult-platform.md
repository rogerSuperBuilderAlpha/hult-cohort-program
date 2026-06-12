# Ludwitt/Hult platform

**Purpose:** Platform readiness for Phase 2 Project 1 (week 9). Students integrate learning apps and user counts are the success metric — platform must provide integration surface, listing, and ungameable analytics.

**Launch blocker deadline:** **November 1, 2026** (1 week before learning app kickoff).

---

## Current state (assumed for cohort 1 planning)

| Component | Status | Cohort 1 action |
|-----------|--------|-----------------|
| Core learning platform | Exists (Ludwitt/Hult) | Extend, don't rebuild |
| Third-party app SDK | **Not built** | Build MVP by Nov 1 |
| Developer docs | **Not built** | Ship v0.1 docs |
| App listing/review | **Not built** | Manual review by platform admin |
| Per-app analytics | **Partial** | Build unified dashboard |

---

## Integration architecture (decision)

**Model: Embedded iframe apps with postMessage + platform auth token.**

| Layer | Spec |
|-------|------|
| **Auth** | Platform issues JWT to student app on launch; includes `user_id`, `email`, `app_id` |
| **Embed** | App hosted on student Vercel; registered URL whitelisted in platform |
| **Events** | Student app POSTs learning events to platform API |
| **Listing** | App metadata in platform directory (title, description, icon, URL) |

**Reasoning:** Fastest path for cohort 1; students keep full control of app codebase; platform owns user counting via server-side events (not iframe trust).

Alternative rejected: monorepo plugins (too much coupling for 30 different apps in 3 weeks).

---

## Developer program (cohort 1)

### Onboarding flow

1. Student registers app in Ludwitt/Hult developer console → receives `app_id` + `api_key` (sandbox)
2. Student implements event API + JWT validation per [integration-spec.md](../curriculum/phase-2/project-1-learning-app/integration-spec.md)
3. Student submits for review (GitHub repo link + deploy URL)
4. Platform admin approves → production keys + directory listing
5. App appears in platform launcher

### Sandbox

- Separate sandbox API keys
- Events prefixed `sandbox.` — excluded from user metrics
- Available from week 1 for early builders; required for integration testing

### App review checklist (platform admin)

- [ ] HTTPS deploy
- [ ] JWT validation implemented
- [ ] ≥ 1 learning event fires on test session
- [ ] No malicious iframe behavior
- [ ] Content appropriate (no hate, illegal, etc.)

Review SLA: **48 hrs** during weeks 9–11.

---

## User metrics infrastructure

**Canonical user count** = platform-side count only (student self-report ignored for pass/fail).

### Learning event schema

```json
POST /api/v1/apps/{app_id}/events
{
  "event": "lesson_started | lesson_completed | quiz_submitted | session_heartbeat",
  "user_id": "platform-user-uuid",
  "session_id": "uuid",
  "metadata": { "lesson_id": "intro-1" }
}
```

### User qualification ([metrics.md](../assessment/metrics.md))

User counts toward student's metric when:
- Unique `user_id` not in cohort roster blocklist
- ≥ 1 `lesson_started` OR `lesson_completed` OR ≥ 120 sec cumulative `session_heartbeat`
- Event timestamp before snapshot deadline

### Snapshots

| Snapshot | Date | Used for |
|----------|------|----------|
| #1 | Fri Nov 21, 2026 | Learning app pass gate |
| #2 | Fri Dec 12, 2026 | Venture pass gate (if same app extended) |

Dashboard: platform admin exports CSV → cohort PM platform import.

---

## Platform governance

| Decision | Owner |
|----------|-------|
| App approval/rejection | Ludwitt platform admin (founder delegate cohort 1) |
| Content standards | No illegal content; educational purpose; English or labeled language |
| App removal | Admin + program director; student notified 24 hr |
| Rate limits | 100 events/min/app (anti-spam) |

---

## Long-term app lifecycle

| Phase | Policy |
|-------|--------|
| During cohort | Listed in directory |
| Post-cohort (pass) | **Stays listed 12 months** minimum |
| Post-cohort (fail) | Removed at student request or 90 days inactive |
| Maintenance | Student responsibility |
| Revenue share | **None cohort 1** — students keep 100% of any app revenue |

---

## Ownership

| Entity | Role |
|--------|------|
| **Ludwitt** | Platform engineering, SDK, analytics |
| **Hult** | Brand, student access, continuing-ed relationship |
| **Program** | Curriculum requiring integration; not platform owner |

⚠️ **DECISION NEEDED (Founder + EVP):** Legal entity for platform API terms of service.

---

## Cohort 1 build checklist (platform team)

| By date | Deliverable |
|---------|-------------|
| Oct 15 | JWT auth spec finalized |
| Oct 22 | Sandbox API live |
| Nov 1 | Production API + developer docs v0.1 |
| Nov 3 | First student app approved (smoke test) |
| Nov 21 | Snapshot export working |

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Platform API ToS entity | Founder + EVP |
| iframe vs native SDK long-term | Founder (cohort 1 uses iframe) |

## Depends on

- [../curriculum/phase-2/project-1-learning-app/integration-spec.md](../curriculum/phase-2/project-1-learning-app/integration-spec.md)
- [../assessment/metrics.md](../assessment/metrics.md)
