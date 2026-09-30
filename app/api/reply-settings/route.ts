import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  outletId: z.string(),
  defaultLanguage: z.enum(["en", "hi", "kn"]),
  autoReply5starNoText: z.boolean(),
});

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (reply_settings_owner_all) confirms this outlet belongs to the
  // signed-in owner before the upsert is allowed to touch it.
  const { error } = await supabase.from("reply_settings").upsert(
    {
      outlet_id: parsed.data.outletId,
      default_language: parsed.data.defaultLanguage,
      auto_reply_5star_no_text: parsed.data.autoReply5starNoText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "outlet_id" }
  );

  if (error) return NextResponse.json({ ok: false, error: "Could not save settings" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
