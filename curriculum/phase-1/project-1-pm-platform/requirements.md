# PM platform: build requirements

**Purpose:** Mandatory functionality, production bar, and ballot eligibility for Project 1.

---

## Mandatory functionality

Every eligible build must implement all **baseline** features. Differentiating features are optional but scored in rubric.

### Baseline (required for ballot)

| Feature | Requirement |
|---------|-------------|
| **Projects** | Create/edit/archive project; ≥ 1 project per user |
| **Tasks** | Create task with title, description, status, assignee |
| **Status workflow** | ≥ 3 states (e.g. todo / in progress / done) |
| **Assignment** | Assign task to any cohort member (by email or username) |
| **Multi-user auth** | Email+password or OAuth; sized for the **enrolled cohort** (capacity — not a pre-merge signup quota) |
| **Task list views** | Filter by assignee, status, project |
| **Deployment** | Public HTTPS URL; data persists across redeploys |

### Differentiating (optional, rubric points)

| Feature | Examples |
|---------|----------|
| Due dates + reminders | Email or in-app |
| Comments on tasks | Thread per task |
| GitHub integration | Link task ↔ issue/PR |
| Review/vote module | Ballot for Project 2+ (strongly valued — replaces Google Forms) |
| Metrics dashboard | Track PR counts, review completion |
| Notifications | In-app or email on assignment |
| Mobile-responsive UI | Usable on phone |

---

## Production criteria

| Criterion | Minimum bar |
|-----------|-------------|
| **Uptime** | Deploy URL returns 200 during staff smoke-test at deadline |
| **Auth** | Multiple test accounts creatable without manual DB edits (prove multi-user works) |
| **Data persistence** | Tasks survive page refresh and redeploy |
| **Concurrent use** | 10 simultaneous users without visible errors (load test optional but rubric credit) |
| **Security** | No hardcoded secrets in repo; `.env` in `.gitignore` |
| **README** | Setup, architecture diagram (can be ASCII), deploy URL, known bugs |

Stack is **agnostic**. TypeScript/Next.js on Vercel is the documented default in week 1 but not required.

---

## Repository constraints

| Rule | Value |
|------|-------|
| Repo location | `hult-cohort-{term}-{campus}/pm-{your-github-handle}` |
| Visibility | **Public** |
| License | MIT (in template) |
| `AGENTS.md` | Required |
| Forking prior cohort repos | Allowed for reference; **substantial copy-paste = plagiarism** |

---

## Account model (review window)

**Merge eligibility is the PR template + merge by deadline** (see `content/program.ts`). You do **not** need real cohort signups before merging.

By review week, builders should:

1. Post signup instructions in README
2. Leave open registration (or create accounts for peer reviewers on request)
3. Staff test account available if requested: `staff-review@hult-cohort.test` (password in `#setup-verification` during review week)

Reviewers must be able to sign up (or log in) and create a project and task without builder assistance.

---

## Ballot eligibility checklist

Synced with [the-loop.md](../the-loop.md). All must be true at deploy deadline:

- [ ] Repo in cohort org, public
- [ ] README complete with deploy URL
- [ ] URL loads; reviewer can sign up and create + assign a task
- [ ] `AGENTS.md` present
- [ ] All baseline features demonstrable in ≤ 5 min demo
- [ ] Staff smoke-test passed

Missing any item → **ineligible for votes**; student may still complete reviews for pass credit; build unit marked incomplete.

---

## Open decisions

None.

## Depends on

- [../the-loop.md](../the-loop.md)
- [review-rubric.md](review-rubric.md)
