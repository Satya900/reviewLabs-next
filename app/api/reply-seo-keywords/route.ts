import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  outletId: z.string().min(1),
  keyword: z.string().trim().min(1).max(60),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (reply_seo_keywords_owner_all) enforces that outletId belongs to
  // the signed-in owner before this insert is allowed to go through.
  const { data, error } = await supabase
    .from("reply_seo_keywords")
    .insert({ outlet_id: parsed.data.outletId, keyword: parsed.data.keyword })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "That keyword is already added" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Could not add keyword" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
