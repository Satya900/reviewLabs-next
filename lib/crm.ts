import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { mockPublicRatings, mockOutlet } from "./mock-data";
import type { Rating } from "./supabase/types";

export type RatingWithOutlet = Rating & { outletName?: string };

// Phase 1's "basic CRM": every rating the business has collected, however
// the customer chose to route it. Not a contacts database yet — that's a
// later phase — just the ratings log an owner can scan at a glance.
export async function getOwnerRatings(): Promise<{ ratings: RatingWithOutlet[]; demo: boolean }> {
  if (!hasSupabaseEnv) {
    return {
      ratings: mockPublicRatings.map((r) => ({ ...r, outletName: mockOutlet.name })),
      demo: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ratings: [], demo: false };

  const { data } = await supabase
    .from("ratings")
    .select("*, outlets(name)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (Rating & { outlets: { name: string } | null })[];
  return { ratings: rows.map((r) => ({ ...r, outletName: r.outlets?.name })), demo: false };
}
