# Cohort-capacity test plan

The automated suite verifies product behavior but does not claim a real 15-account production load test before Firebase credentials exist. Use this lightweight plan on the deployed project to produce honest submission evidence.

## Goal

Demonstrate that at least 15 concurrent authenticated participants can send and receive channel messages with a responsive UI, no authorization errors, and delivery comfortably inside the program’s two-second target.

## Setup

1. Create 15 GitHub-authenticated member accounts or recruit 15 cohort participants.
2. Use three device/browser groups: desktop Chromium, mobile Safari/Chrome, and a second desktop browser.
3. Open `#ship-room` on every client.
4. Open browser developer tools on three observer clients and enable Preserve log.
5. Record the Firebase project’s Firestore usage dashboard before the run.

## Burst script

At a synchronized countdown:

1. Each participant sends `BURST-1 @<next-person-handle> <local timestamp>`.
2. Five participants react to a different burst message.
3. Five participants open a thread and add one reply.
4. Five participant pairs send a 1:1 DM.
5. Every participant searches for `BURST-1`.

Repeat as `BURST-2` after one minute.

## Evidence to capture

- A screen recording or timestamped screenshots from two observers.
- Median and worst observed send-to-render delay for at least 30 channel sends.
- Count of failed/duplicated/missing messages.
- Console errors and permission-denied errors.
- Firestore reads/writes during the test.
- Mobile composer and scrolling behavior under message arrival.

Use this table in the PR or a linked note:

| Metric | Result |
|---|---|
| Concurrent authenticated clients | ___ |
| Channel sends observed | ___ |
| Median delivery | ___ ms |
| Slowest delivery | ___ ms |
| Failed or missing sends | ___ |
| Duplicate renders | ___ |
| Permission errors | ___ |
| Search successful on all clients | Yes / No |

## Acceptance

- 15 concurrent clients complete the script.
- No message is lost or duplicated.
- Median delivery is under two seconds.
- DMs remain visible only to their two participants.
- The app remains usable on the smallest tested mobile viewport.
