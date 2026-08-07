# Comms platform: build requirements

---

## Mandatory functionality (baseline)

| Feature | Requirement |
|---------|-------------|
| **Channels** | ≥ 3 public channels; create/rename/archive |
| **Direct messages** | 1:1 messaging between any two cohort members |
| **Message persistence** | Messages survive refresh; history ≥ 30 days |
| **Announcements** | Role or channel where only operator/admin can post (for staff announcements) |
| **Notifications** | In-app and/or email on @mention or DM |
| **Search** | Search message content by keyword |
| **Multi-user auth** | ≥ 30 accounts; **same email as PM platform** (shared user table or matching email required) |
| **Deployment** | Public HTTPS URL |

### Differentiating

| Feature | Examples |
|---------|----------|
| Threads | Reply threads on messages |
| File attachments | Images, PDFs |
| GitHub notifications | Post to channel on org PR activity |
| PM deep links | Unfurl task URLs from PM platform |
| Reactions | Emoji reactions |
| Presence | Online/offline indicators |
| Mobile PWA | Installable on phone |

---

## Production criteria

| Criterion | Minimum |
|-----------|---------|
| Latency | Message send → appear < 2 sec (same region) |
| Concurrent | 15 users posting in same channel without drop |
| Real-time | No manual refresh required (polling ≤ 5 sec OK for MVP) |
| Uptime | Passes smoke-test at deadline |

---

## Ballot eligibility

Same checklist as [PM requirements](../project-1-pm-platform/requirements.md):

- Public repo `comms-{handle}` in org
- Deploy URL live
- Staff can sign up, join channel, send DM, receive notification
- `AGENTS.md` present
- **PM email match:** Staff verifies test user email matches PM platform account

---

## Open decisions

None.

## Depends on

- [README.md](README.md)
- [../project-1-pm-platform/requirements.md](../project-1-pm-platform/requirements.md)
