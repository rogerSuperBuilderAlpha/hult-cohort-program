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

export type GithubAuthProfile = {
  user: User;
  githubHandle: string;
  githubUrl: string;
  photoUrl: string | null;
};

function profileFromUser(user: User): GithubAuthProfile | null {
  const github = user.providerData.find((p) => p.providerId === 'github.com');
  const handle = github?.displayName?.trim();
  if (!handle) return null;

  return {
    user,
    githubHandle: handle.toLowerCase(),
    githubUrl: `https://github.com/${handle}`,
    photoUrl: github?.photoURL ?? user.photoURL,
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

  return {
    configured,
    profile,
    loading,
    authError,
    signIn,
    signOut,
    getIdToken,
  };
}
