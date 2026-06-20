import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../page.module.css';
import {
  getCohortStats,
} from '@/lib/cohort-stats-server';
import {
  formatPeerReviewsPerProject,
  operatorRoleCount,
} from '@/lib/cohort-stats-format';

export const metadata = {
  title: 'Program Overview | Hult Cohort Developer Program',
  description:
    'Program structure, assessment model, and timeline for students, hiring partners, and university stakeholders.',
};

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const cohortStats = await getCohortStats();
  const peerReviewLine = formatPeerReviewsPerProject(cohortStats);
  const operators =
    cohortStats.enrolledCount > 0
      ? `${operatorRoleCount(cohortStats.enrolledCount)} of ${cohortStats.enrolledCount} students`
      : 'roughly 30% of the cohort';

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Program overview · Fall 2026</p>
        <h1 className={styles.sectionTitle}>
          One semester. Two phases. Work verified on GitHub.
        </h1>

        <section className={styles.overviewBlock}>
          <h2>Program outcome</h2>
          <p>
            Participants enroll, complete six production projects, and receive a qualifying job
            offer — or re-enroll at no additional tuition until they do. All work is recorded on
            GitHub, providing hiring partners with an independently verifiable record of each
            participant&apos;s contributions.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Phase 1 · Weeks 2–8 · Internal</h2>
          <p>
            Each cohort develops its own internal tool stack through three sequential projects.
            The assessment cycle repeats for each project:
          </p>
          <ol>
            <li>Each participant builds and deploys a production application.</li>
            <li>
              Each participant files a written GitHub review on every peer submission (
              {peerReviewLine}).
            </li>
            <li>
              Each participant casts a private vote. The submission with the most votes operates
              the platform for the cohort.
            </li>
            <li>
              Participants who do not win contribute as developers and users on the winning
              platform through pull requests, issues, and quality assurance.
            </li>
          </ol>
          <ul>
            <li><strong>Project 1:</strong> Project management platform</li>
            <li><strong>Project 2:</strong> Internal communications platform</li>
            <li><strong>Project 3:</strong> Public showcase for hiring partners</li>
          </ul>
          <p>
            The three winning platforms are unified into a single ecosystem. Each winning team
            selects approximately 10% of the cohort for operator roles — {operators} in
            recognized leadership positions.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Phase 2 · Weeks 9–16 · External</h2>
          <ul>
            <li>
              <strong>Learning application</strong> — registered on the Ludwitt/Hult platform;
              success measured by external users
            </li>
            <li>
              <strong>Venture</strong> — business plan, investor materials, and production
              application
            </li>
            <li>
              <strong>Open source</strong> — merged pull requests in established repositories
              (continuous throughout Phase 2)
            </li>
          </ul>
          <p>
            Assessment criteria escalate across phases: peer review in Phase 1, then external users,
            investors, and upstream maintainers in Phase 2.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>For hiring partners</h2>
          <ul>
            <li>Review public work from week 8 via the cohort showcase platform</li>
            <li>Week 16 hiring showcase (hybrid format; Boston anchor campus)</li>
            <li>25% referral fee on hire; 90-day clawback; no exclusivity requirement</li>
            <li>10% of the referral fee paid to the placed candidate</li>
          </ul>
          <p>
            Contact:{' '}
            <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>. Partner materials are available
            upon request.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Economics</h2>
          <table className={styles.costTable}>
            <tbody>
              <tr>
                <td>Tuition (one-time; re-enrollment at no additional cost)</td>
                <td>$10,000</td>
              </tr>
              <tr>
                <td>Student tooling (~4 months)</td>
                <td>~$1,600</td>
              </tr>
              <tr>
                <td>Typical placement referral (program revenue from hiring partners)</td>
                <td>~$45,000</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Timeline</h2>
          <p>
            <strong>Program start:</strong> September 8, 2026 ·{' '}
            <strong>Hiring showcase:</strong> December 19, 2026
          </p>
          <p>
            A detailed academic calendar is provided to enrolled participants at orientation.
          </p>
        </section>

        <div className={styles.heroActions}>
          <Link href="/#apply" className={styles.primaryBtn}>
            Apply for Fall 2026
          </Link>
          <Link href="/" className={styles.secondaryBtn}>
            Back to home
          </Link>
        </div>
      </article>
    </main>
  );
}
