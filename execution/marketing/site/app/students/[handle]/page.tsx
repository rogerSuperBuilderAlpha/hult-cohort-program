import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { showcaseNavLinks } from '@/content/showcase-vibe';
import { getProject } from '@/content/program';
import { getShowcaseProfile } from '@/lib/showcase/profile-server';
import styles from '@/app/showcase/showcase.module.css';

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const profile = await getShowcaseProfile(handle);
  if (!profile) return { title: 'Profile not found' };
  return {
    title: profile.displayName,
    description: `${profile.displayName} (@${profile.handle}) — Hult Cohort Summer Pilot 2026 builder profile.`,
    openGraph: {
      title: `${profile.displayName} · Hult Cohort`,
      description: profile.bio ?? `GitHub-visible work from @${profile.handle}.`,
      images: profile.photoUrl ? [{ url: profile.photoUrl }] : undefined,
    },
  };
}

export default async function StudentProfilePage({ params }: Props) {
  const { handle } = await params;
  const profile = await getShowcaseProfile(handle);
  if (!profile) notFound();

  if (profile.isPrivate) {
    return (
      <main className={styles.main}>
        <SiteHeader links={[...showcaseNavLinks]} />
        <section className={styles.hero}>
          <h1 className={styles.headline}>Private profile</h1>
          <p className={styles.lead}>This participant opted out of public marketing.</p>
          <Link href="/students" className={styles.secondaryBtn}>
            ← Back to roster
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <SiteHeader links={[...showcaseNavLinks]} />

      <div className={styles.profileHeader}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photoUrl ?? undefined}
          alt=""
          width={120}
          height={120}
          className={styles.avatar}
        />
        <div className={styles.profileMeta}>
          <h1>{profile.displayName}</h1>
          <p className={styles.handle}>@{profile.handle}</p>
          {profile.campus ? <p className={styles.campus}>{profile.campus}</p> : null}
          <ul className={styles.linkList}>
            <li>
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub →
              </a>
            </li>
            <li>
              <Link href="/partners">Request intro via partners →</Link>
            </li>
          </ul>
        </div>
      </div>

      {profile.bio ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bio</h2>
          <p className={styles.sectionBody}>{profile.bio}</p>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Project evidence</h2>
        <p className={styles.sectionBody}>
          Merged submission PRs and deploy URLs from the cohort monorepo.
        </p>
        {profile.submissions.length === 0 ? (
          <p className={styles.muted}>No merged submissions indexed yet — check GitHub directly.</p>
        ) : (
          <ul className={styles.submissionList}>
            {profile.submissions.map((sub) => {
              const project = getProject(sub.projectSlug);
              return (
                <li key={sub.projectSlug}>
                  <strong>{project?.title ?? sub.projectSlug}</strong>
                  <div className={styles.linkList}>
                    {sub.prUrl ? (
                      <a href={sub.prUrl} target="_blank" rel="noopener noreferrer">
                        Merged PR →
                      </a>
                    ) : null}
                    {sub.deployUrl ? (
                      <a href={sub.deployUrl} target="_blank" rel="noopener noreferrer">
                        Live deploy →
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
