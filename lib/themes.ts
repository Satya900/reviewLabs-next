import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "./supabase/server";
import { extractFeedbackTheme, type FeedbackTheme } from "./ai/theme-extract";
import { sendWeeklyDigestEmail } from "./email";
import type { PrivateFeedback } from "./supabase/types";

export const themeDisplayLabel: Record<FeedbackTheme, string> = {
  long_wait: "Long wait",
  rude_staff: "Rude staff",
  pricing_too_high: "Pricing too high",
  cleanliness_issue: "Cleanliness issue",
  poor_communication: "Poor communication",
  booking_difficulty: "Booking difficulty",
  quality_issue: "Quality issue",
  other_complaint: "Other complaint",
  friendly_staff: "Friendly staff",
  great_value: "Great value",
  quick_service: "Quick service",
  clean_facility: "Clean facility",
  good_communication: "Good communication",
  easy_booking: "Easy booking",
  great_quality: "Great quality",
  other_praise: "Other praise",
};

// Shared by both the owner-facing dashboard aggregation and the digest
// builder — exported separately so it's unit-testable without touching
// Supabase. See lib/themes.test.ts.
export function groupThemes(themes: FeedbackTheme[]): { theme: FeedbackTheme; count: number }[] {
  const counts = new Map<FeedbackTheme, number>();
  for (const t of themes) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
}

// Called daily (see app/api/cron/tag-feedback-themes) rather than inline in
// /api/feedback — tagging needs an LLM round-trip, which has no business
// adding latency to the public, customer-facing submission request.
export async function tagUntaggedFeedback(
  limit = 50
): Promise<{ tagged: number; errors: { id: string; error: string }[] }> {
  const supabase = createSupabaseServiceRoleClient();

  const { data } = await supabase
    .from("private_feedback")
    .select("*, ratings(stars)")
    .is("theme", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  const rows = (data ?? []) as unknown as (PrivateFeedback & { ratings: { stars: number } | null })[];

  let tagged = 0;
  const errors: { id: string; error: string }[] = [];

  for (const row of rows) {
    const stars = row.ratings?.stars ?? 3;
    const result = await extractFeedbackTheme({
      stars,
      whatWentWrong: row.answers.what_went_wrong ?? null,
      whatWouldFixIt: row.answers.what_would_fix_it ?? null,
    });

    if (!result) {
      errors.push({ id: row.id, error: "No AI provider available" });
      continue;
    }

    await supabase.from("private_feedback").update({ theme: result.theme }).eq("id", row.id);
    tagged += 1;
  }

  return { tagged, errors };
}

export interface OutletThemeDigest {
  outletId: string;
  outletName: string;
  ratingsCount: number;
  avgStars: number | null;
  ticketsOpened: number;
  ticketsResolved: number;
  topThemes: { theme: FeedbackTheme; count: number }[];
}

export async function buildBusinessDigest(businessId: string, windowDays = 7): Promise<OutletThemeDigest[]> {
  const supabase = createSupabaseServiceRoleClient();
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: outlets } = await supabase.from("outlets").select("id, name").eq("business_id", businessId);

  const results: OutletThemeDigest[] = [];

  for (const outlet of outlets ?? []) {
    const [{ data: ratings }, { data: tickets }, { data: feedback }] = await Promise.all([
      supabase.from("ratings").select("stars").eq("outlet_id", outlet.id).gte("created_at", windowStart),
      supabase.from("tickets").select("status").eq("outlet_id", outlet.id).gte("created_at", windowStart),
      supabase
        .from("private_feedback")
        .select("theme")
        .eq("outlet_id", outlet.id)
        .gte("created_at", windowStart)
        .not("theme", "is", null),
    ]);

    const ratingRows = ratings ?? [];
    const ticketRows = (tickets ?? []) as { status: string }[];
    const themeRows = (feedback ?? []) as { theme: FeedbackTheme }[];

    results.push({
      outletId: outlet.id,
      outletName: outlet.name,
      ratingsCount: ratingRows.length,
      avgStars: ratingRows.length
        ? ratingRows.reduce((sum, r) => sum + r.stars, 0) / ratingRows.length
        : null,
      ticketsOpened: ticketRows.length,
      ticketsResolved: ticketRows.filter((t) => t.status === "resolved").length,
      topThemes: groupThemes(themeRows.map((f) => f.theme)).slice(0, 5),
    });
  }

  return results;
}

export async function sendWeeklyDigests(): Promise<{
  businessesProcessed: number;
  emailsSent: number;
  errors: { businessId: string; error: string }[];
}> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: businesses } = await supabase.from("businesses").select("id, name, owner_user_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let businessesProcessed = 0;
  let emailsSent = 0;
  const errors: { businessId: string; error: string }[] = [];

  for (const business of businesses ?? []) {
    businessesProcessed += 1;
    try {
      const outletDigests = await buildBusinessDigest(business.id);
      const hasActivity = outletDigests.some(
        (o) => o.ratingsCount > 0 || o.ticketsOpened > 0 || o.topThemes.length > 0
      );
      // No point emailing "nothing happened this week" — same spam
      // instinct that already drove the per-business (not per-outlet)
      // send decision.
      if (!hasActivity) continue;

      const { data: userData } = await supabase.auth.admin.getUserById(business.owner_user_id);
      const email = userData.user?.email;
      if (!email) continue;

      const result = await sendWeeklyDigestEmail({
        to: email,
        businessName: business.name,
        outlets: outletDigests.map((o) => ({
          outletName: o.outletName,
          ratingsCount: o.ratingsCount,
          avgStars: o.avgStars,
          ticketsOpened: o.ticketsOpened,
          ticketsResolved: o.ticketsResolved,
          topThemes: o.topThemes.map((t) => ({ label: themeDisplayLabel[t.theme], count: t.count })),
        })),
        dashboardUrl: `${appUrl}/dashboard/themes`,
      });

      if (!result.ok) {
        errors.push({ businessId: business.id, error: result.error });
        continue;
      }
      emailsSent += 1;
    } catch (err) {
      errors.push({ businessId: business.id, error: err instanceof Error ? err.message : "Digest failed" });
    }
  }

  return { businessesProcessed, emailsSent, errors };
}

// Owner-scoped (RLS-backed, not service role) — feeds app/dashboard/themes.
export async function getOwnerThemeFrequency(
  days = 30
): Promise<{ theme: FeedbackTheme; count: number }[]> {
  if (!hasSupabaseEnv) return [];

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // RLS (private_feedback_owner_all) already scopes this to the signed-in
  // owner's outlets.
  const { data } = await supabase
    .from("private_feedback")
    .select("theme")
    .not("theme", "is", null)
    .gte("created_at", windowStart);

  return groupThemes((data ?? []).map((r) => r.theme as FeedbackTheme));
}
