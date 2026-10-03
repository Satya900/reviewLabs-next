import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseAnonClient } from "./supabase/anon";
import { mockBusiness, mockPublicRatings } from "./mock-data";
import type { Rating } from "./supabase/types";

export interface PublicBusinessReviews {
  business: { id: string; name: string; slug: string };
  ratings: Rating[];
}

export async function getPublicBusinessReviews(
  businessSlug: string
): Promise<PublicBusinessReviews | null> {
  if (!hasSupabaseEnv) {
    return { business: { ...mockBusiness, slug: businessSlug }, ratings: mockPublicRatings };
  }

  const supabase = createSupabaseAnonClient();

  // businesses_public (supabase/migrations/0004) exposes only
  // (id, name, slug, plan) — never owner_user_id — to anon callers.
  const { data: business } = await supabase
    .from("businesses_public")
    .select("id,name,slug")
    .eq("slug", businessSlug)
    .single();

  if (!business) return null;

  const { data: outlets } = await supabase
    .from("outlets")
    .select("id")
    .eq("business_id", business.id);

  const outletIds = (outlets ?? []).map((o) => o.id);
  if (outletIds.length === 0) return { business, ratings: [] };

  const { data: ratings } = await supabase
    .from("ratings")
    .select("*")
    .in("outlet_id", outletIds)
    .eq("is_public", true) // never filters by star count — low ratings stay visible
    .order("created_at", { ascending: false });

  return { business, ratings: ratings ?? [] };
}
