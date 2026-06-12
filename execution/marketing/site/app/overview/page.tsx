import styles from '../page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Program Overview | Hult Cohort Developer Program',
  description: 'Full program structure for students, partners, and university stakeholders.',
};

export default function OverviewPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>Hult</span>
          <span className={styles.logoSub}>Cohort</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/#apply" className={styles.navCta}>
            Apply
          </Link>
        </nav>
      </header>

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Program overview · Fall 2026</p>
        <h1 className={styles.sectionTitle}>One semester. Two phases. GitHub-native throughout.</h1>

        <section className={styles.overviewBlock}>
          <h2>The outcome</h2>
          <p>
            Students enroll, complete six production projects, and receive a qualifying job offer —
            or re-enroll at no extra tuition until they do. Every skill leaves a public GitHub trail
            hiring partners can verify independently.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Phase 1 · Weeks 2–8 · Internal</h2>
          <p>Each cohort builds its own tool stack. Same loop three times:</p>
          <ol>
            <li>Everyone builds a production deployment</li>
            <li>Everyone reviews everyone (~29 reviews per project)</li>
            <li>The cohort votes; the winner operates the live platform</li>
            <li>Everyone else engages as developer/users (PRs, issues, QA)</li>
          </ol>
          <ul>
            <li><strong>Project 1:</strong> Project management platform</li>
            <li><strong>Project 2:</strong> Internal comms platform</li>
            <li><strong>Project 3:</strong> Public showcase for hiring partners</li>
          </ul>
          <p>
            Three winners unify their platforms and each draft 10% of the cohort for leadership
            teams — 12 of 30 students in recognized operator roles.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Phase 2 · Weeks 9–16 · External</h2>
          <ul>
            <li><strong>Learning app</strong> on Ludwitt/Hult — success = external users</li>
            <li><strong>Venture</strong> — business plan, investor materials, production app</li>
            <li><strong>Open source</strong> — merged PRs in major repos (continuous)</li>
          </ul>
          <p>Judges escalate: peers → users → investors → maintainer communities of strangers.</p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>For hiring partners</h2>
          <ul>
            <li>Review public work from week 8 via cohort showcase</li>
            <li>Week 16 hiring showcase (hybrid, Boston anchor)</li>
            <li>25% referral fee on hire; 90-day clawback; no exclusivity</li>
            <li>10% of fee paid back to the candidate</li>
          </ul>
          <p>
            Contact: cohort@hult.edu · Partner materials in program repo{' '}
            <code>execution/partners/</code>
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Economics</h2>
          <table className={styles.costTable}>
            <tbody>
              <tr>
                <td>Tuition (one-time, unlimited cohorts)</td>
                <td>$10,000</td>
              </tr>
              <tr>
                <td>Student tooling (~4 months)</td>
                <td>~$1,600</td>
              </tr>
              <tr>
                <td>Typical placement referral (program)</td>
                <td>~$45,000</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Timeline</h2>
          <p>
            <strong>Start:</strong> September 8, 2026 · <strong>Showcase:</strong> December 19, 2026
          </p>
          <p>
            Full calendar: program documentation <code>operations/calendar.md</code>
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

      <footer className={styles.footer}>
        <p>Full proposal available to university stakeholders on request.</p>
      </footer>
    </main>
  );
}
