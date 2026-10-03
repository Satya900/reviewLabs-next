import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import type { Business } from "./supabase/types";

// Returns the signed-in owner's oldest business id, or null if they're
// signed in but haven't created one yet (used to route to /onboarding).
// An agency owner can have multiple businesses — .maybeSingle() alone
// throws on 2+ rows (it only relaxes the zero-row case), so this orders
// and limits first to deterministically pick one rather than error.
export async function getOwnerBusinessId(): Promise<string | null> {
  if (!hasSupabaseEnv) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

// Every business the signed-in owner has — the data source for the agency
// console and consolidated billing. A regular single-business owner just
// gets a one-element array.
export async function getOwnerBusinesses(): Promise<Business[]> {
  if (!hasSupabaseEnv) return [];

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true });

  return data ?? [];
}
