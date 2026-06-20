'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirebaseApp } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import {
  getStoredConsent,
  storeConsent,
  type CookieConsentValue,
} from '@/lib/cookie-consent';
import styles from '../app/page.module.css';

function initAnalyticsOnce() {
  if (!isFirebaseConfigured()) return;
  isSupported().then((supported) => {
    if (supported) getAnalytics(getFirebaseApp());
  });
}

export function ConsentGate() {
  const [consent, setConsent] = useState<CookieConsentValue | null | 'loading'>('loading');
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    if (stored === 'accepted') initAnalyticsOnce();

    const onUpdate = (event: Event) => {
      const value = (event as CustomEvent<CookieConsentValue>).detail;
      setConsent(value);
      if (value === 'accepted') initAnalyticsOnce();
    };

    window.addEventListener('cookie-consent-updated', onUpdate);
    return () => window.removeEventListener('cookie-consent-updated', onUpdate);
  }, []);

  useEffect(() => {
    if (consent !== null) return;

    acceptRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [consent]);

  if (consent === 'loading') return null;

  if (consent === null) {
    return (
      <div
        ref={dialogRef}
        className={styles.cookieBanner}
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
      >
        <div className={styles.cookieBannerInner}>
          <p className={styles.cookieBannerText}>
            This site uses optional analytics cookies to measure aggregate usage. Analytics are not
            loaded until you consent. See our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <div className={styles.cookieBannerActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                storeConsent('declined');
                setConsent('declined');
              }}
            >
              Decline
            </button>
            <button
              ref={acceptRef}
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                storeConsent('accepted');
                setConsent('accepted');
              }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
