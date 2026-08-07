import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { winningGuide } from '@/content/winning-guide';
import styles from '../page.module.css';

export const metadata = {
  title: 'What Winning Means | Hult Cohort',
  description:
    'A practical guide for future cohort winners on maintaining a repo after it becomes the shared platform for everyone else.',
};

export default function WinningGuidePage() {
  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/', label: 'Home' },
          { href: '/program', label: 'Program' },
          { href: '/winning-guide', label: 'Winning guide' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>{winningGuide.eyebrow}</p>
        <h1 className={styles.sectionTitle}>{winningGuide.title}</h1>
        <p className={styles.overviewLead}>{winningGuide.lead}</p>
        <p className={styles.sectionBody}>{winningGuide.byline}</p>

        <section className={`${styles.callout} ${styles.calloutSuccess}`}>
          <strong>Why this page exists</strong>
          <p className={styles.sectionBody}>{winningGuide.warning}</p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>The operating reality after a win</h2>
          {winningGuide.principles.map((item) => (
            <div key={item.title}>
              <p>
                <strong>{item.title}.</strong> {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className={styles.overviewBlock}>
          <h2>Example contribution system that helped</h2>
          <p>
            Forth eventually stabilized by making the contribution workflow explicit for both humans
            and coding agents. The repo used a claim-first process, a public backlog, a shared
            handoff document, and protected areas that needed maintainer approval.
          </p>
          <dl className={styles.dl}>
            {winningGuide.snippets.map((snippet) => (
              <div key={snippet}>
                <dt>Example rule</dt>
                <dd>
                  <code>{snippet}</code>
                </dd>
              </div>
            ))}
          </dl>
          <p>
            Those rules reduced chaos, but did not eliminate it. That is the main lesson: writing a
            process helps, but maintainers still need permission to reject duplicate, unscoped, or
            failing work without guilt.
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>How to think about it</h2>
          <dl className={styles.dl}>
            {winningGuide.takeaways.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Suggested program guidance for future winners</h2>
          <ul>
            {winningGuide.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className={styles.heroActions}>
          <Link href="/program" className={styles.primaryBtn}>
            Back to program
          </Link>
          <Link href="/start" className={styles.secondaryBtn}>
            See student intro
          </Link>
        </div>
      </article>
    </main>
  );
}
