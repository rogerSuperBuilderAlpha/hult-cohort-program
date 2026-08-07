# AGENTS.md — Hult Cohort MCP

Parent: [../../AGENTS.md](../../AGENTS.md)

## Purpose

Stdio MCP server exposing cohort platform actions to Cursor and other MCP clients.

**Path:** `execution/hult-cohort-mcp/`  
**Entry:** `dist/index.js` (after `npm run build`)

## When to edit

- New platform API routes → add matching MCP tool in `src/index.ts`
- Auth changes → update `src/api-client.ts` and `get_auth_instructions` copy
- Review issue template → keep in sync with `execution/marketing/site/lib/written-reviews-format.ts`

## Commands

```bash
npm install && npm run build
npm run dev   # local stdio
```

## Public API added for MCP

`GET /api/program/projects` on the Next.js site — program index without auth.

## Cursor config

See [README.md](README.md) and [mcp.example.json](mcp.example.json).
