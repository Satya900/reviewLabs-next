import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";

const payloadSchema = z.object({
  outletSlug: z.string().min(1),
  // When set, this call updates the rating created by the customer's first
  // action (Google or private) instead of inserting a second row — one
  // visit is one rating, however many channels the customer ends up using.
  ratingId: z.string().nullish(),
  stars: z.number().int().min(1).max(5),
  choseChannel: z.enum(["google", "private", "both", "none"]),
  answers: z.record(z.string(), z.string()).optional(),
  publicComment: z.string().trim().max(500).optional(),
  // Set only on the first POST for a visit, from the ?req= param on
  // /r/{slug}. Links this rating — and, via the DB trigger
  // trg_complete_request_on_rating, the originating requests row — back to
  // the email/WhatsApp ask that produced it. Not a strict UUID: demo mode
  // (app/api/requests/route.ts) sends the literal "demo-request" here, same
  // placeholder convention as ratingId's "demo-rating".
  requestId: z.string().nullish(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { outletSlug, ratingId, stars, choseChannel, answers, publicComment, requestId } = parsed.data;
  const ticketOpened = stars < 4;

  if (!hasSupabaseEnv) {
    // Demo mode: no Supabase project wired up yet. Acknowledge the
    // submission so the UI flow is fully testable before real persistence.
    return NextResponse.json({ ok: true, ticketOpened, demo: true, ratingId: ratingId ?? "demo-rating" });
  }

  const supabase = createSupabaseAnonClient();

  const { data: outlet, error: outletError } = await supabase
    .from("outlets")
    .select("id")
    .eq("slug", outletSlug)
    .single();

  if (outletError || !outlet) {
    return NextResponse.json({ ok: false, error: "Outlet not found" }, { status: 404 });
  }

  let finalRatingId = ratingId;

  if (!finalRatingId) {
    const insertRating = (requestIdToUse: string | null) =>
      supabase
        .from("ratings")
        .insert({
          outlet_id: outlet.id,
          request_id: requestIdToUse,
          stars,
          chose_channel: choseChannel,
          public_comment: publicComment || null,
        })
        .select("id")
        .single();

    let { data: rating, error: ratingError } = await insertRating(requestId ?? null);

    // A stale/tampered or non-UUID ?req= (deleted request, wrong id, the
    // demo-mode "demo-request" placeholder reaching a real project) trips
    // either a foreign-key violation (23503) or an invalid-UUID-syntax
    // error (22P02) — retry without it rather than blocking the customer's
    // submission over a cosmetic linkage.
    if (ratingError && ["23503", "22P02"].includes(ratingError.code ?? "")) {
      ({ data: rating, error: ratingError } = await insertRating(null));
    }

    if (ratingError || !rating) {
      return NextResponse.json({ ok: false, error: "Could not save rating" }, { status: 500 });
    }
    finalRatingId = rating.id;
  } else {
    await supabase
      .from("ratings")
      .update({ chose_channel: choseChannel, public_comment: publicComment || undefined })
      .eq("id", finalRatingId);
  }

  if (answers && Object.keys(answers).length > 0) {
    await supabase.from("private_feedback").insert({
      rating_id: finalRatingId,
      outlet_id: outlet.id,
      answers,
    });
  }

  // Ticket creation (stars < 4) and request-completion (request_id set) both
  // happen via DB triggers fired only on the initial insert above, so each
  // fires exactly once per visit.
  return NextResponse.json({ ok: true, ticketOpened, demo: false, ratingId: finalRatingId });
}
