# Production Readiness Design

> **Superseded for the active release (July 23, 2026).** This historical design records the earlier Blaze path that deployed Storage and Functions with Hosting. Relay 65 now ships as Firebase Spark core (Auth, Firestore, Hosting); attachments and inbound webhooks are deferred. Follow [2026-07-23-spark-free-core-design.md](2026-07-23-spark-free-core-design.md) for the active design and do not use the combined deployment instructions below for Spark.

## Goal

Make Relay 65's first production deployment safe and testable without weakening private-channel authorization.

## Channel authorization and listeners

`FirebaseAdapter.subscribeChannels()` will maintain two independent Firestore listeners:

- public channels: `where('type', '==', 'public')` plus `orderBy('sort', 'asc')`;
- member-only channels: `where('memberIds', 'array-contains', currentUser.uid)` plus `orderBy('sort', 'asc')`.

Each listener stores its latest snapshot. A shared merge function combines both snapshots in a `Map` keyed by channel ID, removes archived channels, and sorts remaining documents by numeric `sort` before invoking the UI callback. The single returned cleanup function unsubscribes both Firestore listeners.

Channel document reads will evaluate the channel's own `resource.data` through `canReadChannelData(channel)`. Nested messages and replies will continue using `canReadChannel(channelId)`, which loads the parent channel document. This preserves the private-member branch rather than broadening all channel reads.

Channel creation and updates will require a numeric `sort` field. The two composite indexes support the public and member-only ordered listeners. Seeding will use only a public-channel query with `limit(1)` and no ordering.

## Configuration validation

The validator will evaluate `window.RELAY_CONFIG` in an isolated VM context rather than infer mode from text. Demo configuration may leave Firebase fields empty. Production configuration must provide every Firebase web identifier, reject `YOUR_...` placeholders, and reject non-public secrets. Normal Firebase browser API keys beginning with `AIza` remain allowed.

Fixture-based tests will exercise both safe demo and complete production configurations without modifying the checked-in `config.js`.

## Deployment and webhooks

Relay will use the full-webhook release path: because Hosting rewrites point to `pmWebhook` and `githubWebhook`, the first production Hosting deploy must include Functions after function dependencies and both secrets are configured. Documentation will no longer describe a Hosting-only first deployment that leaves routes pointing to absent functions.

Deployment order is: configure Firebase and GitHub OAuth; validate; configure Functions dependencies and secrets; deploy rules, indexes, Storage, Functions, and Hosting; sign in; bootstrap the first administrator; run production QA.

## Verification

The dependency-free root suite will test listener registration, merging, deduplication, archival filtering, cleanup, constrained seed reads, indexes, and both configuration modes. A separate Firestore Emulator smoke harness will verify public and member-only channel queries are allowed, an unauthorized private document is not returned, and an unrestricted channel query is denied before production release.
