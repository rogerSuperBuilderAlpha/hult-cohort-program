'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GithubAuthProvider as FirebaseGithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';
import { isFirebaseConfigured } from './config';

type GithubAuthProfile = {
  user: User;
  photoUrl: string | null;
};

type GithubAuthContextValue = {
  configured: boolean;
  profile: GithubAuthProfile | null;
  loading: boolean;
  authError: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  getIdToken: () => Promise<string | null>;
};

const GithubAuthContext = createContext<GithubAuthContextValue | null>(null);

function profileFromUser(user: User): GithubAuthProfile | null {
  const github = user.providerData.find((p) => p.providerId === 'github.com');
  if (!github) return null;

  return {
    user,
    photoUrl: github.photoURL ?? user.photoURL,
  };
}

export function GithubAuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [profile, setProfile] = useState<GithubAuthProfile | null>(null);
  const [loading, setLoading] = useState(configured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      setProfile(user ? profileFromUser(user) : null);
      setLoading(false);
    });
  }, [configured]);

  const signIn = useCallback(async () => {
    if (!configured) return;
    setAuthError('');
    try {
      const auth = getFirebaseAuth();
      const provider = new FirebaseGithubAuthProvider();
      provider.addScope('read:user');
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Try again when you are ready.');
        return;
      }
      setAuthError(err instanceof Error ? err.message : 'GitHub sign-in failed.');
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    setAuthError('');
    await firebaseSignOut(getFirebaseAuth());
  }, [configured]);

  const getIdToken = useCallback(async () => {
    if (!profile?.user) return null;
    return profile.user.getIdToken();
  }, [profile]);

  const deleteAccount = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!configured || !profile?.user) {
      return { ok: false, error: 'You are not signed in.' };
    }
    setAuthError('');
    try {
      const idToken = await profile.user.getIdToken();
      const res = await fetch('/api/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        return { ok: false, error: json.error || 'Could not delete your account.' };
      }
      await firebaseSignOut(getFirebaseAuth());
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Could not delete your account.',
      };
    }
  }, [configured, profile]);

  const value = useMemo(
    () => ({
      configured,
      profile,
      loading,
      authError,
      signIn,
      signOut,
      deleteAccount,
      getIdToken,
    }),
    [authError, configured, deleteAccount, getIdToken, loading, profile, signIn, signOut]
  );

  return <GithubAuthContext.Provider value={value}>{children}</GithubAuthContext.Provider>;
}

export function useGithubAuth(): GithubAuthContextValue {
  const ctx = useContext(GithubAuthContext);
  if (!ctx) {
    throw new Error('useGithubAuth must be used within GithubAuthProvider');
  }
  return ctx;
}
