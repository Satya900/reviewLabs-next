import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import type { ReplySeoKeyword } from "./supabase/types";

// Owner-scoped (RLS via reply_seo_keywords_owner_all) — feeds the Settings
// page's keyword list. Pricing math lives in lib/plans.ts's
// computeReplySeoMonthlyPrice, not here — that needs to be importable from
// a client component without pulling in this file's next/headers-dependent
// Supabase client.
export async function getOutletSeoKeywords(outletId: string): Promise<ReplySeoKeyword[]> {
  if (!hasSupabaseEnv) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reply_seo_keywords")
    .select("*")
    .eq("outlet_id", outletId)
    .order("created_at");

  return data ?? [];
}
