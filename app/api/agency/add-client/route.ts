import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";
import { insertWithUniqueSlug } from "@/lib/utils/unique-slug";

const payloadSchema = z.object({
  businessName: z.string().trim().min(1),
  outletName: z.string().trim().min(1),
  address: z.string().trim().optional(),
});

// Same shape as /api/onboarding, deliberately without its "Business already
// exists" 409 — this route exists specifically to add a second (or third,
// or Nth) business under the same owner, for the agency console's
// per-client grouping.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const { businessName, outletName, address } = parsed.data;

  try {
    const business = await insertWithUniqueSlug(
      (slug) =>
        supabase
          .from("businesses")
          .insert({ owner_user_id: user.id, name: businessName, slug, plan: "starter" })
          .select("id")
          .single(),
      slugify(businessName)
    );

    const outlet = await insertWithUniqueSlug(
      (slug) =>
        supabase
          .from("outlets")
          .insert({ business_id: business.id, name: outletName, slug, address: address || null })
          .select("id")
          .single(),
      slugify(outletName)
    );

    // This is the moment the owner's whole portfolio switches into
    // agency/white-label mode — flips every business they have, including
    // the one just created, not just new ones going forward. No payment
    // step: Razorpay isn't configured with real keys yet, so this is a
    // free/unmetered soft-upgrade for this phase (subscriptions rows are
    // untouched, so businesses.plan and subscriptions.plan can diverge —
    // the add-client-form copy states this consequence to the owner).
    await supabase.from("businesses").update({ plan: "agency" }).eq("owner_user_id", user.id);

    return NextResponse.json({ ok: true, businessId: business.id, outletId: outlet.id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not add client" },
      { status: 500 }
    );
  }
}
