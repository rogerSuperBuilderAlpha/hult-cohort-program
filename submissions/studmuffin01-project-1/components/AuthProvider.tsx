"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  userId: string | null;
  isAuthLoaded: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userId: null,
  isAuthLoaded: false,
});

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export default function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthLoaded, setIsAuthLoaded] = useState(true);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      userId: user?.id ?? null,
      isAuthLoaded,
    }),
    [user, isAuthLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
