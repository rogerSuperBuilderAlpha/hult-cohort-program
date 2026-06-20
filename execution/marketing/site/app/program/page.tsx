import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../page.module.css';
import { programProjects } from '../../content/program';

export const metadata = {
  title: 'Program | Hult Cohort Developer Program',
  description:
    'Project requirements, submission standards, and assessment criteria for each phase of the cohort.',
};

export default function ProgramIndexPage() {
  const phase1 = programProjects.filter((p) => p.phase === 'phase-1');
  const phase2 = programProjects.filter((p) => p.phase === 'phase-2');
  const onboarding = programProjects.filter((p) => p.phase === 'onboarding');

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Participant journey</p>
        <h1 className={styles.sectionTitle}>Projects, requirements, and assessment</h1>
        <p className={styles.overviewLead}>
          Submissions are made through pull requests in the cohort repository, including deploy
          URLs, metrics, and documentation. During Phase 1 review weeks, participants file a
          written GitHub review on every peer submission, then cast a private vote. The submission
          with the most votes is selected to operate the platform.
        </p>

        <Section title="Onboarding" projects={onboarding} />
        <Section title="Phase 1 · Internal (review weeks)" projects={phase1} />
        <Section title="Phase 2 · External" projects={phase2} />
      </article>
    </main>
  );
}

function Section({
  title,
  projects,
}: {
  title: string;
  projects: typeof programProjects;
}) {
  return (
    <section className={styles.overviewBlock}>
      <h2>{title}</h2>
      <ul className={styles.programList}>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/program/${p.slug}`} className={styles.programLink}>
              <span className={styles.programWeeks}>{p.weeks}</span>
              <span className={styles.programTitle}>{p.title}</span>
              {p.voteWeek && <span className={styles.voteBadge}>Review week</span>}
              <span className={styles.programSummary}>{p.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
