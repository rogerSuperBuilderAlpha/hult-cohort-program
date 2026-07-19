'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AppShell } from '../../components/app-shell';
import { Avatar } from '../../components/rally-nav';
import { fetchLeaderboard, subscribeProfiles, type LeaderboardView } from '../../lib/data';

type Profiles = Record<string, { displayName: string; avatarUrl: string | null }>;

/**
 * Leaderboard (rally-app-light.html screen 4): YOUR NEIGHBORS, not the whole ladder. The full
 * ordering is computed server-side and never returned — you see your rank, a ±2 window, and the
 * cooperative team goal. Ranked by helping + shipping, never message count.
 */
const FULL_BOARD_KEY = 'rally.fullboard.v1';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardView | null>(null);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [showFull, setShowFull] = useState(false);

  // Restore the opt-in preference (default off = neighbors-only). Read in an effect for SSR safety.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(FULL_BOARD_KEY) === '1') setShowFull(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    let live = true;
    fetchLeaderboard(showFull).then((b) => live && setBoard(b));
    const offP = subscribeProfiles(setProfiles);
    return () => {
      live = false;
      offP();
    };
  }, [user, showFull]);

  function toggleFull() {
    setShowFull((v) => {
      const next = !v;
      try { localStorage.setItem(FULL_BOARD_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }

  const name = (uid: string) => (uid === user?.uid ? 'You' : profiles[uid]?.displayName ?? 'a teammate');

  const rail = (
    <>
      <div className="rl-card" style={{ padding: 16 }}>
        <span className="rl-k"><span className="d" />Cohort pulse</span>
        <div className="rl-tm">
          {board ? `${board.participants} people are on the board, ${board.teamTotal} rally points earned together.` : 'Loading…'}
        </div>
      </div>
      <div className="rl-card" style={{ padding: 16 }}>
        <span className="rl-k"><span className="d" />Team goal</span>
        {board && (
          <>
            <div className="rl-progress">
              <i style={{ width: `${Math.min(100, Math.round((board.teamGoal.current / Math.max(1, board.teamGoal.target)) * 100))}%` }} />
            </div>
            <div className="rl-tm">{board.teamGoal.current} / {board.teamGoal.target} pts → hit it and everyone earns a badge.</div>
          </>
        )}
      </div>
    </>
  );

  return (
    <AppShell active="leaderboard" rail={rail}>
      {showFull && board?.leaders && board.leaders.length > 0 && (
        <>
          <div className="rl-band"><span className="rl-bn">★</span> Cohort leaders <span className="em">— celebrating the top</span></div>
          <div className="rl-card">
            <span className="rl-k gold"><span className="d" />Most helpful &amp; shipping this cohort</span>
            {board.leaders.map((row) => {
              const isMe = row.uid === user?.uid;
              return (
                <div key={row.uid} className="rl-row" style={{ padding: '9px 0', borderTop: '1px solid var(--slate-100)' }}>
                  <span className="rl-tm" style={{ width: 26, textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--gold-600)' }}>{row.rank}</span>
                  <Avatar name={name(row.uid)} size={30} />
                  <div className="rl-grow"><span className="rl-tb"><b className="rl-name">{name(row.uid)}</b></span></div>
                  <span className={`rl-pill ${isMe ? 'xp' : ''}`}>{row.total}</span>
                </div>
              );
            })}
            <div className="rl-tm">Only the top is ever shown — Rally never lists who&apos;s behind.</div>
          </div>
        </>
      )}

      <div className="rl-band"><span className="rl-bn">≈</span> Your neighbors <span className="em">— not the whole ladder</span></div>
      <div className="rl-card">
        <div className="rl-row">
          <span className="rl-k rl-grow"><span className="d" />By contribution &amp; helpfulness</span>
          <button className="rl-btn ghost sm" onClick={toggleFull} aria-pressed={showFull}>
            {showFull ? 'Hide leaders' : 'Show cohort leaders'}
          </button>
        </div>
        {!board || board.neighbors.length === 0 ? (
          <div className="rl-tm">No standings yet — earn XP by helping a teammate or keeping a commitment.</div>
        ) : (
          board.neighbors.map((row) => {
            const isMe = row.uid === user?.uid;
            return (
              <div
                key={row.uid}
                className="rl-row"
                style={
                  isMe
                    ? { padding: '11px 10px', margin: '2px -6px', borderRadius: 'var(--r-md)', background: 'var(--coral-50)', boxShadow: 'inset 0 0 0 1px var(--coral-200)' }
                    : { padding: '9px 0', borderTop: '1px solid var(--slate-100)' }
                }
              >
                <span className="rl-tm" style={{ width: 26, textAlign: 'center', fontFamily: 'var(--font-mono)', color: isMe ? 'var(--coral-600)' : undefined }}>
                  {row.rank}
                </span>
                <Avatar name={name(row.uid)} size={30} />
                <div className="rl-grow"><span className="rl-tb"><b className="rl-name">{name(row.uid)}</b></span></div>
                <span className={`rl-pill ${isMe ? 'xp' : ''}`}>{row.total}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="rl-tm">Ranked by helping &amp; shipping, never message count. You see your neighbors by default; the leaders are opt-in — a full list of who&apos;s behind is never shown.</div>
    </AppShell>
  );
}
