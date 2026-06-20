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
          <h2 className={styles.participantHeading}>Agent prompt template</h2>
          <p className={styles.harnessLead}>
            Copy this prompt into Cursor, Claude Code, or another agent tool. It will gather
            required details, prepare the repository work, and open the pull request.
          </p>
        </div>
        <button type="button" className={styles.copyHarnessBtn} onClick={() => void copy()}>
          {copied ? 'Copied' : 'Copy prompt'}
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
