'use client';

import { useState } from 'react';
import styles from '../app/page.module.css';

type AccountSectionProps = {
  handle: string;
  onSignOut: () => void;
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  onDeleted: () => void;
};

export function AccountSection({ handle, onSignOut, onDelete, onDeleted }: AccountSectionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmText.trim().toLowerCase() === handle.toLowerCase();

  async function runDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError('');
    const result = await onDelete();
    if (!result.ok) {
      setError(result.error || 'Could not delete your account.');
      setDeleting(false);
      return;
    }
    onDeleted();
  }

  return (
    <section className={styles.accountSection}>
      <h2 className={styles.participantHeading}>Account</h2>
      <div className={styles.participantActions} style={{ marginTop: 0 }}>
        <button type="button" className={styles.secondaryBtn} onClick={onSignOut}>
          Sign out
        </button>
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerZoneTitle}>Delete account</h3>
        <p className={styles.formNote} style={{ marginTop: 0 }}>
          Permanently removes your application, enrollment record, submissions, written reviews, and
          votes from this platform, along with your sign-in record. Public GitHub repositories, pull
          requests, and issues you created remain on GitHub under your account. This action cannot
          be undone.
        </p>

        {!confirmOpen ? (
          <button type="button" className={styles.dangerBtn} onClick={() => setConfirmOpen(true)}>
            Delete my account
          </button>
        ) : (
          <div className={styles.dangerConfirm}>
            <label className={styles.reviewLinkLabel} htmlFor="delete-confirm">
              Type your handle <code>{handle}</code> to confirm:
            </label>
            <input
              id="delete-confirm"
              type="text"
              className={styles.reviewLinkInput}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={handle}
              autoComplete="off"
            />
            <div className={styles.participantActions} style={{ marginTop: 12 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={!canDelete || deleting}
                onClick={() => void runDelete()}
              >
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        )}
        {error ? <p className={styles.formError}>{error}</p> : null}
      </div>
    </section>
  );
}
