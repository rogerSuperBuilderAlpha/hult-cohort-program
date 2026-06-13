'use client';

import { useCallback, useState } from 'react';
import styles from '../app/page.module.css';

type Props = {
  prompt: string;
  personalized?: boolean;
};

export function AgentPromptHarness({ prompt, personalized = true }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [prompt]);

  return (
    <section className={styles.overviewBlock}>
      <div className={styles.harnessHeader}>
        <div>
          <h2 className={styles.participantHeading}>Agent prompt harness</h2>
          <p className={styles.harnessLead}>
            Copy into Cursor, Claude Code, or any agent. It will interview you for required
            details, then create the repo work, open the PR, and push.
          </p>
        </div>
        <button type="button" className={styles.copyHarnessBtn} onClick={() => void copy()}>
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>
      {!personalized && (
        <p className={styles.formNote} style={{ marginTop: 0 }}>
          Contains template placeholders <code>{'{handle}'}</code> and <code>{'{org}'}</code> —
          sign in once enrolled to personalize this prompt.
        </p>
      )}
      <pre className={styles.harnessPre}>{prompt}</pre>
    </section>
  );
}
