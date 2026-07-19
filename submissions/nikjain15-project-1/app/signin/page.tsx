import { byActivity } from '@/lib/cohort';
import { buildCohortSnapshot, participantsOnly } from '@/lib/pre-index';
import { SignInLanding, type SignalEvent } from '@/components/SignInLanding';

/**
 * `/signin` — a landing whose job is to earn the GitHub connect.
 *
 * Server component: it reads the cohort's real week from the public repo (no auth, no model,
 * cached 15 min like the landing) and hands the facts to the client form. The hero shows Pulse
 * working on real people before anyone signs in; the form itself stays client-side.
 *
 * Facts only on this page — a handle and a PR number are public record. Nothing here narrates
 * anyone, and the count is read live, never invented.
 */
export const revalidate = 900;

export default async function SignInPage() {
  const snapshot = await buildCohortSnapshot();
  const members = byActivity(participantsOnly(snapshot.members));

  const events: SignalEvent[] = members
    .map((m) => ({ handle: m.handle, pr: m.evidence.prNumbers[m.evidence.prNumbers.length - 1] }))
    .filter((e) => Number.isFinite(e.pr))
    .slice(0, 8);

  return <SignInLanding shipped={members.length} enrolled={snapshot.enrolled} events={events} />;
}
