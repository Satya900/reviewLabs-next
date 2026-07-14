// lib/supabase/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "./client";
import { getLocalProgress } from "@/lib/progress/localStorage";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    user_name?: string;
    preferred_username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  signOut: async () => {},
});

async function migrateLocalProgress() {
  const local = getLocalProgress();
  if (local.length === 0) return;
  try {
    await fetch("/api/attempts/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempts: local }),
    });
  } catch (err) {
    console.error("Failed to migrate local progress:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    supabase.auth.getUser().then(({ data }: { data: { user: AuthUser | null } }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: string, session: { user: AuthUser | null } | null) => {
        setUser(session?.user ?? null);
        // Only migrate on an actual sign-in transition, not on every already-signed-in
        // page load (INITIAL_SESSION) — otherwise this would silently re-run forever.
        if (event === "SIGNED_IN") {
          migrateLocalProgress();
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
          window.location.pathname
        )}`,
      },
    });
  };

  const signOut = async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
