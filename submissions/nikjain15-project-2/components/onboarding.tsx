'use client';

import { useEffect, useState } from 'react';

const SEEN_KEY = 'rally.welcomed.v1';

/**
 * A one-time welcome shown to a member the first time they land on Home. Gated by a localStorage
 * flag (the same "one-time beat lives in localStorage" pattern the cohort's other app uses) so it
 * never nags on a return visit. Purely presentational + kind — it explains what Rally is for, no
 * data writes, dismiss with one button. Reads storage in an effect so SSR renders nothing.
 */
export function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(true);
      }
    } catch {
      // Private mode / storage blocked → just don't show it. Never a crash.
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,37,64,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="rl-card" style={{ maxWidth: 420, gap: 12 }} role="dialog" aria-label="Welcome to Rally" aria-modal="true">
        <div className="rl-brand" style={{ padding: 0 }}><span className="rl-mk" />Welcome to Rally</div>
        <p className="rl-tm">Your cohort&apos;s home — built around lifting each other up.</p>
        <div className="rl-item"><span className="rl-chk" /><div className="rl-grow"><div className="rl-tb">Thank a teammate and it becomes points for them — recognition you both confirm.</div></div></div>
        <div className="rl-item"><span className="rl-chk" /><div className="rl-grow"><div className="rl-tb">Make a promise in a channel, tap <b>Track it</b>, and keep it on your terms.</div></div></div>
        <div className="rl-item"><span className="rl-chk" /><div className="rl-grow"><div className="rl-tb">Ask Rally to catch you up on any channel you&apos;re in.</div></div></div>
        <div className="rl-btnrow">
          <button className="rl-btn pri" onClick={dismiss}>Let&apos;s go</button>
        </div>
      </div>
    </div>
  );
}
