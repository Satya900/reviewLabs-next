import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// For public, unauthenticated reads/writes (the customer-facing rating and
// feedback flow) from Route Handlers where there's no browser session to
// read cookies from. RLS still applies — this respects the `anon` policies
// defined in supabase/migrations, it does not bypass them.
export function createSupabaseAnonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
