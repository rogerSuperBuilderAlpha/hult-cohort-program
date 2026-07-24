# Submission pull request

**Title — use exactly:**

```text
[Project 2] Submission — zukhriddingit
```

**Base branch:** `projects/summer26/phase-1-project-2`
**Head branch:** `participants/summer26/phase-1-project-2/zukhriddingit`

Copy the body below and replace only the clearly marked placeholders.

```markdown
## Summary
Shipped **Relay 65**, an async-first, realtime communications home for the Summer Pilot 2026 cohort. It includes frictionless GitHub-only entry, member-created shared channels, a staff-post-only `#announcements` channel, future-ready private-channel authorization, private 1:1 DMs, threads, reactions, presence, notifications, cross-workspace search, saved messages, moderation reports, PWA support, and PM-task deep links/cards. The product is sized for the 65-person cohort and includes a persistent reviewer demo.

This release uses Firebase Spark core (Authentication, Firestore, and Hosting) with no billing requirement. The composer keeps a visible disabled paperclip that explains attachments are unavailable; protected uploads and inbound PM/GitHub webhooks are intentionally deferred to a future Blaze upgrade.

## Production URL
https://vera-ae3af.web.app

## PM platform integration notes
Relay 65 integrates with **Forth** at **https://forth-bice.vercel.app/**; the same URL is the configured cohort board through:
- channel-level Forth board deep links, including the `ship-room` project card;
- task cards in messages with title, status, assignee, and canonical task URL;
- GitHub handle and verified-email profile metadata so the same participant identity can be reconciled with the PM platform.

The Spark release does not expose inbound `/api/pm-webhook` or `/api/github-webhook` endpoints. The retained webhook mapper is future Blaze-upgrade source only; restore and test its Functions target, hosting rewrites, secrets, and signature verification before configuring an upstream sender.

## Agent usage
- **Research:** Reviewed the Hult Week 2 brief, repository requirements, rubric, operator guidance, Firebase GitHub Auth documentation, and Firestore realtime/security patterns.
- **Dev:** Designed and implemented the Relay 65 frontend, demo and Firebase adapters, GitHub OAuth flow (including the narrowly scoped Firebase Auth CSP helper allowance and configuration-cache invalidation), Firestore rules, dual rule-compatible channel listeners/indexes, Spark-only Hosting manifest, disabled attachment affordance, responsive visual system, PWA, documentation, and test suite.
- **QA:** Passed **24/24 dependency-free root tests** and **8/8 Firestore Emulator security checks**. Spark-only Firestore rules/indexes/Hosting deployment, live Firebase Hosting, GitHub OAuth, Firestore open entry, normal-member enrollment, a designated staff profile, six shared channels, and Forth board/task-card integration are verified at `https://vera-ae3af.web.app`. Two-account realtime/privacy and load remain to be run.

## Test plan
- [x] Final `npm test` output is recorded in `QA_REPORT.md` (24/24)
- [x] Expanded Firestore Emulator smoke test (8/8)
- [x] Fresh local launch with no frontend dependencies
- [x] Demo login and seeded multi-user workspace
- [x] Public channel create/edit/archive flows
- [x] Channel messages, signal types, reactions, threads, and search
- [x] 1:1 DM creation and messaging
- [x] Mentions, activity center, saved messages, and task cards
- [x] Responsive desktop/mobile layout and keyboard command palette
- [x] Spark manifest/config/rules validation: no Storage/Functions target, no webhook rewrite, disabled paperclip, and attachment-write denial
- [x] Firebase Auth Hosting CSP permits the required Google API iframe helper without broad script permissions
- [x] Firebase configuration cannot remain on a stale placeholder cache after a Hosting deployment
- [x] Live GitHub OAuth and open member enrollment on `https://vera-ae3af.web.app`
- [x] Shared public channels created by a normal member; the designated staff profile is the only poster in `#announcements`, without an access-approval gate
- [x] Firestore Emulator: public/member queries allowed; open-entry gate, staff-only announcement posting, private child/DM isolation, and attachment-bearing write denial
- [x] Firestore rules/indexes/Hosting deployment confirmation; both required `channels` indexes are enabled
- [ ] Two-browser Firestore realtime and DM-isolation smoke test
- [x] Final Forth board URL/task-card verification
```

Attachments and inbound webhook delivery are not pending Spark-release items; they belong only in a future Blaze upgrade.
