import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncOutletReviews } from "@/lib/google-sync";

const payloadSchema = z.object({ outletId: z.string() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Missing outletId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS-scoped lookup confirms this outlet belongs to the signed-in owner
  // before we touch anything with the service-role sync helper.
  const { data: outlet } = await supabase.from("outlets").select("id").eq("id", parsed.data.outletId).single();
  if (!outlet) return NextResponse.json({ ok: false, error: "Outlet not found" }, { status: 404 });

  try {
    const result = await syncOutletReviews(parsed.data.outletId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
