import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { exchangeGoogleCode, listGoogleAccounts, listGoogleLocations } from "@/lib/google";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const outletId = searchParams.get("state");

  if (!code || !outletId) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=missing_code`);
  }

  try {
    const redirectUri = `${origin}/api/google/callback`;
    const tokens = await exchangeGoogleCode(code, redirectUri);

    // MVP simplification: auto-pick the first account and first location.
    // A business with multiple Business Profile accounts/locations will
    // need a picker here — tracked as a Phase 2 follow-up, not a Phase 3 one.
    const { accounts } = await listGoogleAccounts(tokens.access_token);
    const firstAccount = accounts?.[0];
    let googleLocationId: string | null = null;

    if (firstAccount) {
      const { locations } = await listGoogleLocations(tokens.access_token, firstAccount.name);
      const firstLocation = locations?.[0];
      if (firstLocation) {
        // Store as "accounts/{id}/locations/{id}" so google-sync.ts can
        // split it back into the account/location pair the v4 reviews API needs.
        googleLocationId = `${firstAccount.name}/locations/${firstLocation.name.split("/locations/")[1] ?? firstLocation.name}`;
      }
    }

    const supabase = await createSupabaseServerClient();
    await supabase.from("google_connections").upsert(
      {
        outlet_id: outletId,
        google_location_id: googleLocationId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        status: "connected",
      },
      { onConflict: "outlet_id" }
    );

    await supabase.from("reply_settings").upsert({ outlet_id: outletId }, { onConflict: "outlet_id" });

    return NextResponse.redirect(`${origin}/dashboard/settings?connected=1`);
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return NextResponse.redirect(`${origin}/dashboard/settings?error=oauth_failed`);
  }
}
