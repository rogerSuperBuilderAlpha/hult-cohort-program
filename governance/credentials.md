# Credentials and recognition

**Purpose:** Verifiable distinction credentials — the program's Law Review equivalent. Every credential links to public evidence on GitHub and the cohort showcase.

---

## Credential taxonomy

| Credential | ID slug | Criteria | Evidence URL |
|------------|---------|----------|--------------|
| **Cohort Graduate** | `hult-cohort-graduate-{term}` | Pass all units ([pass-fail.md](../assessment/pass-fail.md)) | Showcase profile + certificate |
| **Platform Winner** | `hult-cohort-winner-{platform}-{term}` | Won ranked-choice vote for PM, comms, or showcase | Vote record + winning repo |
| **Platform Operator** | `hult-cohort-operator-{platform}-{term}` | Won + met ≥ 80% SLA weeks ([metrics.md](../assessment/metrics.md)) | Platform repo commit history + uptime log |
| **Leadership Team** | `hult-cohort-leadership-{platform}-{term}` | Picked in draft + active ≥ 50% of term | Team roster on showcase |
| **Distinction** | `hult-cohort-distinction-{term}` | Top 10% by composite metrics (optional) | Showcase featured profile |

Platforms: `pm`, `comms`, `showcase`.

---

## Issuance

| When | Who issues | Where displayed |
|------|------------|-----------------|
| Week 16 pass | Program director | Hult certificate PDF + showcase badge |
| Week 4/6/8 (win) | Auto on vote announcement | Showcase profile immediately |
| Week 16 (operator) | Program director after SLA audit | Showcase badge |
| Week 8 (leadership) | Auto on draft | Showcase profile |

### Showcase badge format

```json
{
  "credential": "hult-cohort-operator-pm-fall26",
  "issued": "2026-12-19",
  "evidence": "https://github.com/hult-cohort-fall26-boston/pm-platform",
  "verify": "https://showcase.hult-cohort.fall26.boston/verify/abc123"
}
```

Verify URL returns JSON with criteria met + links.

---

## Hult-recognized certificate

**Cohort Graduate** certificate includes:
- Student name
- Term and campus
- QR code → showcase profile
- Skills summary (auto-generated from metrics)
- Hult continuing-ed seal

⚠️ **DECISION NEEDED (Academic Affairs):** Certificate design and registrar issuance process.

---

## Multi-cohort accumulation

| Rule | Detail |
|------|--------|
| Repeat enrollment | New credentials each term — **stack on showcase** |
| Same platform win twice | Two winner badges (different terms) |
| Operator across terms | Cumulative "operator weeks" counter |
| Display | Most recent term primary; all terms visible on `/history` |

Repeat enrollees are not penalized — multiple credentials show commitment.

---

## Hiring partner guide (1-pager for partners)

**How to read Hult Cohort credentials:**

1. **Cohort Graduate** — completed six production projects; pass/fail only, no grade inflation
2. **Platform Winner** — peers voted their build best of 30; strong product judgment signal
3. **Platform Operator** — ran live infrastructure for 30 users for months; check repo PR merge rate and uptime
4. **Leadership Team** — trusted by operator to help run platform
5. **Always click GitHub** — credentials are pointers; the work is in the repos

Distributed to partners at signup ([hiring-partners.md](../partnerships/hiring-partners.md)).

---

## Removal effects

See [removal-succession.md](removal-succession.md). Removed operators lose operator badge; winner badge retained.

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Hult certificate design and issuance | Academic Affairs |

## Depends on

- [removal-succession.md](removal-succession.md)
- [team-formation.md](team-formation.md)
- [../assessment/metrics.md](../assessment/metrics.md)
- [../assessment/pass-fail.md](../assessment/pass-fail.md)
- [../partnerships/hiring-partners.md](../partnerships/hiring-partners.md)
