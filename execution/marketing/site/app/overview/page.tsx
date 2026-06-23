import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../page.module.css';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { formatPeerReviewsPerProject, operatorRoleCount } from '@/lib/cohort-stats-format';

export const metadata = {
  title: 'Program Overview | Hult Cohort',
  description:
    'Stakeholder summary: six-week Summer Pilot structure, production software outcomes, and July 2026 timeline.',
};

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const cohortStats = await getCohortStats();
  const peerReviewLine = formatPeerReviewsPerProject(cohortStats);
  const operators =
    cohortStats.enrolledCount > 0
      ? `${operatorRoleCount(cohortStats.enrolledCount)} of ${cohortStats.enrolledCount} students`
      : 'roughly 10% of the cohort per winning platform';

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/', label: 'Home' },
          { href: '/start', label: 'Visual intro' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Stakeholder overview · Summer Pilot 2026</p>
        <h1 className={styles.sectionTitle}>CS for Business elective · production software pilot</h1>
        <p className={styles.overviewLead}>
          For a quick visual map, send students to{' '}
          <Link href="/start">What is this program?</Link>. This page is a longer summary for faculty
          and partners.
        </p>

        <section className={styles.overviewBlock}>
          <h2>Outcome</h2>
          <p>
            Participants complete eight tracked deliverables by building, deploying, reviewing, and
            operating production-grade software. Assessment is pass/fail on published criteria;
            credit follows degree enrollment.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Phase 1 · Weeks 2–5</h2>
          <ol>
            <li>Each participant builds and deploys a production application.</li>
            <li>
              Written technical review on every peer submission ({peerReviewLine}).
            </li>
            <li>
              Private votes after each review determine which system operates for the cohort.
            </li>
            <li>Non-winners contribute to the selected platform through review, QA, and follow-on changes.</li>
          </ol>
          <ul>
            <li>
              <strong>Project 1:</strong> Project management platform
            </li>
            <li>
              <strong>Project 2:</strong> Internal communications platform
            </li>
            <li>
              <strong>Project 3:</strong> Public showcase
            </li>
          </ul>
          <p>
            Winners unify the three platforms. Operator roles (~10% each): {operators}.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Final sprint · Week 6</h2>
          <ul>
            <li>
              <strong>Learning app</strong> — Ludwitt/Hult metrics; external users
            </li>
            <li>
              <strong>Venture</strong> — plan, materials, production app
            </li>
            <li>
              <strong>Open source</strong> — accepted upstream contribution
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>For hiring partners</h2>
          <ul>
            <li>Public showcase built in week 4 and unified in week 5</li>
            <li>Week 6 hiring showcase (Boston anchor)</li>
            <li>Review deployed systems, technical documentation, and contribution history directly</li>
          </ul>
          <p>
            Contact: <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Timeline</h2>
          <p>
            <strong>Start:</strong> July 9, 2026 at 09:00 Eastern Time · <strong>Showcase:</strong>{' '}
            August 19, 2026
          </p>
        </section>

        <div className={styles.heroActions}>
          <Link href="/apply" className={styles.primaryBtn}>
            Apply
          </Link>
          <Link href="/start" className={styles.secondaryBtn}>
            Student intro
          </Link>
        </div>
      </article>
    </main>
  );
}
