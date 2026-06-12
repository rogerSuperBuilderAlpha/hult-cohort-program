# Execution artifacts

Ready-to-use templates, starter repos, and runnable tools. **Legal templates require General Counsel review before use.**

## Launch sequence

1. [checklists/cohort-1-launch.md](checklists/cohort-1-launch.md)
2. Legal templates → GC review → [templates/legal/](templates/legal/)
3. [marketing/FIREBASE.md](marketing/FIREBASE.md) → Firebase project + credentials
4. [marketing/site/](marketing/site/) → deploy on Vercel (apply + program live)
5. [admissions/](admissions/) → take-home repo publish
6. [ludwitt-hult-api/](ludwitt-hult-api/) → deploy sandbox by Nov 1
7. Cohort org from [templates/cohort-project-template/](templates/cohort-project-template/)
8. [partners/partner-one-pager.md](partners/partner-one-pager.md) + [partner-pitch-outline.md](partners/partner-pitch-outline.md)

## Contents

| Path | Purpose |
|------|---------|
| [marketing/FIREBASE.md](marketing/FIREBASE.md) | **Firebase** schema, env vars, auth, staff workflows |
| [marketing/site/](marketing/site/) | **Next.js platform** (apply, program, landing) |
| [marketing/DEPLOY.md](marketing/DEPLOY.md) | Vercel + Firebase deploy guide |
| [admissions/](admissions/) | Application form spec, publish guide |
| [admissions-take-home/](admissions-take-home/) | Runnable admissions task (Node) |
| [ludwitt-hult-api/](ludwitt-hult-api/) | **Runnable** platform MVP + OpenAPI + DEVELOPER.md |
| [cohort-scripts/](cohort-scripts/) | Review assignment generator |
| [operations/discord-bootstrap.md](operations/discord-bootstrap.md) | Weeks 1–4 Discord setup |
| [operations/github-org-setup.md](operations/github-org-setup.md) | Org + teams + branch protection |
| [templates/emails.md](templates/emails.md) | 7 operational email templates |
| [templates/cohort-project-template/](templates/cohort-project-template/) | GitHub org starter |
| [templates/legal/](templates/legal/) | Agreement drafts |
| [templates/venture/](templates/venture/) | Venture doc templates |
| [templates/showcase/](templates/showcase/) | Lightning demo outline |
| [templates/qualified-repos.md](templates/qualified-repos.md) | OSS allowlist |
| [checklists/cohort-1-launch.md](checklists/cohort-1-launch.md) | Master launch checklist |
| [partners/partner-one-pager.md](partners/partner-one-pager.md) | Single-page partner brief |
| [partners/partner-pitch-outline.md](partners/partner-pitch-outline.md) | Partner deck outline |

## Runnable tools

```bash
# Admissions take-home (tests fail until bugs fixed)
cd admissions-take-home && npm install && npm test

# Ludwitt/Hult API
cd ludwitt-hult-api && npm install && npm test && npm run dev

# Landing page
cd marketing/site && npm install && npm run dev

# Review assignments
node cohort-scripts/review-assignments.js cohort-scripts/roster.example.json
```
