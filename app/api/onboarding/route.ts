import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

const payloadSchema = z.object({
  businessName: z.string().trim().min(1),
  outletName: z.string().trim().min(1),
  address: z.string().trim().optional(),
});

// Tries the plain slug first, then appends a short random suffix on
// collision. Three attempts is plenty for a slug space this small.
async function insertWithUniqueSlug<T extends { id: string }>(
  insertOne: (slug: string) => PromiseLike<{ data: T | null; error: { code?: string } | null }>,
  baseSlug: string
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await insertOne(slug);
    if (data) return data;
    if (error?.code !== "23505") throw new Error("Could not create record");
  }
  throw new Error("Could not generate a unique slug");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: false, error: "Business already exists" }, { status: 409 });

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

    return NextResponse.json({ ok: true, businessId: business.id, outletId: outlet.id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 }
    );
  }
}
