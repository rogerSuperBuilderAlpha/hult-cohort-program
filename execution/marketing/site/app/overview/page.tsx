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

export const revalidate = 60;

export default async function OverviewPage() {
  const cohortStats = await getCohortStats();
  const peerReviewLine = formatPeerReviewsPerProject();
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
          { href: '/program', label: 'Program' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Stakeholder overview · Summer Pilot 2026</p>
        <h1 className={styles.sectionTitle}>Open community program · production software pilot</h1>
        <p className={styles.overviewLead}>
          For a quick visual map, send participants to{' '}
          <Link href="/start">What is this program?</Link>. This page is a longer summary for faculty
          and partners.
        </p>

        <section className={styles.overviewBlock}>
          <h2>Outcome</h2>
          <p>
            Participants complete six weekly deliverables by building, deploying, reviewing, and
            operating production-grade software. Assessment is pass/fail on published criteria.
            Summer Pilot 2026 is open-access—formal academic credit and certificates are deferred.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Weeks 1–3 · Contests</h2>
          <ol>
            <li>Each participant builds and deploys a production application.</li>
            <li>
              Written technical review on every peer submission ({peerReviewLine}).
            </li>
            <li>
              Optional public upvotes on GitHub (or abstain) determine which system operates for the
              cohort — tallies are not shown on this site.
            </li>
            <li>Non-winners contribute to the selected platform through review, QA, and follow-on changes.</li>
          </ol>
          <ul>
            <li>
              <strong>Week 1:</strong> Project management platform
            </li>
            <li>
              <strong>Week 2:</strong> Internal communications platform
            </li>
            <li>
              <strong>Week 3:</strong> Vibe marketing platform
            </li>
          </ul>
          <p>Operator roles (~10% each winning platform): {operators}.</p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Weeks 4–6 · External sprints</h2>
          <ul>
            <li>
              <strong>Week 4:</strong> Learning engineer integration to Ludwitt — verified external users
            </li>
            <li>
              <strong>Week 5:</strong> Startup / entrepreneurship — deck, plan, production app
            </li>
            <li>
              <strong>Week 6:</strong> Open source swarm — merged upstream contribution
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>For hiring partners</h2>
          <ul>
            <li>Vibe marketing platform ships in week 3</li>
            <li>End-of-pilot hiring showcase (Boston anchor)</li>
            <li>Review deployed systems, technical documentation, and contribution history directly</li>
          </ul>
          <p>
            Contact: <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Timeline</h2>
          <p>
            <strong>Start:</strong> July 13, 2026 at 09:00 Eastern Time · <strong>Showcase:</strong>{' '}
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
