'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

  if (consent === 'loading') return null;

  if (consent === null) {
    return (
      <div className={styles.cookieBanner} role="dialog" aria-label="Cookie consent">
        <div className={styles.cookieBannerInner}>
          <p className={styles.cookieBannerText}>
            We use optional Firebase Analytics cookies to understand site usage. No analytics load
            until you accept. See our{' '}
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
