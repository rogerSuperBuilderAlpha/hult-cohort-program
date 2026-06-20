import styles from './page.module.css';
import { ParticipantCta } from '@/components/ParticipantCta';
import { SiteHeader } from '@/components/SiteHeader';
import { cohortSubmissionRepo } from '@/lib/cohort-config';
import { cohortRepoUrl } from '@/lib/github-urls';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { formatCohortSizeLine } from '@/lib/cohort-stats-format';

const OVERVIEW_URL = process.env.NEXT_PUBLIC_OVERVIEW_URL || '/overview';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cohortStats = await getCohortStats();
  const cohortSizeLine = formatCohortSizeLine(cohortStats);

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '#program', label: 'Program' },
          { href: '#journey', label: 'Journey' },
          { href: '#cost', label: 'Cost' },
          { href: '#faq', label: 'FAQ' },
        ]}
      />

      <section className={styles.hero}>
        <p className={`${styles.eyebrow} animate-in`}>Hult Cohort Developer Program · Fall 2026</p>
        <h1 className={`${styles.headline} animate-in delay-1`}>
          A one-semester developer cohort<br />
          evaluated on verifiable work.
        </h1>
        <p className={`${styles.subhead} animate-in delay-2`}>
          Participants complete six production projects across sixteen weeks. Every contribution is
          recorded publicly on GitHub, giving hiring partners independent evidence of engineering
          ability.
        </p>
        <div className={`${styles.heroActions} animate-in delay-3`}>
          <ParticipantCta />
          <a href={OVERVIEW_URL} className={styles.secondaryBtn}>
            Program overview
          </a>
        </div>
        <div className={`${styles.heroMeta} animate-in delay-4`}>
          <a href={cohortRepoUrl()} target="_blank" rel="noopener noreferrer">
            github.com/{cohortSubmissionRepo()}
          </a>
          <span>Applications open June 15, 2026</span>
          <span>Program begins September 8, 2026</span>
        </div>
      </section>

      <section id="program" className={styles.section}>
        <div className={styles.sectionLabel}>Program structure</div>
        <h2 className={styles.sectionTitle}>Tuition, completion, and placement</h2>
        <p className={styles.sectionBody}>
          Tuition is <strong>$10,000</strong>, paid once. Participants who complete the program and
          receive a qualifying full-time software job offer satisfy the placement requirement.
          Those who do not may re-enroll at no additional tuition until placement is achieved. A
          full refund is available if you withdraw during week 1.
        </p>
      </section>

      <section id="journey" className={styles.gridSection}>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Phase 1 · Weeks 2–8</span>
          <h3>Internal platform development</h3>
          <ul>
            <li>Project management platform</li>
            <li>Internal communications platform</li>
            <li>Public showcase for hiring partners</li>
          </ul>
          <p className={styles.phaseNote}>
            Each participant builds and deploys a production application. During review week,
            participants file written GitHub reviews on every peer submission and cast a private
            vote. The submission with the most votes operates the platform for the cohort.
          </p>
        </div>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Phase 2 · Weeks 9–16</span>
          <h3>External validation</h3>
          <ul>
            <li>Learning application with external users</li>
            <li>Startup venture: business plan, investor materials, production application</li>
            <li>Open-source contribution to established repositories</li>
          </ul>
          <p className={styles.phaseNote}>
            Phase 1 is evaluated by peers. Phase 2 is evaluated by users, investors, and upstream
            maintainers.
          </p>
        </div>
      </section>

      <section className={styles.skills}>
        <h2>Program outcomes</h2>
        <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>
          The program is conducted entirely through GitHub: submissions, peer reviews, and progress
          tracking. Participants may also interact with the platform through the cohort MCP server.
        </p>
        <div className={styles.skillGrid}>
          {[
            {
              n: '01',
              t: 'Version control proficiency',
              d: 'Sustained practice with pull requests, code review, and merge workflows.',
            },
            {
              n: '02',
              t: 'Distributed collaboration',
              d: 'Coordination across asynchronous, repository-based workflows.',
            },
            {
              n: '03',
              t: 'Verifiable portfolio',
              d: 'A public record of work that hiring partners can inspect independently.',
            },
          ].map((s) => (
            <article key={s.n} className={styles.skillCard}>
              <span className={styles.skillNum}>{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cost" className={styles.cost}>
        <h2>Cost of attendance</h2>
        <table className={styles.costTable}>
          <tbody>
            <tr>
              <td>Program tuition (one-time; re-enrollment at no additional cost)</td>
              <td>$10,000</td>
            </tr>
            <tr>
              <td>Required tooling — Cursor and Claude Code (~4 months)</td>
              <td>~$1,600</td>
            </tr>
            <tr>
              <td>Candidate placement payment (typical hire)</td>
              <td className={styles.highlight}>~$5,000</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.costNote}>
          When a participant is placed through a hiring partner, 10% of the program&apos;s referral
          fee is paid to the candidate — typically approximately $5,000.
        </p>
      </section>

      <section id="faq" className={styles.faq}>
        <h2>Frequently asked questions</h2>
        <dl>
          <div>
            <dt>How is the program assessed?</dt>
            <dd>
              Assessment is pass/fail. There are no letter grades. Participants build production
              software that the cohort uses throughout the semester, including the project
              management platform used to track work.
            </dd>
          </div>
          <div>
            <dt>What happens if I do not pass?</dt>
            <dd>
              You may re-enroll at no additional tuition on your original payment until you receive
              a qualifying placement.
            </dd>
          </div>
          <div>
            <dt>What qualifies as a placement offer?</dt>
            <dd>
              A full-time software engineering role with a base salary of $80,000 or more, with a
              start date within 180 days of program completion.
            </dd>
          </div>
          <div>
            <dt>What tooling is required?</dt>
            <dd>
              Cursor and Claude Code are required from week 1, at a combined cost of approximately
              $400 per month.
            </dd>
          </div>
        </dl>
      </section>

      <section id="apply" className={styles.apply}>
        <h2>Admissions</h2>
        <ol className={styles.steps}>
          <li>Complete the application form</li>
          <li>Complete the 48-hour take-home: repair a repository and submit a pull request</li>
          <li>Receive a decision within 48 hours of your take-home pull request</li>
        </ol>
        <p>{cohortSizeLine} · Application deadline: August 15, 2026</p>
        <ParticipantCta />
      </section>
    </main>
  );
}
