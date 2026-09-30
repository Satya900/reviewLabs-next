import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  fixNote: z.string().trim().min(1, "Describe the fix before resolving."),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseEnv) {
    // Demo mode: no persistence. The dashboard reflects the resolve
    // optimistically client-side; this just confirms the shape is right.
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (tickets_owner_all) enforces that this ticket belongs to the
  // signed-in owner's outlet before the update is allowed to touch it.
  const { error } = await supabase
    .from("tickets")
    .update({ status: "resolved", fix_note: parsed.data.fixNote, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: "Could not resolve ticket" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, demo: false });
}
