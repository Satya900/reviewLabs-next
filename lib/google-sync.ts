import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import {
  listGoogleReviews,
  refreshGoogleAccessToken,
  replyToGoogleReview,
  starWordToStars,
} from "@/lib/google";
import { draftReply } from "@/lib/ai/reply-draft";
import type { GoogleConnection, ReplySettings, ReviewRequest, Ticket } from "@/lib/supabase/types";

async function getValidAccessToken(connection: GoogleConnection): Promise<string> {
  const expiresInMs = new Date(connection.token_expires_at).getTime() - Date.now();
  if (expiresInMs > 60_000) return connection.access_token;

  const refreshed = await refreshGoogleAccessToken(connection.refresh_token);
  const supabase = createSupabaseServiceRoleClient();
  await supabase
    .from("google_connections")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    })
    .eq("id", connection.id);

  return refreshed.access_token;
}

// Best-effort match: the most recent ticket on this outlet with the same
// star rating, within 14 days before the review landed, not already linked
// to another synced review. Google never shares enough identity to match
// exactly, so this is a heuristic, not a guarantee.
async function findGroundingTicket(
  outletId: string,
  stars: number,
  reviewCreateTime: string
): Promise<Ticket | null> {
  const supabase = createSupabaseServiceRoleClient();
  const windowStart = new Date(new Date(reviewCreateTime).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidateTickets } = await supabase
    .from("tickets")
    .select("*, ratings(stars)")
    .eq("outlet_id", outletId)
    .eq("status", "resolved")
    .gte("created_at", windowStart)
    .lte("created_at", reviewCreateTime)
    .order("created_at", { ascending: false });

  const rows = (candidateTickets ?? []) as unknown as (Ticket & { ratings: { stars: number } | null })[];
  const match = rows.find((t) => t.ratings?.stars === stars);
  return match ?? null;
}

// Best-effort match back to the requests row that likely produced this
// review (the other half of PHASES.md Phase 2's request<->review
// correlation — see supabase/migrations/0003 for the ReviewLabs-own-page
// half). Google shares no identifying link, so this is a heuristic over
// the email/WhatsApp requests sent in the weeks before the review landed,
// not a guarantee. Requests already 'completed' — by this function on an
// earlier sync, or by the migration 0003 trigger — are excluded so one
// request can't be double-matched to two different reviews.
async function findMatchingRequest(
  outletId: string,
  reviewerName: string | null,
  reviewCreateTime: string
): Promise<ReviewRequest | null> {
  const supabase = createSupabaseServiceRoleClient();
  const windowStart = new Date(new Date(reviewCreateTime).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidateRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("outlet_id", outletId)
    .in("channel", ["email", "whatsapp"])
    .neq("status", "completed")
    .gte("created_at", windowStart)
    .lte("created_at", reviewCreateTime)
    .order("created_at", { ascending: false });

  const candidates = (candidateRequests ?? []) as ReviewRequest[];
  if (candidates.length === 0) return null;

  if (reviewerName) {
    const nameMatch = candidates.find(
      (r) => r.customer_name && r.customer_name.toLowerCase() === reviewerName.toLowerCase()
    );
    if (nameMatch) return nameMatch;
  }

  return candidates[0]; // most recent request in the window, as a weak fallback guess
}

export async function syncOutletReviews(outletId: string): Promise<{ synced: number; drafted: number; autoPublished: number }> {
  const supabase = createSupabaseServiceRoleClient();

  const { data: connection } = await supabase
    .from("google_connections")
    .select("*")
    .eq("outlet_id", outletId)
    .single();

  if (!connection || !connection.google_location_id) {
    throw new Error("Outlet has no active Google connection");
  }

  const { data: settingsRow } = await supabase
    .from("reply_settings")
    .select("*")
    .eq("outlet_id", outletId)
    .single();

  const settings: ReplySettings =
    settingsRow ?? {
      outlet_id: outletId,
      default_language: "en",
      auto_reply_5star_no_text: true,
      auto_reply_min_stars_for_review: 1,
      updated_at: new Date().toISOString(),
    };

  const accessToken = await getValidAccessToken(connection);
  const [accountId] = connection.google_location_id.split("/locations/")[0] === connection.google_location_id
    ? [connection.google_location_id]
    : connection.google_location_id.split("/locations/");
  const locationId = connection.google_location_id.split("/locations/")[1] ?? connection.google_location_id;

  const { reviews } = await listGoogleReviews(accessToken, accountId, locationId);

  let synced = 0;
  let drafted = 0;
  let autoPublished = 0;

  for (const review of reviews ?? []) {
    const stars = starWordToStars(review.starRating);

    const { data: existing } = await supabase
      .from("google_reviews")
      .select("id, has_owner_reply")
      .eq("outlet_id", outletId)
      .eq("google_review_id", review.reviewId)
      .maybeSingle();

    let googleReviewRowId = existing?.id as string | undefined;

    if (!googleReviewRowId) {
      const groundingTicket = await findGroundingTicket(outletId, stars, review.createTime);
      const matchedRequest = await findMatchingRequest(outletId, review.reviewer?.displayName ?? null, review.createTime);

      let matchedRatingId: string | null = null;
      if (matchedRequest) {
        const { data: linkedRating } = await supabase
          .from("ratings")
          .select("id")
          .eq("request_id", matchedRequest.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        matchedRatingId = linkedRating?.id ?? null;
      }

      const { data: inserted } = await supabase
        .from("google_reviews")
        .insert({
          outlet_id: outletId,
          google_review_id: review.reviewId,
          reviewer_name: review.reviewer?.displayName ?? null,
          stars,
          review_text: review.comment ?? null,
          google_create_time: review.createTime,
          google_update_time: review.updateTime,
          matched_request_id: matchedRequest?.id ?? null,
          matched_rating_id: matchedRatingId,
          has_owner_reply: Boolean(review.reviewReply),
        })
        .select("id")
        .single();

      if (!inserted) continue;
      googleReviewRowId = inserted.id;
      synced += 1;

      if (matchedRequest) {
        await supabase.from("requests").update({ status: "completed" }).eq("id", matchedRequest.id);
      }

      if (!review.reviewReply) {
        const draft = await draftReply({
          businessName: "the business", // TODO Phase 2 follow-up: pass the real business name through
          reviewerName: review.reviewer?.displayName ?? null,
          stars,
          reviewText: review.comment ?? null,
          fixNote: groundingTicket?.fix_note ?? null,
          language: settings.default_language,
        });

        if (draft) {
          const isAutoReplyEligible =
            stars === 5 && !review.comment && settings.auto_reply_5star_no_text;

          const { data: draftRow } = await supabase
            .from("reply_drafts")
            .insert({
              google_review_id: googleReviewRowId,
              draft_text: draft.text,
              language: settings.default_language,
              grounded_ticket_id: groundingTicket?.id ?? null,
              model_used: draft.modelUsed,
              status: isAutoReplyEligible ? "auto_approved" : "pending_approval",
            })
            .select("id")
            .single();

          drafted += 1;

          if (isAutoReplyEligible && draftRow) {
            await replyToGoogleReview(accessToken, accountId, locationId, review.reviewId, draft.text);
            await supabase
              .from("reply_drafts")
              .update({ status: "published", published_text: draft.text, published_at: new Date().toISOString() })
              .eq("id", draftRow.id);
            await supabase.from("google_reviews").update({ has_owner_reply: true }).eq("id", googleReviewRowId);
            autoPublished += 1;
          }
        }
      }
    }
  }

  return { synced, drafted, autoPublished };
}

// Called on a schedule (see app/api/cron/sync-google-reviews) so review sync
// doesn't depend on an owner remembering to click "Sync now." Each outlet's
// failure is isolated so one bad token doesn't block the rest of the batch.
export async function syncAllConnectedOutlets(): Promise<{
  outletsProcessed: number;
  totalSynced: number;
  totalDrafted: number;
  totalAutoPublished: number;
  errors: { outletId: string; error: string }[];
}> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: connections } = await supabase
    .from("google_connections")
    .select("outlet_id")
    .eq("status", "connected");

  const results = { outletsProcessed: 0, totalSynced: 0, totalDrafted: 0, totalAutoPublished: 0, errors: [] as { outletId: string; error: string }[] };

  for (const { outlet_id } of connections ?? []) {
    results.outletsProcessed += 1;
    try {
      const { synced, drafted, autoPublished } = await syncOutletReviews(outlet_id);
      results.totalSynced += synced;
      results.totalDrafted += drafted;
      results.totalAutoPublished += autoPublished;
    } catch (err) {
      results.errors.push({ outletId: outlet_id, error: err instanceof Error ? err.message : "Sync failed" });
    }
  }

  return results;
}

export async function publishReplyDraft(draftId: string, finalText: string): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();

  const { data: draft } = await supabase
    .from("reply_drafts")
    .select("*, google_reviews(outlet_id, google_review_id)")
    .eq("id", draftId)
    .single();

  if (!draft) throw new Error("Draft not found");
  const review = (draft as unknown as { google_reviews: { outlet_id: string; google_review_id: string } }).google_reviews;

  const { data: connection } = await supabase
    .from("google_connections")
    .select("*")
    .eq("outlet_id", review.outlet_id)
    .single();
  if (!connection || !connection.google_location_id) throw new Error("No active Google connection");

  const accessToken = await getValidAccessToken(connection);
  const accountId = connection.google_location_id.split("/locations/")[0];
  const locationId = connection.google_location_id.split("/locations/")[1];

  await replyToGoogleReview(accessToken, accountId, locationId, review.google_review_id, finalText);

  await supabase
    .from("reply_drafts")
    .update({ status: "published", published_text: finalText, published_at: new Date().toISOString() })
    .eq("id", draftId);

  await supabase
    .from("google_reviews")
    .update({ has_owner_reply: true })
    .eq("google_review_id", review.google_review_id)
    .eq("outlet_id", review.outlet_id);
}
