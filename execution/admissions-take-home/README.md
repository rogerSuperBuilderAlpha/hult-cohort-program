# Fix the repo (Admissions take-home)

**Time limit:** 48 hours from receipt of link.

Clone this repo, fix the bugs, implement the missing feature, and open a PR using the template below.

## Task

This is a miniature task board API. It should:

1. Return tasks from `GET /api/tasks`
2. Create tasks via `POST /api/tasks` with `{ "title": "..." }`
3. Mark tasks complete via `PATCH /api/tasks/:id` with `{ "completed": true }`

Currently **3 bugs** prevent correct behavior and **1 feature** is missing (optional — see grading: pass requires 3 bugs + green tests; DELETE earns strong pass).

## Setup

```bash
npm install
npm test        # some tests fail until you fix bugs
npm run dev     # http://localhost:3000
```

## Submit

1. Fork or branch: `admissions/{your-github-handle}`
2. Open PR against `main` with title: `[Admissions] Fix task board — {your handle}`
3. Fill the PR template completely
4. Include **Agent usage** section — which agents you used

## We evaluate

- PR is mergeable (or close with notes)
- You explored the repo (not a blind paste)
- Tests pass
- PR description shows you understand what you changed

Good luck — this is the same loop as the program itself.
