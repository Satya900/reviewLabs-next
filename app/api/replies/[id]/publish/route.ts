import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publishReplyDraft } from "@/lib/google-sync";

const payloadSchema = z.object({ text: z.string().trim().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Reply text is required" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (reply_drafts_owner_all) confirms this draft's review belongs to
  // one of the signed-in owner's outlets before we publish on their behalf.
  const { data: draft } = await supabase.from("reply_drafts").select("id").eq("id", id).single();
  if (!draft) return NextResponse.json({ ok: false, error: "Draft not found" }, { status: 404 });

  try {
    await publishReplyDraft(id, parsed.data.text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Publish failed" }, { status: 500 });
  }
}
