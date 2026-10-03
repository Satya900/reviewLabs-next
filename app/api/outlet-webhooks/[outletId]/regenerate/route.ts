import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { regenerateOutletWebhookSecret } from "@/lib/outlet-webhooks";

export async function POST(request: Request, { params }: { params: Promise<{ outletId: string }> }) {
  const { outletId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS (outlet_webhooks_owner_all) enforces this only ever touches one of
  // the signed-in owner's own outlets.
  const secret = await regenerateOutletWebhookSecret(outletId);
  if (!secret) return NextResponse.json({ ok: false, error: "Could not regenerate secret" }, { status: 500 });

  return NextResponse.json({ ok: true, secret });
}
