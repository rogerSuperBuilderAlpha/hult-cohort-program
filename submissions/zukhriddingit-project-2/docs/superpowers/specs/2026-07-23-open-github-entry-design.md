# Open GitHub Entry Design

## Goal

Relay 65 admits any person who signs in with GitHub, without administrator approval or an administrator account. Every admitted person receives an active `member` profile and can use the shared public channels and participant-only DMs.

## Chosen model

The neutral Firestore document `settings/workspace` is the one-time switch that activates enrollment:

```text
settings/workspace
  accessMode: "open"
  cohortCapacity: 65
  workspaceName: "Hult Cohort"
```

When a GitHub-authenticated user has no `members/{uid}` document, the existing Firebase adapter creates one with `role: "member"` and `active: true`. Firestore rules independently require the GitHub sign-in provider, the caller's own UID, an active profile, and `settings/workspace.accessMode == "open"`.

No member receives `admin` or `staff` solely by joining. The active production workspace has no administrator record. The old pending access-request record from the pre-workspace first sign-in is removed.

## Shared channels

Because the chosen model has no administrator bootstrap, shared public channels are seeded through the existing member channel-creation path. Every seeded document is public, has a numeric `sort`, and has `postingRoles: []` so no channel depends on a staff-only role.

The initial workspace contains `announcements`, `general`, `ship-room`, `reviews`, `help-desk`, and `random`. Members may continue to create public channels through the existing UI. Private channel authorization and direct-message isolation remain enforced by the existing Firestore rules.

## Security boundary and trade-off

GitHub is the only admission gate in this model. It does not prove cohort enrollment: any GitHub-authenticated account can create a member profile while the workspace remains open. This is an intentional frictionless peer-review policy, not a cohort allowlist.

The model does not broaden private-channel reads, direct-message reads, attachment restrictions, or Firestore settings writes. It uses the existing Spark-only Firebase profile: Authentication, Firestore, and Hosting with no Storage, Functions, billing upgrade, or webhook route.

## Verification

1. Verify `settings/workspace` contains `accessMode: "open"`.
2. Sign in with GitHub after the workspace exists; Relay must show the app, not the pending screen, and create `members/{uid}` with `active: true` and `role: "member"`.
3. Confirm no `access_requests/{uid}` record remains for that user.
4. Confirm the six shared public channels are visible and each has a numeric sort value.
5. Add a Firestore Emulator case proving a GitHub-authenticated fresh user can create only their own member record in an open workspace, while a non-GitHub identity is denied.

## Non-goals

- enforcing a cohort roster or GitHub-handle allowlist;
- creating an administrator, staff account, or approval queue;
- granting administrators access to private channels or DMs;
- enabling Storage, Cloud Functions, or webhook delivery.
