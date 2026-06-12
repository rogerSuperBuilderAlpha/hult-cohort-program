# GitHub organization setup

Run before cohort week 1. Org: `hult-cohort-fall26-boston` (adjust per term/campus).

---

## Create org

1. GitHub → New organization → `hult-cohort-fall26-boston`
2. Plan: Free (public repos)
3. Add `@staff` owners (program director only as owner; placement lead as member)

---

## Seed repos

| Repo | Source | Visibility |
|------|--------|------------|
| `cohort-project-template` | [templates/cohort-project-template/](../templates/cohort-project-template/) | Public |
| `ecosystem-integration` | Empty + README | Public |
| `qualified-repos.md` | Copy from templates | Public or wiki |
| `cohort-scripts` | [cohort-scripts/](../cohort-scripts/) | Public |

Students create `pm-{handle}`, etc. themselves week 2+.

---

## Teams

| Team | Permission | Members |
|------|------------|---------|
| `students` | Write on own repos; triage on platform repos | All students |
| `operators` | Maintain on `*-platform` repos | 3 winners + teams (week 5+) |
| `staff` | Admin | Program director |
| `alumni` | Read all | Graduates (post week 16) |

Use GitHub Team sync or manual adds.

---

## Branch protection (after first platform cutover, week 5)

On `pm-platform`, `comms-platform`, `showcase-platform`:

- Require PR before merge to `main`
- Require 1 approval (operator or delegate)
- No force push

---

## Org settings

- [ ] Base permissions: Read
- [ ] Member repository creation: Allowed (students create build repos)
- [ ] Outside collaborators: Disabled
- [ ] 2FA required for all members

---

## Week 1 invites

Sep 8 AM: invite all confirmed students by GitHub username from admissions spreadsheet.

Template message:

> You've been invited to `hult-cohort-fall26-boston`. Accept before Tuesday kickoff. Enable 2FA.

---

## Webhooks (optional week 5+)

Org webhook → cohort PM platform or `cohort-scripts` worker for metrics dashboard.

Events: `pull_request`, `issues`, `push` on platform repos.

See [cohort-lifecycle.md](../../operations/cohort-lifecycle.md).
