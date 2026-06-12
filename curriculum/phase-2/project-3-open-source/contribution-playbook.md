# Open source: contribution playbook

---

## Pipeline

```
1. TARGET  — Pick repo + issue (comment to claim)
2. REPRO    — Reproduce locally; document in issue
3. PROPOSE  — Comment approach; wait for maintainer ack (≤ 48 hr)
4. IMPLEMENT — Branch feat/issue-{n}; small focused diff
5. CI       — Green locally + remote
6. PR       — Fill template; link issue
7. REVIEW   — Respond ≤ 24 hr to maintainer comments
8. MERGE    — Celebrate; add to showcase profile
```

---

## Agent orchestration

| Step | Agent |
|------|-------|
| Repo archaeology | Research agent — map dirs, test commands |
| Fix implementation | Dev agent — follow repo conventions |
| Test against repo CI | QA agent — run exact CI commands locally |
| Review response draft | QA agent — draft replies; human sends |

---

## Review response rules

- Never argue with maintainers in PR comments
- If rejected: ask what would make it mergeable, or withdraw gracefully
- If stalled **14 days**: polite ping once; parallel second PR elsewhere

---

## Tracking

All PRs logged in PM platform board **Open Source** with columns: Target / Open / Review / Merged / Stalled.

Showcase profile auto-links merged PRs via GitHub username.

---

## Open decisions

None.

## Depends on

- [repo-targeting.md](repo-targeting.md)
- [../../onboarding/agent-setup.md](../../onboarding/agent-setup.md)
