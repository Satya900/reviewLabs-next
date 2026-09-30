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
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { outletSlug, ratingId, stars, choseChannel, answers, publicComment } = parsed.data;
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
    const { data: rating, error: ratingError } = await supabase
      .from("ratings")
      .insert({
        outlet_id: outlet.id,
        stars,
        chose_channel: choseChannel,
        public_comment: publicComment || null,
      })
      .select("id")
      .single();

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

  // Ticket creation for stars < 4 happens via the DB trigger
  // (fn_open_ticket_for_low_rating) defined in supabase/migrations, fired
  // only on the initial insert above — so it opens exactly once per visit.
  return NextResponse.json({ ok: true, ticketOpened, demo: false, ratingId: finalRatingId });
}
