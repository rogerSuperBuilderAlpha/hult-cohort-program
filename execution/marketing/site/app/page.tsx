import styles from './page.module.css';
import { ParticipantCta } from '@/components/ParticipantCta';
import { SiteHeader } from '@/components/SiteHeader';
import { cohortOrg, cohortOrgUrl } from '@/lib/cohort-config';
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
          { href: '/program', label: 'Journey' },
          { href: '#cost', label: 'Cost' },
          { href: '#faq', label: 'FAQ' },
        ]}
      />

      <section className={styles.hero}>
        <p className={`${styles.eyebrow} animate-in`}>Dare Mighty Things · Fall 2026</p>
        <h1 className={`${styles.headline} animate-in delay-1`}>
          Pay once.<br />
          Ship six production projects.<br />
          <em>Get a job offer</em> — or come back free until you do.
        </h1>
        <p className={`${styles.subhead} animate-in delay-2`}>
          Every skill we teach is verifiable on GitHub. Hiring partners see your work before
          they interview you.
        </p>
        <div className={`${styles.heroActions} animate-in delay-3`}>
          <ParticipantCta />
          <a href={OVERVIEW_URL} className={styles.secondaryBtn}>
            Program overview
          </a>
        </div>
        <div className={`${styles.heroMeta} animate-in delay-4`}>
          <a href={cohortOrgUrl()} target="_blank" rel="noopener noreferrer">
            github.com/{cohortOrg()}
          </a>
          <span>Applications open June 15</span>
          <span>Starts Sep 8</span>
        </div>
      </section>

      <section id="program" className={styles.section}>
        <div className={styles.sectionLabel}>The promise</div>
        <h2 className={styles.sectionTitle}>One fee. Unlimited cohorts until you&apos;re placed.</h2>
        <p className={styles.sectionBody}>
          You pay <strong>$10,000 once</strong>. Complete the program and receive a qualifying
          full-time software job offer — or re-enroll at no extra tuition until you do. Withdraw
          in week 1 for a full refund.
        </p>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Phase 1 · Weeks 2–8</span>
          <h3>Build your cohort&apos;s tool stack</h3>
          <ul>
            <li>Project management platform</li>
            <li>Internal comms platform</li>
            <li>Public showcase for hiring partners</li>
          </ul>
          <p className={styles.phaseNote}>
            Everyone builds. Everyone files written reviews on GitHub. Everyone votes 👍/👎 in
            private. Most thumbs up operates the platform.
          </p>
        </div>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Phase 2 · Weeks 9–16</span>
          <h3>Ship to the world</h3>
          <ul>
            <li>Learning app on Ludwitt/Hult — real users</li>
            <li>Full venture: plan, investors, production app</li>
            <li>Open source merges in major repos</li>
          </ul>
          <p className={styles.phaseNote}>
            Peers judge Phase 1. The market judges Phase 2.
          </p>
        </div>
      </section>

      <section className={styles.skills}>
        <h2>What you walk away with</h2>
        <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>
          Agent-native from day one — apply, file written reviews, and cast votes via the web or
          the cohort MCP server.
        </p>
        <div className={styles.skillGrid}>
          {[
            { n: '01', t: 'GitHub fluency', d: 'Hundreds of reviews, PRs, and merges — all public.' },
            { n: '02', t: 'Distributed teamwork', d: 'Coordinate without direct interaction.' },
            { n: '03', t: 'Verifiable proof', d: 'Hiring partners inspect your trail, not our word.' },
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
              <td>Program tuition (one-time, unlimited cohorts)</td>
              <td>$10,000</td>
            </tr>
            <tr>
              <td>Tooling — Cursor + Claude Code (~4 months)</td>
              <td>~$1,600</td>
            </tr>
            <tr>
              <td>Placement kickback (typical hire)</td>
              <td className={styles.highlight}>~$5,000 back to you</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.costNote}>
          When we place you, you receive 10% of our referral fee — often ~$5,000 on a typical hire.
        </p>
      </section>

      <section id="faq" className={styles.faq}>
        <h2>FAQ</h2>
        <dl>
          <div>
            <dt>Is this a bootcamp?</dt>
            <dd>
              No letter grades. Pass/fail. You build production software your cohort actually uses
              — including the PM tool you track work on.
            </dd>
          </div>
          <div>
            <dt>What if I fail?</dt>
            <dd>Re-enroll free. Unlimited times on your original payment until you&apos;re placed.</dd>
          </div>
          <div>
            <dt>What counts as a qualifying offer?</dt>
            <dd>Full-time software role, $80k+ base, start within 180 days of passing.</dd>
          </div>
          <div>
            <dt>Do I need both Cursor and Claude Code?</dt>
            <dd>Yes. ~$400/mo total. Both required from day 1.</dd>
          </div>
        </dl>
      </section>

      <section id="apply" className={styles.apply}>
        <h2>Admissions</h2>
        <ol className={styles.steps}>
          <li>Short application (15 min)</li>
          <li>48-hour take-home: fix a repo, open a PR</li>
          <li>Decision within 48 hours of your take-home PR</li>
        </ol>
        <p>{cohortSizeLine} · Apply by August 15, 2026</p>
        <ParticipantCta />
      </section>
    </main>
  );
}
