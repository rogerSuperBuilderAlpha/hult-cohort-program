import { redirect } from 'next/navigation';

/**
 * Placeholder root.
 *
 * This is where the landing page goes — the signed-out view that shows a visitor
 * their own week, read from the public cohort repo, before they ever sign up
 * (DESIGN-SPEC §5.0). Until that exists, send people somewhere real rather than
 * leaving create-next-app on the front door.
 */
export default function Home() {
  redirect('/signin');
}
