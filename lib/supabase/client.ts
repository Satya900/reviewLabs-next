// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a dummy object for mock mode
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({ data: {}, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }),
        insert: () => ({ error: null }),
      }),
    } as any;
  }

  return createBrowserClient(url, anonKey);
}
