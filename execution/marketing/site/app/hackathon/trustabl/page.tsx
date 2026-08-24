import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { hackathonTrustabl } from '@/content/hackathon-trustabl';
import styles from '../../page.module.css';

export const metadata = {
  title: 'Trustabl Hackathon Track | Hult Cohort',
  description:
    'Open contribution guide for Trustabl: new detection rules, threat-model docs, and test fixtures. Accessible to everyone — in-person Aug 24, 2026 and remote.',
};

export default function HackathonTrustablPage() {
  const content = hackathonTrustabl;

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/', label: 'Home' },
          { href: '/program', label: 'Program' },
          { href: '/hackathon/trustabl', label: 'Hackathon' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h1 className={styles.sectionTitle}>{content.title}</h1>
        <p className={styles.overviewLead}>{content.lead}</p>

        <section className={`${styles.callout} ${styles.calloutSuccess}`}>
          <strong>{content.event.label}</strong>
          <p className={styles.sectionBody}>
            <strong>{content.event.when}</strong>
            <br />
            {content.event.where}
          </p>
          <p className={styles.sectionBody}>{content.event.lumaNote}</p>
          <a
            href={content.event.lumaUrl}
            className={styles.primaryBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register on Luma →
          </a>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Main repositories</h2>
          <ul>
            {content.repos.map((repo) => (
              <li key={repo.name}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>{' '}
                — {repo.label}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>{content.primaryPath.title}</h2>
          <p>{content.primaryPath.summary}</p>
          <ol>
            {content.primaryPath.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            {content.primaryPath.conventions}{' '}
            <a href={content.primaryPath.conventionsUrl} target="_blank" rel="noopener noreferrer">
              trustabl-rules/CLAUDE.md
            </a>
            . Rationale template:{' '}
            <a href={content.primaryPath.templateUrl} target="_blank" rel="noopener noreferrer">
              policy-rationale-doc-template-guide.md
            </a>
            .
          </p>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Other contribution areas</h2>
          <ul>
            {content.otherAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>Highest-value target areas right now</h2>
          <ul>
            {content.targetAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </section>

        <section className={styles.overviewBlock}>
          <h2>How to start</h2>
          <ol>
            {content.howToStart.map((step) =>
              step.url ? (
                <li key={step.label}>
                  <a href={step.url} target="_blank" rel="noopener noreferrer">
                    {step.label}
                  </a>
                </li>
              ) : (
                <li key={step.label}>{step.label}</li>
              )
            )}
          </ol>
          <p>
            Happy to support a focused hackathon track around rule authoring + rationale docs. That
            is the highest-leverage way to contribute in a single session.
          </p>
        </section>

        <div className={styles.heroActions}>
          <a
            href={content.discordUrl}
            className={styles.primaryBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
          <Link href="/program/phase-2-open-source" className={styles.secondaryBtn}>
            Cohort OSS week
          </Link>
        </div>
      </article>
    </main>
  );
}
