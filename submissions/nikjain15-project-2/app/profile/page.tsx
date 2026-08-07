'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AppShell } from '../../components/app-shell';
import { Avatar } from '../../components/rally-nav';
import { subscribeMyProfile, updateMyDisplayName, type MyProfile } from '../../lib/data';

/**
 * Profile / settings — the one screen where you curate your own identity. Display name is
 * editable (self-update, uid immutable — the rule allows exactly this); the GitHub handle is
 * read-only because it's the login we learned at sign-in, never a guess.
 */
export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (!user) return;
    return subscribeMyProfile(user.uid, (p) => {
      setProfile(p);
      setDraft((d) => (d === '' && p ? p.displayName : d));
    });
  }, [user]);

  if (!user) return <AppShell active="profile">{null}</AppShell>;

  const dirty = profile != null && draft.trim() !== '' && draft.trim() !== profile.displayName;

  async function save() {
    if (!user || !dirty || status === 'saving') return;
    setStatus('saving');
    try {
      await updateMyDisplayName(user.uid, draft);
      setStatus('saved');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <AppShell active="profile">
      <div className="rl-band"><span className="rl-bn">◆</span> Your profile <span className="em">— how the cohort sees you</span></div>

      <div className="rl-card">
        <div className="rl-row">
          <Avatar name={profile?.displayName ?? 'You'} url={profile?.avatarUrl ?? null} size={56} />
          <div className="rl-grow">
            <div className="rl-t3">{profile?.displayName ?? 'You'}</div>
            <div className="rl-tm">@{profile?.githubLogin ?? profile?.handle ?? 'you'}</div>
          </div>
        </div>
      </div>

      <div className="rl-card">
        <span className="rl-k"><span className="d" />Display name</span>
        <div className="rl-tm">This is the name teammates see on your messages and recognitions.</div>
        <div className="rl-compose" style={{ padding: '6px 6px 6px 12px' }}>
          <input
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setStatus('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            maxLength={60}
            placeholder="Your name"
            aria-label="Display name"
          />
          <button className="rl-btn pri sm" onClick={save} disabled={!dirty || status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
        {status === 'saved' && <div className="rl-tm">Saved ✓</div>}
      </div>

      <div className="rl-card">
        <span className="rl-k"><span className="d" />GitHub</span>
        <div className="rl-row">
          <span className="rl-tb rl-grow">Connected account</span>
          <span className="rl-pill">{profile?.githubLogin ? `@${profile.githubLogin}` : 'not linked'}</span>
        </div>
        <div className="rl-tm">Your handle comes from GitHub sign-in and can&apos;t be changed here.</div>
      </div>

      <div className="rl-card">
        <span className="rl-k"><span className="d" />Session</span>
        <div className="rl-btnrow">
          <button className="rl-btn sec sm" onClick={() => signOut()}>Sign out</button>
        </div>
      </div>
    </AppShell>
  );
}
