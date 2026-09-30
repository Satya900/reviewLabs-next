import { NextResponse } from "next/server";
import { syncAllConnectedOutlets } from "@/lib/google-sync";

// Scheduled entry point: any external scheduler (Vercel Cron, Supabase
// pg_cron + pg_net, GitHub Actions, cron-job.org) hits this on a timer with
// `Authorization: Bearer ${CRON_SECRET}`. Requires a public deployment —
// nothing external can reach localhost, so this only fires once ReviewLabs
// is actually deployed somewhere.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 501 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllConnectedOutlets();
  return NextResponse.json({ ok: true, ...result });
}
