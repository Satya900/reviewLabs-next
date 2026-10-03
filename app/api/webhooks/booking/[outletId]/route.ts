import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendReviewRequestEmail } from "@/lib/email";
import { isValidWebhookSecret } from "@/lib/webhook-auth";

const payloadSchema = z.object({
  customerName: z.string().trim().min(1),
  customerEmail: z.string().trim().email(),
});

// Generic inbound webhook — PHASES.md Phase 3 names no specific booking/
// billing partner, so any external tool capable of firing a POST on
// "appointment completed" can integrate by pasting this URL (with its
// outlet-specific ?secret=) into that tool's own webhook settings. Creates
// an email review request exactly like the dashboard's own
// POST /api/requests email path — same requests-table shape, same
// ?req={id} correlation (supabase/migrations/0003), just triggered by an
// external event instead of an owner filling in a form.
//
// Email only: WhatsApp requests only ever produce a wa.me link for a human
// to click (no WhatsApp Business API configured anywhere in this project),
// and a webhook delivery has no human present at that moment to click it.
export async function POST(request: Request, { params }: { params: Promise<{ outletId: string }> }) {
  const { outletId } = await params;
  const { searchParams } = new URL(request.url);
  const providedSecret = searchParams.get("secret") ?? request.headers.get("x-webhook-secret");

  const supabase = createSupabaseServiceRoleClient();

  const { data: webhook } = await supabase
    .from("outlet_webhooks")
    .select("secret")
    .eq("outlet_id", outletId)
    .maybeSingle();

  if (!webhook || !isValidWebhookSecret(providedSecret, webhook.secret)) {
    return NextResponse.json({ ok: false, error: "Invalid or missing webhook secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: outlet } = await supabase.from("outlets").select("name, slug").eq("id", outletId).single();
  if (!outlet) {
    return NextResponse.json({ ok: false, error: "Outlet not found" }, { status: 404 });
  }

  const { customerName, customerEmail } = parsed.data;

  const { data: created, error } = await supabase
    .from("requests")
    .insert({
      outlet_id: outletId,
      channel: "email",
      customer_name: customerName,
      customer_contact: customerEmail,
      status: "sent",
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ ok: false, error: "Could not create review request" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reviewUrl = `${appUrl}/r/${outlet.slug}?req=${created.id}`;

  const emailResult = await sendReviewRequestEmail({
    to: customerEmail,
    customerName,
    outletName: outlet.name,
    reviewUrl,
  });

  if (!emailResult.ok) {
    // The request row is already saved — the send is best-effort, same
    // resilience as the dashboard's own POST /api/requests.
    return NextResponse.json({ ok: true, requestId: created.id, emailError: emailResult.error });
  }

  return NextResponse.json({ ok: true, requestId: created.id });
}
