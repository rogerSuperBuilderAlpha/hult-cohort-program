'use client';

import { useEffect, useState } from 'react';

/**
 * "You're offline. Showing the last thing we saw." — DESIGN-SPEC §10.
 *
 * The second half of the spec's copy — "Changes will send when you're back" — is a claim
 * about Firestore, and it's true: the web SDK queues writes locally and replays them on
 * reconnect, and `onSnapshot` serves the last known data from cache meanwhile. So the
 * board keeps working offline, which is why this is a banner and not a blocking screen.
 * If that ever stops being true, this copy has to change with it.
 *
 * Auto-recovers: the banner is driven by the browser's own online/offline events, so it
 * leaves when the network does. Nothing to dismiss, nothing to retry by hand.
 *
 * `navigator.onLine` is not a promise that the internet works — it only knows whether an
 * interface is up. It is reliable in the direction that matters here: false means
 * definitely offline. A captive portal that lies gets handled by the sync's own degraded
 * path instead, which says GitHub is unreachable.
 */
export function OfflineBanner() {
  // Assume online until the browser says otherwise. Starting pessimistic would flash a
  // scary banner on every first paint, and SSR has no navigator at all.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline) return null;

  // Red, not a third colour. The spec's visual language has exactly two with meaning —
  // green is the motivating action, red is debt or time against you — and "nothing else
  // is coloured". A board showing the last thing we saw IS time against you, and it's the
  // same family as the sync's degraded note, which is already red. Inventing amber for
  // this would have been a new vocabulary word for one banner.
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="border-b border-red-900/60 bg-red-950/30 px-4 py-2 text-center text-xs text-red-300"
    >
      You’re offline. Showing the last thing we saw. Changes will send when you’re back.
    </div>
  );
}
