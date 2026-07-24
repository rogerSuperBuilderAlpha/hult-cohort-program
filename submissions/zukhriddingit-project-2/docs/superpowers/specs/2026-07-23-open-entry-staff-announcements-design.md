# Open GitHub Entry with Staff Announcements Design

## Goal

Meet the communications-project requirement for a staff-only announcement channel without restoring an access-approval gate or weakening private-channel/DM privacy.

## Decision

Relay remains globally open to every GitHub-authenticated account when `settings/workspace.accessMode` is `"open"`. The existing project owner profile receives the Firestore role `"staff"`, not `"admin"`. The existing `announcements` channel receives `postingRoles: ["staff"]`.

## Entry and authorization flow

1. Any GitHub-authenticated visitor signs in.
2. With `settings/workspace.accessMode: "open"`, Firestore permits the visitor to create only their own active profile with `role: "member"`.
3. The project owner's existing profile is separately set to `role: "staff"` through Firebase Console/IAM.
4. `#announcements` allows all active members to read but only a profile whose role is `staff` can create messages or replies.
5. Every other public room remains member-postable.
6. Private channels still require `memberIds` membership; DMs still require `participantIds` membership. `staff` is not a private-channel or DM read bypass.

## Alternatives considered

1. Keep all channels member-postable: preserves the simplest model but fails the project requirement for staff-only announcements.
2. Promote the project owner to `admin`: would also work technically, but adds access-approval and workspace-administration capability that is unnecessary for the active open-entry release.
3. Promote the project owner to `staff` and restrict only `#announcements`: selected. It satisfies the rubric while retaining open entry and the smallest privilege set.

## Implementation boundaries

- Firestore document changes are limited to the existing owner member profile and the existing `channels/announcements` document.
- The existing Firestore posting-role rule already enforces `role() in channel.postingRoles`; no broader read authorization is added.
- Tests add a normal-member denial and staff success for an announcement write, plus retain current open-entry and privacy assertions.
- Documentation distinguishes staff posting capability from account enrollment; `staff` is not an in-app access approver.

## Acceptance evidence

- A new GitHub account can still self-enrol without approval.
- A normal member cannot post to `#announcements`.
- The staff account can post to `#announcements`.
- Normal members can post to the other shared public channels.
- A staff account cannot read a non-member private channel or a nonparticipant DM.
