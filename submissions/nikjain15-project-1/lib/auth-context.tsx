'use client';

import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { logPulse } from './pulse';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Something to call a person on screen. Never used as the handle — see below. */
function nameFor(user: User, githubLogin?: string | null): string {
  return user.displayName || githubLogin || user.email?.split('@')[0] || 'member';
}

/**
 * Create the member doc on first sign-in, and emit member_joined once.
 * Idempotent: repeat sign-ins find the doc and no-op, so the feed never duplicates.
 *
 * `githubLogin` is the person's GitHub username, and it is the ONLY acceptable
 * source for `handle`. The public cohort repo indexes people by login, so handle is
 * the join key for everything downstream — recognising a reviewer on the landing
 * page, attributing commits, matching a helper to someone stuck.
 *
 * It is only available from getAdditionalUserInfo() on the sign-in credential, not
 * from `User`, so it has to be threaded in from the caller. That awkwardness is why
 * this previously guessed the handle from the email local-part — which produced
 * "nikjain1588" for a GitHub user whose login is "nikjain15", and the join silently
 * never matched. No error; just a permanent "we don't know you".
 */
async function ensureMember(user: User, githubLogin?: string | null) {
  const ref = doc(db, 'members', user.uid);
  const snap = await getDoc(ref);
  const displayName = nameFor(user, githubLogin);

  if (snap.exists()) {
    // onAuthStateChanged fires before signInWithPopup resolves, so the doc can
    // already exist by the time we learn the login. Backfill rather than no-op —
    // otherwise the race decides whether identity works.
    if (githubLogin && snap.data().handle !== githubLogin) {
      await setDoc(ref, { handle: githubLogin }, { merge: true });
    }
    return;
  }

  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? '',
    // null, not a guess. A wrong handle can collide with a real member's login and
    // attach one person's work to another. Set when they connect GitHub.
    handle: githubLogin ?? null,
    displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
  });

  await logPulse({
    kind: 'member_joined',
    actorUid: user.uid,
    actorName: displayName,
    actorPhotoURL: user.photoURL,
    subject: displayName,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        if (u) await ensureMember(u);
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
      // The GitHub login lives on the credential result, not on User. Grab it here
      // or it's gone — and with it, the only correct value for `handle`.
      const login = getAdditionalUserInfo(result)?.username ?? null;
      await ensureMember(result.user, login);
    },
    signInWithEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signUpWithEmail: async (email, password, displayName) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await ensureMember(cred.user);
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
