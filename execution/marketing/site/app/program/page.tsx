import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../page.module.css';
import { programProjects } from '../../content/program';

export const metadata = {
  title: 'Program | Hult Cohort Developer Program',
  description:
    'Every phase and project — what participants build, submit as PRs, and review and vote on.',
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
        <h1 className={styles.sectionTitle}>Every project. Clear expectations. PRs as proof.</h1>
        <p className={styles.overviewLead}>
          You do not submit links in a form. You open a PR in the cohort org with your deploy URL,
          metrics, and agent notes. Phase 1 review weeks: file a written GitHub review on every peer
          build, then cast a private 👍 or 👎. The repo with the most thumbs up wins.
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
