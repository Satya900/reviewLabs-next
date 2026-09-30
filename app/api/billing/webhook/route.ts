import { NextResponse } from "next/server";
import crypto from "crypto";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

// Razorpay subscription webhook. Configure this URL in the Razorpay
// dashboard once RAZORPAY_WEBHOOK_SECRET is set. Uses the service-role
// client because there's no signed-in user in a webhook request, only a
// verified signature from Razorpay.
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret not configured" }, { status: 501 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const subscriptionEntity = event.payload?.subscription?.entity;
  if (!subscriptionEntity) return NextResponse.json({ ok: true, ignored: true });

  const statusMap: Record<string, "active" | "past_due" | "cancelled"> = {
    "subscription.activated": "active",
    "subscription.charged": "active",
    "subscription.pending": "past_due",
    "subscription.halted": "past_due",
    "subscription.cancelled": "cancelled",
    "subscription.completed": "cancelled",
  };

  const newStatus = statusMap[event.event as string];
  if (!newStatus || !hasSupabaseEnv) return NextResponse.json({ ok: true, ignored: true });

  const supabase = createSupabaseServiceRoleClient();
  await supabase
    .from("subscriptions")
    .update({ status: newStatus, current_period_end: subscriptionEntity.current_end ? new Date(subscriptionEntity.current_end * 1000).toISOString() : undefined })
    .eq("razorpay_subscription_id", subscriptionEntity.id);

  return NextResponse.json({ ok: true });
}
