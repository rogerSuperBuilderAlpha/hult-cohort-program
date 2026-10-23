import Link from 'next/link';
import { EducatorPilotCta } from '@/components/EducatorPilotCta';
import { ParticipantCta } from '@/components/ParticipantCta';
import { PageFrame } from '@/components/PageFrame';
import { RunsOnLudwitt } from '@/components/RunsOnLudwitt';
import styles from '../page.module.css';
import { cohortMarketing } from '@/content/program';
import { formatPeerReviewsPerProject } from '@/lib/cohort-stats-format';
import { metadataForPath } from '@/lib/page-metadata';

export const metadata = metadataForPath('/overview');

export default function OverviewPage() {
  const peerReviewLine = formatPeerReviewsPerProject();
  const operators = 'roughly 10% of the cohort per winning platform';

  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>Stakeholder overview · Fall 2026</p>
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
            Fall 2026 is open-access—formal academic credit and certificates are deferred.
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
              <strong>Week 4:</strong> Learning engineer integration to Ludwitt — a registered, working, instrumented app
            </li>
            <li>
              <strong>Week 5:</strong> Startup / entrepreneurship — deck, plan, production app
            </li>
            <li>
              <strong>Week 6:</strong> Open source swarm — merged upstream contribution
            </li>
          </ul>
        </section>

        <RunsOnLudwitt layout="overview" />

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
            <strong>Start:</strong> {cohortMarketing.cohortStart} at 09:00 Eastern Time ·{' '}
            <strong>Showcase:</strong> {cohortMarketing.showcase}
          </p>
        </section>

        <div className={styles.heroActions}>
          <ParticipantCta />
          <EducatorPilotCta />
          <Link href="/start" className={styles.secondaryBtn}>
            Student intro
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}
