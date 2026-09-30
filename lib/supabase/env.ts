// Phase 1 runs demo pages against lib/mock-data.ts until a real Supabase
// project is wired up (see .env.example). This flag lets pages/components
// pick a data source without every call site re-checking env vars.
export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
