import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { ActiveProfile, PendingProfile } from '@/components/ProfileView';
import { allHandles, getParticipant } from '@/data/participants';
import { positioning } from '@/data/cohort';

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return allHandles().map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const participant = getParticipant(handle);
  if (!participant) return { title: 'Profile not found' };

  const title =
    participant.status === 'active' ? participant.name : `@${participant.handle} (pending)`;

  return {
    title,
    description: participant.headline,
    openGraph: {
      title: `${title} · Hult Cohort`,
      description: participant.headline,
      url: `${positioning.productionDomain}/p/${participant.handle}`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params;
  const participant = getParticipant(handle);
  if (!participant) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        {participant.status === 'active' ? (
          <ActiveProfile participant={participant} />
        ) : (
          <PendingProfile participant={participant} />
        )}
      </main>
    </>
  );
}
