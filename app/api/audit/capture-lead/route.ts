import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { sendAuditLeadNotification } from "@/lib/email";
import { computeAuditScore, type ReviewRecency } from "@/lib/audit-score";

const recencyLabel: Record<ReviewRecency, string> = {
  week: "this week",
  month: "this month",
  "1-3mo": "1-3 months ago",
  "3-6mo": "3-6 months ago",
  "6mo-plus": "6+ months ago",
  unsure: "not sure",
};

const payloadSchema = z.object({
  businessName: z.string().trim().min(1),
  email: z.string().trim().email(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  recency: z.enum(["week", "month", "1-3mo", "3-6mo", "6mo-plus", "unsure"]),
});

// Public, unauthenticated — the free audit tool itself (lib/audit-score.ts)
// needs no server round-trip at all; this route only exists for the
// optional opt-in step after a visitor already sees their free score.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { businessName, email, rating, reviewCount, recency } = parsed.data;
  const { score } = computeAuditScore({ rating, reviewCount, recency });

  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = createSupabaseAnonClient();
  const { error } = await supabase.from("audit_leads").insert({
    business_name: businessName,
    email,
    rating,
    review_count: reviewCount,
    recency,
    score,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "Could not save your details" }, { status: 500 });
  }

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  if (notifyTo) {
    // Best-effort — a notification failure shouldn't fail the lead capture
    // the visitor already completed.
    await sendAuditLeadNotification({
      to: notifyTo,
      businessName,
      email,
      score,
      rating,
      reviewCount,
      recencyLabel: recencyLabel[recency],
    });
  }

  return NextResponse.json({ ok: true, demo: false });
}
