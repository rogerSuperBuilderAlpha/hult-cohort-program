# Hult Cohort MCP Server

[MCP](https://modelcontextprotocol.io) server so students and agents can **apply**, **file written peer reviews**, and **cast private votes** from Cursor, Claude Desktop, or any MCP client — using the same APIs as [the cohort website](https://site-nine-rouge-68.vercel.app).

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `get_auth_instructions` | No | How to set `HULT_ID_TOKEN` |
| `auth_status` | Optional | Verify token works |
| `get_cohort_stats` | No | Live roster size / review count |
| `list_program_projects` | No | All project slugs and summaries |
| `get_me` | Yes | Application + roster + submissions |
| `get_project_progress` | Yes | Peers, reviews, votes for a project |
| `submit_application` | Yes | Apply for Fall 2026 |
| `prepare_review_issue` | Yes | GitHub issue template + peer links |
| `save_written_review` | Yes | Save issue URL (unlocks vote) |
| `cast_peer_vote` | Yes | Private 👍/👎 after review |

**Prompt:** `peer_review_workflow` — guided steps for one peer.

## Quick start (Cursor)

### 1. Build

```bash
cd execution/hult-cohort-mcp
npm install
npm run build
```

### 2. Sign in on the website

Open https://site-nine-rouge-68.vercel.app/apply → **Sign in with GitHub**.

### 3. Copy your Firebase ID token

While signed in, open DevTools → **Network** → reload or trigger `/api/me` → copy the `Authorization: Bearer …` token (starts with `eyJ`).

Tokens expire after ~1 hour. Refresh when tools return 401.

Or call MCP tool `get_auth_instructions` for the full walkthrough.

### 4. Add to Cursor MCP config

Merge into `.cursor/mcp.json` (project) or Cursor Settings → MCP:

```json
{
  "mcpServers": {
    "hult-cohort": {
      "command": "node",
      "args": ["/Users/YOU/HULT/execution/hult-cohort-mcp/dist/index.js"],
      "env": {
        "HULT_API_BASE_URL": "https://site-nine-rouge-68.vercel.app",
        "HULT_ID_TOKEN": "eyJ..."
      }
    }
  }
}
```

See [mcp.example.json](mcp.example.json) for a template.

### 5. Try it

Ask your agent:

> Use hult-cohort MCP: check auth_status, then get_project_progress for phase-1-project-1

## Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `HULT_ID_TOKEN` | For auth tools | — |
| `HULT_API_BASE_URL` | No | `https://site-nine-rouge-68.vercel.app` |

## Peer review flow (same as the website)

1. `prepare_review_issue` → open deploy, read PR, file GitHub issue  
2. `save_written_review` → paste issue URL  
3. `cast_peer_vote` → `up` or `down` (private)

Written review must exist before voting (403 otherwise).

## Development

```bash
npm run dev    # tsx stdio server (for manual testing)
npm run build
```

Stdio transport only — logs must go to stderr (the server follows MCP conventions).

## API surface

This server proxies the cohort platform REST API:

- `GET /api/program/projects`
- `GET /api/cohort/stats`
- `GET /api/me`
- `GET /api/program/{slug}/progress`
- `POST /api/applications`
- `POST /api/program/{slug}/written-reviews`
- `POST /api/program/{slug}/ratings`

Parent docs: [../../AGENTS.md](../../AGENTS.md)
