import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/SiteNav';
import styles from '../../page.module.css';
import { getProject, programProjects } from '../../../content/program';

export function generateStaticParams() {
  return programProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Not found' };
  return {
    title: `${project.title} | Hult Cohort Program`,
    description: project.summary,
  };
}

export default async function ProgramProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>Hult</span>
          <span className={styles.logoSub}>Cohort</span>
        </Link>
        <SiteNav links={[{ href: '/program', label: 'Program' }]} />
      </header>

      <article className={styles.overview}>
        <p className={styles.eyebrow}>{project.phaseLabel}</p>
        <h1 className={styles.sectionTitle}>{project.title}</h1>
        <p className={styles.overviewLead}>{project.summary}</p>

        {project.voteWeek && (
          <div className={styles.callout}>
            <strong>Vote week.</strong> After review, rank your top 3 merged submission PRs on the
            platform. You cannot rank your own PR. See{' '}
            <Link href="/program/phase-1-project-1">Phase 1 loop</Link> for mechanics.
          </div>
        )}

        <section className={styles.overviewBlock}>
          <h2>What is expected of you</h2>
          <ul>
            {project.expectations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>How you submit (PR, not a link form)</h2>
          <dl className={styles.dl}>
            <dt>Repo</dt>
            <dd>
              <code>{project.submission.repoPattern}</code>
            </dd>
            <dt>PR title</dt>
            <dd>
              <code>{project.submission.prTitle}</code>
            </dd>
            <dt>PR body must include</dt>
            <dd>
              <ul>
                {project.submission.prBodyMustInclude.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
            <dt>Deadline</dt>
            <dd>{project.submission.deadlineNote}</dd>
          </dl>
        </section>

        {project.reviews && (
          <section className={styles.overviewBlock}>
            <h2>Peer review</h2>
            <p>
              <strong>{project.reviews.count}</strong> mandatory reviews. Artifact:{' '}
              {project.reviews.artifact}. Due: {project.reviews.dueNote}.
            </p>
          </section>
        )}

        <section className={styles.overviewBlock}>
          <h2>Pass gate</h2>
          <ul>
            {project.passGate.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {project.voteWeek && (
          <section className={styles.overviewBlock}>
            <h2>Voting</h2>
            <p>
              Ballot lists every <strong>merged submission PR</strong> that passed the eligibility
              checklist. Rank your top 3. Ballots are private; aggregate results published after the
              winner is announced. Tie-break uses median peer rubric score.
            </p>
            <p>
              <em>Enrolled participants only — voting UI opens during review week.</em>
            </p>
          </section>
        )}

        <p className={styles.backLink}>
          <Link href="/program">← All projects</Link>
        </p>
      </article>
    </main>
  );
}
