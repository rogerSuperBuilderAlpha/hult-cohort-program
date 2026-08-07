'use client';

import { useAuth } from '../lib/auth-context';
import { RallyNav, type NavPage } from './rally-nav';

/**
 * The three-column app shell (nav / main / rail) from the visual contract, for the read-first
 * screens (Home, Quests, Leaderboard). The channels screen has its own layout for the chat pane
 * but reuses RallyNav. Handles loading + signed-out states so each page doesn't repeat them.
 */
export function AppShell({
  active,
  rail,
  children,
}: {
  active: NavPage;
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, loading, signInWithGithub } = useAuth();

  if (loading) return <Centered>Loading…</Centered>;
  if (!user) {
    return (
      <Centered>
        <div className="rl-card" style={{ alignItems: 'center', maxWidth: 320, textAlign: 'center' }}>
          <div className="rl-brand" style={{ padding: 0 }}><span className="rl-mk" />Rally</div>
          <p className="rl-tm">Your cohort&apos;s home. Sign in with GitHub to jump in.</p>
          {/* Actually starts GitHub sign-in — not a route hop to a second button (the label promised
              auth, so the click must deliver it). Matches the channels screen's sign-in control. */}
          <button className="rl-btn pri" onClick={() => signInWithGithub().catch(() => {})}>
            Continue with GitHub
          </button>
        </div>
      </Centered>
    );
  }

  return (
    <div className="rl-app">
      <RallyNav active={active} />
      <main className="rl-main">{children}</main>
      <aside className="rl-rail">{rail}</aside>
    </div>
  );
}

export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {children}
    </div>
  );
}
