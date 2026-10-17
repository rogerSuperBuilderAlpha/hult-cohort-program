import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProgramProjectView } from '@/components/ProgramProjectView';
import { PageFrame } from '@/components/PageFrame';
import { RunsOnPitchrise } from '@/components/RunsOnPitchrise';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { projectPageMetadata } from '@/lib/page-metadata';
import styles from '../../page.module.css';
import { getProject, programProjects } from '../../../content/program';

export const revalidate = 60;
export function generateStaticParams() {
  return programProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Not found', robots: { index: false, follow: false } };

  return projectPageMetadata(project);
}

export default async function ProgramProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = programProjects.findIndex((p) => p.slug === slug);
  const prevSlug = index > 0 ? programProjects[index - 1]?.slug : undefined;
  const nextSlug =
    index >= 0 && index < programProjects.length - 1
      ? programProjects[index + 1]?.slug
      : undefined;

  const initialStats = await getCohortStats();

  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>{project.phaseLabel}</p>
        <h1 className={styles.sectionTitle}>{project.title}</h1>
        <p className={styles.overviewLead}>{project.summary}</p>

        {slug === 'phase-2-learning-app' ? (
          <RunsOnPitchrise layout="overview" weekLink={false} />
        ) : null}

        <ProgramProjectView
          project={project}
          prevSlug={prevSlug}
          nextSlug={nextSlug}
          initialStats={initialStats}
        />

        <p className={styles.backLink}>
          <Link href="/program">← All projects</Link>
        </p>
      </article>
    </PageFrame>
  );
}
