import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (reply_seo_keywords_owner_all) enforces this only ever deletes a
  // keyword belonging to one of the signed-in owner's own outlets.
  await supabase.from("reply_seo_keywords").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
