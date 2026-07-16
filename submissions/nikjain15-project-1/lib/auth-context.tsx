'use client';

import {
  createUserWithEmailAndPassword,
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

/** Derive a cohort handle from an email or display name. */
function handleFrom(user: User): string {
  const fromEmail = user.email?.split('@')[0];
  return (fromEmail || user.displayName || 'member').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

/**
 * Create the member doc on first sign-in, and emit member_joined once.
 * Idempotent: repeat sign-ins find the doc and no-op, so the feed never duplicates.
 */
async function ensureMember(user: User) {
  const ref = doc(db, 'members', user.uid);
  if ((await getDoc(ref)).exists()) return;

  const displayName = user.displayName || handleFrom(user);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? '',
    handle: handleFrom(user),
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
      await signInWithPopup(auth, new GithubAuthProvider());
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
