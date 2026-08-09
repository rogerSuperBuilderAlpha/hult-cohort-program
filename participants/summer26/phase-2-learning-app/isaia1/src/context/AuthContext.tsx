import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  clearLocalSession,
  getLocalDisplayName,
  getLocalSession,
  localSignIn,
  localSignUp,
  localResetPassword,
} from '../lib/localAuth';
import { fetchLudwittSession, logoutLudwitt, type LudwittPublicUser } from '../services/ludwittApi';

export interface AuthUser {
  id: string;
  email: string;
  provider: 'local' | 'ludwitt';
  name?: string | null;
  picture?: string | null;
}

interface Profile {
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isLudwittUser: boolean;
  signIn: (email: string, password: string) => { error: string | null };
  signUp: (email: string, password: string, displayName: string) => { error: string | null };
  resetPassword: (email: string, newPassword: string) => { error: string | null; message?: string };
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userFromLudwitt(ludwittUser: LudwittPublicUser): AuthUser {
  return {
    id: ludwittUser.id,
    email: ludwittUser.email,
    provider: 'ludwitt',
    name: ludwittUser.name,
    picture: ludwittUser.picture,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyLudwittUser = useCallback((ludwittUser: LudwittPublicUser) => {
    clearLocalSession();
    const nextUser = userFromLudwitt(ludwittUser);
    setUser(nextUser);
    setProfile({ displayName: ludwittUser.name ?? ludwittUser.email.split('@')[0] });
  }, []);

  const refreshSession = useCallback(async () => {
    const ludwittUser = await fetchLudwittSession();
    if (ludwittUser) {
      applyLudwittUser(ludwittUser);
      return;
    }

    const session = getLocalSession();
    if (session) {
      setUser({ id: session.userId, email: session.email, provider: 'local' });
      setProfile({ displayName: getLocalDisplayName(session.userId) });
      return;
    }

    setUser(null);
    setProfile(null);
  }, [applyLudwittUser]);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const signIn = (email: string, password: string) => {
    const { error, session } = localSignIn(email, password);
    if (error || !session) return { error: error ?? 'Sign in failed.' };
    setUser({ id: session.userId, email: session.email, provider: 'local' });
    setProfile({ displayName: getLocalDisplayName(session.userId) });
    return { error: null };
  };

  const signUp = (email: string, password: string, displayName: string) => {
    const { error, session } = localSignUp(email, password, displayName);
    if (error || !session) return { error: error ?? 'Sign up failed.' };
    setUser({ id: session.userId, email: session.email, provider: 'local' });
    setProfile({ displayName: displayName.trim() });
    return { error: null };
  };

  const signOut = async () => {
    if (user?.provider === 'ludwitt') {
      await logoutLudwitt().catch(() => undefined);
    } else {
      clearLocalSession();
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = (email: string, newPassword: string) => {
    const { error } = localResetPassword(email, newPassword);
    if (error) return { error };
    return { error: null, message: 'Password updated! You can sign in with your new password.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isLudwittUser: user?.provider === 'ludwitt',
        signIn,
        signUp,
        resetPassword,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
