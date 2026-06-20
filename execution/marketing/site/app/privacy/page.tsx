import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSiteDisplayLabel, getSiteUrl } from '@/lib/site-config';
import styles from '../page.module.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How the Hult Cohort Developer Program collects, uses, and stores your data.',
};

export default function PrivacyPage() {
  const siteUrl = getSiteUrl();
  const siteLabel = getSiteDisplayLabel();

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.sectionTitle}>Privacy Policy</h1>
        <p className={styles.overviewLead}>
          Last updated: June 2026 · Contact:{' '}
          <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
        </p>

        <section className={styles.overviewBlock}>
          <h2>Who we are</h2>
          <p>
            The Hult Cohort Developer Program is operated by Hult International Business School
            (&quot;Hult&quot;, &quot;we&quot;, &quot;us&quot;). This site (
            <a href={siteUrl}>{siteLabel}</a> and successor domains) is the admissions and
            participant platform for the Fall 2026 cohort.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>GitHub identity</strong> — When you sign in, Firebase Authentication stores
              your GitHub username, profile URL, and optional avatar. Repository access is not
              requested at application time.
            </li>
            <li>
              <strong>Application data</strong> — Name, email, campus, timezone, motivation
              statement, project proposal, referral source, and optional Hult student ID submitted
              through the application form.
            </li>
            <li>
              <strong>Program activity</strong> — After enrollment: submission pull request links,
              deployment URLs, written peer review issue URLs, and private votes tied to your
              GitHub handle.
            </li>
            <li>
              <strong>Technical logs</strong> — Hosting infrastructure may record IP address, user
              agent, and request metadata for security and reliability.
            </li>
            <li>
              <strong>Analytics</strong> — If you consent to cookies, aggregated usage data (pages
              visited, device type) may be collected. Analytics are not loaded until you opt in.
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Where data is stored</h2>
          <p>
            Application and participant records are stored in Google Firebase / Firestore (project{' '}
            <code>hult-cohorts</code>, United States). Authentication sessions are managed by
            Firebase. The site is hosted on Vercel.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Public by design</h2>
          <p>
            This program requires public work on GitHub. Your code, pull requests, written peer
            reviews (GitHub issues), and deployment URLs are public by program requirement. Private
            votes are stored in Firestore and are not visible to other participants. Hiring partners
            and the public may inspect your GitHub contributions independently of this platform.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>How we use your data</h2>
          <ul>
            <li>Process admissions and communicate decisions</li>
            <li>Track submissions, peer reviews, and pass criteria progress</li>
            <li>Operate cohort administration (enrollment, voting, progress dashboards)</li>
            <li>Improve the site (only with analytics consent)</li>
            <li>Comply with law and protect against abuse</li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Retention</h2>
          <p>
            Application records are retained for the admissions cycle and enrolled cohort term(s).
            Enrolled participant records may be retained for program operations and alumni placement
            tracking. You may request deletion of platform-held personally identifiable information
            (see Your rights).
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Your rights</h2>
          <ul>
            <li>
              <strong>Access and export</strong> — Enrolled participants can download a JSON export
              of platform-held data from the{' '}
              <Link href="/dashboard">participant dashboard</Link>.
            </li>
            <li>
              <strong>Correction</strong> — Email{' '}
              <a href="mailto:cohort@hult.edu">cohort@hult.edu</a> to update application or
              enrollment details.
            </li>
            <li>
              <strong>Deletion</strong> — While your application is in progress, delete your account
              from the <Link href="/apply">Apply</Link> page (Account → Delete account). When
              enrolled, delete from the <Link href="/dashboard">Dashboard</Link> (Account → Delete
              account).
            </li>
            <li>
              This permanently removes your application, enrollment record, submissions, written
              reviews, votes, and sign-in record from this platform. You may also request deletion
              by emailing <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>.
            </li>
            <li>
              Public GitHub repositories, issues, and pull requests you created remain on GitHub
              under your account and are outside our control. You may delete or archive them
              directly on GitHub.
            </li>
            <li>
              <strong>Withdraw consent</strong> — Decline analytics cookies via the site banner.
              You may sign out at any time from the site header or dashboard. Re-enrollment
              requires an active GitHub session.
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Third parties</h2>
          <ul>
            <li>GitHub — OAuth sign-in provider</li>
            <li>Google Firebase — authentication, database, optional analytics</li>
            <li>Vercel — site hosting</li>
          </ul>
          <p>
            Each provider maintains its own privacy policy. We do not sell your personal
            information.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Changes</h2>
          <p>
            We may update this policy. Material changes will be posted on this page with an updated
            date. Continued use after enrollment constitutes acceptance of the revised policy where
            permitted by law.
          </p>
        </section>

        <div className={styles.heroActions}>
          <Link href="/terms" className={styles.secondaryBtn}>
            Terms of Service
          </Link>
          <Link href="/" className={styles.primaryBtn}>
            Back to home
          </Link>
        </div>
      </article>
    </main>
  );
}
