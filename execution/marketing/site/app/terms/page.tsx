import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import styles from '../page.module.css';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Hult Cohort Developer Program platform.',
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.sectionTitle}>Terms of Service</h1>
        <p className={styles.overviewLead}>
          Last updated: June 2026 · Contact:{' '}
          <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
        </p>

        <section className={styles.overviewBlock}>
          <h2>Acceptance</h2>
          <p>
            By signing in with GitHub or submitting an application, you agree to these Terms and our{' '}
            <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use this
            platform.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Your account</h2>
          <ul>
            <li>
              You sign in with GitHub via Firebase. You are responsible for securing your GitHub
              account and any activity conducted under your handle.
            </li>
            <li>
              One GitHub identity per applicant. You may not impersonate others or share account
              access for submissions or votes.
            </li>
            <li>
              Your application is linked to the GitHub account used at application time — the same
              identity used for all program submissions.
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Submit false information on applications or progress records</li>
            <li>Attempt to access other participants&apos; private votes or unauthorized data</li>
            <li>Disrupt the platform, scrape enrolled-only APIs, or bypass authentication</li>
            <li>Use the platform for harassment, spam, or illegal activity</li>
            <li>Automate votes or reviews in violation of program rules</li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Program terms</h2>
          <p>
            Academic requirements, credit, and pass/fail rules follow your course syllabus and
            Hult policies. The platform tracks submissions, written peer reviews, and private votes
            per published program criteria in the{' '}
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              open-source repository
            </a>
            .
          </p>
          <p>
            Website copy is informational. In the event of a conflict, official university policies
            and your course syllabus take precedence.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Intellectual property</h2>
          <ul>
            <li>
              Student project code is yours, subject to the Program Agreement and open-source
              requirements of each project.
            </li>
            <li>
              This website&apos;s source code is{' '}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                open source under MIT
              </a>
              .
            </li>
            <li>
              Hult name, marks, and program materials remain property of Hult International
              Business School.
            </li>
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Disclaimers</h2>
          <p>
            The platform is provided &quot;as is&quot; without warranty. We do not guarantee
            uninterrupted access, error-free operation, or specific admissions or employment
            outcomes. Employment results are not guaranteed by use of this website alone.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Hult is not liable for indirect, incidental, or
            consequential damages arising from use of the platform. Our total liability for platform
            use claims is limited to direct tuition you paid to Hult for this course in the twelve
            months preceding the claim, where applicable law permits such a cap.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Termination</h2>
          <p>
            We may suspend or revoke platform access for violations of these Terms or program rules.
            You may stop using the platform at any time. Request data deletion per the{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Governing law</h2>
          <p>
            These Terms are governed by the laws of the Commonwealth of Massachusetts, USA, without
            regard to conflict-of-law rules. Disputes shall be resolved in courts located in
            Massachusetts, except where prohibited by applicable consumer protection law.
          </p>
        </section>

        <div className={styles.heroActions}>
          <Link href="/privacy" className={styles.secondaryBtn}>
            Privacy Policy
          </Link>
          <Link href="/" className={styles.primaryBtn}>
            Back to home
          </Link>
        </div>
      </article>
    </main>
  );
}
