import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProgramProjectView } from '@/components/ProgramProjectView';
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

  const index = programProjects.findIndex((p) => p.slug === slug);
  const prevSlug = index > 0 ? programProjects[index - 1]?.slug : undefined;
  const nextSlug =
    index >= 0 && index < programProjects.length - 1
      ? programProjects[index + 1]?.slug
      : undefined;

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

        <ProgramProjectView project={project} prevSlug={prevSlug} nextSlug={nextSlug} />

        <p className={styles.backLink}>
          <Link href="/program">← All projects</Link>
        </p>
      </article>
    </main>
  );
}
