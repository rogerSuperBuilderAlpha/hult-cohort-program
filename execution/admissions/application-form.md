# Application form specification

Implement on-site at **`/apply`** (Next.js). Submissions stored in **Firebase Firestore** via Admin SDK. See [FIREBASE.md](../marketing/FIREBASE.md).

Staff review in Firebase Console or exported CSV — no admin dashboard cohort 1.

---

## Fields

| # | Field | Type | Required | Validation |
|---|-------|------|----------|------------|
| 1 | Legal first name | text | yes | |
| 2 | Legal last name | text | yes | |
| 3 | Email | email | yes | |
| 4 | GitHub username | text | yes | Pattern: `[a-zA-Z0-9-]+` |
| 5 | GitHub profile URL | url | yes | Must match username |
| 6 | Preferred campus timezone | select | yes | Boston / London / San Francisco / Dubai / Online (Boston TZ) |
| 7 | Hult student ID | text | no | If blank → external applicant |
| 8 | Why this program? | textarea | yes | 50–300 words |
| 9 | Project 1 idea (PM platform angle) | textarea | yes | 30–150 words |
| 10 | How did you hear about us? | select | yes | Hult email / Founder network / Cursor Boston / Social / Friend / Other |
| 11 | Confirm GitHub ≥ 6 months, ≥ 5 commits | checkbox | yes | |
| 12 | Confirm $10k tuition + $400/mo tooling affordable | checkbox | yes | |
| 13 | Confirm public work on GitHub | checkbox | yes | |
| 14 | Need-based tooling assistance (cohort 1 rare) | checkbox | no | Flags program director |

*Current `/apply` page implements a subset; align form to full field list when Firebase is wired.*

---

## Automations

| Trigger | Action |
|---------|--------|
| Submit | Firestore `applications` doc; auto-reply email with take-home repo URL |
| GitHub API check (optional script) | Flag if account < 6 months or < 5 commits |
| Deadline pass | Close apply route or flag `applications.status`; queue for review |

---

## Firestore / export columns

Maps to `applications` collection — see [FIREBASE.md](../marketing/FIREBASE.md):

`submittedAt`, `firstName`, `lastName`, `email`, `githubHandle`, `campus`, `hultStudentId`, `takeHomePrUrl`, `status`, `notes` (staff-added)

---

## Review SLA

48 hours from take-home PR submission to decision email.

Grading: [admissions-take-home/GRADING.md](../admissions-take-home/GRADING.md)

---

## Supersedes

External form tools (Typeform, Google Forms). See deprecated [typeform-setup.md](typeform-setup.md).
