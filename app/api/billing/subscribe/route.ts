import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasRazorpayEnv, getRazorpayClient } from "@/lib/razorpay";

export async function POST() {
  if (!hasRazorpayEnv) {
    return NextResponse.json(
      { ok: false, error: "Razorpay isn't configured yet. Add the keys in .env.example to enable checkout." },
      { status: 501 }
    );
  }

  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, error: "Connect Supabase before billing can be linked to a business." }, { status: 501 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // An agency owner can have multiple businesses — .single() throws on
  // zero or 2+ rows, so order+limit to deterministically pick the oldest.
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ ok: false, error: "No business found for this account" }, { status: 404 });
  }

  const razorpay = getRazorpayClient();
  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID_STARTER!,
    customer_notify: 1,
    total_count: 120, // 10 years of monthly cycles; Razorpay requires a bound
  });

  await supabase.from("subscriptions").upsert(
    {
      business_id: business.id,
      razorpay_subscription_id: subscription.id,
      plan: "starter",
      status: "trialing",
    },
    { onConflict: "razorpay_subscription_id" }
  );

  return NextResponse.json({
    ok: true,
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
