import Link from 'next/link';
import styles from './page.module.css';
import { ParticipantCta } from '@/components/ParticipantCta';
import { ApplySectionSignup } from '@/components/ApplySectionSignup';
import { SiteHeader } from '@/components/SiteHeader';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { formatCohortSizeLine } from '@/lib/cohort-stats-format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cohortStats = await getCohortStats();
  const cohortSizeLine = formatCohortSizeLine(cohortStats);

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/start', label: 'What is this?' },
          { href: '/program', label: 'Projects' },
          { href: '#apply', label: 'Apply' },
        ]}
      />

      <section className={styles.hero}>
        <p className={`${styles.eyebrow} animate-in`}>CS for Business · Summer Pilot 2026</p>
        <h1 className={`${styles.headline} animate-in delay-1`}>
          Build software that has to work.
        </h1>
        <p className={`${styles.subhead} animate-in delay-2`}>
          A for-credit pilot where students design, ship, review, and operate production systems
          under the same expectations used by professional engineering teams.
        </p>
        <div className={`${styles.heroActions} animate-in delay-3`}>
          <ParticipantCta />
          <Link href="/start" className={styles.secondaryBtn}>
            What is this program?
          </Link>
        </div>
        <div className={`${styles.heroMeta} animate-in delay-4`}>
          <span>Production deployment</span>
          <span>Technical review</span>
          <span>Operational ownership</span>
          <span>Applications open June 15, 2026</span>
          <span>Program begins July 9, 2026 at 09:00 Eastern Time</span>
        </div>
      </section>

      <section id="program" className={styles.section}>
        <div className={styles.sectionLabel}>At a glance</div>
        <h2 className={styles.sectionTitle}>Six weeks inside a professional delivery loop</h2>
        <p className={styles.sectionBody}>
          <strong>Weeks 2–5:</strong> participants build project management, communications, and
          showcase platforms for the cohort, then unify the selected systems into one operating
          stack. <strong>Week 6:</strong> participants ship externally validated work: a learning app,
          a venture package, or an accepted open-source contribution.
        </p>
        <p className={styles.sectionBody}>
          New here?{' '}
          <Link href="/start">See the visual pilot map and Phase 1 loop →</Link>
        </p>
      </section>

      <section id="journey" className={styles.gridSection}>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Delivery</span>
          <h3>Production systems, not exercises</h3>
          <ul>
            <li>Deploy working applications over HTTPS</li>
            <li>Document setup, limitations, and operating assumptions</li>
            <li>Support real cohort users, deadlines, and workflows</li>
          </ul>
        </div>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Assessment</span>
          <h3>Reviewed like engineering work</h3>
          <p className={styles.phaseNote}>
            Participants evaluate one another’s systems before private votes select which platform
            operates for the cohort. Pass criteria are published before each project begins.
          </p>
        </div>
      </section>

      <section className={styles.skills}>
        <h2>Engineering standards practiced</h2>
        <div className={styles.skillGrid}>
          {[
            {
              n: '01',
              t: 'System delivery',
              d: 'Scope a product, implement the core workflows, deploy it, and make it usable by others.',
            },
            {
              n: '02',
              t: 'Quality and review',
              d: 'Read peer implementations, identify risks, and give structured technical feedback.',
            },
            {
              n: '03',
              t: 'Operations and evidence',
              d: 'Track adoption, reliability, documentation, and handoff quality beyond the demo.',
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

      <section id="apply" className={styles.apply}>
        <p className={styles.sectionLabel}>Applications</p>
        <h2>Summer 2026 is the active cohort</h2>
        <p>{cohortSizeLine} · Starts July 9, 2026 · Application deadline July 8</p>
        <ApplySectionSignup />
      </section>
    </main>
  );
}
