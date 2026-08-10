import { useEffect, useState } from 'react';
import { CourseIcon, IoChevronForward, IoLogOutOutline, IoStar } from '../utils/icons';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { fetchLudwittCredits, type LudwittCreditsBalance } from '../services/ludwittApi';
import StreakBadge from '../components/StreakBadge';
import { LUDWITT_TOP_UP_URL } from '../lib/ludwitt/pkce';

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'LH';
}

const menuItems = [
  { icon: 'notifications-outline', label: 'Notifications', color: '#c4b5fd' },
  { icon: 'settings-outline', label: 'Settings', color: 'rgba(255,255,255,0.78)' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: 'rgba(255,255,255,0.78)' },
];

export default function ProfilePage() {
  const { user, profile, signOut, isLudwittUser } = useAuth();
  const { progress } = useProgress();
  const [credits, setCredits] = useState<LudwittCreditsBalance | null>(null);
  const [creditsError, setCreditsError] = useState('');

  useEffect(() => {
    if (!isLudwittUser) return;
    fetchLudwittCredits()
      .then(setCredits)
      .catch((err) => setCreditsError(err instanceof Error ? err.message : 'Could not load credits.'));
  }, [isLudwittUser]);

  const displayName = profile?.displayName ?? 'Learner';
  const email = user?.email ?? '';
  const initials = getInitials(profile?.displayName ?? null, user?.email ?? null);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) await signOut();
  };

  return (
    <div className="page page-scroll">
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 88, height: 88, borderRadius: 44, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 32, fontWeight: 800 }}>
          {initials}
        </div>
        <h1 className="h2" style={{ marginBottom: 4 }}>{displayName}</h1>
        <p className="subtitle" style={{ marginBottom: 12 }}>{email}</p>
        <StreakBadge streak={progress.streak} />
      </div>

      <div className="glass fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <IoStar size={24} color="#fb923c" />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{progress.totalXP} XP</div>
          <div className="subtitle">Level {Math.floor(progress.totalXP / 100) + 1} Learner</div>
        </div>
      </div>

      {isLudwittUser && (
        <div className="glass fade-in" style={{ borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.78)' }}>
            Ludwitt spendable credits
          </div>
          {credits ? (
            <>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{credits.spendableFormatted}</div>
              <div className="subtitle" style={{ marginTop: 4 }}>
                Total balance {credits.balanceFormatted} (only paid credits work in third-party apps)
              </div>
            </>
          ) : (
            <div className="subtitle">{creditsError || 'Loading credits…'}</div>
          )}
          <a href={LUDWITT_TOP_UP_URL} className="btn-link" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12 }}>
            Top up credits
          </a>
        </div>
      )}

      <div className="glass fade-in" style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: 16, borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', color: '#fff' }}
          >
            <CourseIcon name={item.icon} size={22} color={item.color} />
            <span style={{ flex: 1, textAlign: 'left', fontSize: 16 }}>{item.label}</span>
            <IoChevronForward size={18} color="rgba(255,255,255,0.55)" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="fade-in"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 16, borderRadius: 14, border: '1px solid rgba(252,165,165,0.4)', background: 'rgba(255,255,255,0.08)', color: '#fca5a5', fontWeight: 600, fontSize: 16 }}
      >
        <IoLogOutOutline size={20} />
        Log Out
      </button>
    </div>
  );
}
