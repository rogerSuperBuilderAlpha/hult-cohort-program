'use client';

import {
  getAdditionalUserInfo,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@cohort/core/firebase';
import { ensureProfile, ensureDefaultChannels, provisionMe } from './data';

/**
 * Rally auth — GitHub sign-in over Firebase Auth, provisioning a `profiles/{uid}` doc and
 * joining the default channels on first sign-in.
 *
 * Kept in the app (not @cohort/core) on purpose: provisioning is Rally-specific (its own
 * collections), and @cohort/core stays UI-free so the two apps merge cleanly later. The one
 * lesson carried over verbatim from Pulse: `handle` is the GitHub login and comes ONLY from
 * getAdditionalUserInfo() on the sign-in credential — never guessed from an email local-part
 * (that shipped once as "nikjain1588" for login "nikjain15" and every join silently missed).
 */
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        // On a returning session onAuthStateChanged fires without a fresh credential, so the
        // GitHub login isn't available here — provision idempotently with what we have; the
        // login is backfilled by the sign-in path below when it runs.
        if (u) await ensureProfile(u, null);
        setUser(u);
        setLoading(false);
      }),
    []
  );

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGithub: async () => {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      const login = getAdditionalUserInfo(result)?.username ?? null;
      await ensureProfile(result.user, login);
      await ensureDefaultChannels(result.user.uid);
      await provisionMe();
    },
    signOut: async () => {
      await fbSignOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
