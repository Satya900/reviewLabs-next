import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import type { Subscription } from "./supabase/types";

export async function getOwnerSubscription(): Promise<{ subscription: Subscription | null; demo: boolean }> {
  if (!hasSupabaseEnv) return { subscription: null, demo: true };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { subscription: null, demo: false };

  // An agency owner can have multiple businesses — .single() throws on
  // zero or 2+ rows, so order+limit to deterministically pick the oldest.
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!business) return { subscription: null, demo: false };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return { subscription: subscription ?? null, demo: false };
}
