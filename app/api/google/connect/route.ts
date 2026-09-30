import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasGoogleEnv, buildGoogleAuthUrl } from "@/lib/google";

export async function GET(request: Request) {
  if (!hasGoogleEnv()) {
    return NextResponse.json(
      { ok: false, error: "Google OAuth isn't configured yet. Add GOOGLE_CLIENT_ID/SECRET to .env." },
      { status: 501 }
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const outletId = searchParams.get("outletId");
  if (!outletId) return NextResponse.json({ ok: false, error: "Missing outletId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  // RLS confirms this outlet actually belongs to the signed-in owner before
  // we send them into Google's consent screen for it.
  const { data: outlet } = await supabase.from("outlets").select("id").eq("id", outletId).single();
  if (!outlet) return NextResponse.json({ ok: false, error: "Outlet not found" }, { status: 404 });

  const redirectUri = `${origin}/api/google/callback`;
  return NextResponse.redirect(buildGoogleAuthUrl(outletId, redirectUri));
}
