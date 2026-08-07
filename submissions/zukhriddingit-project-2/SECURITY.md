# Security and privacy

## Supported security boundary

Relay 65's active Spark release assumes Firebase Authentication is configured with GitHub as the sign-in provider and that the included Firestore rules and indexes are deployed. Running the UI alone does not provide authorization. Cloud Storage and Cloud Functions are intentionally not provisioned or deployed in this release.

## Direct-message privacy

`conversations/{conversationId}` and every nested message/reply require the authenticated UID to be in `participantIds`. In-app staff and admins receive no general DM override. Public-channel moderation therefore does not silently become private-message surveillance.

A participant may file a report. The report includes a bounded snapshot of the selected message for a future operator-managed workflow. Firebase Console/IAM project administrators remain a separate privileged backend boundary, as with any Firebase project; they are not app-level roles and ordinary signed-in users never gain that access.

## Identity and membership

Authentication and authorization are separate:

- GitHub OAuth proves the external account identity.
- An active `members/{uid}` document grants workspace access.
- Firebase Console/IAM creates the neutral `settings/workspace` document; ordinary clients cannot write it.
- With `settings/workspace.accessMode: "open"`, a GitHub-authenticated visitor can create only their own active profile, forced to the `member` role.
- This is deliberately global GitHub entry, not a cohort-roster allowlist. It needs no in-app access-approval administrator.
- One existing owner profile is designated `staff` only for staff-restricted public posting such as `#announcements`; that role does not grant a private-channel or DM read bypass.
- The retained `request` / `access_requests/{uid}` path is dormant in this release and can be enabled only by a future operator-managed deployment.
- A client cannot elevate its role or change its active flag.

Relay requests GitHub’s `read:user` and `user:email` scopes to capture handle/avatar and an available verified email. Do not use those profile fields as a substitute for Firestore authorization.

## Content and attachments

- Root messages are capped at 5,000 characters; thread replies at 3,000.
- Browser output escapes user-supplied HTML before applying a small safe rich-text renderer.
- External links are accepted only for `http:` and `https:` protocols.
- The Spark composer keeps a visible, focusable paperclip with `aria-disabled="true"`; activating it explains that attachments are unavailable in the free Firebase release and does not open a file picker.
- Both adapters reject unexpected upload calls before reading a local file or contacting a Firebase service.
- Firestore rules accept only an omitted or `null` attachment value on new messages/replies, and ordinary message edits cannot introduce or alter attachment metadata.
- CSP, no-sniff, strict referrer policy, restrictive permissions policy, and frame-ancestor denial are configured in `firebase.json`. The CSP permits only Firebase Auth's required `https://apis.google.com` iframe helper plus the project `firebaseapp.com` auth frame; it does not broadly allow third-party scripts. `index.html`, `config.js`, and `sw.js` are non-cacheable, and the worker fetches configuration with `no-store`, so a stale public Firebase configuration cannot outlive a deployment.

## Inbound webhooks — deferred

The Spark manifest has no `/api/pm-webhook` or `/api/github-webhook` route and no Cloud Functions deployment target. Do not create or configure an upstream webhook sender for the Spark release.

The retained `functions/` source is future Blaze-upgrade material only. Before it can become active, the upgrade must restore the Functions target and both Hosting rewrites, set secrets in Firebase rather than source code, verify PM HMAC and GitHub signature handling, bound inputs, and test endpoint delivery.

## Reporting a vulnerability

Do not open a public issue containing credentials, private messages, or an exploitable production detail. Contact the repository owner directly, describe the affected component and reproduction, and rotate any exposed credential immediately.

## Pre-launch review

- Deploy the exact included rules and indexes.
- Run `cd emulator && npm run test:emulator && cd ..` after installing the package-local dependencies; it verifies both allowed channel queries, open-entry gating, normal-member denial and staff success in `#announcements`, private roots/descendants, third-party staff/admin DM isolation, denied unrestricted reads, and an attachment-bearing direct channel-message write denial.
- Verify a third account cannot read a test DM through the client or REST API.
- Confirm regular members can post in shared public channels other than `#announcements`, while staff-only announcement posting, private-channel membership, and DM isolation still hold.
- Confirm regular members cannot edit roles, activate/deactivate themselves, or edit workspace settings.
- Confirm the paperclip is focusable, explains the Spark restriction, and never opens a file picker.
- Confirm a direct Firestore client cannot write a non-null attachment payload.
- Confirm no secret appears in Git history, `config.js`, Hosting responses, or browser source maps.
- Add Firebase App Check when moving beyond the pilot or when abuse volume justifies it.

## Future Blaze upgrade — deferred

`storage.rules` and `functions/` are retained for a later billing-backed upgrade, not deployed on Spark. Before enabling protected uploads or inbound webhooks, restore their Firebase manifest targets and webhook rewrites together, run the Storage/Functions security review, configure server-side secrets, and complete separate two-account attachment and signed-webhook tests.
