'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  GithubAuthProvider,
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

// Sign-in is established by the Firebase user having a github.com provider.
// We deliberately do NOT derive a handle here: github.displayName is the
// GitHub *display name* (often a real name like "Roger Hunt"), not the login.
// The authoritative login is resolved server-side from the immutable numeric id
// (see lib/firebase/github-handle.ts) and surfaced via /api/me.
function profileFromUser(user: User): GithubAuthProfile | null {
  const github = user.providerData.find((p) => p.providerId === 'github.com');
  if (!github) return null;

  return {
    user,
    photoUrl: github.photoURL ?? user.photoURL,
  };
}

export function useGithubAuth() {
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
      const provider = new GithubAuthProvider();
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

  return {
    configured,
    profile,
    loading,
    authError,
    signIn,
    signOut,
    deleteAccount,
    getIdToken,
  };
}
