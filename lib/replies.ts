import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { mockOutlet } from "./mock-data";
import type { GoogleConnection, Outlet, ReplyDraft, ReplySettings } from "./supabase/types";

export type OutletConnectionStatus = {
  outlet: Outlet;
  connection: GoogleConnection | null;
  settings: ReplySettings | null;
};

export async function getOwnerOutletConnection(): Promise<OutletConnectionStatus | null> {
  if (!hasSupabaseEnv) return { outlet: mockOutlet, connection: null, settings: null };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: outlet } = await supabase.from("outlets").select("*").order("created_at").limit(1).single();
  if (!outlet) return null;

  const { data: connection } = await supabase
    .from("google_connections")
    .select("*")
    .eq("outlet_id", outlet.id)
    .maybeSingle();

  const { data: settings } = await supabase
    .from("reply_settings")
    .select("*")
    .eq("outlet_id", outlet.id)
    .maybeSingle();

  return { outlet, connection: connection ?? null, settings: settings ?? null };
}

export type ReplyDraftWithReview = ReplyDraft & {
  reviewerName: string | null;
  stars: number;
  reviewText: string | null;
  outletName: string;
};

export async function getPendingReplyDrafts(): Promise<{ drafts: ReplyDraftWithReview[]; demo: boolean }> {
  if (!hasSupabaseEnv) return { drafts: [], demo: true };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { drafts: [], demo: false };

  const { data } = await supabase
    .from("reply_drafts")
    .select("*, google_reviews(reviewer_name, stars, review_text, outlets(name))")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (ReplyDraft & {
    google_reviews: { reviewer_name: string | null; stars: number; review_text: string | null; outlets: { name: string } | null };
  })[];

  return {
    drafts: rows.map((r) => ({
      ...r,
      reviewerName: r.google_reviews?.reviewer_name ?? null,
      stars: r.google_reviews?.stars ?? 0,
      reviewText: r.google_reviews?.review_text ?? null,
      outletName: r.google_reviews?.outlets?.name ?? "",
    })),
    demo: false,
  };
}
