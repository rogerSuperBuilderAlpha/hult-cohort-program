import Link from 'next/link';
import styles from './page.module.css';
import { ParticipantCta } from '@/components/ParticipantCta';
import { ApplySectionSignup } from '@/components/ApplySectionSignup';
import { SiteHeader } from '@/components/SiteHeader';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { formatCohortSizeLine } from '@/lib/cohort-stats-format';
import { cohortMarketing } from '@/content/program';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cohortStats = await getCohortStats();
  const cohortSizeLine = formatCohortSizeLine(cohortStats);

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/start', label: 'What is this?' },
          { href: '/program', label: 'Program' },
        ]}
      />

      <section className={styles.hero}>
        <p className={`${styles.eyebrow} animate-in`}>Open community · Summer 2026</p>
        <h1 className={`${styles.headline} animate-in delay-1`}>
          Build the software your<br />
          cohort actually runs on.
        </h1>
        <p className={`${styles.subhead} animate-in delay-2`}>
          A six-week, open-access community program. You build real applications in the frameworks
          and workflows professional engineering teams use—and the strongest builds go into
          production for the whole cohort to use.
        </p>
        <div className={`${styles.heroActions} animate-in delay-3`}>
          <ParticipantCta />
          <Link href="/start" className={styles.secondaryBtn}>
            How it works
          </Link>
        </div>
        <div className={`${styles.heroMeta} animate-in delay-4`}>
          <span>Starts {cohortMarketing.cohortStart}</span>
          <span>Six weeks</span>
          <span>Applications open {cohortMarketing.applicationsOpen.replace(', 2026', '')}</span>
        </div>
      </section>

      <section id="program" className={styles.section}>
        <div className={styles.sectionLabel}>How the six weeks work</div>
        <h2 className={styles.sectionTitle}>
          You build the tools, then the best ones go live.
        </h2>
        <p className={styles.sectionBody}>
          Weeks 1–3 are contests: project management, internal communications, then vibe marketing.
          Everyone reviews every submission, and a private vote decides which build the cohort adopts
          and operates.
        </p>
        <p className={styles.sectionBody}>
          Weeks 4–6 go external, one week each: Ludwitt learning integration, a startup venture
          package, then an open-source swarm contribution.
        </p>
        <p className={styles.sectionBody}>
          <Link href="/start">See the full week-by-week breakdown →</Link>
        </p>
      </section>

      <section id="journey" className={styles.gridSection}>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>What you build</span>
          <h3>Working products, deployed and used</h3>
          <ul>
            <li>Live applications running over HTTPS, not slide decks</li>
            <li>Real accounts, data, and deadlines for the whole cohort</li>
            <li>Setup docs and known limitations, written for the next engineer</li>
          </ul>
        </div>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>How you&apos;re judged</span>
          <h3>Reviewed like a real engineering team</h3>
          <p className={styles.phaseNote}>
            You read your peers&apos; code, test their deployments, and write technical reviews
            before voting. Pass criteria are published before every project—no surprises, no
            participation trophies.
          </p>
        </div>
      </section>

      <section id="apply" className={styles.apply}>
        <p className={styles.sectionLabel}>Applications</p>
        <h2>Summer 2026 is open.</h2>
        <p>{cohortSizeLine} · Starts {cohortMarketing.cohortStart} · Apply by {cohortMarketing.applicationDeadline.replace(', 2026', '')}</p>
        <ApplySectionSignup />
      </section>
    </main>
  );
}
