import { readSession } from '@/lib/ludwitt/session';
import { GreenularityDashboard } from '@/components/GreenularityDashboard';
import { EVENT_JOIN_PATH } from '@/lib/site';
import { isEventModeEnabled, isEventWindowOpen } from '@/lib/event/access';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; launched?: string; signin?: string; event?: string }>;
}) {
  const session = await readSession();
  const params = await searchParams;
  const eventLive = isEventModeEnabled() && isEventWindowOpen();
  const authGateHref = session ? null : eventLive ? EVENT_JOIN_PATH : null;

  const sessionProfile = session
    ? {
        email: session.email,
        name: session.name,
        companyName: session.companyName,
        username: session.username,
      }
    : null;

  return (
    <GreenularityDashboard
      sessionProfile={sessionProfile}
      authGateHref={authGateHref}
      eventLive={eventLive}
      error={params.error ?? null}
      launched={params.launched === '1' && Boolean(session)}
    />
  );
}
