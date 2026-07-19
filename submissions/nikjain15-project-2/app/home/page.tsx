'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AppShell } from '../../components/app-shell';
import { Avatar } from '../../components/rally-nav';
import { Onboarding } from '../../components/onboarding';
import { RallyAgent } from '../../components/rally-agent';
import {
  confirmRecognition,
  declineRecognition,
  fetchBrief,
  fetchLeaderboard,
  subscribeMyCommitments,
  subscribeMyPendingRecognitions,
  subscribeMyQuests,
  subscribePulse,
  subscribeProfiles,
  subscribeXpTotal,
  type BriefView,
  type CommitmentView,
  type LeaderboardView,
  type PulseView,
  type QuestView,
  type RecognitionView,
} from '../../lib/data';
import { commitmentNudge, nudgeSortKey } from '../../lib/commitment-nudge';

type Profiles = Record<string, { displayName: string; avatarUrl: string | null }>;

const KIND_VERB: Record<string, string> = {
  answered: 'answered a question for',
  unblocked: 'unblocked',
  reviewed: 'reviewed for',
  paired: 'paired with',
};

/**
 * Home = the situation board (rally-app-light.html screen 1). Three bands — recognition, relief,
 * belonging — plus a live-pulse + standing rail. Recognition-first, lift-only: no shame, no
 * public ranking of people.
 */
export default function HomePage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<RecognitionView[]>([]);
  const [pulse, setPulse] = useState<PulseView[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [xp, setXp] = useState(0);
  const [commitments, setCommitments] = useState<CommitmentView[]>([]);
  const [quests, setQuests] = useState<QuestView[]>([]);
  const [board, setBoard] = useState<LeaderboardView | null>(null);
  const [brief, setBrief] = useState<BriefView | null>(null);
  // Clock for the kind commitment nudges — sourced in an effect (not during render) and ticked
  // each minute so a "due soon" chip stays honest without a reload. Null until mounted.
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    // One-time seed of the clock on mount, then a per-minute tick. Both write from outside render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    const offs = [
      subscribeMyPendingRecognitions(user.uid, setPending),
      subscribePulse(setPulse),
      subscribeProfiles(setProfiles),
      subscribeXpTotal(user.uid, setXp),
      subscribeMyCommitments(user.uid, setCommitments),
      subscribeMyQuests(user.uid, setQuests),
    ];
    return () => offs.forEach((off) => off());
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    fetchLeaderboard().then((b) => live && setBoard(b));
    fetchBrief().then((b) => live && setBrief(b));
    return () => {
      live = false;
    };
  }, [user, xp, pending.length]);

  const name = (uid: string) => profiles[uid]?.displayName ?? 'a teammate';
  const confirmedHelps = pulse.filter((p) => p.actorUid === user?.uid && p.verb === 'recognition_confirmed').length;
  const openCommitments = commitments.filter((c) => c.status === 'open');
  const openQuests = quests.filter((q) => q.status !== 'done');

  const rail = (
    <>
      <div>
        <span className="rl-k gold" style={{ marginBottom: 10 }}><span className="d" />● Live pulse</span>
        {pulse.length === 0 ? (
          <p className="rl-tm">Quiet for now. The first recognition shows up here.</p>
        ) : (
          pulse.slice(0, 8).map((p) => (
            <div className="rl-pulse" key={p.id}>
              <Avatar name={name(p.actorUid)} size={26} />
              <span className="rl-tm">
                <b className="rl-name">{name(p.actorUid)}</b> helped <b className="rl-name">{name(p.object)}</b>
                {p.points ? <> · <b className="rl-name">+{p.points}</b></> : null}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="rl-card" style={{ padding: 15 }}>
        <span className="rl-k gold"><span className="d" />Your standing</span>
        <div className="rl-ring">
          <div className="rl-bignum">{board?.me ? `#${board.me.rank}` : '—'}</div>
          <div>
            <div className="rl-t3">{board?.participants ? `Rank of ${board.participants}` : 'New here'}</div>
            <div className="rl-tm">{xp} rally pts</div>
          </div>
        </div>
        <div className="rl-btnrow">
          {confirmedHelps >= 1 && <span className="rl-badge">★ First lift</span>}
          {confirmedHelps >= 5 && <span className="rl-badge">★ Cohort pillar</span>}
          {xp >= 50 && <span className="rl-badge">★ 50 club</span>}
          {confirmedHelps < 1 && xp < 50 && <span className="rl-tm">Earn XP to unlock badges.</span>}
        </div>
      </div>
    </>
  );

  return (
    <AppShell active="home" rail={rail}>
      <Onboarding />
      <div className="rl-tm" style={{ marginBottom: 2 }}>Your cohort, in sync — here&apos;s what needs you and how you&apos;re doing.</div>
      <RallyAgent />
      {/* Band 1 — recognition */}
      <div className="rl-band"><span className="rl-bn">1</span> You&apos;re winning <span className="em">— who thanked you</span></div>
      <div className="rl-card">
        <span className="rl-k gold"><span className="d" />Your effort, made visible</span>
        <div className="rl-row">
          <span className="rl-t3 rl-grow">
            {confirmedHelps > 0
              ? `${confirmedHelps} ${confirmedHelps === 1 ? 'person' : 'people'} confirmed you helped`
              : 'Help a teammate — recognition shows up here'}
          </span>
          <span className="rl-pill xp">{xp} pts</span>
        </div>
      </div>
      {pending.map((r) => (
        <div className="rl-card" key={r.id}>
          <span className="rl-k indigo"><span className="d" />Rally spotted this — confirm to credit them</span>
          <div className="rl-tb">
            Did <b className="rl-name">{name(r.helperUid)}</b> {KIND_VERB[r.kind] ?? 'help'} you? Confirm to send
            them <b className="rl-name">+{r.points} XP</b>.
          </div>
          <div className="rl-btnrow">
            <button className="rl-btn pri sm" onClick={() => confirmRecognition(r.id)}>Yes, that helped</button>
            <button className="rl-btn ghost sm" onClick={() => declineRecognition(r.id)}>Not really</button>
          </div>
        </div>
      ))}

      {/* Band 2 — relief (the Brief) */}
      <div className="rl-band" style={{ marginTop: 6 }}><span className="rl-bn">2</span> Caught up <span className="em">— what needs you</span></div>
      <div className="rl-card">
        <span className="rl-k"><span className="d" />Catch me up</span>
        {brief && brief.items.length > 0 ? (
          <>
            {brief.items.map((it, i) => (
              <div className="rl-item" key={i}>
                <span className="rl-chk" />
                <div className="rl-grow"><div className="rl-tb">{it.text}</div></div>
              </div>
            ))}
            <div className="rl-tm">{brief.quiet}</div>
          </>
        ) : (
          <div className="rl-tm">{brief?.quiet ?? "You're all caught up. Nothing needs you."}</div>
        )}
      </div>
      {openCommitments.length > 0 && (
        <div className="rl-card">
          <span className="rl-k"><span className="d" />You promised</span>
          {[...openCommitments]
            .sort((a, b) => nudgeSortKey(a.dueAtMs) - nudgeSortKey(b.dueAtMs))
            .map((c) => {
              const nudge = nowMs == null ? { tone: 'none' as const, label: '' } : commitmentNudge(c.dueAtMs, nowMs);
              return (
                <div className="rl-row" key={c.id}>
                  <span className="rl-tb rl-grow">{c.text}</span>
                  {nudge.tone !== 'none' && (
                    <span className={`rl-pill${nudge.tone === 'overdue' ? ' warm' : ''}`}>{nudge.label}</span>
                  )}
                  {c.pmTaskUrl ? (
                    <a className="rl-pill" href={c.pmTaskUrl} target="_blank" rel="noopener noreferrer">Open task ↗</a>
                  ) : (
                    <span className="rl-pill">tracked</span>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Band 3 — belonging (cohort momentum) */}
      <div className="rl-band" style={{ marginTop: 6 }}><span className="rl-bn">3</span> Building together <span className="em">— the cohort goal</span></div>
      <div className="rl-card">
        <span className="rl-k"><span className="d" />Cohort momentum</span>
        <div className="rl-stats">
          <div className="rl-stat"><b>{board?.teamTotal ?? 0}</b><span>rally pts earned</span></div>
          <div className="rl-stat"><b>{board?.participants ?? 0}</b><span>people contributing</span></div>
          <div className="rl-stat"><b>{pulse.length}</b><span>recent recognitions</span></div>
        </div>
        {board && (
          <>
            <div className="rl-progress">
              <i style={{ width: `${Math.min(100, Math.round((board.teamGoal.current / Math.max(1, board.teamGoal.target)) * 100))}%` }} />
            </div>
            <div className="rl-tm">
              Cohort goal: {board.teamGoal.current} / {board.teamGoal.target} pts — hit it together and everyone earns the badge.
            </div>
          </>
        )}
      </div>

      {openQuests.length > 0 && (
        <div className="rl-card">
          <span className="rl-k"><span className="d" />Open quests</span>
          {openQuests.map((q) => (
            <div className="rl-row" key={q.id}>
              <span className="rl-chk" />
              <span className="rl-tb rl-grow">{q.title}</span>
              <span className="rl-pill xp">+{q.rewardPts}</span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
