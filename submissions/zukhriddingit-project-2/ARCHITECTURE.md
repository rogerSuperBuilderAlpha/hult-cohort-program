# Relay 65 architecture

## Product model

Relay 65 is deliberately **async-first and realtime-delivered**:

- durable context belongs in channels and threads;
- personal coordination belongs in participant-only DMs;
- important posts carry a scannable signal (`Update`, `Ask`, `Decision`, or `Win`);
- project work stays canonical in the selected PM platform and appears in Relay as a deep-linked task card;
- Firestore listeners deliver changes immediately without making the product behave like an interruption machine.

## Frontend

The application is a static progressive web app built from semantic HTML, CSS, and browser-native ES modules. There is no bundler and no frontend package install, which keeps fresh-clone setup predictable for peer reviewers.

`src/app.js` owns rendering, navigation, keyboard interactions, notifications, modal flows, and composer behavior. It talks only to a small adapter contract. The adapters expose methods such as:

```text
subscribeChannels       subscribeMessages       sendMessage
subscribeMembers        subscribeThread         sendThreadReply
subscribeConversations  subscribeNotifications  search
createChannel           createConversation      toggleReaction
uploadFile              reportMessage           updatePresence
```

`DemoAdapter` persists the same conceptual entities in `localStorage`; the active `FirebaseAdapter` maps them to Authentication and Firestore. This separation makes the demo realistic while preventing demo shortcuts from leaking into production authorization.

The active deployment is Firebase **Spark core**: Auth, Firestore, and Hosting. It deliberately does not initialize Cloud Storage or Cloud Functions. The adapter keeps a safe attachment-unavailable guard so an unexpected caller cannot start a file upload, and the Firestore rules reject new attachment payloads. The `storage.rules` and `functions/` source are retained as deferred future Blaze-upgrade material, not active Spark services.

## Firestore data model

```text
settings/workspace
members/{uid}
access_requests/{uid}              (dormant request-mode path)
channels/{channelId}
  messages/{messageId}
    replies/{replyId}
conversations/{sortedUidA__sortedUidB}
  messages/{messageId}
    replies/{replyId}
notifications/{notificationId}
reports/{reportId}
```

### Members

A member profile stores the GitHub handle, display name, verified/available email, avatar URL, role, active state, status, and last-seen timestamp. GitHub OAuth is the source of authentication; Firestore membership is the source of workspace authorization.

Roles:

- `member` — regular cohort participant;
- `staff` — designated operator role for official announcements and public-content moderation, with no private-channel or DM read bypass;
- `admin` — future operator-managed role for access approval and workspace administration.

The active Spark release has no in-app access-approval flow. A Firebase Console/IAM operator creates the neutral `settings/workspace` document once; with `accessMode: "open"`, every GitHub-authenticated visitor can create only their own active `member` profile. One already-enrolled owner profile is then designated `staff` solely for the staff-only announcement path; it does not determine who may enter. The retained `admin` and `access_requests` paths support a future controlled-access deployment; regular clients cannot create or edit the workspace setting or elevate a profile.

### Channels

In the active open-entry workspace, enrolled members create the shared public rooms through the normal channel UI. Every shared room except `#announcements` remains member-postable. The existing announcement channel has `postingRoles: ["staff"]`, so all active members can read it while only the designated staff profile can publish. The production data model and rules also preserve future private-channel support. Every channel document has a `type` (`public` or `private`), numeric `sort`, archive state, name, emoji, description, PM URL, creator, and posting-role restriction. A private channel also carries a `memberIds` list. Channel messages are subcollection documents so a high-volume channel does not grow one unbounded array.

`sort` is mandatory for both public and private channels. The rules validate a numeric `sort` on creates and channel-identity updates preserve it, preventing a channel from silently disappearing from either ordered listener. The shared-room examples use increments of ten so a future room can be inserted between existing ones.

The Firebase adapter does not use an unrestricted channel query. It keeps two snapshots:

1. public channels: `where("type", "==", "public")`, `orderBy("sort", "asc")`;
2. member channels: `where("memberIds", "array-contains", currentUser.uid)`, `orderBy("sort", "asc")`.

It merges them in a map keyed by channel ID, filters archived documents, sorts the merged values client-side, and tears down both listeners together. This preserves private membership authorization while handling a duplicate safely if a document matches both queries. The seed check likewise queries only one public channel, with no ordering requirement.

Two deployed composite indexes support those listeners: `type ASC, sort ASC` and `memberIds CONTAINS, sort ASC`. Firestore Rules are not filters, so the query constraints deliberately match the rule’s public or membership branch.

### Direct messages

A 1:1 conversation ID is deterministic: the two Firebase UIDs are sorted and joined. The conversation stores only participant IDs and last-message metadata. DM messages and replies are subcollections.

The privacy boundary lives in Firestore rules, not in the UI. A browser request must come from a UID listed in `participantIds`; an in-app `admin` or `staff` role is not a bypass. A participant may explicitly include a message snapshot in an abuse report. Firebase Console/IAM project administrators are a separate, privileged backend boundary and are not represented as in-app roles.

### Messages and threads

Messages store sender identity snapshots, text, signal type, optional task metadata, reactions, thread count, and server/client timestamps. Threads are message subcollections to keep root-message queries fast. Reaction updates use Firestore array transforms and rules that permit only reaction/thread metadata changes by non-authors.

The Spark release treats attachment metadata as historical/demo-only display data. New message and reply writes may omit `attachment` or set it to `null`; the Firestore rules deny a non-null attachment payload, and normal edits cannot introduce one. The composer paperclip remains focusable and explains that attachments are unavailable in the free Firebase release. Existing safe direct demo URLs can render, while an old Firebase `storagePath` is shown as unavailable without contacting Storage.

### Notifications

Mentions, DMs, thread replies, and task events create recipient-scoped notification documents. Queries are bounded and indexed by recipient plus creation time. A recipient can read/update/delete only their own notifications.

## Realtime behavior

The current target uses Firestore `onSnapshot` listeners for channels, members, conversations, notifications, the selected message stream, and the open thread. UI subscriptions are torn down when the target changes. Queries are bounded to protect initial load and keep cohort-scale usage predictable.

For a root channel document, the rules use `allow read: if canReadChannelData(resource.data)` without self-fetching the same document, retaining the `memberIds is list` structural check. An additional query-specific `allow list` calls query-compatible `canListChannelData(resource.data)` so the `array-contains` listener can be proven safe by Firestore. Both preserve the public-or-member privacy boundary and use `resource.data`; child messages and replies use `canReadChannel(channelId)` to read the parent channel and apply the direct-read rule. Staff and administrators do not receive a private-channel read bypass.

Presence is intentionally lightweight. The client writes `online`/`away` plus `lastSeenAt` on visibility changes and periodic activity; the UI treats recent timestamps as online. This is appropriate for a 65-person pilot but is not a perfect distributed presence system. A future version could use Realtime Database `onDisconnect` if exact presence becomes operationally important.

## Project-management integration

Relay keeps the PM system authoritative:

1. `config.js` declares the platform name, base URL, and cohort board URL.
2. A channel can carry its own PM URL.
3. Any message can include a normalized task card with title, status, owner/context, provider, and canonical HTTPS URL.
4. The Spark release has no inbound webhook endpoint; external activity is represented through manually shared task cards and canonical PM links.

`firebase.json` has no Functions rewrite in the Spark release. The small webhook mapper remains as deferred source so a future Blaze upgrade can adapt the winning platform's event schema without redesigning the communication UI. Upstream providers must not be configured to send to Relay until that deliberate upgrade is deployed and tested.

This is a deep-link/event integration, not shared-session authentication. Relay captures the GitHub identity fields needed to reconcile users with the PM platform. True cross-domain single sign-on would require both products to trust the same identity broker or Firebase project.

## Scaling notes

The design is sized for the 65-person cohort:

- message streams read the newest 100 documents;
- notification streams read the newest 100 documents;
- conversations are indexed by participant and last-message time;
- channel and thread writes are independent documents;
- search scans bounded recent messages across targets the current user is allowed to read.

The current search strategy favors a dependency-free pilot. For substantially larger history or organizations, add normalized search tokens or a managed full-text engine. A future Blaze upgrade can also add a Cloud Function indexing pipeline, protected Storage uploads, and signed inbound webhooks after dedicated security verification.

## Failure modes

- **Firebase unavailable:** the production UI surfaces an error; the packaged demo remains independently reviewable.
- **OAuth popup blocked:** authentication falls back to redirect mode.
- **OAuth iframe setup:** Hosting CSP permits Firebase Auth's `https://apis.google.com` helper script and its `firebaseapp.com` iframe, so the provider handoff can initialize without broad script permissions.
- **Updated Firebase configuration:** the app shell and `config.js` are served without HTTP caching, its release query changes with a config deployment, and the service worker bypasses the HTTP cache for it; an old placeholder configuration cannot keep overriding the active Firebase project.
- **Open-entry setting missing or closed:** a signed-in GitHub account remains on the pending screen. A Firebase Console/IAM operator must create `settings/workspace` with `accessMode: "open"`; an ordinary client cannot make that change.
- **Missing PM platform:** deep-link UI clearly shows a configuration state rather than inventing a URL.
- **Attachment request:** the Spark UI explains that uploads are unavailable, the adapters reject unexpected upload calls, and Firestore denies new attachment metadata.
- **Inbound webhook:** no `/api` webhook route is deployed on Spark; a future Blaze endpoint must use HMAC/signature verification and replay protections.
- **Unauthorized DM read:** rejected by participant membership rules, including for staff/admin users.
- **Offline shell:** the service worker caches static assets; unsent production message queuing is not claimed.


## Verification boundary

Local behavior and browser evidence are recorded in [QA_REPORT.md](QA_REPORT.md). The package-local Firestore Emulator smoke test is a required pre-production gate. GitHub OAuth, deployed Firestore rules/indexes, two-account realtime/DM isolation, the disabled-attachment affordance, and the 15-client burst remain Spark production checks. Storage uploads and live webhook delivery are deliberately out of scope until a future Blaze upgrade.

## Future Blaze upgrade — deferred

Protected attachments and signed PM/GitHub webhook ingestion remain possible future capabilities, but they are not partially enabled in this release. A billing-backed upgrade must restore Storage/Functions deployment targets and Hosting rewrites together, install Function dependencies, set server-side secrets, re-enable attachment configuration only after its UI/adapter/rule tests pass, and then run attachment and webhook QA. Keeping this boundary explicit avoids a Hosting release that points to absent Functions or a UI that claims file storage it cannot safely provide.
