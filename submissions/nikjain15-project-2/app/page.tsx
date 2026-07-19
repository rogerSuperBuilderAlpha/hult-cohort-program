'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

/**
 * The public landing — what a visitor sees at the root URL before they sign in. It explains what
 * Rally is in one line, shows the recognize → commit → rise loop, and hands off to GitHub sign-in.
 * A signed-in visitor is sent straight to their board. The intelligence stays invisible here too.
 */
export default function Landing() {
  const { user, loading, signInWithGithub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/home');
  }, [user, router]);

  if (user) return null; // redirecting to /home

  return (
    <div className="rl-land">
      <header className="rl-land-nav">
        <div className="rl-brand" style={{ padding: 0 }}><span className="rl-mk" />Rally</div>
        <button className="rl-btn ghost sm" onClick={() => signInWithGithub().catch(() => {})} disabled={loading}>Sign in</button>
      </header>

      <section className="rl-land-hero">
        <span className="rl-land-eyebrow">One home base for your cohort</span>
        <h1 className="rl-land-h1">Your cohort, in sync.</h1>
        <p className="rl-land-sub">
          Chat in real time, recognize the people who help, and keep the commitments you make —
          all in one place for the whole cohort.
        </p>
        <div className="rl-btnrow" style={{ justifyContent: 'center' }}>
          <button className="rl-btn pri" onClick={() => signInWithGithub().catch(() => {})} disabled={loading}>
            Continue with GitHub
          </button>
        </div>
        <p className="rl-tm" style={{ marginTop: 10 }}>Free for the cohort. Sign in with the GitHub account you already use.</p>
      </section>

      <section className="rl-land-how">
        <div className="rl-band" style={{ justifyContent: 'center' }}>How Rally works</div>
        <div className="rl-land-steps">
          <div className="rl-land-step">
            <span className="rl-land-step-n">1</span>
            <b>Talk</b>
            <span>Real-time channels, threads, and DMs. Ask Rally to catch you up on any channel in a sentence.</span>
          </div>
          <span className="rl-land-arrow" aria-hidden="true">→</span>
          <div className="rl-land-step">
            <span className="rl-land-step-n">2</span>
            <b>Recognize &amp; commit</b>
            <span>Thank a teammate — they confirm, they earn. Turn a promise into a tracked task and keep it.</span>
          </div>
          <span className="rl-land-arrow" aria-hidden="true">→</span>
          <div className="rl-land-step">
            <span className="rl-land-step-n">3</span>
            <b>Rise</b>
            <span>Recognition and kept promises lift you and the shared cohort goal — you rise together.</span>
          </div>
        </div>
        <p className="rl-tm" style={{ textAlign: 'center', marginTop: 4 }}>
          It&apos;s a loop: every thank-you and every kept promise feeds the whole cohort&apos;s progress.
        </p>
      </section>

      <footer className="rl-land-foot">
        <button className="rl-btn pri" onClick={() => signInWithGithub().catch(() => {})} disabled={loading}>Join your cohort</button>
      </footer>
    </div>
  );
}
