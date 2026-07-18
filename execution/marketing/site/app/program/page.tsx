import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../page.module.css';
import { programProjects } from '../../content/program';

export const metadata = {
  title: 'Program | Hult Cohort Developer Program',
  description:
    'Project requirements, submission standards, and assessment criteria for each week of the cohort.',
};

export default function ProgramIndexPage() {
  const phase1 = programProjects.filter((p) => p.phase === 'phase-1');
  const phase2 = programProjects.filter((p) => p.phase === 'phase-2');

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Participant journey</p>
        <h1 className={styles.sectionTitle}>Six weeks · projects, requirements, assessment</h1>
        <p className={styles.overviewLead}>
          Weeks 1–3 are review-week contests: build, review every peer on GitHub, optionally upvote.
          The selected system operates for the cohort. Weeks 4–6 are external sprints — Ludwitt
          learning, startup, and open-source swarm — one week each.
        </p>
        <p className={styles.formNote}>
          Select any project to open its full requirements, deadlines, and submission steps.
        </p>

        <Section title="Weeks 1–3 · Contests (review weeks)" projects={phase1} />
        <Section title="Weeks 4–6 · External sprints" projects={phase2} />
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
  if (projects.length === 0) return null;
  return (
    <section className={styles.overviewBlock}>
      <h2>{title}</h2>
      <ul className={styles.programList}>
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/program/${project.slug}`}>
              <strong>{project.phaseLabel}</strong> — {project.title}
              {project.voteWeek ? ' · Review week' : ''}
            </Link>
            <p>{project.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
