import { SiteHeader } from '@/components/SiteHeader';
import { StudentCard } from '@/components/showcase/StudentCard';
import { showcaseNavLinks } from '@/content/showcase-vibe';
import { listShowcaseProfiles } from '@/lib/showcase/profile-server';
import styles from '@/app/showcase/showcase.module.css';

export const revalidate = 60;

export const metadata = {
  title: 'Builders',
  description: 'Summer Pilot 2026 participant profiles with GitHub evidence and deployment links.',
};

export default async function StudentsPage() {
  const profiles = await listShowcaseProfiles();

  return (
    <main className={styles.main}>
      <SiteHeader links={[...showcaseNavLinks]} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Roster</p>
        <h1 className={styles.headline}>Meet the builders</h1>
        <p className={styles.lead}>
          {profiles.length} profiles · opt-out participants show a private placeholder
        </p>
      </section>

      <div className={styles.grid}>
        {profiles.map((profile) => (
          <StudentCard key={profile.handle} profile={profile} />
        ))}
      </div>
    </main>
  );
}
