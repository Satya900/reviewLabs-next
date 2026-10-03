import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReviewRequest } from "@/lib/requests";
import { sendReviewRequestEmail } from "@/lib/email";
import { buildWaMeLink } from "@/lib/utils/whatsapp";
import { mockOutlet } from "@/lib/mock-data";

const payloadSchema = z
  .object({
    outletId: z.string().min(1),
    channel: z.enum(["email", "whatsapp"]),
    customerName: z.string().trim().min(1, "Enter the customer's name"),
    customerContact: z.string().trim().min(1, "Enter an email or phone number"),
  })
  .refine((v) => v.channel === "whatsapp" || v.customerContact.includes("@"), {
    message: "Enter a valid email for an email request",
    path: ["customerContact"],
  });

// Matches lib/email.ts's tone — a personal ask from the owner, not a
// marketing blast. Run through /anthropic-skills:humanizer.
function requestMessage(customerName: string, outletName: string, reviewUrl: string) {
  return `Hi ${customerName}, thanks for coming by ${outletName}. If you've got a minute, I'd really appreciate a quick review: ${reviewUrl}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { outletId, channel, customerName, customerContact } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!hasSupabaseEnv) {
    // Demo mode: no persistence, but a WhatsApp link still builds for real
    // so the flow is fully clickable without a Supabase project.
    const reviewUrl = `${appUrl}/r/${mockOutlet.slug}?req=demo-request`;
    const waLink =
      channel === "whatsapp"
        ? buildWaMeLink(customerContact, requestMessage(customerName, mockOutlet.name, reviewUrl))
        : undefined;
    return NextResponse.json({ ok: true, demo: true, requestId: "demo-request", waLink });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // outlets_public_read allows this select regardless of auth; ownership is
  // enforced on the write below via requests_owner_all.
  const { data: outlet } = await supabase
    .from("outlets")
    .select("name, slug")
    .eq("id", outletId)
    .single();

  if (!outlet) {
    return NextResponse.json({ ok: false, error: "Outlet not found" }, { status: 404 });
  }

  const created = await createReviewRequest({ outletId, channel, customerName, customerContact });
  if (!created.ok) {
    return NextResponse.json({ ok: false, error: created.error }, { status: 500 });
  }

  const reviewUrl = `${appUrl}/r/${outlet.slug}?req=${created.id}`;

  if (channel === "whatsapp") {
    const waLink = buildWaMeLink(customerContact, requestMessage(customerName, outlet.name, reviewUrl));
    return NextResponse.json({ ok: true, demo: false, requestId: created.id, waLink });
  }

  const emailResult = await sendReviewRequestEmail({
    to: customerContact,
    customerName,
    outletName: outlet.name,
    reviewUrl,
  });

  if (!emailResult.ok) {
    // The request row is already saved — the send is best-effort, so a
    // transient provider failure doesn't lose the owner's work, just
    // surfaces a warning the UI can show.
    return NextResponse.json({
      ok: true,
      demo: false,
      requestId: created.id,
      emailError: emailResult.error,
    });
  }

  return NextResponse.json({ ok: true, demo: false, requestId: created.id });
}
