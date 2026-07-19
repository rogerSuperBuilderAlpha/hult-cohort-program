'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AppShell } from '../../components/app-shell';
import { subscribeMyQuests, subscribePulse, subscribeXpTotal, type PulseView, type QuestView } from '../../lib/data';

/**
 * My Quests (rally-app-light.html screen 3): tracked promises + challenges as the game.
 * Personal on-ramps, never a comparison. Rewards come through the ledger on completion.
 */
export default function QuestsPage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<QuestView[]>([]);
  const [xp, setXp] = useState(0);
  const [pulse, setPulse] = useState<PulseView[]>([]);

  useEffect(() => {
    if (!user) return;
    const offs = [
      subscribeMyQuests(user.uid, setQuests),
      subscribeXpTotal(user.uid, setXp),
      subscribePulse(setPulse),
    ];
    return () => offs.forEach((off) => off());
  }, [user]);

  const done = quests.filter((q) => q.status === 'done').length;
  const total = quests.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const confirmedHelps = pulse.filter((p) => p.actorUid === user?.uid && p.verb === 'recognition_confirmed').length;

  const rail = (
    <>
      <div className="rl-card" style={{ padding: 16 }}>
        <span className="rl-k"><span className="d" />Your badges</span>
        <div className="rl-btnrow">
          {confirmedHelps >= 1 && <span className="rl-badge">★ First lift</span>}
          {confirmedHelps >= 5 && <span className="rl-badge">★ Cohort pillar</span>}
          {xp >= 50 && <span className="rl-badge">★ 50 club</span>}
          {confirmedHelps < 1 && xp < 50 && <span className="rl-tm">Complete quests to earn badges.</span>}
        </div>
      </div>
      <div className="rl-card" style={{ padding: 16 }}>
        <span className="rl-k"><span className="d" />Standing</span>
        <div className="rl-row"><span className="rl-tm rl-grow">Rally points</span><span className="rl-pill xp">{xp}</span></div>
      </div>
    </>
  );

  return (
    <AppShell active="quests" rail={rail}>
      <div className="rl-band"><span className="rl-bn">★</span> My quests <span className="em">— small goals, real points</span></div>
      <div className="rl-card">
        <span className="rl-k"><span className="d" />This week · {done} of {total || 0} done</span>
        <div className="rl-progress"><i style={{ width: `${pct}%` }} /></div>
        <div className="rl-tm">Each one nudges you to help a teammate or keep a promise — and earns points when you do.</div>
      </div>

      {quests.length === 0 && (
        <div className="rl-card"><div className="rl-tm">No quests yet — they seed on sign-in. Try recognizing a teammate or making a commitment.</div></div>
      )}
      {quests.map((q) => (
        <div className="rl-card" key={q.id}>
          <div className="rl-row">
            {q.status === 'done' ? (
              <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--coral-500)', flex: '0 0 auto' }} />
            ) : (
              <span className="rl-chk" />
            )}
            <div className="rl-grow">
              <div className="rl-tb"><b className="rl-name">{q.title}</b></div>
              <div className="rl-tm">{q.status === 'done' ? 'done · reward banked' : `open · +${q.rewardPts} on completion`}</div>
            </div>
            <span className="rl-pill xp">+{q.rewardPts}</span>
          </div>
        </div>
      ))}
    </AppShell>
  );
}
