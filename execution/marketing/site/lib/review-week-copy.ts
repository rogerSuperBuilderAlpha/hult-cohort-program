/** Single source for review-week participant copy. */

export const REVIEW_WEEK_CALLOUT =
  'Evaluate each peer submission, file a written GitHub review on each repository, and optionally add Vote: up in that issue to upvote — or omit it to abstain. There are no downvotes.';

export const REVIEW_WEEK_CALLOUT_ENROLLED = `${REVIEW_WEEK_CALLOUT} Upvotes are public on GitHub. The site shows only your personal review status — not cohort tallies.`;

export const REVIEW_WEEK_CALLOUT_PUBLIC = `${REVIEW_WEEK_CALLOUT} Upvotes are public on GitHub. Cohort tallies are not shown on this site.`;

export const WINNER_SELECTION_PUBLIC =
  'Each participant files a written GitHub review on every other merged submission and may optionally upvote with Vote: up in that issue (or abstain). After review week closes, staff select the submission with the most upvotes. This site does not display live or final vote totals — browse the cohort repositories on GitHub if you want to count them.';

export const WINNER_NOTE =
  'Staff select the submission with the most GitHub upvotes after review week. This site does not display vote totals.';

export const VOTE_NOTE =
  'Upvotes are public on GitHub (Vote: up in your review issue). Abstain by filing the review without that line. There are no downvotes.';

/** Lead paragraph above the numbered how-to on the Peer review tab. */
export const REVIEW_HOW_TO_LEAD =
  'Reviews and optional upvotes happen on GitHub — not as a button on this site. This page only tracks whether we found your review issue. Follow the steps below for every peer with a merged submission.';

export type ReviewHowToStep = {
  title: string;
  body: string;
};

/** Complete participant instructions for filing a review + optional upvote. */
export const REVIEW_HOW_TO_STEPS: ReviewHowToStep[] = [
  {
    title: 'Open one peer from the list below',
    body: 'Expand their card. You will see links to their live deployment and their submission pull request in the cohort repo.',
  },
  {
    title: 'Evaluate the work',
    body: 'Open the deployment and try the product. Read the submission pull request (code, README, Production URL). Take notes for your written review.',
  },
  {
    title: 'Start a GitHub issue on their app repo',
    body: 'Click “File review + optional upvote on GitHub.” That opens GitHub’s New Issue form on their app/build repository (not the cohort monorepo). The title is pre-filled as Review by @{you}: @{peer} — do not change that title; the platform looks for exactly that pattern.',
  },
  {
    title: 'Write the review in the issue body',
    body: 'The body is a template (deployment tested, rubric scores, suggestion, recommendation). Fill it in. Minimum quality bar: a real written review with rubric scores — not a one-line comment.',
  },
  {
    title: 'Choose upvote or abstain',
    body: 'At the bottom of the template is a “Vote (optional)” section with a line that says Vote: up. Keep that exact line on its own line to upvote this peer. Delete the whole Vote section (or that line) to abstain. There are no downvotes. You can edit the issue later to add or remove Vote: up before review week closes.',
  },
  {
    title: 'Submit the issue on GitHub',
    body: 'On GitHub, click “Submit new issue.” You must be signed into GitHub as the same account you use on this site. The issue must be created by you — filing under someone else’s title does not count.',
  },
  {
    title: 'Return here and refresh',
    body: 'Come back to this page and click “Refresh status” on that peer’s card (or reload the page). When the platform finds your issue, the status changes to Reviewed (abstained) or Upvoted. Discovery can take up to about a minute after you submit on GitHub.',
  },
];

/** Compact one-liner still used where a full block does not fit. */
export const REVIEW_HOW_TO = REVIEW_HOW_TO_LEAD;

export const REVIEW_PUBLIC_BLURB =
  'For each peer: evaluate their deployment, read their submission pull request, then open a GitHub issue titled Review by @{you}: @{peer} on their app repo. Optionally keep Vote: up in the issue body to upvote, or delete that section to abstain. Click Submit new issue on GitHub, then return here and refresh. This site shows your personal status only — not cohort tallies.';
