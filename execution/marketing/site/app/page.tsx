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
          Build production software.<br />
          Learn professional engineering practice.
        </h1>
        <p className={`${styles.subhead} animate-in delay-2`}>
          A for-credit developer pilot where students design, deploy, review, and operate real
          applications using the same frameworks and delivery workflows relied on by professional
          engineering teams.
        </p>
        <div className={`${styles.heroActions} animate-in delay-3`}>
          <ParticipantCta />
          <Link href="/start" className={styles.secondaryBtn}>
            What is this program?
          </Link>
        </div>
        <div className={`${styles.heroMeta} animate-in delay-4`}>
          <span>Production systems, technical review, and deployment practice</span>
          <span>Applications open June 15, 2026</span>
          <span>Program begins July 9, 2026 at 09:00 Eastern Time</span>
        </div>
      </section>

      <section id="program" className={styles.section}>
        <div className={styles.sectionLabel}>At a glance</div>
        <h2 className={styles.sectionTitle}>Two phases, real operating software</h2>
        <p className={styles.sectionBody}>
          <strong>Phase 1 (weeks 2–5):</strong> the cohort builds PM, comms, and showcase platforms,
          then unifies the winning stack.
          Written technical reviews and private votes select the operator for each project.{' '}
          <strong>Week 6 final sprint:</strong> learning apps with real users, a venture package, and
          open-source contribution evidence.
        </p>
        <p className={styles.sectionBody}>
          New here?{' '}
          <Link href="/start">See the visual pilot map and Phase 1 loop →</Link>
        </p>
      </section>

      <section id="journey" className={styles.gridSection}>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Enrollment</span>
          <h3>Dual enrollment</h3>
          <ul>
            <li>Register for the elective through Hult</li>
            <li>Apply on this site and complete the technical take-home</li>
            <li>Staff admit unlocks project pages and submissions</li>
          </ul>
        </div>
        <div className={styles.phaseCard}>
          <span className={styles.phaseTag}>Tooling</span>
          <h3>What you pay for yourself</h3>
          <p className={styles.phaseNote}>
            Cursor and Claude Code (~$400/month combined) from week 1. Course tuition follows your degree
            bill—not a separate cohort fee on this site.
          </p>
        </div>
      </section>

      <section className={styles.skills}>
        <h2>What you practice</h2>
        <div className={styles.skillGrid}>
          {[
            {
              n: '01',
              t: 'Production delivery',
              d: 'Every project is deployed, documented, and reviewed against published criteria.',
            },
            {
              n: '02',
              t: 'Engineering review',
              d: 'Participants review each other’s systems before voting on which one operates.',
            },
            {
              n: '03',
              t: 'External validation',
              d: 'The final sprint adds users, investors, and maintainers as real-world evaluators.',
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

      <section id="faq" className={styles.faq}>
        <h2>Frequently asked questions</h2>
        <dl>
          <div>
            <dt>How is the program assessed?</dt>
            <dd>
              Pass/fail on published project criteria. Letter grades follow your course syllabus; the
              platform tracks submissions, reviews, and votes.
            </dd>
          </div>
          <div>
            <dt>What tooling is required?</dt>
            <dd>
              Cursor and Claude Code from week 1 (~$400/month combined). Students work in modern
              development environments and production deployment workflows.
            </dd>
          </div>
          <div>
            <dt>Where do I learn more?</dt>
            <dd>
              <Link href="/start">Start with the visual intro</Link>, then browse{' '}
              <Link href="/program">project expectations</Link>.
            </dd>
          </div>
        </dl>
      </section>

      <section id="apply" className={styles.apply}>
        <h2>Platform apply</h2>
        <ol className={styles.steps}>
          <li>Complete the application form</li>
          <li>Finish the 48-hour technical take-home</li>
          <li>Decision within ~48 hours of take-home submission</li>
        </ol>
        <p>{cohortSizeLine} · Application deadline: July 8, 2026</p>
        <ApplySectionSignup />
      </section>
    </main>
  );
}
