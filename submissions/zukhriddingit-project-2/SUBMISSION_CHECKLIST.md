# Hult Project 2 submission checklist

## Deadline

Merge by **Sunday, July 26, 2026 at 5:00 PM Eastern Daylight Time**.

## Repository workflow

```bash
git clone https://github.com/rogerSuperBuilderAlpha/hult-cohort-program.git
cd hult-cohort-program
git fetch origin

git switch projects/summer26/phase-1-project-2
git pull --ff-only origin projects/summer26/phase-1-project-2

git switch -c participants/summer26/phase-1-project-2/zukhriddingit
```

Copy the `relay65` project into the submission location expected by the cohort branch. Preserve this README and all configuration/rule files.

```bash
git add .
git commit -m "feat: ship Relay 65 cohort communications platform"
git push -u origin participants/summer26/phase-1-project-2/zukhriddingit
```

Open a pull request with:

- **Title:** `[Project 2] Submission — zukhriddingit`
- **Base:** `projects/summer26/phase-1-project-2`
- **Head:** `participants/summer26/phase-1-project-2/zukhriddingit`
- **Body:** the completed copy in [PR_BODY.md](PR_BODY.md)

## Merge bar

- [x] Production `config.js` has complete Firebase browser configuration, `demoMode: false`, and final Forth PM platform URLs; `npm test` passes.
- [x] The Firestore Emulator channel-rules smoke test in `emulator/` passes (8/8 on July 23, 2026).
- [ ] `attachmentsEnabled: false` is retained in production configuration and the paperclip is verified as unavailable without a file picker.
- [x] Firestore rules/indexes and Hosting were deployed with the Spark command; both required `channels` indexes are enabled.
- [x] A Firebase Console/IAM operator created neutral `settings/workspace` with `accessMode: "open"`; the signed-in GitHub account self-enrolled as an active `member`, was designated `staff`, and the `announcements` channel was made staff-post-only without an access-approval gate.
- [x] Final HTTPS production URL works in a signed-out browser.
- [x] GitHub authentication succeeds on the production domain.
- [x] `Production URL` PR section is filled.
- [x] `PM platform integration notes` PR section is filled.
- [x] `Agent usage` PR section is filled.
- [ ] Exact PR title is used.
- [ ] PR targets the exact project branch.
- [x] Automated checks pass.
- [ ] Pull request is merged before the deadline.

There is no requirement to collect real cohort signups before merge; the product must have the capacity and production setup for the cohort.

## Values you still need to add

1. Live two-account realtime/DM-isolation evidence, including the normal-member `#announcements` denial.
2. The disabled-paperclip browser check.
3. The documented 15-concurrent-participant burst result.
4. Final PR creation and merge evidence.

## Required deployment order

1. Keep Firebase on Spark, configure Firebase web values, GitHub OAuth, and PM URLs; set `attachmentsEnabled: false`; run `npm test` plus `cd emulator && npm install && npm run test:emulator && cd ..`.
2. Deploy with `firebase deploy --only firestore:rules,firestore:indexes,hosting`.
3. In Firestore Console/IAM, create neutral `settings/workspace` with `accessMode: "open"`; sign in on the deployed HTTPS domain to self-enrol as a normal member, then create shared public channels through the member UI. Designate the existing owner profile `staff` and set the channel named `announcements` to `postingRoles: ["staff"]`.
4. Finish two-account realtime/DM-isolation, staff-announcement authorization, disabled-paperclip, PM-link, and 15-client QA.

Do not provision Storage, install Function dependencies, set webhook secrets, or configure inbound webhook delivery for this Spark release. The manifest intentionally contains no Functions rewrite.

## Future Blaze upgrade — not a merge blocker

Protected attachments and inbound PM/GitHub webhooks are intentionally deferred. Their retained `storage.rules` and `functions/` source must be re-enabled only through the documented future upgrade path: restore Storage/Functions manifest targets and webhook rewrites, configure server-side secrets, test the capabilities, and then use the appropriate combined deployment. Do not treat those deferred capabilities as unfinished Spark-release checks.

## Review week

After review week opens, use the cohort site’s **Peer review** tab to open the correct issue form. File each required written review with the exact issue title shown by the program. Keep `Vote: up` only when you intend to give a public upvote; remove that line to abstain. There are no downvotes.
