import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { showcaseNavLinks } from '@/content/showcase-vibe';
import { getPmSnapshot } from '@/lib/showcase/pm-snapshot-server';
import styles from '@/app/showcase/showcase.module.css';

export const revalidate = 60;

export const metadata = {
  title: 'Project status',
  description: 'Read-only PM platform snapshot — merged submissions and enrolled cohort size.',
};

export default async function StatusPage() {
  const snapshot = await getPmSnapshot();

  return (
    <main className={styles.main}>
      <SiteHeader links={[...showcaseNavLinks]} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>PM integration</p>
        <h1 className={styles.headline}>Cohort project status</h1>
        <p className={styles.lead}>
          Live snapshot from the cohort platform · cohort {snapshot.cohortId}
          {snapshot.available ? '' : ' · roster offline (showing structure)'}
        </p>
        <p className={styles.muted}>Updated {new Date(snapshot.updatedAt).toLocaleString()}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionBody}>
          <strong>{snapshot.enrolledCount}</strong> enrolled · API:{' '}
          <Link href="/api/showcase/pm-status">/api/showcase/pm-status</Link>
        </p>

        <table className={styles.statusTable}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Merged</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.projects.map((project) => {
              const total = Math.max(project.totalEnrolled, 1);
              const pct = Math.round((project.mergedCount / total) * 100);
              return (
                <tr key={project.slug}>
                  <td>
                    <strong>{project.title}</strong>
                    <div className={styles.muted}>{project.phaseLabel}</div>
                  </td>
                  <td>
                    {project.mergedCount} / {project.totalEnrolled || '—'}
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <div className={styles.barTrack} aria-hidden>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
