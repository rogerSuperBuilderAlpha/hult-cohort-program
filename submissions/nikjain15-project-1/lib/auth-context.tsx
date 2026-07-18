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
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { logPulse } from './pulse';

type AuthContextValue = {
  user: User | null;
  /**
   * The actor's display name as recorded on their MEMBER DOC — the exact value
   * firestore.rules checks `actorName` against on every pulse write. Every write must use
   * this, never `user.displayName ?? email-local`: the two drift for a GitHub user with no
   * GitHub display name (login on the doc, email-local on the User), and that drift made the
   * pulse rule silently reject their events while `logPulse` swallowed the error. null until
   * the member doc listener delivers.
   */
  memberName: string | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The name someone typed on the sign-up form, parked where the auth listener can see it.
 *
 * onAuthStateChanged fires the instant createUserWithEmailAndPassword resolves — before
 * updateProfile has propagated to `User` — and it usually wins the race to create the
 * member doc. Backfilling the doc afterwards isn't enough on its own: member_joined is
 * denormalised into the feed at write time, so the winner has to already know the name or
 * the cohort's first sight of a new member is "grace joined the cohort" instead of
 * "Grace Hopper joined the cohort", permanently.
 *
 * A module-level value is safe here because sign-up is one flow in one tab.
 */
let pendingSignupName: string | null = null;

/**
 * Something to call a person on screen. Never used as the handle — see below.
 *
 * `preferred` is the name they typed at sign-up. It has to be threaded in explicitly
 * because updateProfile() hasn't propagated to `User` by the time onAuthStateChanged
 * fires — without it, someone who signs up as "Grace Hopper" is called "grace".
 */
/**
 * Live-subscribe to a member's own displayName. Module-level so the state update stays out
 * of the effect body (the codebase's `subscribeTo*` shape), and so the exact string the
 * pulse rules enforce is what every write attributes itself with.
 */
function watchMemberName(uid: string, onName: (name: string | null) => void): () => void {
  return onSnapshot(doc(db, 'members', uid), (snap) =>
    onName((snap.data()?.displayName as string | undefined) ?? null)
  );
}

function nameFor(user: User, githubLogin?: string | null, preferred?: string | null): string {
  return (
    preferred?.trim() ||
    user.displayName ||
    pendingSignupName?.trim() ||
    githubLogin ||
    user.email?.split('@')[0] ||
    'member'
  );
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
async function ensureMember(user: User, githubLogin?: string | null, preferredName?: string | null) {
  const ref = doc(db, 'members', user.uid);
  const displayName = nameFor(user, githubLogin, preferredName);

  /**
   * The create has to be atomic, not read-then-write.
   *
   * ensureMember runs from two places at once: onAuthStateChanged fires as soon as the
   * credential lands, while signUp/signIn calls it again with the GitHub login. A plain
   * getDoc-then-setDoc lets both reads miss, both writes land, and member_joined publish
   * TWICE — the cohort feed then says the same person joined twice, on their first
   * five seconds in the product. The spec's guard is "once per member ever", and only a
   * transaction can actually promise that.
   *
   * The transaction reports whether THIS call created the doc; only the winner logs.
   */
  const created = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);

    if (snap.exists()) {
      // The doc can exist before we learn the login or the typed name, because
      // onAuthStateChanged wins the race with signInWithPopup / updateProfile. Backfill
      // rather than no-op, or the race decides who you are.
      const patch: Record<string, string> = {};
      if (githubLogin && snap.data().handle !== githubLogin) patch.handle = githubLogin;
      if (preferredName?.trim() && snap.data().displayName !== preferredName.trim()) {
        patch.displayName = preferredName.trim();
      }
      if (Object.keys(patch).length > 0) tx.update(ref, patch);
      return false;
    }

    tx.set(ref, {
      uid: user.uid,
      email: user.email ?? '',
      // null, not a guess. A wrong handle can collide with a real member's login and
      // attach one person's work to another. Set when they connect GitHub.
      handle: githubLogin ?? null,
      displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
    return true;
  });

  if (!created) return;

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
  const [memberName, setMemberName] = useState<string | null>(null);
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

  // Track the member doc's displayName live, so every write attributes itself with the
  // exact string the rules enforce. Created in ensureMember before this runs, so by the
  // time anyone ships a card it's populated; the fallback in useAuth consumers only covers
  // the first paint. The listener lives in a module fn so the state update stays out of the
  // effect body — same shape as the lib `subscribeTo*` helpers.
  useEffect(() => {
    if (!user) return;
    return watchMemberName(user.uid, setMemberName);
  }, [user]);

  const value: AuthContextValue = {
    user,
    memberName,
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
      // Park the name BEFORE the account exists — onAuthStateChanged fires the moment it
      // does, and it must not create the member doc under a name derived from the email.
      pendingSignupName = displayName;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        await ensureMember(cred.user, null, displayName);
      } finally {
        pendingSignupName = null;
      }
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
