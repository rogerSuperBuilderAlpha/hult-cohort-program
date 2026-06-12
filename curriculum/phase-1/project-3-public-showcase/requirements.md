# Public showcase: build requirements

---

## Mandatory functionality

| Feature | Requirement |
|---------|-------------|
| **Public homepage** | Cohort name, term, narrative (≥ 200 words), no login required |
| **Student profiles** | 1 page per student: name, GitHub, photo (optional), bio |
| **Portfolio links** | Auto or manual links to pm-/comms-/showcase- repos + deploy URLs |
| **PM integration** | Read-only display of cohort project status from PM platform (API, embed, or synced JSON — minimum: static snapshot updated daily) |
| **Partner section** | `/partners` page: how to hire, fee model summary, contact |
| **Request intro** | Form: partner name, company, student(s), message → notifies placement lead |
| **Privacy** | Students opt-in to public profile (default **opt-in** at enrollment; opt-out allowed — profile shows "private") |
| **SEO** | `<title>`, meta description, Open Graph tags |
| **Deployment** | Public HTTPS; no auth for public pages |

### Differentiating

| Feature | Examples |
|---------|----------|
| Live GitHub activity feed | Recent commits, PRs |
| Metrics dashboard | User counts, merged PRs (Phase 2) |
| Partner login | Gated student contact info |
| Search/filter | By skill, project, metric |
| Event RSVP | Week 16 showcase registration |

---

## Production criteria

| Criterion | Minimum |
|-----------|---------|
| Load time | LCP < 4 sec on 4G |
| Mobile | Readable on phone |
| Profiles | 30/30 students have pages (opt-out shows placeholder) |
| Partner form | Submissions reach placement lead email within 1 min |

---

## Ballot eligibility

Standard checklist + **PM integration demonstrable** (even if ugly — must show real project data from PM platform, not hardcoded lorem ipsum).

---

## Open decisions

None.

## Depends on

- [README.md](README.md)
- [../project-1-pm-platform/requirements.md](../project-1-pm-platform/requirements.md)
- [../../../partnerships/hiring-partners.md](../../../partnerships/hiring-partners.md)
