# Reviewer access

Production entry shows the **sign-in** experience. Reviewers do **not** need real credentials.

## How to review

1. Open the **Production URL** (from the submission PR).
2. You’ll land on the Fireside welcome / sign-in flow (`/` → **Sign in**, or go directly to `/signin`).
3. Click **Continue as guest — no account needed** to enter the workspace.
4. Optional: fill name/email and click **Enter Fireside** (demo only — nothing is sent to a real auth server yet).

Direct workspace link (same app, skips the gate): `/workspace`

## What to try

- Channels: `#general`, `#announcements`, `#reviews`, `#motivation`, `#at-risk`, `#help`
- DMs, group chats (**+ Start**)
- Attach a file; flag a message; open **Fireside AI**
- Sidebar **Open Forth** / `/ticket Campaign | Ticket label` in the composer

## Submission PR notes

Put the stable Vercel URL on the line immediately after `## Production URL` in the PR body, e.g.:

```markdown
## Production URL

https://your-fireside-app.vercel.app
```

Suggested production settings:

| Setting | Value |
|---------|--------|
| Root directory | `submissions/studmuffin01-project-2` |
| Production branch | `participants/summer26/phase-1-project-2/studmuffin01` |

Point the Production URL at `/` or `/signin` so reviewers see the login page first; guest bypass is on that page.
