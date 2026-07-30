import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { StudentCard } from '@/components/showcase/StudentCard';
import {
  showcaseNavLinks,
  showcaseNarrative,
  showcasePositioning,
} from '@/content/showcase-vibe';
import { listShowcaseProfiles } from '@/lib/showcase/profile-server';
import styles from './showcase.module.css';

export const revalidate = 60;

export const metadata = {
  title: 'Showcase',
  description:
    'Summer Pilot 2026 vibe marketing showcase — inspect cohort builders on GitHub before you hire.',
  openGraph: {
    title: 'Hult Cohort Showcase · Summer Pilot 2026',
    description: showcasePositioning.oneLiner,
  },
};

export default async function ShowcasePage() {
  const profiles = await listShowcaseProfiles();
  const featured = profiles.filter((p) => !p.isPrivate).slice(0, 6);

  return (
    <main className={styles.main}>
      <SiteHeader links={[...showcaseNavLinks]} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Summer Pilot 2026 · Vibe marketing</p>
        <h1 className={styles.headline}>{showcasePositioning.tagline}</h1>
        <p className={styles.lead}>{showcasePositioning.oneLiner}</p>
        <div className={styles.heroActions}>
          <Link href="/students" className={styles.primaryBtn}>
            Browse builders
          </Link>
          <Link href="/partners" className={styles.secondaryBtn}>
            Hire from this cohort
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured builders</h2>
        <p className={styles.sectionBody}>
          Profiles link to GitHub, merged submission PRs, and live deploys — not résumé bullets.
        </p>
        <div className={styles.grid}>
          {featured.map((profile) => (
            <StudentCard key={profile.handle} profile={profile} />
          ))}
        </div>
        <p className={styles.sectionBody} style={{ marginTop: 24 }}>
          <Link href="/students">View full roster →</Link>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why this cohort</h2>
        <p className={styles.narrative}>{showcaseNarrative}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Live project status</h2>
        <p className={styles.sectionBody}>
          PM integration: read-only snapshot from the cohort platform — updated as submissions merge.
        </p>
        <Link href="/status" className={styles.secondaryBtn}>
          Open status dashboard →
        </Link>
      </section>
    </main>
  );
}
