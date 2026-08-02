import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { ProfileView } from '@/components/ProfileView';
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

  const isPrivate = participant.privacy === 'private';

  return {
    title: isPrivate ? `${participant.displayName} (private)` : participant.displayName,
    description: isPrivate
      ? 'Private profile — enrolled participant opted out of public bio.'
      : participant.headline,
    openGraph: {
      title: `${participant.displayName} · Hult Cohort`,
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
        <ProfileView participant={participant} />
        <p className="mt-12 text-sm text-ceal-muted">
          Cohort peers reviewing this showcase:{' '}
          <Link href="/vote" className="text-ceal-leaf underline focus-ring rounded">
            vote link →
          </Link>
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
