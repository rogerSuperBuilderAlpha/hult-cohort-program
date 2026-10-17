import Link from 'next/link';
import { PageFrame } from '@/components/PageFrame';
import { hackathonTrustabl } from '@/content/hackathon-trustabl';
import { metadataForPath } from '@/lib/page-metadata';
import styles from '../../page.module.css';

export const metadata = metadataForPath('/hackathon/trustabl');

export default function HackathonTrustablPage() {
  const content = hackathonTrustabl;

  return (
    <PageFrame>
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
            {content.event.lumaCta} →
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
            Rule authoring and rationale docs were the highest-leverage way to contribute in that
            session, and they are still the best place to start a remote pull request.
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
    </PageFrame>
  );
}
