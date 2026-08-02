import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { PartnerIntroForm } from '@/components/showcase/PartnerIntroForm';
import { showcaseNavLinks } from '@/content/showcase-vibe';
import { listShowcaseHandles } from '@/lib/showcase/profile-server';
import styles from '@/app/showcase/showcase.module.css';

export const revalidate = 300;

export const metadata = {
  title: 'Hiring partners',
  description:
    'Hire from the Hult Cohort Summer Pilot 2026 — browse GitHub evidence, request intros, transparent fee model.',
};

export default async function PartnersPage() {
  const handles = await listShowcaseHandles();

  return (
    <main className={styles.main}>
      <SiteHeader links={[...showcaseNavLinks]} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>For hiring partners</p>
        <h1 className={styles.headline}>Evaluate on GitHub. Pay on hire.</h1>
        <p className={styles.lead}>
          Browse deployed systems, read peer reviews, and request introductions to specific builders.
          No exclusivity — you interview on your timeline.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How hiring works</h2>
        <ol className={styles.sectionBody}>
          <li>Review profiles and live project status on this showcase.</li>
          <li>Request an intro below — placement lead coordinates async portfolio review.</li>
          <li>Run your interview process; hire on your terms.</li>
          <li>Referral fee (~25% first-year base) due on start date with 90-day clawback.</li>
        </ol>
        <div className={styles.feeCard}>
          <strong>Commercial terms (summary)</strong>
          <ul>
            <li>~25% of first-year base salary on successful hire</li>
            <li>90-day clawback if candidate leaves early</li>
            <li>10% candidate kickback — aligned incentives</li>
            <li>No exclusivity; multiple partners may engage the cohort</li>
          </ul>
          <p className={styles.muted} style={{ marginTop: 12 }}>
            Full partner docs:{' '}
            <code>participants/summer26/phase-1-project-3/ryanroper79-alt/PARTNERS.md</code> in the
            cohort repo
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Request intro</h2>
        <p className={styles.sectionBody}>
          Submissions notify the placement lead ({process.env.PLACEMENT_NOTIFY_EMAIL?.trim() || 'cohort@hult.edu'}).
        </p>
        <PartnerIntroForm handles={handles} />
      </section>

      <section className={styles.section}>
        <p className={styles.sectionBody}>
          <Link href="/students">Browse all builder profiles →</Link>
        </p>
      </section>
    </main>
  );
}
