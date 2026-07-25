# Shared context across cohort apps

The cohort is becoming a **suite** of apps (Pulse, Rally, and more to come). For it to feel like one
product, the apps share:

- **Common context & history** — who the user is, what they're working on, a shared timeline.
- **Shared agent memory** — anything you tell one app's agent, the others' agents can see.
- **Agent-to-agent dispatch** — one app's agent can hand work to another ("Rally, ask Pulse to
  summarize my week").

This document is the contract. Rally already implements it; any new app adopts the same shape.

## The one idea: key everything by GitHub handle

Each app authenticates the same person against its **own** Firebase project, so the Firebase `uid`
is different in every app. The stable cross-app identifier is the **GitHub login (handle)**. The
shared layer is keyed by `contextKey(handle)` (lower-cased), never by `uid`.

## The bus

A single **shared Firestore project** all apps' servers write to (Admin SDK). Its layout — defined
once in [`@cohort/core/shared-context`](../vendor/cohort-core/src/shared-context.ts):

```
cohortContext/{handle}                 profile-ish doc (updatedAt)
cohortContext/{handle}/memory/{id}     { app, text, createdAt }     — shared durable memory
cohortContext/{handle}/activity/{id}   { app, kind, summary, ... }  — shared history timeline
agentTasks/{id}                        { fromApp, toApp, handle, intent, payload, status, result }
```

Rules on the bus are **deny-all for clients** — only trusted app servers write it, so no user can
read another's cross-app context or forge a task for someone else's agent.

## Agent-to-agent dispatch protocol

```
App A (Rally)                     bus                        App B (Pulse)
  │  user confirms "ask Pulse …"    │                              │
  ├── dispatchTask(toApp=pulse) ───►│  agentTasks: {status:pending}│
  │                                 │◄──── claimTasks(toApp=pulse) ┤  (poll / inbox)
  │                                 │      {status:claimed}        │
  │                                 │                              ├─ run it as the user
  │                                 │◄──── completeTask(id,result)─┤
  │                                 │      {status:done}           │
```

Lifecycle is enforced pure in the contract: `pending → claimed → done|failed`. Claims are
transactional, so a task is never worked twice.

## How a new app joins (e.g. Pulse)

1. `import { BUS, contextKey, newAgentTask, canTransition } from '@cohort/core/shared-context'`.
2. Add a `busDb()` that points at the shared project via `SHARED_FIREBASE_SERVICE_ACCOUNT` (falls
   back to your own DB until the shared project exists) — see Rally's [`lib/admin.ts`](../lib/admin.ts).
3. Implement the thin adapter (memory/activity/dispatch/claim/complete) against the contract paths —
   copy Rally's [`lib/shared-context.ts`](../lib/shared-context.ts).
4. In your agent: resolve the caller's handle, **read shared memory into the model's context**, and
   **write durable facts to the bus** (not just app-local).
5. Add two routes: `POST /dispatch` (send work to another app) and `POST /inbox` (claim + run tasks
   addressed to you) — see Rally's [`app/api/assistant/dispatch`](../app/api/assistant/dispatch/route.ts)
   and [`inbox`](../app/api/assistant/inbox/route.ts). Poll `/inbox` when your agent surface opens.

That's it — the two apps now share one brain and can call each other's agents.

## Setup: the dedicated shared Firebase project

Until this exists, the bus **transparently falls back to each app's own database**, so shared
context already works *within* an app. To make it truly shared across apps:

1. Create a new Firebase project, e.g. `cohort-context` (Firestore enabled).
2. Deploy deny-all-clients rules to it (the `cohortContext` / `agentTasks` blocks in
   [`firestore.rules`](../firestore.rules) are exactly this — server-only).
3. Generate a service-account key (Project settings → Service accounts → Generate new private key).
4. On **every** app's host (Vercel), set `SHARED_FIREBASE_SERVICE_ACCOUNT` to that JSON.
5. Redeploy. Every app now reads/writes the same bus; the fallback is no longer used.

## Privacy model

The bus records a person's memory and full interaction history across apps, so privacy is designed
in, not bolted on:

- **Per-person isolation.** Everything is keyed by `contextKey(handle)`; there is no query that
  returns another person's data. One user can never read or write another's context.
- **Server-only.** The bus has deny-all-client rules — no browser ever touches it. Only trusted app
  servers (Admin SDK), after verifying the caller's ID token, read or write it. Provenance (`app`)
  is stored on every note and event so it's always clear which app wrote what.
- **Data minimization.** The shared history stores *concise summaries* (the request + what was
  drafted), never full model output or raw transcripts. Full detail stays app-local (Rally's
  `assistantThreads`, self-read only).
- **User access + erasure.** `GET /api/assistant/memory` reads the user their own shared memory +
  history; `DELETE` is the right to be forgotten — it purges their entire shared record *and* their
  app-local assistant data. Exposed in the assistant's "Memory & privacy" panel.
- **Consent to share.** A note only reaches the bus when the user has a GitHub handle (the shared
  key); without one, memory stays app-local. Explicit `remember`/actions are what get recorded.

## Current state

- **Rally**: fully implemented — shared memory read/write, activity, dispatch, and inbox. The bus
  falls back to Rally's `rally-14e17` project until `SHARED_FIREBASE_SERVICE_ACCOUNT` is set.
- **Pulse**: not yet integrated — it has its own agent and Firebase project (`cursor-boston-project`).
  Adopting steps 1–5 above wires it into the same bus. (Pulse changes are owned by the Pulse
  session; coordinate before editing its tree.)
