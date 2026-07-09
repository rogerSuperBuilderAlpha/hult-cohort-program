import type { ProjectOutcome } from '@/lib/project-outcomes-types';
import styles from '../app/page.module.css';

type Props = {
  outcome: ProjectOutcome;
  viewerHandle: string;
};

export function ProjectOutcomeBanner({ outcome, viewerHandle }: Props) {
  const isWinner = outcome.winnerHandle === viewerHandle;
  const isTie = !outcome.winnerHandle && outcome.tiedHandles.length > 1;

  return (
    <div className={isWinner ? styles.calloutSuccess : styles.callout}>
      <p style={{ marginTop: 0 }}>
        <strong>Contest outcome published.</strong>{' '}
        {isTie ? (
          <>
            Tie at {outcome.up} thumbs up — staff resolving via rubric median. Candidates:{' '}
            {outcome.tiedHandles.map((h) => `@${h}`).join(', ')}.
          </>
        ) : outcome.winnerHandle ? (
          <>
            @{outcome.winnerHandle} operates this platform ({outcome.up} up, {outcome.down} down).
            {isWinner
              ? ' You won — keep the deployment stable for the cohort.'
              : ' Contribute fixes and improvements to the winning build.'}
          </>
        ) : (
          'No eligible winner recorded.'
        )}
      </p>
      {outcome.deployUrl ? (
        <p className={styles.formNote} style={{ marginBottom: 0 }}>
          Canonical deployment:{' '}
          <a href={outcome.deployUrl} target="_blank" rel="noopener noreferrer">
            {outcome.deployUrl}
          </a>
          {outcome.prUrl ? (
            <>
              {' '}
              ·{' '}
              <a href={outcome.prUrl} target="_blank" rel="noopener noreferrer">
                winning PR
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

type UnificationProps = {
  outcomes: ProjectOutcome[];
};

const PLATFORM_LABELS: Record<string, string> = {
  'phase-1-project-1': 'Project management platform',
  'phase-1-project-2': 'Internal communications platform',
  'phase-1-project-3': 'Public showcase platform',
};

export function UnificationWinnersPanel({ outcomes }: UnificationProps) {
  if (outcomes.length === 0) {
    return (
      <div className={styles.callout}>
        <p style={{ marginTop: 0 }}>
          <strong>Winning platforms not yet published.</strong> Staff announce outcomes after each
          review week closes.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.progressPanel}>
      <h2 className={styles.participantHeading} style={{ marginTop: 0 }}>
        Phase 1 winning platforms
      </h2>
      <ul className={styles.introList}>
        {outcomes.map((o) => (
          <li key={o.projectSlug}>
            <strong>{PLATFORM_LABELS[o.projectSlug] ?? o.projectSlug}:</strong>{' '}
            {o.winnerHandle ? (
              <>
                @{o.winnerHandle}
                {o.deployUrl ? (
                  <>
                    {' '}
                    —{' '}
                    <a href={o.deployUrl} target="_blank" rel="noopener noreferrer">
                      deployment
                    </a>
                  </>
                ) : null}
              </>
            ) : (
              'pending tie-break'
            )}
          </li>
        ))}
      </ul>
      <p className={styles.formNote} style={{ marginBottom: 0 }}>
        Integration checklist: shared navigation, single sign-on or deep links between all three,
        migration plan for cohort data, and a live demo of five of six unification steps.
      </p>
    </section>
  );
}
