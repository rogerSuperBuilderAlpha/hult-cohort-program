import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ProgramIntroLoop } from '@/components/ProgramIntroLoop';
import { ProgramIntroTimeline } from '@/components/ProgramIntroTimeline';
import { introFaq, programIntro } from '@/content/program-intro';
import styles from '../page.module.css';

export const metadata = {
  title: 'What is this program? | Hult Cohort',
  description:
    'Visual intro to the CS for Business elective: semester timeline, Phase 1 peer review loop, and how to enroll.',
};

export default function StartPage() {
  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/', label: 'Home' },
          { href: '/program', label: 'Projects' },
          { href: '/apply', label: 'Apply' },
        ]}
      />

      <article className={styles.introPage}>
        <p className={styles.eyebrow}>{programIntro.eyebrow}</p>
        <h1 className={styles.sectionTitle}>{programIntro.title}</h1>
        <p className={styles.introLead}>{programIntro.lead}</p>
        <p className={styles.introNote}>{programIntro.electiveNote}</p>

        <section className={styles.introSection}>
          <h2 className={styles.introSectionTitle}>Sixteen weeks at a glance</h2>
          <ProgramIntroTimeline />
        </section>

        <section className={styles.introSection}>
          <h2 className={styles.introSectionTitle}>Phase 1 repeats this loop</h2>
          <p className={styles.sectionBody}>
            Three internal products (PM platform, comms, showcase). Each project uses the same cycle:
          </p>
          <ProgramIntroLoop />
        </section>

        <section className={styles.introSection}>
          <h2 className={styles.introSectionTitle}>What you need</h2>
          <ul className={styles.introList}>
            <li>{programIntro.dualEnrollment}</li>
            <li>{programIntro.toolingNote}</li>
          </ul>
        </section>

        <section className={styles.introSection}>
          <h2 className={styles.introSectionTitle}>Quick answers</h2>
          <dl className={styles.faq}>
            {introFaq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className={styles.heroActions}>
          <Link href="/apply" className={styles.primaryBtn}>
            {programIntro.ctaApply}
          </Link>
          <Link href="/program" className={styles.secondaryBtn}>
            {programIntro.ctaProgram}
          </Link>
        </div>
      </article>
    </main>
  );
}
