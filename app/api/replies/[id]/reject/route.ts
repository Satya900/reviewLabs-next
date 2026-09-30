import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (reply_drafts_owner_all) scopes this update to the signed-in
  // owner's own drafts.
  const { error } = await supabase.from("reply_drafts").update({ status: "rejected" }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: "Could not reject draft" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
