import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";

// Returns the signed-in owner's business id, or null if they're signed in
// but haven't created one yet (used to route to /onboarding).
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
    .maybeSingle();

  return data?.id ?? null;
}
