# Ecosystem unification (Week 5)

**Purpose:** The three platform winners integrate PM, comms, and showcase into one coherent ecosystem before Phase 2. First forced leadership collaboration.

---

## Definition of "unified"

### Minimum bar (required for pass — Fri Aug 12 demo)

| Requirement | Acceptable implementation |
|-------------|---------------------------|
| **Shared identity** | Same email login across all 3 apps OR single sign-on OR documented account-linking flow completed by all enrolled users |
| **Cross-navigation** | Header/footer links between PM, comms, showcase from every app |
| **PM → showcase data** | Showcase displays live or daily-synced project status from PM platform (not hardcoded) |
| **Comms ↔ PM** | Task assignment or status change posts to a comms channel (webhook, bot, or manual MVP documented) |
| **Showcase → comms** | Partner intro form triggers comms notification to `#partners` or placement lead |
| **Visual coherence** | Shared logo, cohort name, color palette (CSS variables OK — identical codebase not required) |

### Aspiration (distinction, not pass gate)

- Single sign-on (OAuth shared)
- Real-time PM → showcase sync
- Unified notification center
- One combined repo/monorepo

---

## Process (one week)

| Day | Activity | Owner |
|-----|----------|-------|
| Tue | Unification kickoff: 3 operators + program director; agree on `ecosystem-integration` repo | All |
| Wed | Integration spec PR due: architecture diagram, API contracts, task split | All operators |
| Thu | Build integration branches; daily async standup in comms | Operators + teams |
| **Fri 17:00** | **Unified ecosystem demo** (30 min, whole cohort) | All |

### `ecosystem-integration` repo

Joint repo where operators land:
- Shared auth config
- Linking documentation
- Webhook URLs
- Demo script for Fri Aug 12

Each platform repo may also receive integration PRs — track in PM platform.

---

## Decision rights when operators disagree

| Dispute type | Decision maker |
|--------------|----------------|
| Technical (API design, auth approach) | **Majority vote among 3 operators**; if 1–1–1 split → program director picks |
| Product (whose UX pattern wins) | **Showcase operator** has tie-break (public face priority) |
| Timeline (scope cut) | **PM operator** has tie-break (PM is source of truth for data) |
| Conduct (operator not participating) | [removal-succession.md](../../governance/removal-succession.md) |

Document decisions as ADRs in `ecosystem-integration/docs/adr/`.

---

## Acceptance criteria (Fri Aug 12 demo)

Program director runs demo script:

1. [ ] Log into PM platform as student
2. [ ] Navigate to comms via header link; post message in `#general`
3. [ ] Assign task in PM; verify notification in comms (or documented webhook fire)
4. [ ] Navigate to showcase; see student profile with PM project status
5. [ ] Submit partner intro form; placement lead receives notification
6. [ ] All enrolled students completed account linking (checklist in PM)

**Pass:** 5/6 steps work live. **Fail:** operators have 48 hr fix window; team formation delayed to Mon week 6.

---

## Open decisions

None.

## Depends on

- [../project-3-public-showcase/](../project-3-public-showcase/)
- [../../governance/team-formation.md](../../governance/team-formation.md)
- [../../operations/calendar.md](../../operations/calendar.md)
